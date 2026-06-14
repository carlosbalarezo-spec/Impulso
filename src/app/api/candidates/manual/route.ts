import { NextResponse } from 'next/server';
import { addCandidate, Candidate } from '@/lib/db';
import { calculateRanking } from '@/lib/ranking';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, sourceName, language, title, note, tags } = body;

    if (!url || !sourceName || !language || !title) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: url, sourceName, language, title' 
      }, { status: 400 });
    }

    const cleanTags = Array.isArray(tags) ? tags : ["Manual", "Actualidad"];
    if (!cleanTags.includes("Manual")) cleanTags.push("Manual");

    const dateStr = new Date().toISOString().split('T')[0];
    
    const criteria = {
      sportMentalHealth: 50,
      publicInterest: 60,
      sportImpact: 60,
      publicMentalHealth: 50,
      economicImpact: 50,
      novelty: 95, // Freshly added
      pedagogicalPotential: 50,
      audiovisualClarity: 70,
      brandAlignment: 70
    };

    const penalties = {
      isRumor: false,
      isWeakSource: false,
      hasDefamationRisk: false,
      hasMinorWithoutFocus: false,
      hasDiagnosticRisk: false,
      hasNoOwnStance: true // Manual starts with no own stance
    };

    // Calculate score. Note that calculateRanking will penalize for Manual URL and no custom stance.
    const scoreResult = calculateRanking(criteria, penalties, title);

    const newCandidate: Candidate = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      source: sourceName,
      language: language.toUpperCase() as 'ES' | 'EN' | 'DE',
      date: dateStr,
      link: url,
      sourceUrl: url,
      sourceName,
      ingestedAt: new Date().toISOString(),
      verificationStatus: "needs_review",
      isMock: false,
      dataType: "MANUAL_URL",
      summary: note || "Ingresado manualmente por Salvador.",
      entities: [],
      tags: cleanTags,
      criteria,
      penalties,
      scoreResult,
      status: "idea",
      editorialCard: {
        summary: `Ficha manual: ${title}`,
        context: `URL ingresada manualmente por Salvador el ${new Date().toLocaleDateString()}. Plataforma/Origen: ${sourceName}.`,
        whyItMatters: "[Completar por qué importa]",
        psychologicalAngle: "[Completar ángulo de psicología deportiva]",
        managementAngle: "[Completar ángulo de gestión deportiva]",
        salvadorStance: note || "[Completar la postura sugerida para el comentario]",
        counterArgument: "[Completar posibles objeciones]",
        simplificationRisk: "Explotar la crisis o ridiculizar en lugar de enfocar de forma transformativa.",
        phrasesToAvoid: ["está deprimido", "es débil", "fracasó por falta de carácter"],
        verifiedSources: [sourceName],
        complianceNote: "Revisar directrices de compliance. Si proviene de TikTok o Instagram de terceros: NO descargar el video original, NO eliminar marcas de agua, usar solo como referencia editorial transformativa."
      },
      scripts: {
        s30: `HOOK: ¿Has visto este post en ${sourceName}? Hablemos de ${title.substring(0, 50)}... COMENTARIO: [Comentario corto]. CTA: Deja tu opinión.`,
        s60: `HOOK: El video de ${sourceName} del que todos hablan. CONTEXTO: ${title}. COMENTARIO: Salvador opina: [Comentario de 60 segundos]. CTA: Comparte y comenta.`,
        s90: `HOOK: Analicemos la polémica de ${title.substring(0, 50)}... CONTEXTO: Post original en ${sourceName}. COMENTARIO: Salvador analiza a fondo: [Ángulo transformativo]. CTA: Conversación sana abajo.`,
        captionTiktok: `Comentario de opinión sobre el post de ${sourceName} 🧠🎥. #deporte #actualidad #mindset`,
        captionInstagram: `Reflexión sobre el video de ${sourceName}. Análisis transformativo de opinión. 🧠📊 #Deporte #PsicologíaDeportiva`,
        hashtags: ["deporte", "actualidad", "opinion"]
      },
      overlayPlan: {
        background: "Captura de pantalla del post original.",
        headline: title,
        sourceCitation: `Fuente: ${sourceName}`,
        salvadorPosition: "Centro inferior",
        largeText: "ANÁLISIS DE OPINIÓN",
        timeline: [
          { time: "0:00", action: `Presentar el post original de ${sourceName} en el overlay.` }
        ],
        recsTiktok: "Subtítulos rápidos en pantalla.",
        recsInstagram: "Diseño premium."
      },
      history: [
        { timestamp: new Date().toISOString(), fromStatus: "", toStatus: "idea", note: "Creado manualmente en la mesa editorial." }
      ]
    };

    addCandidate(newCandidate);
    return NextResponse.json({ success: true, candidate: newCandidate });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
