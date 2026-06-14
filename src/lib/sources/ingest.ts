import { getEnabledSources } from './sourceRegistry';
import { parseRSS } from './rssParser';
import { addCandidate, addIngestLogs, getCandidates, Candidate, IngestionLog } from '../db';
import { calculateRanking } from '../ranking';

export async function ingestAllFeeds(): Promise<{ success: boolean; logs: IngestionLog[]; addedCount: number }> {
  const enabledSources = getEnabledSources();
  const logs: IngestionLog[] = [];
  let addedCount = 0;
  
  const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const existingCandidates = getCandidates();
  const existingLinks = new Set(existingCandidates.map(c => c.link));

  for (const source of enabledSources) {
    const start = Date.now();
    
    if (!source.feedUrl) {
      logs.push({
        timestamp: new Date().toISOString(),
        sourceId: source.id,
        url: "",
        status: "error",
        itemsFound: 0,
        itemsSaved: 0,
        duplicatesOmitted: 0,
        errorMessage: "No feed URL specified for RSS source type.",
        durationMs: Date.now() - start,
        runId
      });
      continue;
    }

    try {
      // Fetch with timeout to prevent hanging the ingester
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(source.feedUrl, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'IMPULSO-MesaEditorial/1.0' }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xmlText = await response.text();
      const parsedItems = parseRSS(xmlText);
      
      let sourceAdded = 0;
      let duplicates = 0;
      
      // Limit to max 5 new items per source to prevent database bloat
      const freshItems = parsedItems.filter(item => {
        if (existingLinks.has(item.link)) {
          duplicates++;
          return false;
        }
        return true;
      });

      const targetItems = freshItems.slice(0, 5);

      for (const item of targetItems) {
        // Enforce: REAL_SOURCE must have sourceUrl. If missing, skip.
        if (!item.link) {
          continue; 
        }

        // Format publication date if available
        let dateStr = "";
        let sourcePubAt = "";
        if (item.pubDate) {
          try {
            const parsedDate = new Date(item.pubDate);
            if (!isNaN(parsedDate.getTime())) {
              dateStr = parsedDate.toISOString().split('T')[0];
              sourcePubAt = parsedDate.toISOString();
            }
          } catch (e) {
            // Invalid date format
          }
        }

        // Verification Status depends on presence of publication date
        const verificationStatus = dateStr ? "source_verified" : "needs_review";

        // Define default criteria values based on source trust tier
        const baseScore = source.trustTier === 'high' ? 85 : source.trustTier === 'medium' ? 75 : 60;
        const criteria = {
          sportMentalHealth: 50, // Default baseline, editor will refine
          publicInterest: 70,
          sportImpact: 70,
          publicMentalHealth: 50,
          economicImpact: 50,
          novelty: 90, // Newly ingested, high novelty
          pedagogicalPotential: 50,
          audiovisualClarity: 70,
          brandAlignment: 60
        };

        const penalties = {
          isRumor: false,
          isWeakSource: source.trustTier === 'low',
          hasDefamationRisk: false,
          hasMinorWithoutFocus: false,
          hasDiagnosticRisk: false,
          hasNoOwnStance: true // Newly ingested has no custom stance yet!
        };

        const scoreResult = calculateRanking(
          criteria, 
          penalties, 
          item.title, 
          "REAL_SOURCE", 
          source.trustTier, 
          verificationStatus, 
          dateStr
        );

        const newCandidate: Candidate = {
          id: `${source.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: item.title,
          source: source.name,
          language: source.language.toUpperCase() as 'ES' | 'EN' | 'DE',
          date: dateStr, // Could be empty if missing
          link: item.link,
          sourceUrl: item.link,
          sourceName: source.name,
          sourceFeedUrl: source.feedUrl,
          ingestedAt: new Date().toISOString(),
          originalTitle: item.title,
          sourcePublishedAt: sourcePubAt || undefined,
          verificationStatus,
          contentStored: "metadata_only",
          isMock: false,
          dataType: "REAL_SOURCE",
          summary: item.description || "Sin descripción corta disponible.",
          entities: [],
          tags: ["Deporte", "Actualidad"],
          criteria,
          penalties,
          scoreResult,
          status: "idea",
          editorialCard: {
            summary: `Resumen generado por IMPULSO: ${item.description || item.title}`,
            context: `Noticia real ingesta desde el feed RSS público de ${source.name} el ${new Date().toLocaleDateString()}.`,
            whyItMatters: "[Pendiente de análisis editorial por Salvador]",
            psychologicalAngle: "[Completar análisis sobre presión, motivación o estrés del atleta]",
            managementAngle: "[Completar análisis sobre gobernanza, finanzas o contratos]",
            salvadorStance: "[Definir la postura de Salvador para el video]",
            counterArgument: "[Añadir posibles objeciones del público]",
            simplificationRisk: "Reducir la noticia a juicios simplistas de carácter.",
            phrasesToAvoid: ["está deprimido", "es débil", "fracasó por falta de carácter"],
            verifiedSources: [source.name],
            complianceNote: "Revisar directrices de compliance. No emitir diagnósticos psicológicos clínicos."
          },
          scripts: {
            s30: `HOOK: ¿Has visto lo que pasó con ${item.title.substring(0, 50)}...? COMENTARIO: [Escribir comentario corto]. EJEMPLO: [Ejemplo de resiliencia o gestión]. CTA: ¿Qué opinas tú?`,
            s60: `HOOK: ¿Qué hay detrás del titular sobre ${item.title.substring(0, 50)}...? CONTEXTO: ${item.description || 'Detalles de la noticia'}. COMENTARIO: Salvador analiza: [Escribir comentario de 60 segundos]. EJEMPLO: [Ejemplo formativo]. CTA: Deja tus comentarios abajo.`,
            s90: `HOOK: Analicemos el lado mental y de gestión sobre ${item.title.substring(0, 50)}... CONTEXTO: ${item.description || 'Detalles de la noticia'}. COMENTARIO: Salvador explica: [Análisis profundo]. EJEMPLO: [Ejemplo de resiliencia o liderazgo deportivo]. CTA: Únete a la conversación.`,
            captionTiktok: `Análisis real sobre ${source.name} 🧠⚽️. #deporte #psicologia #rendimiento`,
            captionInstagram: `Analizamos la actualidad de ${source.name} desde la psicología y gestión deportiva. 🧠📊 #Deporte #PsicologíaDeportiva`,
            hashtags: ["deporte", "actualidad", "psicologia"]
          },
          overlayPlan: {
            background: "Captura de pantalla de la noticia original.",
            headline: item.title,
            sourceCitation: `Fuente: ${source.name}`,
            salvadorPosition: "Centro inferior",
            largeText: "ACTUALIDAD DEPORTIVA",
            timeline: [
              { time: "0:00", action: `Mostrar Salvador en primer plano con el titular de ${source.name} de fondo.` }
            ],
            recsTiktok: "Texto grande y llamativo en pantalla.",
            recsInstagram: "Línea gráfica premium de la marca."
          },
          history: [
            { timestamp: new Date().toISOString(), fromStatus: "", toStatus: "idea", note: "Ingestado automáticamente vía RSS." }
          ]
        };

        addCandidate(newCandidate);
        existingLinks.add(item.link);
        sourceAdded++;
        addedCount++;
      }

      logs.push({
        timestamp: new Date().toISOString(),
        sourceId: source.id,
        url: source.feedUrl,
        status: "success",
        itemsFound: parsedItems.length,
        itemsSaved: sourceAdded,
        duplicatesOmitted: duplicates + (parsedItems.length - targetItems.length - duplicates),
        durationMs: Date.now() - start,
        runId
      });

    } catch (error: any) {
      logs.push({
        timestamp: new Date().toISOString(),
        sourceId: source.id,
        url: source.feedUrl,
        status: "error",
        itemsFound: 0,
        itemsSaved: 0,
        duplicatesOmitted: 0,
        errorMessage: error.message,
        durationMs: Date.now() - start,
        runId
      });
    }
  }

  addIngestLogs(logs);
  return { success: true, logs, addedCount };
}
