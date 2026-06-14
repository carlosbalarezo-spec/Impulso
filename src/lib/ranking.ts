export type CandidateDataType = "MOCK" | "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" | "REAL_SOURCE" | "MANUAL_URL";
export type VerificationStatus = "mock" | "unverified" | "source_verified" | "needs_review";

export interface RankingCriteria {
  sportMentalHealth: number; // 0 to 100
  publicInterest: number;    // 0 to 100
  sportImpact: number;       // 0 to 100
  publicMentalHealth: number;// 0 to 100
  economicImpact: number;    // 0 to 100
  novelty: number;           // 0 to 100
  pedagogicalPotential: number;// 0 to 100
  audiovisualClarity: number;// 0 to 100
  brandAlignment: number;    // 0 to 100
}

export interface Penalties {
  isRumor: boolean;
  isWeakSource: boolean;
  hasDefamationRisk: boolean;
  hasMinorWithoutFocus: boolean;
  hasDiagnosticRisk: boolean;
  hasNoOwnStance: boolean;
}

export interface RankingResult {
  score: number;
  baseScore: number;
  breakdown: {
    sportMentalHealth: number;
    publicInterest: number;
    sportImpact: number;
    publicMentalHealth: number;
    economicImpact: number;
    novelty: number;
    pedagogicalPotential: number;
    audiovisualClarity: number;
    brandAlignment: number;
  };
  penaltiesApplied: {
    name: string;
    points: number;
    description: string;
  }[];
  explanation: string;
  recommendation: 'publicar' | 'revisar' | 'descartar';
}

const WEIGHTS = {
  sportMentalHealth: 0.20,
  publicInterest: 0.15,
  sportImpact: 0.15,
  publicMentalHealth: 0.10,
  economicImpact: 0.10,
  novelty: 0.10,
  pedagogicalPotential: 0.10,
  audiovisualClarity: 0.05,
  brandAlignment: 0.05,
};

