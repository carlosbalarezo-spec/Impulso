export interface ComplianceViolation {
  phrase: string;
  alternative: string;
  reason: string;
}

export interface ComplianceReport {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  suggestions: string[];
}

const FORBIDDEN_RULES = [
  // --- ESPAÑOL: Salud mental y No diagnóstico ---
  {
    regex: /(tiene|sufre|padece|sufre\s+de)\s+(depresi[oó]n|ansiedad)|est[aá]\s+deprimido/gi,
    alternative: "no podemos diagnosticar desde fuera; este caso ilustra la presión competitiva o el desgaste físico y mental",
    reason: "Diagnóstico psicológico clínico desde el exterior sin sustento médico oficial.",
  },
  {
    regex: /se\s+quebr[oó]\s+mentalmente|se\s+rompi[oó]\s+mentalmente/gi,
    alternative: "sintió la enorme presión competitiva y el desgaste acumulado",
    reason: "Simplificación sensacionalista de un momento de vulnerabilidad o crisis emocional.",
  },
  {
    regex: /(no\s+tiene\s+mentalidad\s+ganadora|es\s+d[eé]bil|es\s+un\s+d[eé]bil|d[eé]bil\s+mental|no\s+tiene\s+cabeza\s+para\s+competir)/gi,
    alternative: "la fortaleza mental no significa no sentir presión o no flaquear",
    reason: "Juicio de valor destructivo sobre el carácter del atleta.",
  },
  {
    regex: /le\s+falta(n)?\s+huevos/gi,
    alternative: "está lidiando con un entorno de altísima exigencia y estrés",
    reason: "Uso de lenguaje vulgar, sexista y descalificador del esfuerzo atlético.",
  },
  {
    regex: /no\s+naci[oó]\s+para\s+competir/gi,
    alternative: "está en un proceso complejo de adaptación o toma de decisiones difíciles",
    reason: "Determinismo biológico o personal que anula el aprendizaje y resiliencia del atleta.",
  },
  {
    regex: /fracas[oó]\s+por\s+falta\s+de\s+car[aá]cter/gi,
    alternative: "el entorno influyó críticamente en cómo procesó el momento decisivo",
    reason: "Reduccionismo moral o psicológico de un resultado deportivo multifactorial.",
  },

  // --- ESPAÑOL: Lenguaje de Burla y Descalificación ---
  {
    regex: /se\s+arrug[oó]|pecho\s+fr[ií]o|cag[oó]n/gi,
    alternative: "sufrió una parálisis por análisis o una sobrecarga de presión en el cierre",
    reason: "Uso de lenguaje de burla o descalificaciones informales de grada.",
  },

  // --- INGLÉS: Salud mental y No diagnóstico ---
  {
    regex: /(he|she)\s+is\s+depressed|has\s+(depress|anxiet)[a-z]*/gi,
    alternative: "we cannot diagnose from the outside; this case illustrates competitive pressure or physical and mental load",
    reason: "Clinical psychological diagnosis from the outside without official medical backing.",
  },
  {
    regex: /mentally\s+weak|weak\s+mindset|weak\s+mentality/gi,
    alternative: "facing highly demanding environments where mental strength includes acknowledging vulnerability",
    reason: "Destructive character judgment.",
  },
  {
    regex: /not\s+built\s+for\s+competition/gi,
    alternative: "is in a complex adaptation process or making difficult career decisions",
    reason: "Biological determinism that disregards athlete learning and resilience.",
  },

  // --- INGLÉS: Lenguaje de Burla y Choke ---
  {
    regex: /\bchoked\b|\bbottled\s+it\b/gi,
    alternative: "failed to convert under extreme pressure / suffered a performance drop under stress",
    reason: "Use of mockery or hyper-simplified labels for athletic performance setbacks.",
  }
];

export function checkScriptCompliance(text: string): ComplianceReport {
  const violations: ComplianceViolation[] = [];
  const suggestions: string[] = [];

  for (const rule of FORBIDDEN_RULES) {
    const matches = text.match(rule.regex);
    if (matches) {
      for (const match of matches) {
        if (!violations.some(v => v.phrase.toLowerCase() === match.toLowerCase())) {
          violations.push({
            phrase: match,
            alternative: rule.alternative,
            reason: rule.reason,
          });
        }
      }
    }
  }

  const isCompliant = violations.length === 0;

  if (!isCompliant) {
    suggestions.push(
      "Reemplaza los términos prohibidos (" + 
      violations.map(v => `"${v.phrase}"`).join(', ') + 
      ") por alternativas descriptivas y empáticas."
    );
  } else {
    suggestions.push("El texto respeta la política de no diagnóstico y el lenguaje empático.");
  }

  return {
    isCompliant,
    violations,
    suggestions,
  };
}

export function checkCandidateCompliance(candidate: any, scriptVersion: 's30' | 's60' | 's90'): ComplianceReport {
  const fieldsToScan = [
    candidate.title || "",
    candidate.originalTitle || "",
    candidate.summary || "",
    candidate.editorialCard?.summary || "",
    candidate.editorialCard?.context || "",
    candidate.editorialCard?.whyItMatters || "",
    candidate.editorialCard?.psychologicalAngle || "",
    candidate.editorialCard?.managementAngle || "",
    candidate.editorialCard?.salvadorStance || "",
    candidate.scripts?.[scriptVersion] || ""
  ];

  const combinedText = fieldsToScan.join(" | ");
  return checkScriptCompliance(combinedText);
}
