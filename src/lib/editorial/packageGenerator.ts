import { Candidate, EditorialPackage, EditorialBrief, ScriptSet, ScriptSetVariant, OverlayPlan, ApprovalChecklist, ComplianceResult, SourceCitation } from '../db';
import { checkScriptCompliance } from '../compliance';

// Helper to parse script parts from a single text block
function parseScriptPart(text: string, marker: string, nextMarkers: string[]): string {
  const idx = text.indexOf(marker);
  if (idx === -1) return "";
  const start = idx + marker.length;
  let end = text.length;
  for (const next of nextMarkers) {
    const nextIdx = text.indexOf(next, start);
    if (nextIdx !== -1 && nextIdx < end) {
      end = nextIdx;
    }
  }
  return text.substring(start, end).trim();
}


function buildSourceCitation(candidate: Candidate): SourceCitation {
  const rawSourceName = candidate.sourceName || candidate.source || "Fuente no especificada";
  const sourceName = rawSourceName.replace(/^\[MOCK\]\s*/i, "").trim() || "Fuente no especificada";
  const sourceUrl = candidate.sourceUrl || candidate.realSourceUrl || undefined;
  const sourceType = candidate.dataType || (candidate.isMock ? "MOCK" : undefined);
  const verificationStatus = candidate.verificationStatus;

  const isMock =
    verificationStatus === "mock" ||
    candidate.dataType === "MOCK" ||
    candidate.dataType === "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" ||
    candidate.isMock === true ||
    /^\[MOCK\]/i.test(candidate.source || "");

  const isManual =
    candidate.dataType === "MANUAL_URL" ||
    verificationStatus === "needs_review";

  if (isMock) {
    return {
      sourceName,
      sourceUrl,
      sourceType,
      verificationStatus,
      narrativeCitation: "Según una fuente simulada de prueba, ",
      overlayCitation: `Fuente simulada: [MOCK] ${sourceName}`
    };
  }

  if (isManual) {
    return {
      sourceName,
      sourceUrl,
      sourceType,
      verificationStatus,
      narrativeCitation: "Según una fuente manual pendiente de revisión, ",
      overlayCitation: "Fuente manual: pendiente de revisión"
    };
  }

  return {
    sourceName,
    sourceUrl,
    sourceType,
    verificationStatus,
    narrativeCitation: `Según ${sourceName}, `,
    overlayCitation: `Fuente: ${sourceName}`
  };
}

function withNarrativeCitation(context: string, sourceCitation: SourceCitation): string {
  const cleanContext = context.trim();
  const cleanCitation = sourceCitation.narrativeCitation.trim();

  if (!cleanContext) {
    return sourceCitation.narrativeCitation.trim();
  }

  if (cleanContext.includes(cleanCitation)) {
    return cleanContext;
  }

  return `${sourceCitation.narrativeCitation}${cleanContext}`;
}