export function calculateRanking(
  criteria: RankingCriteria,
  penalties: Penalties,
  title: string,
  dataType: CandidateDataType = "MOCK",
  trustTier: 'high' | 'medium' | 'low' = "medium",
  verificationStatus: VerificationStatus = "mock",
  date?: string,
  sourceFailing: boolean = false
): RankingResult {
  // 1. Calculate Base Score
  const sportMentalHealthW = criteria.sportMentalHealth * WEIGHTS.sportMentalHealth;
  const publicInterestW = criteria.publicInterest * WEIGHTS.publicInterest;
  const sportImpactW = criteria.sportImpact * WEIGHTS.sportImpact;
  const publicMentalHealthW = criteria.publicMentalHealth * WEIGHTS.publicMentalHealth;
  const economicImpactW = criteria.economicImpact * WEIGHTS.economicImpact;
  const noveltyW = criteria.novelty * WEIGHTS.novelty;
  const pedagogicalPotentialW = criteria.pedagogicalPotential * WEIGHTS.pedagogicalPotential;
  const audiovisualClarityW = criteria.audiovisualClarity * WEIGHTS.audiovisualClarity;
  const brandAlignmentW = criteria.brandAlignment * WEIGHTS.brandAlignment;

  let baseScore = sportMentalHealthW + publicInterestW + sportImpactW + publicMentalHealthW +
    economicImpactW + noveltyW + pedagogicalPotentialW + audiovisualClarityW + brandAlignmentW;

  // 1.1 Source Quality Adjustments
  let sourceBonus = 0;
  if (dataType === "REAL_SOURCE" && trustTier === "high" && verificationStatus === "source_verified") {
    sourceBonus = 5;
    baseScore = Math.min(100, baseScore + sourceBonus);
  }

  // 2. Process Penalties
  const penaltiesApplied: { name: string; points: number; description: string }[] = [];
  let penaltySum = 0;

  if (penalties.isRumor) {
    penaltiesApplied.push({
      name: "Rumor no confirmado",
      points: 30,
      description: "El hecho se basa en especulaciones de prensa o redes sin confirmación oficial de los involucrados.",
    });
    penaltySum += 30;
  }
  if (penalties.isWeakSource) {
    penaltiesApplied.push({
      name: "Fuente débil / Dudosa",
      points: 20,
      description: "La información proviene de portales sensacionalistas o perfiles sin trayectoria periodística seria.",
    });
    penaltySum += 20;
  }
  if (penalties.hasDefamationRisk) {
    penaltiesApplied.push({
      name: "Riesgo de difamación",
      points: 40,
      description: "El contenido realiza aseveraciones graves sobre la vida privada o conducta ética de un atleta sin pruebas judiciales.",
    });
    penaltySum += 40;
  }
  if (penalties.hasMinorWithoutFocus) {
    penaltiesApplied.push({
      name: "Menor involucrado sin enfoque formativo",
      points: 30,
      description: "Involucra a un atleta menor de 18 años exponiendo su vida privada o criticándolo duramente en lugar de enfocarse en el entorno y presión adulta.",
    });
    penaltySum += 30;
  }
  if (penalties.hasDiagnosticRisk) {
    penaltiesApplied.push({
      name: "Riesgo de diagnóstico clínico directo",
      points: 40,
      description: "Se intenta diagnosticar un trastorno clínico desde fuera (depresión, ansiedad, burnout) violando las directrices éticas de IMPULSO.",
    });
    penaltySum += 40;
  }
  if (penalties.hasNoOwnStance) {
    penaltiesApplied.push({
      name: "Sin ángulo transformativo propio",
      points: 25,
      description: "El tema no ofrece espacio para aportar valor, psicología o gestión, resultando en una mera repetición de la noticia.",
    });
    penaltySum += 25;
  }

  // --- NEW AUDIT AG-0003 PENALTIES ---
  if (dataType === "MANUAL_URL" && verificationStatus === "needs_review") {
    penaltiesApplied.push({
      name: "URL manual sin verificar",
      points: 15,
      description: "La noticia o post fue cargado manualmente y está pendiente de revisión de compliance y autenticidad.",
    });
    penaltySum += 15;
  }

  if (trustTier === "low") {
    penaltiesApplied.push({
      name: "Fuente de baja reputación",
      points: 15,
      description: "El medio original tiene calificaciones bajas de confiabilidad periodística.",
    });
    penaltySum += 15;
  }

  if (sourceFailing) {
    penaltiesApplied.push({
      name: "Fuente con problemas de salud",
      points: 10,
      description: "El medio de origen ha presentado fallos de conexión o inactividad en los últimos chequeos de salud.",
    });
    penaltySum += 10;
  }

  if (!date) {
    penaltiesApplied.push({
      name: "Ausencia de fecha de publicación",
      points: 10,
      description: "No se pudo determinar cuándo se publicó la noticia, aumentando el riesgo de anacronismo.",
    });
    penaltySum += 10;
  } else {
    // Parse date and compare with 2026-06-13
    try {
      const pubDate = new Date(date);
      const currentDate = new Date("2026-06-13");
      const diffTime = Math.abs(currentDate.getTime() - pubDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 5) {
        penaltiesApplied.push({
          name: "Noticia antigua (>5 días)",
          points: 15,
          description: "La noticia fue publicada hace más de 5 días, perdiendo novedad para el formato de video corto.",
        });
        penaltySum += 15;
      }
    } catch (e) {
      // Ignorar errores de parseo
    }
  }

  // 3. Calculate Final Score
  const score = Math.max(0, Math.round(baseScore - penaltySum));

  // 4. Recommendation Range
  let recommendation: 'publicar' | 'revisar' | 'descartar' = 'descartar';
  if (score >= 90) {
    recommendation = 'publicar';
  } else if (score >= 60) {
    recommendation = 'revisar';
  } else {
    recommendation = 'descartar';
  }

  // 5. Generate Natural Language Explanation
  let explanation = `El tema "${title}" tiene una puntuación base de ${baseScore.toFixed(1)}/100, fundamentada en su relevancia de salud mental deportiva (${criteria.sportMentalHealth}/100) y potencial pedagógico (${criteria.pedagogicalPotential}/100). `;
  
  if (sourceBonus > 0) {
    explanation += `Incluye un bono de +${sourceBonus} puntos por proceder de una fuente oficial/confiable. `;
  }

  if (penaltiesApplied.length > 0) {
    explanation += `Sin embargo, se han aplicado penalizadores que restan un total de -${penaltySum} puntos. Las penalizaciones incluyen: ${penaltiesApplied.map(p => `${p.name} (-${p.points} pts)`).join(', ')}. `;
  }

  if (recommendation === 'publicar') {
    explanation += `Se recomienda publicar. Es un tema de alta prioridad y alineación con IMPULSO, con un balance óptimo entre interés periodístico y valor educativo en psicología.`;
  } else if (recommendation === 'revisar') {
    explanation += `Se clasifica como "Revisar". El tema tiene potencial, pero requiere mitigar riesgos (por ejemplo, suavizando aseveraciones o corroborando fuentes) y asegurar que el guion adopte una postura constructiva antes de grabar.`;
  } else {
    explanation += `Se recomienda descartar. El puntaje final de ${score}/100 indica que los riesgos editoriales, éticos o la falta de alineación de fuentes superan el interés informativo.`;
  }

  return {
    score,
    baseScore: Math.round(baseScore),
    breakdown: {
      sportMentalHealth: Math.round(sportMentalHealthW),
      publicInterest: Math.round(publicInterestW),
      sportImpact: Math.round(sportImpactW),
      publicMentalHealth: Math.round(publicMentalHealthW),
      economicImpact: Math.round(economicImpactW),
      novelty: Math.round(noveltyW),
      pedagogicalPotential: Math.round(pedagogicalPotentialW),
      audiovisualClarity: Math.round(audiovisualClarityW),
      brandAlignment: Math.round(brandAlignmentW),
    },
    penaltiesApplied,
    explanation,
    recommendation,
  };
}
