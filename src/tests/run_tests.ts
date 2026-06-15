import assert from 'assert';
import { calculateRanking, RankingCriteria, Penalties } from '../lib/ranking';
import { checkScriptCompliance, checkCandidateCompliance } from '../lib/compliance';

console.log("=========================================");
console.log("      RUNNING IMPULSO CORE TEST SUITE     ");
console.log("=========================================\n");

let passedTests = 0;
let failedTests = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ [PASS] ${name}`);
    passedTests++;
  } catch (error: any) {
    console.error(`✗ [FAIL] ${name}`);
    console.error(error.stack || error.message);
    failedTests++;
  }
}

// ==========================================================
// SCORING ENGINE TESTS (ranking.ts)
// ==========================================================

const defaultCriteria: RankingCriteria = {
  sportMentalHealth: 90,
  publicInterest: 90,
  sportImpact: 90,
  publicMentalHealth: 90,
  economicImpact: 90,
  novelty: 90,
  pedagogicalPotential: 90,
  audiovisualClarity: 90,
  brandAlignment: 90
};

const defaultPenalties: Penalties = {
  isRumor: false,
  isWeakSource: false,
  hasDefamationRisk: false,
  hasMinorWithoutFocus: false,
  hasDiagnosticRisk: false,
  hasNoOwnStance: false
};

test("Scoring - Tema de alta calidad y bajo riesgo", () => {
  const result = calculateRanking(defaultCriteria, defaultPenalties, "Tema de Alta Calidad", "MOCK", "medium", "mock", "2026-06-13");
  
  assert.strictEqual(result.baseScore, 90);
  assert.strictEqual(result.score, 90);
  assert.strictEqual(result.recommendation, "publicar");
});

test("Scoring - Tema con menor de edad involucrado", () => {
  const penalties = { ...defaultPenalties, hasMinorWithoutFocus: true };
  const result = calculateRanking(defaultCriteria, penalties, "Menor Involucrado", "MOCK", "medium", "mock", "2026-06-13");
  
  assert.strictEqual(result.score, 60); // 90 - 30
  assert.ok(result.penaltiesApplied.some(p => p.name === "Menor involucrado sin enfoque formativo"));
});

test("Scoring - Tema con fuente débil", () => {
  const penalties = { ...defaultPenalties, isWeakSource: true };
  const result = calculateRanking(defaultCriteria, penalties, "Fuente Débil", "MOCK", "medium", "mock", "2026-06-13");
  
  assert.strictEqual(result.score, 70); // 90 - 20
});

test("Scoring - Tema con rumor no confirmado", () => {
  const penalties = { ...defaultPenalties, isRumor: true };
  const result = calculateRanking(defaultCriteria, penalties, "Rumor No Confirmado", "MOCK", "medium", "mock", "2026-06-13");
  
  assert.strictEqual(result.score, 60); // 90 - 30
});

test("Scoring - Tema con riesgo de diagnóstico clínico", () => {
  const penalties = { ...defaultPenalties, hasDiagnosticRisk: true };
  const result = calculateRanking(defaultCriteria, penalties, "Riesgo Diagnóstico", "MOCK", "medium", "mock", "2026-06-13");
  
  assert.strictEqual(result.score, 50); // 90 - 40
});

// --- NEW SCORING TESTS FOR AG-0003 ---

test("Scoring - Fuente real de alta confianza (REAL_SOURCE + trustTier=high)", () => {
  const result = calculateRanking(
    defaultCriteria, 
    defaultPenalties, 
    "Noticia BBC", 
    "REAL_SOURCE", 
    "high", 
    "source_verified",
    "2026-06-13" // Current date
  );
  
  // Base score 90 + 5 bonus = 95. Final score 95
  assert.strictEqual(result.baseScore, 95);
  assert.strictEqual(result.score, 95);
  assert.strictEqual(result.recommendation, "publicar");
});

test("Scoring - URL manual sin verificar (MANUAL_URL + needs_review)", () => {
  const result = calculateRanking(
    defaultCriteria,
    defaultPenalties,
    "Post manual",
    "MANUAL_URL",
    "medium",
    "needs_review",
    "2026-06-13"
  );
  
  // Base score 90 - 15 penalty = 75
  assert.strictEqual(result.score, 75);
  assert.ok(result.penaltiesApplied.some(p => p.name === "URL manual sin verificar"));
});

test("Scoring - Fuente sin fecha", () => {
  const result = calculateRanking(
    defaultCriteria,
    defaultPenalties,
    "Noticia sin fecha",
    "REAL_SOURCE",
    "medium",
    "source_verified",
    undefined // No date
  );
  
  // Base score 90 - 10 penalty = 80
  assert.strictEqual(result.score, 80);
  assert.ok(result.penaltiesApplied.some(p => p.name === "Ausencia de fecha de publicación"));
});

test("Scoring - Fuente de bajo trust", () => {
  const result = calculateRanking(
    defaultCriteria,
    defaultPenalties,
    "Noticia baja confianza",
    "REAL_SOURCE",
    "low",
    "source_verified",
    "2026-06-13"
  );
  
  // Base score 90 - 15 penalty = 75
  assert.strictEqual(result.score, 75);
  assert.ok(result.penaltiesApplied.some(p => p.name === "Fuente de baja reputación"));
});

test("Scoring - Noticia antigua (>5 días)", () => {
  const result = calculateRanking(
    defaultCriteria,
    defaultPenalties,
    "Noticia antigua",
    "REAL_SOURCE",
    "medium",
    "source_verified",
    "2026-06-01" // More than 5 days before 2026-06-13
  );
  
  // Base score 90 - 15 penalty = 75
  assert.strictEqual(result.score, 75);
  assert.ok(result.penaltiesApplied.some(p => p.name === "Noticia antigua (>5 días)"));
});


// ==========================================================
// COMPLIANCE ENGINE TESTS (compliance.ts)
// ==========================================================

test("Compliance - Guion limpio (OK)", () => {
  const text = "El mediocampista sintió la enorme presión competitiva y el desgaste acumulado. La fortaleza mental no significa no sentir presión.";
  const report = checkScriptCompliance(text);
  
  assert.strictEqual(report.isCompliant, true);
  assert.strictEqual(report.violations.length, 0);
});

test("Compliance - Detección de frases prohibidas en Español (Salud Mental)", () => {
  const phrases = [
    "este deportista tiene depresión",
    "está deprimido y no puede jugar",
    "el delantero sufre ansiedad",
    "el jugador es débil",
    "es un débil mental",
    "a este equipo le faltan huevos",
    "no tiene mentalidad ganadora",
    "fracasó por falta de carácter"
  ];
  
  for (const phrase of phrases) {
    const report = checkScriptCompliance(`Contexto: ${phrase} en el partido.`);
    assert.strictEqual(report.isCompliant, false, `Debería fallar compliance para la frase: "${phrase}"`);
  }
});

test("Compliance - Detección de frases prohibidas en Inglés (Salud Mental)", () => {
  const phrases = [
    "he is depressed after the game",
    "she is depressed since yesterday",
    "the player has depression",
    "the defender has anxiety",
    "they are mentally weak",
    "he shows a weak mindset",
    "he is not built for competition"
  ];
  
  for (const phrase of phrases) {
    const report = checkScriptCompliance(`Context: ${phrase} during training.`);
    assert.strictEqual(report.isCompliant, false, `Debería fallar compliance para la frase en inglés: "${phrase}"`);
  }
});

// --- NEW COMPLIANCE TESTS FOR AG-0003 ---

test("Compliance - Detección de frases de burla y choke", () => {
  const SpanishPhrases = [
    "el equipo se arrugó en la final",
    "es un pecho frío que no aparece",
    "el jugador demostró ser un cagón"
  ];
  
  const EnglishPhrases = [
    "they choked under the pressure",
    "the team bottled it in the final minute",
    "he displays a weak mentality"
  ];
  
  for (const phrase of SpanishPhrases) {
    const report = checkScriptCompliance(`Contexto: ${phrase}.`);
    assert.strictEqual(report.isCompliant, false, `Debería fallar por lenguaje de burla: "${phrase}"`);
    assert.ok(report.violations.some(v => v.reason.includes("burla")));
  }
  
  for (const phrase of EnglishPhrases) {
    const report = checkScriptCompliance(`Context: ${phrase}.`);
    assert.strictEqual(report.isCompliant, false, `Debería fallar por lenguaje de burla/choke en inglés: "${phrase}"`);
  }
});

// --- NEW SCORING & COMPLIANCE TESTS FOR AG-0004 ---

test("Scoring - Fuente con problemas de salud (sourceFailing=true)", () => {
  const result = calculateRanking(
    defaultCriteria,
    defaultPenalties,
    "Noticia de fuente caída",
    "REAL_SOURCE",
    "medium",
    "source_verified",
    "2026-06-13",
    true // sourceFailing
  );
  
  // Base score 90 - 10 penalty = 80
  assert.strictEqual(result.score, 80);
  assert.ok(result.penaltiesApplied.some(p => p.name === "Fuente con problemas de salud"));
});

test("Compliance - Títulos y metadatos riesgosos", () => {
  const riskyTitles = [
    "He choked under pressure",
    "Se quebró mentalmente el atleta",
    "Un directivo lo llamó débil mental",
    "No tiene cabeza para competir al alto nivel"
  ];
  
  for (const title of riskyTitles) {
    const report = checkScriptCompliance(title);
    assert.strictEqual(report.isCompliant, false, `Debería fallar compliance para el título: "${title}"`);
  }
});

test("Compliance - Escaneo de candidato completo", () => {
  const mockCandidate = {
    title: "Noticia normal",
    summary: "Se quebró mentalmente tras las derrotas",
    editorialCard: {
      summary: "Análisis normal",
      context: "Contexto normal",
      whyItMatters: "Importa mucho",
      psychologicalAngle: "Normal",
      managementAngle: "Normal",
      salvadorStance: "Normal"
    },
    scripts: {
      s60: "Guion normal y limpio sin problemas de compliance."
    }
  };
  
  const report = checkCandidateCompliance(mockCandidate, 's60');
  assert.ok(report.violations.some(v => v.phrase.toLowerCase().includes("quebr")));
});

// ==========================================================
// EDITORIAL PACKAGE TESTS (packageGenerator.ts)
// ==========================================================
import { generateEditorialPackage, validatePackageApproval } from '../lib/editorial/packageGenerator';
import { Candidate, ApprovalChecklist } from '../lib/db';

function createTestCandidate(overrides: Partial<Candidate>): Candidate {
  const base: Candidate = {
    id: "mock-1",
    title: "[SIMULACIÓN] Simone Biles talks pressure",
    source: "[MOCK] BBC Sport",
    language: "EN",
    date: "2026-06-13",
    link: "https://mock.example.com",
    sourceUrl: "https://mock.example.com",
    verificationStatus: "source_verified",
    summary: "Simone Biles talks pressure and mental health",
    entities: ["Biles"],
    tags: ["Salud Mental"],
    criteria: defaultCriteria,
    penalties: defaultPenalties,
    scoreResult: calculateRanking(defaultCriteria, defaultPenalties, overrides.title || "[SIMULACIÓN] Simone Biles talks pressure"),
    status: "idea",
    isMock: true,
    dataType: "MOCK",
    editorialCard: {
      summary: "Resumen editorial mock",
      context: "Contexto mock",
      whyItMatters: "Importancia mock",
      psychologicalAngle: "Ángulo psicológico mock",
      managementAngle: "Ángulo gestión mock",
      salvadorStance: "Postura Salvador mock",
      counterArgument: "Contraargumento mock",
      simplificationRisk: "Riesgo simplificación mock",
      phrasesToAvoid: ["es débil", "sufre de depresión"],
      verifiedSources: ["BBC Sport"],
      complianceNote: "Compliance note mock"
    },
    scripts: {
      s30: "HOOK: Biles pressure. COMENTARIO: Salvador comenta: es normal. EJEMPLO: Gimnasta regresa fuerte. CTA: Comenta abajo.",
      s60: "HOOK: Biles pressure. CONTEXTO: En Tokio. COMENTARIO: Salvador comenta: es normal. EJEMPLO: Gimnasta regresa fuerte. CTA: Comenta abajo.",
      s90: "HOOK: Biles pressure. CONTEXTO: En Tokio. COMENTARIO: Salvador comenta: es normal. EJEMPLO: Gimnasta regresa fuerte. CTA: Comenta abajo.",
      captionTiktok: "TikTok caption",
      captionInstagram: "Insta caption",
      hashtags: ["biles", "saludmental"]
    },
    overlayPlan: {
      background: "background-mock",
      headline: "headline-mock",
      sourceCitation: "source-mock",
      salvadorPosition: "salvadorPosition-mock",
      largeText: "largeText-mock",
      timeline: [{ time: "0:00", action: "action-mock" }],
      recsTiktok: "recsTiktok-mock",
      recsInstagram: "recsInstagram-mock"
    },
    history: []
  };

  const merged = { ...base, ...overrides };
  merged.scoreResult = calculateRanking(merged.criteria, merged.penalties, merged.title);
  return merged;
}

function createApprovedChecklist(overrides: Partial<ApprovalChecklist> = {}): ApprovalChecklist {
  return {
    sourceVisible: true,
    urlSaved: true,
    noClinicalDiagnosis: true,
    noMockery: true,
    noMinorExposed: true,
    noPrivateContent: true,
    noThirdPartyVideoDownloaded: true,
    noFullArticleCopied: true,
    ownStancePresent: true,
    humanReviewPending: true,
    sourceCitedInNarrative: true,
    sourceCitedInOverlay: true,
    sourceUrlAvailable: true,
    ...overrides
  };
}

test("Editorial - Generación de paquete desde mock", () => {
  const mockCand = createTestCandidate({ id: "mock-1" });
  const pkg = generateEditorialPackage(mockCand);
  assert.strictEqual(pkg.id, "pkg-mock-1");
  assert.strictEqual(pkg.candidateId, "mock-1");
  assert.strictEqual(pkg.status, "draft");
  assert.strictEqual(pkg.editorialBrief.summary, "Resumen editorial mock");
  assert.strictEqual(pkg.scripts.s30.hook, "Biles pressure.");
  assert.strictEqual(pkg.scripts.s60.context, "Según una fuente simulada de prueba, En Tokio.");
  assert.strictEqual(pkg.sourceCitation.overlayCitation, "Fuente simulada: [MOCK] BBC Sport");
  assert.strictEqual(pkg.scripts.s90.cta, "Comenta abajo.");
  assert.strictEqual(pkg.overlayPlan.format, "9:16");
});

test("Editorial - Fuente narrativa incluida en paquete generado", () => {
  const realCand = createTestCandidate({
    id: "real-source-citation",
    title: "Noticia limpia de Simone Biles",
    source: "BBC Sport",
    sourceName: "BBC Sport",
    isMock: false,
    dataType: "REAL_SOURCE",
    verificationStatus: "source_verified"
  });
  const pkg = generateEditorialPackage(realCand);
  assert.strictEqual(pkg.sourceCitation.narrativeCitation, "Según BBC Sport, ");
  assert.ok(pkg.scripts.s30.context.startsWith("Según BBC Sport, "));
  assert.ok(pkg.scripts.s60.context.startsWith("Según BBC Sport, "));
  assert.ok(pkg.scripts.s90.context.startsWith("Según BBC Sport, "));
});

test("Editorial - Fuente overlay incluida en paquete generado", () => {
  const realCand = createTestCandidate({
    id: "real-overlay-citation",
    title: "Noticia limpia de Simone Biles",
    source: "BBC Sport",
    sourceName: "BBC Sport",
    isMock: false,
    dataType: "REAL_SOURCE",
    verificationStatus: "source_verified"
  });
  const pkg = generateEditorialPackage(realCand);
  assert.strictEqual(pkg.sourceCitation.overlayCitation, "Fuente: BBC Sport");
  assert.strictEqual(pkg.overlayPlan.visibleSource, "Fuente: BBC Sport");
});

test("Editorial - Mock queda marcado como fuente simulada", () => {
  const mockCand = createTestCandidate({
    id: "mock-citation",
    source: "[MOCK] BBC Sport",
    sourceName: "BBC Sport",
    isMock: true,
    dataType: "MOCK",
    verificationStatus: "mock"
  });
  const pkg = generateEditorialPackage(mockCand);
  assert.ok(pkg.sourceCitation.narrativeCitation.includes("fuente simulada"));
  assert.ok(pkg.sourceCitation.overlayCitation.includes("Fuente simulada"));
  assert.ok(pkg.sourceCitation.overlayCitation.includes("[MOCK]"));
});

test("Editorial - Bloqueo si falta check de citación narrativa u overlay", () => {
  const realCand = createTestCandidate({
    id: "real-missing-double-citation-check",
    title: "Noticia limpia de Simone Biles",
    source: "BBC Sport",
    sourceName: "BBC Sport",
    isMock: false,
    dataType: "REAL_SOURCE",
    verificationStatus: "source_verified"
  });
  const pkg = generateEditorialPackage(realCand);
  pkg.approvalChecklist = createApprovedChecklist({
    sourceCitedInNarrative: false,
    sourceCitedInOverlay: false
  });

  const val = validatePackageApproval(pkg, realCand);
  assert.strictEqual(val.approved, false);
  assert.ok(val.reasons.some(r => r.includes("narrativa hablada")));
  assert.ok(val.reasons.some(r => r.includes("overlay visible")));
});

test("Editorial - Aprobación exitosa exige citación doble", () => {
  const realCand = createTestCandidate({
    id: "real-double-citation-ok",
    title: "Noticia limpia de Simone Biles",
    source: "BBC Sport",
    sourceName: "BBC Sport",
    isMock: false,
    dataType: "REAL_SOURCE",
    verificationStatus: "source_verified"
  });
  const pkg = generateEditorialPackage(realCand);
  pkg.approvalChecklist = createApprovedChecklist();

  const val = validatePackageApproval(pkg, realCand);
  assert.strictEqual(val.approved, true);
});

test("Editorial - Bloqueo de aprobación por checklist crítico incompleto", () => {
  const mockCand = createTestCandidate({ id: "mock-1", verificationStatus: "mock" });
  const pkg = generateEditorialPackage(mockCand);
  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, false);
  assert.ok(val.reasons.some(r => r.includes("Fuente visible en pantalla")));
  assert.ok(val.reasons.some(r => r.includes("URL de la fuente original guardada")));
});

test("Editorial - Bloqueo de aprobación por compliance", () => {
  const mockCand = createTestCandidate({
    id: "mock-1",
    scripts: {
      s30: "HOOK: Ella es débil mental. COMENTARIO: Tiene depresión clínica.",
      s60: "",
      s90: "",
      captionTiktok: "",
      captionInstagram: "",
      hashtags: []
    }
  });

  const pkg = generateEditorialPackage(mockCand);
  pkg.approvalChecklist = createApprovedChecklist();

  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, false, "Debería estar bloqueado por compliance");
  assert.ok(val.reasons.some(r => r.includes("Frase prohibida detectada")));
});

test("Editorial - Bloqueo de aprobación por needs_review", () => {
  const mockCand = createTestCandidate({
    id: "mock-1",
    title: "Noticia normal",
    source: "BBC Sport",
    verificationStatus: "needs_review",
    isMock: false,
    dataType: "REAL_SOURCE"
  });

  const pkg = generateEditorialPackage(mockCand);
  pkg.approvalChecklist = createApprovedChecklist();

  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, false);
  assert.ok(val.reasons.some(r => r.includes("verificationStatus es 'needs_review'")));
});

test("Editorial - Bloqueo de aprobación por MANUAL_URL sin revisión", () => {
  const mockCand = createTestCandidate({
    id: "mock-1",
    title: "Post manual",
    source: "Manual",
    verificationStatus: "unverified",
    isMock: false,
    dataType: "MANUAL_URL"
  });

  const pkg = generateEditorialPackage(mockCand);
  pkg.approvalChecklist = createApprovedChecklist();

  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, false);
  assert.ok(val.reasons.some(r => r.includes("origen URL Manual y no ha sido verificado") || r.includes("verificationStatus debe ser 'source_verified'")));
});

test("Editorial - Bloqueo de aprobación por falta de sourceUrl", () => {
  const mockCand = createTestCandidate({
    id: "mock-1",
    title: "Noticia sin URL",
    source: "BBC Sport",
    sourceUrl: "",
    isMock: false,
    dataType: "REAL_SOURCE"
  });

  const pkg = generateEditorialPackage(mockCand);
  pkg.approvalChecklist = createApprovedChecklist();

  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, false);
  assert.ok(val.reasons.some(r => r.includes("sourceUrl está vacío")));
});

test("Editorial - Menor involucrado y no está activado modo sensible", () => {
  const mockCand = createTestCandidate({
    id: "mock-minor",
    title: "Presión en el fútbol infantil de cantera",
    source: "Marca",
    tags: ["Fútbol Base"],
    isMock: false,
    dataType: "REAL_SOURCE"
  });

  const pkg = generateEditorialPackage(mockCand);
  pkg.approvalChecklist = createApprovedChecklist({ noMinorExposed: false });

  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, false, "Debería bloquear por menor de edad involucrado sin check");
  assert.ok(val.reasons.some(r => r.includes("protección de menores")));
});

test("Editorial - Aprobación exitosa con todo en regla", () => {
  const mockCand = createTestCandidate({
    id: "mock-ok",
    title: "Noticia limpia de Simone Biles",
    source: "BBC Sport",
    isMock: false,
    dataType: "REAL_SOURCE"
  });

  const pkg = generateEditorialPackage(mockCand);
  pkg.approvalChecklist = createApprovedChecklist();

  const val = validatePackageApproval(pkg, mockCand);
  assert.strictEqual(val.approved, true);
});

console.log("\n=========================================");
console.log(`TEST RUN SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
console.log("=========================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