export function generateEditorialPackage(candidate: Candidate): EditorialPackage {
  // 1. Ficha Editorial (Brief)
  const editorialBrief: EditorialBrief = {
    summary: candidate.editorialCard?.summary || candidate.summary || "Sin resumen disponible.",
    context: candidate.editorialCard?.context || candidate.summary || "Sin contexto disponible.",
    whyItMatters: candidate.editorialCard?.whyItMatters || "Este tema ilustra dinámicas críticas en la psicología deportiva y el bienestar de los atletas.",
    psychologicalAngle: candidate.editorialCard?.psychologicalAngle || "Enfoque en la gestión de la presión, resiliencia y salud mental bajo condiciones competitivas.",
    managementAngle: candidate.editorialCard?.managementAngle || "Gobernanza deportiva y cómo las organizaciones abordan el bienestar frente a los resultados.",
    salvadorStance: candidate.editorialCard?.salvadorStance || "El bienestar mental es un prerrequisito para el rendimiento deportivo sostenible y no debe ser ignorado.",
    counterArgument: candidate.editorialCard?.counterArgument || "Opiniones tradicionales que exigen rendimiento incondicional.",
    simplificationRisk: candidate.editorialCard?.simplificationRisk || "Decir que se resuelve con 'echarle ganas', ignorando los factores organizacionales y fisiológicos.",
    phrasesToAvoid: candidate.editorialCard?.phrasesToAvoid || ["es un cobarde", "sufre de depresión severa", "no tiene mentalidad"],
    verifiedSources: candidate.editorialCard?.verifiedSources || [candidate.source || "Fuente pública"],
    complianceNote: candidate.editorialCard?.complianceNote || "Evitar realizar diagnósticos médicos clínicos o usar calificativos peyorativos sobre el atleta."
  };

  const sourceCitation = buildSourceCitation(candidate);

  // 2. Scripts (s30, s60, s90)
  const parseScriptVariant = (text: string, lengthType: '30' | '60' | '90'): ScriptSetVariant => {
    if (!text) {
      // Generate deterministic scripts if they don't exist
      const titleClean = candidate.title.replace(/\[(SIMULACIÓN|MOCK|CONTEXTO PÚBLICO SIMULADO)\]\s*/i, "").trim();
      const firstWord = titleClean.split(" ")[0] || "deportista";
      if (candidate.language === 'EN') {
        return {
          hook: `What does the case of ${titleClean} teach us about pressure?`,
          context: withNarrativeCitation(`Recently, it was reported that ${candidate.summary}`, sourceCitation),
          centralComment: `This highlights the intense psychological pressure and the importance of a healthier sports culture.`,
          example: `As shown in the news, high performance is unsustainable without proper mental support.`,
          closure: `Mental health in sports is not a luxury, it's a requirement for long-term success.`,
          cta: `What do you think about this? Let us know in the comments.`,
          subtitles: `Dynamic, high-contrast subtitles for sports content.`,
          captionTiktok: `Analysis of ${firstWord} 🧠. #sports #psychology #performance`,
          captionInstagram: `Deep dive into the sports management and psychology of this case. #Sports #Psychology #Performance`,
          hashtags: ["sports", "psychology", "performance", "resilience"]
        };
      } else if (candidate.language === 'DE') {
        return {
          hook: `Was können wir aus dem Fall ${titleClean} lernen?`,
          context: withNarrativeCitation(`Kürzlich wurde berichtet, dass ${candidate.summary}`, sourceCitation),
          centralComment: `Dies zeigt den enormen psychologischen Druck und die Bedeutung einer gesünderen Sportkultur.`,
          example: `Wie die Nachrichten zeigen, ist Spitzenleistung ohne mentale Unterstützung nicht nachhaltig.`,
          closure: `Mentale Gesundheit im Sport ist kein Luxus, sondern eine Notwendigkeit für langfristigen Erfolg.`,
          cta: `Was denkst du darüber? Schreib es in die Kommentare.`,
          subtitles: `Dynamische, kontrastreiche Untertitel für Sportinhalte.`,
          captionTiktok: `Analyse von ${firstWord} 🧠. #sport #psychologie #leistung`,
          captionInstagram: `Ein tiefer Einblick in das Sportmanagement und die Psychologie dieses Falles. #Sport #Psychologie #Leistung`,
          hashtags: ["sport", "psychologie", "leistung", "resilienz"]
        };
      } else {
        return {
          hook: `¿Qué nos enseña el caso de ${titleClean}?`,
          context: withNarrativeCitation(`Recientemente se dio a conocer que ${candidate.summary}`, sourceCitation),
          centralComment: `Esto demuestra la presión psicológica y la necesidad de una gestión deportiva más empática.`,
          example: `Como vemos en la noticia, el rendimiento óptimo no ocurre sin una estabilidad mental previa.`,
          closure: `La salud mental en el deporte no es un lujo, es una necesidad de rendimiento.`,
          cta: `¿Qué opinas sobre este caso? Cuéntanos en los comentarios.`,
          subtitles: `Subtítulos dinámicos de colores llamativos.`,
          captionTiktok: `El análisis sobre ${firstWord} 🧠⚽. #deporte #psicologia #impulso`,
          captionInstagram: `Un análisis detallado de la gestión y psicología deportiva del caso. #Deporte #Psicologia #Rendimiento`,
          hashtags: ["deporte", "psicologia", "rendimiento", "disciplina"]
        };
      }
    }

    const hook = parseScriptPart(text, "HOOK:", ["CONTEXTO:", "COMENTARIO:", "EJEMPLO:", "CIERRE:", "CTA:"]);
    const context = parseScriptPart(text, "CONTEXTO:", ["COMENTARIO:", "EJEMPLO:", "CIERRE:", "CTA:"]) || candidate.summary;
    const centralComment = parseScriptPart(text, "COMENTARIO:", ["EJEMPLO:", "CIERRE:", "CTA:"]);
    const example = parseScriptPart(text, "EJEMPLO:", ["CIERRE:", "CTA:"]);
    const closure = parseScriptPart(text, "CIERRE:", ["CTA:"]) || "La salud mental y la gestión deportiva son pilares clave.";
    const cta = parseScriptPart(text, "CTA:", []);

    const firstWord = candidate.title.replace(/\[(SIMULACIÓN|MOCK|CONTEXTO PÚBLICO SIMULADO)\]\s*/i, "").split(" ")[0] || "deportista";

    return {
      hook: hook || `Análisis de ${lengthType}s sobre este caso.`,
      context: withNarrativeCitation(context, sourceCitation),
      centralComment: centralComment || text,
      example: example || "Como vemos en este caso deportivo.",
      closure: closure,
      cta: cta || "¿Qué opinas? Comenta abajo.",
      subtitles: "Subtítulos sugeridos en la zona media de la pantalla.",
      captionTiktok: candidate.scripts?.captionTiktok || `Análisis de ${firstWord} 🧠 #deporte #psicologia`,
      captionInstagram: candidate.scripts?.captionInstagram || `Análisis de ${firstWord} 🧠 #Deporte #PsicologíaDeportiva`,
      hashtags: candidate.scripts?.hashtags || ["deporte", "psicologia", "rendimiento"]
    };
  };

  const scripts: ScriptSet = {
    s30: parseScriptVariant(candidate.scripts?.s30 || "", '30'),
    s60: parseScriptVariant(candidate.scripts?.s60 || "", '60'),
    s90: parseScriptVariant(candidate.scripts?.s90 || "", '90')
  };

  // 3. Plan de Overlay
  const overlayPlan: OverlayPlan = {
    format: "9:16",
    salvadorPosition: candidate.overlayPlan?.salvadorPosition || "Centro inferior",
    visibleTitle: candidate.overlayPlan?.headline || candidate.title || "Titular",
    visibleSource: sourceCitation.overlayCitation,
    largeText: candidate.overlayPlan?.largeText || "SALUD MENTAL = RENDIMIENTO",
    emphasisMoments: (candidate.overlayPlan?.timeline || [
      { time: "0:00", action: "Mostrar Salvador e introducir el titular de prensa." },
      { time: "0:15", action: "Mostrar texto clave en pantalla." }
    ]).map(t => ({ time: t.time, action: t.action })),
    copyrightWarning: "ADVERTENCIA DE COPYRIGHT: Este video contiene solo comentarios y análisis críticos bajo la doctrina de Fair Use. No usar video completo de terceros sin autorización.",
    ownBRollSuggestion: "Se sugiere usar b-roll propio de Salvador hablando o imágenes libres de derechos/autorizadas.",
    noThirdPartyVideoWarning: "RECOMENDACIÓN: No descargar ni reproducir videos completos de terceros para evitar penalizaciones por copyright."
  };

  // 4. Checklist de Aprobación
  const approvalChecklist: ApprovalChecklist = {
    sourceVisible: false,
    urlSaved: false,
    noClinicalDiagnosis: false,
    noMockery: false,
    noMinorExposed: false,
    noPrivateContent: false,
    noThirdPartyVideoDownloaded: false,
    noFullArticleCopied: false,
    ownStancePresent: false,
    humanReviewPending: false,
    sourceCitedInNarrative: false,
    sourceCitedInOverlay: false,
    sourceUrlAvailable: Boolean(candidate.sourceUrl || candidate.realSourceUrl)
  };

  // 5. Compliance check (run on scripts and candidate fields)
  const combinedTexts = [
    candidate.title || "",
    candidate.summary || "",
    editorialBrief.summary,
    editorialBrief.context,
    editorialBrief.whyItMatters,
    editorialBrief.psychologicalAngle,
    editorialBrief.managementAngle,
    editorialBrief.salvadorStance,
    scripts.s30.hook, scripts.s30.centralComment, scripts.s30.example, scripts.s30.closure,
    scripts.s60.hook, scripts.s60.centralComment, scripts.s60.example, scripts.s60.closure,
    scripts.s90.hook, scripts.s90.centralComment, scripts.s90.example, scripts.s90.closure
  ].join(" | ");

  const compReport = checkScriptCompliance(combinedTexts);
  const complianceResult: ComplianceResult = {
    passed: compReport.isCompliant,
    reasons: compReport.violations.map(v => `Frase prohibida detectada: "${v.phrase}". Motivo: ${v.reason}`)
  };

  return {
    id: `pkg-${candidate.id}`,
    candidateId: candidate.id,
    createdAt: candidate.ingestedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    editorialBrief,
    scripts,
    overlayPlan,
    approvalChecklist,
    complianceResult,
    sourceCitation
  };
}

export function validatePackageApproval(pkg: EditorialPackage, candidate: Candidate): { approved: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // 1. Compliance check (frase prohibida)
  if (!pkg.complianceResult.passed) {
    reasons.push(...pkg.complianceResult.reasons);
  }

  // 2. Citación doble obligatoria
  const citation = pkg.sourceCitation;
  if (!citation) {
    reasons.push("Falta la estructura sourceCitation en el paquete editorial.");
  } else {
    if (!citation.narrativeCitation || citation.narrativeCitation.trim() === "") {
      reasons.push("Falta la citación de fuente en la narrativa hablada del guion.");
    }
    if (!citation.overlayCitation || citation.overlayCitation.trim() === "") {
      reasons.push("Falta la citación de fuente como texto visible en pantalla.");
    }
  }

  if (pkg.approvalChecklist.sourceCitedInNarrative !== true) {
    reasons.push("El check crítico 'Fuente citada en narrativa hablada' no está completado.");
  }
  if (pkg.approvalChecklist.sourceCitedInOverlay !== true) {
    reasons.push("El check crítico 'Fuente citada en overlay visible' no está completado.");
  }
  if (pkg.approvalChecklist.sourceUrlAvailable !== true) {
    reasons.push("El check crítico 'URL o fuente original disponible para auditoría' no está completado.");
  }

  const isMockSource =
    candidate.verificationStatus === "mock" ||
    candidate.dataType === "MOCK" ||
    candidate.dataType === "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" ||
    candidate.isMock === true ||
    /^\[MOCK\]/i.test(candidate.source || "");

  if (isMockSource) {
    const overlayCitation = citation?.overlayCitation || "";
    if (!overlayCitation.includes("Fuente simulada") && !overlayCitation.includes("[MOCK]")) {
      reasons.push("La fuente simulada debe estar marcada como 'Fuente simulada' o '[MOCK]' en el overlay.");
    }
  }

  // 3. Candidate verification status is needs_review
  if (candidate.verificationStatus === 'needs_review') {
    reasons.push("El candidato requiere revisión de verificación de fuente (verificationStatus es 'needs_review').");
  }

  // 3. Falta sourceUrl
  if (!candidate.sourceUrl || candidate.sourceUrl.trim() === "") {
    reasons.push("Falta la URL de la fuente original (sourceUrl está vacío).");
  }

  // 4. Es MANUAL_URL sin revisión
  if (candidate.dataType === 'MANUAL_URL' && candidate.verificationStatus !== 'source_verified') {
    reasons.push("El candidato es de origen URL Manual y no ha sido verificado (verificationStatus debe ser 'source_verified').");
  }

  // 5. Menor involucrado y no está activado modo sensible
  const minorTags = ["menor", "menor de edad", "niño", "niña", "infantil", "child", "minor", "kid", "adolescente", "hijo", "hija"];
  const hasTag = (candidate.tags || []).some(t => minorTags.some(mt => t.toLowerCase().includes(mt)));
  const hasPenalty = candidate.penalties?.hasMinorWithoutFocus === true;
  const textToScan = `${candidate.title} ${candidate.summary}`.toLowerCase();
  const hasText = minorTags.some(mt => textToScan.includes(mt));
  const minorInvolved = hasTag || hasPenalty || hasText;

  if (minorInvolved && !pkg.approvalChecklist.noMinorExposed) {
    reasons.push("Hay un menor involucrado en la noticia y no se ha completado el check crítico de protección de menores ('no menor expuesto').");
  }

  // 6. Checklist crítico incompleto
  const checklist = pkg.approvalChecklist;
  if (!checklist.sourceVisible) {
    reasons.push("El check crítico 'Fuente visible en pantalla' no está completado.");
  }
  if (!checklist.urlSaved) {
    reasons.push("El check crítico 'URL de la fuente original guardada' no está completado.");
  }
  if (!checklist.noClinicalDiagnosis) {
    reasons.push("El check crítico 'No emitir diagnóstico clínico' no está completado.");
  }
  if (!checklist.noMockery) {
    reasons.push("El check crítico 'No usar lenguaje de burla o descalificación' no está completado.");
  }
  if (!checklist.noPrivateContent) {
    reasons.push("El check crítico 'No publicar contenido privado o íntimo' no está completado.");
  }
  if (!checklist.noThirdPartyVideoDownloaded) {
    reasons.push("El check crítico 'No descargar video completo de terceros' no está completado.");
  }
  if (!checklist.noFullArticleCopied) {
    reasons.push("El check crítico 'No copiar el artículo completo de la fuente' no está completado.");
  }
  if (!checklist.ownStancePresent) {
    reasons.push("El check crítico 'Postura propia de Salvador presente en los guiones' no está completado.");
  }
  if (!checklist.humanReviewPending) {
    reasons.push("El check crítico 'Revisión humana completada' no está completado.");
  }

  return {
    approved: reasons.length === 0,
    reasons
  };
}
