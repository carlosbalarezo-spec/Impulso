import fs from 'fs';
import path from 'path';
import { calculateRanking, RankingCriteria, Penalties, RankingResult } from './ranking';

export type CandidateDataType = "MOCK" | "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" | "REAL_SOURCE" | "MANUAL_URL";
export type VerificationStatus = "mock" | "unverified" | "source_verified" | "needs_review";

export interface SourceCitation {
  sourceName: string;
  sourceUrl?: string;
  sourceType?: string;
  verificationStatus: VerificationStatus;
  narrativeCitation: string;
  overlayCitation: string;
}

export interface Candidate {
  id: string;
  title: string;
  source: string;
  language: 'ES' | 'EN' | 'DE';
  date: string;
  link: string; // Mock or Real URL
  realSourceUrl?: string; // Prepared field for future real source URL
  sourceUrl?: string;
  sourceName?: string;
  sourceFeedUrl?: string;
  ingestedAt?: string;
  originalTitle?: string;
  sourcePublishedAt?: string;
  verificationStatus: VerificationStatus;
  contentStored?: 'metadata_only';
  summary: string;
  entities: string[];
  tags: string[];
  criteria: RankingCriteria;
  penalties: Penalties;
  scoreResult: RankingResult;
  status: 'idea' | 'preselected' | 'script_generated' | 'ready_to_record' | 'recorded' | 'edited' | 'approved' | 'published' | 'descartado';
  isMock: boolean;
  dataType: CandidateDataType;
  editorialCard: {
    summary: string;
    context: string;
    whyItMatters: string;
    psychologicalAngle: string;
    managementAngle: string;
    salvadorStance: string;
    counterArgument: string;
    simplificationRisk: string;
    phrasesToAvoid: string[];
    verifiedSources: string[];
    complianceNote: string;
  };
  scripts: {
    s30: string;
    s60: string;
    s90: string;
    captionTiktok: string;
    captionInstagram: string;
    hashtags: string[];
  };
  overlayPlan: {
    background: string;
    headline: string;
    sourceCitation: string;
    salvadorPosition: string;
    largeText: string;
    timeline: { time: string; action: string }[];
    recsTiktok: string;
    recsInstagram: string;
  };
  history: {
    timestamp: string;
    fromStatus: string;
    toStatus: string;
    note: string;
  }[];
}

export interface AnalyticsRecord {
  id: string;
  candidateId: string;
  title: string;
  platform: 'tiktok' | 'instagram';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  retentionRate: number;
  publishDate: string;
  hookUsed: string;
  duration: number;
}

export interface IngestionLog {
  timestamp: string;
  sourceId: string;
  url: string;
  status: 'success' | 'warning' | 'error';
  itemsFound: number;
  itemsSaved: number;
  duplicatesOmitted: number;
  errorMessage?: string;
  durationMs: number;
  runId: string;
}

export interface EditorialBrief {
  summary: string;
  context: string;
  whyItMatters: string;
  psychologicalAngle: string;
  managementAngle: string;
  salvadorStance: string;
  counterArgument: string;
  simplificationRisk: string;
  phrasesToAvoid: string[];
  verifiedSources: string[];
  complianceNote: string;
}

export interface ScriptSetVariant {
  hook: string;
  context: string;
  centralComment: string;
  example: string;
  closure: string;
  cta: string;
  subtitles: string;
  captionTiktok: string;
  captionInstagram: string;
  hashtags: string[];
}

export interface ScriptSet {
  s30: ScriptSetVariant;
  s60: ScriptSetVariant;
  s90: ScriptSetVariant;
}

export interface OverlayPlan {
  format: "9:16";
  salvadorPosition: string;
  visibleTitle: string;
  visibleSource: string;
  largeText: string;
  emphasisMoments: { time: string; action: string }[];
  copyrightWarning: string;
  ownBRollSuggestion: string;
  noThirdPartyVideoWarning: string;
}

export interface ApprovalChecklist {
  sourceVisible: boolean;
  urlSaved: boolean;
  noClinicalDiagnosis: boolean;
  noMockery: boolean;
  noMinorExposed: boolean;
  noPrivateContent: boolean;
  noThirdPartyVideoDownloaded: boolean;
  noFullArticleCopied: boolean;
  ownStancePresent: boolean;
  humanReviewPending: boolean;
  sourceCitedInNarrative: boolean;
  sourceCitedInOverlay: boolean;
  sourceUrlAvailable: boolean;
}

export interface ComplianceResult {
  passed: boolean;
  reasons: string[];
}

export interface EditorialPackage {
  id: string;
  candidateId: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "needs_review" | "ready_to_record" | "recorded" | "edited" | "approved" | "published_manual" | "discarded";
  editorialBrief: EditorialBrief;
  scripts: ScriptSet;
  overlayPlan: OverlayPlan;
  approvalChecklist: ApprovalChecklist;
  complianceResult: ComplianceResult;
  sourceCitation: SourceCitation;
}

interface DBData {
  candidates: Candidate[];
  analytics: AnalyticsRecord[];
  ingestHistory: IngestionLog[];
  lastIngestTime?: string;
  editorialPackages: EditorialPackage[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const getInitialSeed = (): DBData => {
  const seedCandidates: Omit<Candidate, 'scoreResult'>[] = [
    {
      id: "en-1",
      title: "[SIMULACIÓN] Simone Biles talks pressure and gymnastics mental blocks before major tournament",
      source: "[MOCK] BBC Sport",
      language: "EN",
      date: "2026-06-12",
      link: "https://mock.bbc.com/sport/gymnastics/biles-pressure",
      realSourceUrl: "",
      sourceUrl: "https://mock.bbc.com/sport/gymnastics/biles-pressure",
      sourceName: "BBC Sport",
      verificationStatus: "mock",
      summary: "Simone Biles explica en una entrevista simulada cómo maneja el miedo a los 'twisties' y la presión, priorizando la terapia mental sobre el entrenamiento excesivo.",
      entities: ["Simone Biles"],
      tags: ["Salud Mental", "Presión", "Gimnasia"],
      criteria: {
        sportMentalHealth: 95,
        publicInterest: 90,
        sportImpact: 85,
        publicMentalHealth: 85,
        economicImpact: 30,
        novelty: 80,
        pedagogicalPotential: 90,
        audiovisualClarity: 80,
        brandAlignment: 90
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "preselected",
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT",
      editorialCard: {
        summary: "Simone Biles y la superación de los twisties para la competencia.",
        context: "Basado en declaraciones públicas de Biles sobre sus bloqueos mentales de orientación espacial experimentados en Tokio.",
        whyItMatters: "Visibiliza que los bloqueos mentales no son cobardía sino un peligro fisiológico real en deportes de alto riesgo.",
        psychologicalAngle: "Gestión de la ansiedad somática, disociación bajo estrés extremo y el papel del apoyo terapéutico continuo.",
        managementAngle: "Gobernanza deportiva y el deber de cuidado de las federaciones hacia el bienestar del deportista ante los patrocinadores.",
        salvadorStance: "Celebrar la madurez de Biles al priorizar su salud y explicar que parar a tiempo en el alto rendimiento es una victoria y no debilidad.",
        counterArgument: "Críticos antiguos dicen que abandonar debilita el espíritu competitivo tradicional.",
        simplificationRisk: "Decir que se curó mágicamente; la salud mental es un mantenimiento diario continuo.",
        phrasesToAvoid: ["estaba deprimida", "sufre de burnout crónico", "es débil mentalmente", "no aguantó la presión"],
        verifiedSources: ["BBC Sport (Public Interviews Context)"],
        complianceNote: "Evitar etiquetar a Biles con diagnósticos clínicos. Hablar en su lugar de bloqueos de orientación y manejo del estrés."
      },
      scripts: {
        s30: "HOOK: ¿Qué pasa cuando tu propio cerebro se apaga en el aire? Simone Biles lo llama 'twisties' y casi le cuesta la carrera. COMENTARIO: En Tokio decidió retirarse por seguridad, lo que muchos llamaron cobardía. Hoy demuestra que la verdadera fortaleza mental es saber cuándo parar para reconstruirse. EJEMPLO: Biles regresó integrando terapia mental regular en su entrenamiento diario. CTA: ¿Pararías en tu trabajo si tu mente colapsa? Opina abajo.",
        s60: "HOOK: La gimnasta más grande de todos los tiempos casi lo pierde todo por un bloqueo mental. Simone Biles vuelve a hablar de la presión antes de los Juegos Olímpicos. CONTEXTO: En Tokio sufrió 'twisties', un fenómeno donde el cerebro pierde la conexión con el cuerpo en el aire. Peligro de muerte. COMENTARIO: Salvador aquí: esto no es falta de carácter. Es una respuesta biológica al estrés extremo. Biles demuestra que entrenar la mente no es un lujo, sino una parte del rendimiento. Ella asiste a terapia semanal y ha puesto límites claros a los medios. EJEMPLO: Su enfoque demuestra que el éxito sostenible requiere balance emocional. CTA: La cabeza también juega, ¿tú cuidas tu descanso mental?",
        s90: "HOOK: ¿Es la retirada de Simone Biles en Tokio el mayor ejemplo de fortaleza mental del deporte moderno? Muchos dijeron que era debilidad; hoy sabemos que salvó su carrera. CONTEXTO: En la gimnasia artística, perder el control a mitad de un giro te puede dejar en silla de ruedas. Los 'twisties' son reales y ocurren bajo estrés crítico. COMENTARIO: Salvador comenta: Los atletas no son robots. Biles cambió la conversación mundial al bajarse de la competencia para priorizar su salud. Ahora, vuelve como favorita pero con una regla clara: la salud mental está por encima de cualquier medalla de oro. Esto nos enseña que el rendimiento no se trata de resistir el dolor hasta romperse, sino de conocer y respetar tus propios límites. EJEMPLO: Su régimen actual incluye sesiones semanales con psicólogos deportivos y descansos programados de redes sociales. CTA: ¿Crees que las federaciones deportivas protegen suficiente a sus atletas? Déjalo en comentarios.",
        captionTiktok: "Simone Biles y la lección mental más importante para París 🧠🤸‍♀️. ¿Debilidad o inteligencia? #saludmental #deporte #simonebiles #psicologia #alto-rendimiento",
        captionInstagram: "La verdadera fortaleza mental no es aguantar hasta romperse. Simone Biles nos enseña que poner límites y cuidar la mente es el verdadero camino al oro. 🧠✨ #Deporte #PsicologiaDeportiva #SaludMental #Rendimiento #Gymnastics",
        hashtags: ["saludmental", "psicologiadeportiva", "simonebiles", "rendimiento", "disciplina"]
      },
      overlayPlan: {
        background: "Captura de pantalla de la noticia de BBC Sport con titular sobre Biles y psicoterapia.",
        headline: "Simone Biles: 'La terapia salvó mi gimnasia'",
        sourceCitation: "Fuente simulada: [MOCK] BBC Sport",
        salvadorPosition: "Centro inferior, dejando la mitad superior libre para ver el titular de prensa.",
        largeText: "TERAPIA = RENDIMIENTO",
        timeline: [
          { time: "0:00", action: "Mostrar Salvador con cara seria y de fondo la captura difuminada del titular de BBC." },
          { time: "0:10", action: "Zoom en la frase clave 'twisties' en la pantalla." },
          { time: "0:25", action: "Mostrar texto grande en pantalla: TERAPIA = RENDIMIENTO." },
          { time: "0:45", action: "Salvador mira a cámara en primer plano enfatizando el CTA." }
        ],
        recsTiktok: "Subtítulos dinámicos de colores llamativos estilo TikTok y ritmo rápido.",
        recsInstagram: "Diseño estético minimalista con tonos neutros e iluminación suave."
      },
      history: [
        { timestamp: "2026-06-13T18:00:00Z", fromStatus: "idea", toStatus: "preselected", note: "Importado automáticamente de fuentes recomendadas." }
      ]
    },
    {
      id: "en-2",
      title: "[SIMULACIÓN] Harry Kane on adapting to league pressure and media scrutiny",
      source: "[MOCK] Sky Sports",
      language: "EN",
      date: "2026-06-11",
      link: "https://mock.skysports.com/football/kane-bundesliga-pressure",
      realSourceUrl: "",
      sourceUrl: "https://mock.skysports.com/football/kane-bundesliga-pressure",
      sourceName: "Sky Sports",
      verificationStatus: "mock",
      summary: "Harry Kane describe de forma simulada los desafíos psicológicos del cambio de cultura y la extrema exigencia de la prensa bávara tras su trasplante.",
      entities: ["Harry Kane"],
      tags: ["Adaptación", "Gestión Deportiva", "Presión", "Fútbol"],
      criteria: {
        sportMentalHealth: 80,
        publicInterest: 75,
        sportImpact: 80,
        publicMentalHealth: 60,
        economicImpact: 70,
        novelty: 70,
        pedagogicalPotential: 75,
        audiovisualClarity: 75,
        brandAlignment: 80
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "idea",
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT",
      editorialCard: {
        summary: "La adaptación de Harry Kane a la presión en su club.",
        context: "Basado en entrevistas públicas sobre la aclimatación de Kane al fútbol alemán.",
        whyItMatters: "Refleja que cambiar de entorno corporativo (club) afecta el rendimiento sin importar el nivel de ingresos.",
        psychologicalAngle: "Estrés por aculturación, resiliencia familiar y manejo de expectativas externas.",
        managementAngle: "El soporte de relocalización de los clubes y el retorno de inversión de fichajes millonarios.",
        salvadorStance: "Explicar que la adaptación no es inmediata y que el éxito inicial requiere paciencia y apoyo familiar.",
        counterArgument: "Analistas opinan que cobrando millones debe rendir desde el día uno.",
        simplificationRisk: "Pensar que los futbolistas de élite no sienten desarraigo por tener dinero.",
        phrasesToAvoid: ["está deprimido", "no tiene carácter para jugar fuera"],
        verifiedSources: ["Sky Sports (Public Scrutiny Context)"],
        complianceNote: "Centrar el análisis en la transición profesional y adaptabilidad."
      },
      scripts: {
        s30: "HOOK: ¿Por qué mudarse de país afecta hasta al delantero más caro del mundo? Harry Kane rompe el silencio sobre Múnich. COMENTARIO: Vivir meses en un hotel lejos de tu familia destruye tu enfoque. Kane demuestra que el rendimiento depende de la estabilidad emocional fuera de la cancha. EJEMPLO: El club contrató asistentes dedicados solo a integrar a su familia. CTA: ¿Rendirías igual en tu trabajo si tu familia está lejos?",
        s60: "HOOK: El dinero no compra la adaptación inmediata. Harry Kane y el lado invisible de su pase al Bayern. CONTEXTO: Con un traspaso récord, la prensa exigía goles inmediatos. Pero Kane revela la dificultad del idioma y la distancia familiar. COMENTARIO: Salvador comenta: Olvidamos que detrás del deportista de millones hay un ser humano en transición. El estrés de relocalización afecta el enfoque. No se trata de falta de disciplina, sino de adaptación humana. EJEMPLO: Su desempeño mejoró drásticamente una vez que su family se mudó. CTA: ¿Le exiges a tu equipo rendimiento sin darles tiempo de adaptarse?",
        s90: "HOOK: ¿Cuánto afecta el cambio de entorno al rendimiento de un profesional? El caso de Harry Kane es la prueba de que el talento no basta sin estabilidad familiar. CONTEXTO: Kane dejó Londres tras toda una vida. En su nuevo club, la prensa bávara es implacable y no perdona fallos tácticos. COMENTARIO: Salvador analiza: La adaptación cultural es un proceso psicológico complejo. A menudo la afición opina que cobrar millones anula la soledad o el estrés de aprender otro idioma. Kane demostró inteligencia emocional al enfocarse en los aspectos prácticos y aceptar la ayuda del club para estabilizar su vida privada. EJEMPLO: La gestión deportiva moderna ya no solo entrena lo físico; cuida el bienestar logístico y familiar de sus activos más caros. CTA: ¿Crees que las empresas descuidan la salud familiar de sus trabajadores?",
        captionTiktok: "El lado humano del fichaje de Harry Kane ⚽️🇩🇪. La adaptación familiar importa más de lo que crees. #futbol #harrykane #bayern #psicologia",
        captionInstagram: "La aclimatación familiar y el bienestar logístico son determinantes para el rendimiento laboral. Harry Kane demuestra la importancia de la estabilidad emocional fuera del campo. ⚽️🧠 #Fútbol #PsicologíaDeportiva #GestiónDeportiva #HarryKane",
        hashtags: ["harrykane", "bayern", "adaptacion", "psicologia", "gestion"]
      },
      overlayPlan: {
        background: "Foto de Kane entrenando con mirada pensativa en Múnich.",
        headline: "Harry Kane: 'La mudanza fue un reto mental'",
        sourceCitation: "Fuente simulada: [MOCK] Sky Sports",
        salvadorPosition: "Derecha, dejando la izquierda para texto animado.",
        largeText: "ESTABILIDAD = RENDIMIENTO",
        timeline: [
          { time: "0:00", action: "Mostrar foto de Kane en el hotel." },
          { time: "0:15", action: "Aparece frase grande: ESTABILIDAD = RENDIMIENTO." }
        ],
        recsTiktok: "Subtítulos rápidos y dinámicos.",
        recsInstagram: "Diseño sobrio y elegante."
      },
      history: []
    },
    {
      id: "en-3",
      title: "[SIMULACIÓN] European club financial report shows massive revenues but raises Super League doubts",
      source: "[MOCK] Reuters",
      language: "EN",
      date: "2026-06-10",
      link: "https://mock.reuters.com/sports/club-finance-superleague",
      realSourceUrl: "",
      sourceUrl: "https://mock.reuters.com/sports/club-finance-superleague",
      sourceName: "Reuters",
      verificationStatus: "mock",
      summary: "El último reporte financiero simulado expone ingresos récord por estadios pero abre interrogantes sobre la presión a favor de la Superliga Europea.",
      entities: ["Real Madrid", "Super League"],
      tags: ["Economía del Deporte", "Gestión Deportiva", "Finanzas"],
      criteria: {
        sportMentalHealth: 20,
        publicInterest: 80,
        sportImpact: 70,
        publicMentalHealth: 10,
        economicImpact: 95,
        novelty: 75,
        pedagogicalPotential: 80,
        audiovisualClarity: 70,
        brandAlignment: 75
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "idea",
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT",
      editorialCard: {
        summary: "Finanzas de clubes y el proyecto Superliga.",
        context: "Cuentas basadas en la remodelación de estadios multiusos bajo el temor a los clubes financieros por petroestados.",
        whyItMatters: "Explica cómo funciona la economía del fútbol moderno y la guerra por el control de los derechos de transmisión.",
        psychologicalAngle: "Avaricia vs. sostenibilidad a largo plazo; la mentalidad de crecimiento ilimitado frente al arraigo de la afición local.",
        managementAngle: "Estrategias de diversificación de ingresos de estadios multiusos (conciertos, NFL).",
        salvadorStance: "Analizar objetivamente que la Superliga no es un capricho, sino un intento de las directivas por blindarse ante los clubes estado financistas (PSG, Man City).",
        counterArgument: "La afición tradicional argumenta que rompe el mérito deportivo de ligas nacionales.",
        simplificationRisk: "Pintar al Madrid como el villano absoluto o el héroe salvador del fútbol.",
        phrasesToAvoid: [],
        verifiedSources: ["Reuters (Public Financial Context)"],
        complianceNote: "Evitar aseveraciones conspirativas sobre Florentino Pérez. Enfocar en finanzas y gobernanza."
      },
      scripts: {
        s30: "HOOK: ¿Por qué los grandes clubes ganan más dinero que nunca pero siguen insistiendo en la Superliga? COMENTARIO: Con los estadios remodelados ingresan millones por conciertos y NFL. Sin embargo, temen el dominio de clubes controlados por estados petroleros. Es una guerra de poder financiero, no deportivo. CTA: ¿Apoyas la Superliga o el fútbol tradicional?",
        s60: "HOOK: La paradoja del fútbol de élite: cuentas perfectas, pero pánico económico. ¿Por qué insisten tanto en la Superliga? CONTEXTO: Sus balances financieros reportan ingresos históricos. Los estadios ya no son solo canchas, sino minas de oro comercial. COMENTARIO: Salvador analiza: La clave está en el control de la UEFA. Los clubes tradicionales ven que los clubes estado tienen recursos casi infinitos. Para competir a largo plazo, necesitan torneos cerrados que garanticen miles de millones. EJEMPLO: Los estadios operan conciertos masivos para no depender solo de la taquilla. CTA: ¿Crees que los clubes tradicionales podrán competir sin jeques?",
        s90: "HOOK: ¿El fútbol europeo está en peligro de extinción comercial? Los clubes publican ingresos récord, pero su obsesión por la Superliga tiene una razón matemática de fondo. CONTEXTO: A pesar del éxito financiero de la última temporada, las directivas argumentan que las audiencias jóvenes caen y los ingresos de TV locales se estancan. COMENTARIO: Salvador explica: Esto es pura gestión deportiva y geopolítica financiera. El modelo actual de Champions League no es suficiente para los gigantes europeos que compiten contra la Premier League y el dinero de Medio Oriente. La Superliga es un intento de crear un oligopolio de entretenimiento masivo. El riesgo es que al desconectarse del aficionado local, el fútbol pierda su alma tradicional y mística. EJEMPLO: El modelo de negocio se desplaza del aficionado de grada al espectador de streaming global. CTA: ¿Cuál crees que sea el futuro de los clubes de socios?",
        captionTiktok: "La paradoja del dinero en el fútbol ⚽️💰. ¿Por qué quieren la Superliga si ingresan récord? #futbol #superliga #finanzas",
        captionInstagram: "Análisis financiero del fútbol: Ingresos récord, remodelación de estadios y el trasfondo estratégico de la Superliga Europea. ⚽️📊 #RealMadrid #Superliga #GobernanzaDeportiva #Negocios #Fútbol",
        hashtags: ["futbol", "superliga", "finanzasdeportivas", "negocios"]
      },
      overlayPlan: {
        background: "Gráfico de barras de ingresos del Real Madrid y el Bernabéu iluminado.",
        headline: "Ingresos récords de clubes europeos",
        sourceCitation: "Fuente simulada: [MOCK] Reuters",
        salvadorPosition: "Izquierda, dejando la derecha libre para el gráfico.",
        largeText: "GEOPOLÍTICA DEL FÚTBOL",
        timeline: [
          { time: "0:00", action: "Mostrar el estadio Bernabéu de fondo." },
          { time: "0:15", action: "Aparece gráfico financiero de ingresos." }
        ],
        recsTiktok: "Infografías animadas rápidas.",
        recsInstagram: "Diseño elegante tipo Business Insider."
      },
      history: []
    },
    {
      id: "es-1",
      title: "[SIMULACIÓN] Mediocampista habla de la exigencia física y las recaídas: la mente juega",
      source: "[MOCK] El País Deportes",
      language: "ES",
      date: "2026-06-13",
      link: "https://mock.elpais.com/deportes/pedri-lesiones-mente",
      realSourceUrl: "",
      sourceUrl: "https://mock.elpais.com/deportes/pedri-lesiones-mente",
      sourceName: "El País Deportes",
      verificationStatus: "mock",
      summary: "En esta simulación, el mediocampista del Barcelona admite la frustración de las lesiones musculares recurrentes y cómo el miedo a volver a romperse afectó su estilo de juego.",
      entities: ["Pedri"],
      tags: ["Lesiones", "Frustración", "Salud Mental", "Fútbol"],
      criteria: {
        sportMentalHealth: 90,
        publicInterest: 85,
        sportImpact: 80,
        publicMentalHealth: 70,
        economicImpact: 50,
        novelty: 85,
        pedagogicalPotential: 85,
        audiovisualClarity: 75,
        brandAlignment: 90
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "preselected",
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT",
      editorialCard: {
        summary: "La lucha psicológica de Pedri contra las recaídas de lesiones.",
        context: "Caso construido a partir de los periodos de baja sucesivos y las declaraciones sobre el temor a las recaídas de Pedri.",
        whyItMatters: "Muestra que el miedo a lesionarse condiciona el rendimiento físico del atleta (freno motor preventivo).",
        psychologicalAngle: "El círculo vicioso del miedo a la recaída, la frustración por inactividad y la pérdida de autoconfianza muscular.",
        managementAngle: "La sobrecarga de partidos del calendario oficial y el dilema de los clubes de arriesgar la salud de jóvenes talentos.",
        salvadorStance: "Explicar que la recuperación física no está completa si no se trabaja el miedo mental a la recaída.",
        counterArgument: "Aficionados impacientes dicen que a su edad debería aguantar todo físicamente.",
        simplificationRisk: "Decir que las lesiones son puramente psicológicas, ignorando la sobrecarga real de partidos.",
        phrasesToAvoid: ["está deprimido de tanto romperse", "tiene mentalidad de cristal", "es débil"],
        verifiedSources: ["El País Deportes (Public Medical Context)"],
        complianceNote: "Enfoque científico del entrenamiento deportivo y psicología del trauma deportivo. No diagnosticar debilidades de carácter."
      },
      scripts: {
        s30: "HOOK: ¿Por qué un deportista con talento millonario le tiene miedo a correr? Pedri confiesa el lado oscuro de las lesiones. COMENTARIO: Cuando te rompes el muslo tres veces seguidas, el miedo a la recaída te frena el cerebro. Tu mente activa un escudo invisible que te impide competir al cien. EJEMPLO: Pedri empezó a entrenar la mente tanto como las piernas para volver a confiar en su cuerpo. CTA: ¿Te ha frenado el miedo a fallar después de un error?",
        s60: "HOOK: El miedo a romperse: la barra mental invisible de Pedri que la afición no entiende. CONTEXTO: Tras encadenar múltiples lesiones musculares, Pedri confiesa lo duro que es entrenar con miedo. COMENTARIO: Salvador comenta: El cerebro de un atleta tiene memoria del dolor. Si has sufrido roturas de fibras consecutivas, tu sistema nervioso se autoprotege impidiendo que alcances tu máxima velocidad. No es flojera o debilidad mental, es un mecanismo biológico de defensa. Para curarse del todo, hay que rehabilitar el cerebro tanto como el músculo. EJEMPLO: Los planes de recuperación modernos ya incluyen sesiones de biofeedback y psicología deportiva. CTA: ¿Crees que los equipos saturan a los jóvenes?",
        s90: "HOOK: ¿Es posible jugar al fútbol de élite cuando tu propia mente te pide que te detengas? Pedri y la psicología del miedo a la lesión. CONTEXTO: Las repetidas bajas del canario generaron un debate sobre si su físico está preparado para el Barcelona. COMENTARIO: Salvador explica: La sobrecarga de partidos de las estrellas jóvenes pasa factura física, pero también mental. El deportista lesionado sufre de aislamiento, pérdida de identidad y frustración constante por no ayudar al grupo. Al regresar, el mayor reto no es el tono muscular, sino la autoconfianza. El jugador teme que cada sprint sea el último. La gestión médica debe aliarse con la psicología deportiva para desactivar ese freno de mano mental. EJEMPLO: Casos históricos muestran que sin acompañamiento mental, el miedo altera la biomecánica provocando lesiones en otras zonas del cuerpo. CTA: Deja tu mensaje de apoyo a Pedri en comentarios.",
        captionTiktok: "Pedri confiesa el miedo mental detrás de sus lesiones recurrentes 🧠⚽️. ¿Se cuida a los deportistas jóvenes? #pedri #barca #lesion #psicologia #deporte",
        captionInstagram: "Las lesiones musculares repetitivas no solo afectan las piernas; dejan huellas en el cerebro del deportista. La rehabilitación mental es clave para recuperar la autoconfianza. ⚽️🧠 #Pedri #FCBarcelona #LesionesDeportivas #PsicologíaDeportiva #SaludMental",
        hashtags: ["pedri", "fcbarcelona", "lesiones", "psicologia", "saludmental"]
      },
      overlayPlan: {
        background: "Captura de pantalla de Pedri saliendo del campo tocándose el muslo y titular de prensa sobre el miedo a recaer.",
        headline: "Pedri: 'El miedo a recaer es lo peor de la lesión'",
        sourceCitation: "Fuente simulada: [MOCK] El País Deportes",
        salvadorPosition: "Centro inferior con subtítulos en la zona media.",
        largeText: "REHABILITACIÓN CEREBRAL",
        timeline: [
          { time: "0:00", action: "Mostrar clip de Pedri abandonando la cancha visiblemente frustrado." },
          { time: "0:15", action: "Superponer el texto grande: REHABILITACIÓN CEREBRAL." },
          { time: "0:40", action: "Primer plano de Salvador explicando el freno protector del sistema nervioso." }
        ],
        recsTiktok: "Uso de subtítulos dinámicos en color verde neón y cortes rápidos de video.",
        recsInstagram: "Línea gráfica con marcos elegantes y colores corporativos de IMPULSO."
      },
      history: []
    },
    {
      id: "es-2",
      title: "[SIMULACIÓN] La presión de los padres en el fútbol base: el informe federativo",
      source: "[MOCK] Marca",
      language: "ES",
      date: "2026-06-12",
      link: "https://mock.marca.com/futbol/base/padres-presion",
      realSourceUrl: "",
      sourceUrl: "https://mock.marca.com/futbol/base/padres-presion",
      sourceName: "Marca",
      verificationStatus: "mock",
      summary: "Estudio simulado sobre niveles alarmantes de estrés infantil inducidos por gritos y expectativas desmedidas de los familiares desde la grada.",
      entities: ["Fútbol Base"],
      tags: ["Entorno", "Familia", "Salud Mental Infantil", "Fútbol"],
      criteria: {
        sportMentalHealth: 85,
        publicInterest: 80,
        sportImpact: 50,
        publicMentalHealth: 95,
        economicImpact: 20,
        novelty: 80,
        pedagogicalPotential: 95,
        audiovisualClarity: 80,
        brandAlignment: 90
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "idea",
      isMock: true,
      dataType: "MOCK",
      editorialCard: {
        summary: "Expectativas familiares y frustración infantil en el deporte base.",
        context: "Caso de simulación que aborda las agresiones verbales de padres y la frustración de niños de 8 a 12 años que abandonan el fútbol por estrés.",
        whyItMatters: "El deporte infantil debería fomentar resiliencia y salud, pero se está transformando en una incubadora de ansiedad por frustración de adultos.",
        psychologicalAngle: "Transferencia de frustraciones de los padres, presión por el éxito económico futuro y destrucción de la motivación intrínseca del niño.",
        managementAngle: "Políticas federativas de exclusión de padres conflictivos y campañas de concienciación en clubes de barrio.",
        salvadorStance: "Llamar la atención a los padres para que dejen jugar a los niños sin proyectar sus propios sueños frustrados. El deporte a esa edad debe ser juego y desarrollo.",
        counterArgument: "Algunos padres afirman que sin presión competitiva no se forman campeones de élite.",
        simplificationRisk: "Generalizar que todos los padres de deportistas infantiles son agresivos.",
        phrasesToAvoid: ["los padres tienen desórdenes mentales", "los niños de hoy son débiles"],
        verifiedSources: ["RFEF (Informes de Fútbol Base Simulados)"],
        complianceNote: "Activar modo sensible al tratarse de menores de edad. Foco estricto en la pedagogía parental."
      },
      scripts: {
        s30: "HOOK: ¿Estás arruinando la carrera deportiva de tu hijo sin darte cuenta? El informe de la federación alarma a los clubes. COMENTARIO: Gritar al árbitro o presionar a tu hijo de 10 años para ganar destruye su amor por el deporte. El estrés infantil en el fútbol base está en máximos históricos. EJEMPLO: Muchos niños abandonan por pura ansiedad parental. CTA: ¿Gritas en los partidos de tu hijo? Sé honesto.",
        s60: "HOOK: Papá, mamá, dejen de gritar en la grada. El preocupante informe sobre el fútbol base. CONTEXTO: El estrés infantil en canteras de España está disparado por exigencias insostenibles de los familiares. COMENTARIO: Salvador comenta: Muchos padres ven en sus hijos el boleto de salida económica o el éxito deportivo que ellos no tuvieron. Esto no forma campeones, genera niños frustrados con ansiedad y abandono prematuro. El deporte base debe ser aprendizaje y diversión, no una oficina de presión de fin de semana. EJEMPLO: Clubes en España ya sancionan a padres prohibiendo su entrada a los estadios infantiles. CTA: Deja jugar a tu hijo y comparte este video si estás de acuerdo.",
        s90: "HOOK: ¿Estamos educando atletas resilientes o niños rotos por la presión de sus propios padres? Un informe de la RFEF enciende todas las alarmas del fútbol base. CONTEXTO: Se reporta un abandono masivo de deportes de equipo en niños de 10 a 14 años debido a la hostilidad verbal en las gradas familiares. COMENTARIO: Salvador reflexiona: El comportamiento en la grada define cómo el niño procesa la derrota. Si ve a su padre frustrado y gritando por un error en un pase de entrenamiento, asocia el error con la pérdida de afecto. La motivación intrínseca, que es el motor de todo deportista exitoso, se destruye y se reemplaza por miedo a defraudar. Si quieres que tu hijo juegue profesionalmente, el primer paso es que disfrute del juego. EJEMPLO: Las escuelas de fútbol más exitosas de Europa exigen a los padres firmar códigos de respeto durante las ligas. CTA: ¿Qué opinas de prohibir la entrada a padres gritones en el deporte infantil?",
        captionTiktok: "El preocupante informe sobre la presión de los padres en el fútbol infantil ⚽️ parental 😡. #futbolbase #padres #deporteinfantil #psicologia #rfef",
        captionInstagram: "El deporte en la infancia debe ser una herramienta educativa de resiliencia y diversión, no una fuente de ansiedad provocada por expectativas adultas desmedidas. ⚽️👦 #FútbolBase #PsicologíaInfantil #RFEF #Deporte #Familia",
        hashtags: ["futbolbase", "rfef", "deporteinfantil", "psicologia", "familia"]
      },
      overlayPlan: {
        background: "Imagen borrosa de un partido de fútbol infantil con padres gritando al fondo.",
        headline: "RFEF alerta de niveles críticos de estrés en niños por presión de padres",
        sourceCitation: "Fuente simulada: [MOCK] Informe RFEF Fútbol Base",
        salvadorPosition: "Centro, enfatizando la cercanía física y la empatía en la voz.",
        largeText: "DEJEN JUGAR A LOS NIÑOS",
        timeline: [
          { time: "0:00", action: "Mostrar titular y Salvador de fondo haciendo un gesto de desaprobación." },
          { time: "0:20", action: "Mostrar texto grande en rojo: DEJEN JUGAR A LOS NIÑOS." }
        ],
        recsTiktok: "Tonos de advertencia visuales y texto grande.",
        recsInstagram: "Estética educativa y respetuosa."
      },
      history: []
    },
    {
      id: "de-1",
      title: "[SIMULACIÓN] Motorsport-Legende warnt vor mentalem Druck und Burnout im Sport",
      source: "[MOCK] Der Spiegel Sport",
      language: "DE",
      date: "2026-06-11",
      link: "https://mock.spiegel.de/sport/vettel-burnout-f1",
      realSourceUrl: "",
      sourceUrl: "https://mock.spiegel.de/sport/vettel-burnout-f1",
      sourceName: "Der Spiegel Sport",
      verificationStatus: "mock",
      summary: "En una simulación de entrevista, Sebastian Vettel advierte sobre la insostenibilidad de los calendarios hipercompetitivos y el severo desgaste de mecánicos y pilotos.",
      entities: ["Sebastian Vettel"],
      tags: ["Burnout", "Presión", "Disciplina", "Motorsport"],
      criteria: {
        sportMentalHealth: 85,
        publicInterest: 75,
        sportImpact: 70,
        publicMentalHealth: 80,
        economicImpact: 50,
        novelty: 70,
        pedagogicalPotential: 85,
        audiovisualClarity: 75,
        brandAlignment: 85
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "idea",
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT",
      editorialCard: {
        summary: "Vettel advierte sobre el burnout y presión en el motorsport.",
        context: "Basado en reflexiones de Vettel tras su retiro sobre la extrema exigencia mental en la F1.",
        whyItMatters: "Ilustra que la hipercompetitividad corporativa y los viajes constantes provocan agotamiento extremo en todos los niveles.",
        psychologicalAngle: "Síndrome de burnout, pérdida de propósito personal ante la sobrecarga de trabajo y la importancia del descanso estratégico.",
        managementAngle: "Planificación de recursos humanos de las escuderías y la economía del entretenimiento masivo.",
        salvadorStance: "Respaldar a Vettel explicando que un atleta o profesional agotado comete fallos catastróficos por fatiga mental.",
        counterArgument: "La FIA argumenta que el interés global y los patrocinadores exigen más eventos anuales.",
        simplificationRisk: "Decir que los mecánicos viajan gratis y no pueden quejarse por cobrar un sueldo.",
        phrasesToAvoid: ["están clínicamente deprimidos", "son débiles por cansarse"],
        verifiedSources: ["Der Spiegel (Public Statement Context)"],
        complianceNote: "Abordar el burnout desde la perspectiva de la medicina y psicología laboral deportiva."
      },
      scripts: {
        s30: "HOOK: ¿Se puede tener éxito absoluto pero perder las ganas de vivir? Sebastian Vettel advierte del burnout en F1. COMENTARIO: 24 carreras al año destruyen la mente de pilotos y mecánicos. El éxito constante sin descanso no es sostenible, nos dice Vettel. EJEMPLO: Reducir eventos previene accidentes catastróficos por fatiga. CTA: ¿Te has sentido quemado en tu propio trabajo?",
        s60: "HOOK: El grito de alarma de Sebastian Vettel: la Fórmula 1 está quemando la mente de sus deportistas. CONTEXTO: Calendarios brutales exigen presencia mundial continua, destruyendo la vida familiar de los equipos. COMENTARIO: Salvador comenta: El rendimiento óptimo exige descanso óptimo. Si saturas a un profesional, el cerebro entra en fatiga crónica, ralentizando los reflejos y disparando la frustración. El burnout no se cura con vacaciones de una semana; requiere estructurar límites de carga laboral. EJEMPLO: Vettel priorizó su familia y salud mental al retirarse en plenitud física. CTA: ¿Sabes cuándo frenar en tu carrera profesional?",
        s90: "HOOK: ¿Trabajas hasta el cansancio extremo por miedo a perder tu posición? La advertencia de Sebastian Vettel sobre el burnout en el automovilismo. CONTEXTO: El ex campeón de F1 expone la cruda realidad de mecánicos e ingenieros que viajan todo el año bajo un estrés logístico brutal. COMENTARIO: Salvador analiza: La cultura de 'trabajar hasta reventar' está perdiendo fuerza frente a la ciencia del rendimiento. El cerebro cansado no toma buenas decisiones bajo presión. La disciplina mal entendida confunde fatiga con compromiso. Lo que dice Vettel aplica a cualquier oficina corporativa: si el entorno de trabajo exige disponibilidad 24/7, tarde o temprano el sistema colapsará y el rendimiento caerá en picada. EJEMPLO: Escuderías líderes ya implementan rotación de personal de apoyo técnico para proteger su salud mental. CTA: Comparte esto si crees que el descanso es parte del éxito comercial.",
        captionTiktok: "Sebastian Vettel y la advertencia sobre el burnout en la F1 🏎️💤. ¿Rendir a costa de tu mente? #f1 #vettel #burnout #deporte #estres",
        captionInstagram: "El rendimiento de élite requiere períodos de descanso obligatorios. Sebastian Vettel explica los riesgos de burnout bajo calendarios hipercompetitivos en la F1. 🏎️🧠 #Fórmula1 #Burnout #SaludMental #Rendimiento #SebastianVettel",
        hashtags: ["vettel", "formula1", "burnout", "saludmental", "disciplina"]
      },
      overlayPlan: {
        background: "Foto de Vettel con expresión de agotamiento en su época de Aston Martin y logo de Spiegel.",
        headline: "Vettel: 'Der Druck in der Formel 1 ist oft unmenschlich'",
        sourceCitation: "Fuente simulada: [MOCK] Der Spiegel Sport",
        salvadorPosition: "Derecha, con infografías a la izquierda.",
        largeText: "NO ES DISCIPLINA, ES FATIGA",
        timeline: [
          { time: "0:00", action: "Presentar el titular alemán traducido al español." },
          { time: "0:15", action: "Mostrar texto animado: NO ES DISCIPLINA, ES FATIGA." }
        ],
        recsTiktok: "Efectos de sonido de motores de fondo bajando de volumen bruscamente.",
        recsInstagram: "Diseño minimalista y limpio con enfoque reflexivo."
      },
      history: []
    }
  ];

  const additionalTemplates = [
    {
      id: "en-4",
      title: "[SIMULACIÓN] Midfielder under fire: family environment and mental load in the league",
      source: "[MOCK] The Guardian Sport",
      language: "EN" as const,
      summary: "Análisis simulado de la presión mediática y el soporte familiar en el desarrollo de un jugador tras su costoso traspaso y controversias recientes.",
      tags: ["Entorno", "Presión", "Fútbol"],
      scoreMental: 75,
      scorePedag: 70,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "en-5",
      title: "[SIMULACIÓN] Returning to tennis after motherhood: building mental resilience",
      source: "[MOCK] ESPN",
      language: "EN" as const,
      summary: "Reflexión simulada de Naomi Osaka sobre el regreso al tenis competitivo, el cambio de identidad tras ser madre y el rediseño de metas.",
      tags: ["Resiliencia", "Salud Mental", "Tenis"],
      scoreMental: 90,
      scorePedag: 85,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "en-6",
      title: "[SIMULACIÓN] NCAA athletes struggle with commercial demands and psychological pressure",
      source: "[MOCK] Associated Press",
      language: "EN" as const,
      summary: "Estudio simulado expone el aumento de casos de ansiedad en estudiantes atletas universitarios debido a la monetización de su imagen (NIL).",
      tags: ["Economía del Deporte", "Presión", "Salud Mental"],
      scoreMental: 85,
      scorePedag: 90,
      isMock: true,
      dataType: "MOCK" as const
    },
    {
      id: "en-7",
      title: "[SIMULACIÓN] Striker on online abuse, performance anxiety and rebuilding self-esteem",
      source: "[MOCK] The Guardian Sport",
      language: "EN" as const,
      summary: "Declaraciones de simulación acerca de cómo el acoso en redes sociales afecta la autoconfianza y la toma de decisiones en el área.",
      tags: ["Salud Mental", "Rendimiento", "Fútbol"],
      scoreMental: 80,
      scorePedag: 80,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "en-8",
      title: "[SIMULACIÓN] Manager on burnout and the difficult decision to step down",
      source: "[MOCK] BBC Sport",
      language: "EN" as const,
      summary: "Jurgen Klopp confiesa de forma simulada que se estaba 'quedando sin energía' y la importancia de reconocer el agotamiento emocional.",
      tags: ["Burnout", "Liderazgo", "Gestión Deportiva"],
      scoreMental: 90,
      scorePedag: 95,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "en-9",
      title: "[SIMULACIÓN] Tennis player on social media pressure and managing parent-coach dynamics",
      source: "[MOCK] ESPN",
      language: "EN" as const,
      summary: "Emma Raducanu detalla la presión del patrocinio masivo a temprana edad y cómo la influencia familiar puede chocar con el cuerpo técnico.",
      tags: ["Familia", "Presión", "Tenis"],
      scoreMental: 80,
      scorePedag: 85,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "en-10",
      title: "[SIMULACIÓN] Star Athlete: 'There is no failure in sports, only steps to success'",
      source: "[MOCK] Associated Press",
      language: "EN" as const,
      summary: "Declaración simulada sobre la definición del fracaso en el deporte como modelo de aprendizaje sobre resiliencia mental.",
      tags: ["Resiliencia", "Disciplina", "Baloncesto"],
      scoreMental: 90,
      scorePedag: 95,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "es-3",
      title: "[SIMULACIÓN] Impacto reputacional en la marca de los clubes tras sospechas de corrupción arbitral",
      source: "[MOCK] BBC Mundo",
      language: "ES" as const,
      summary: "Análisis simulado del daño comercial y la desconfianza del aficionado ante sospechas de corrupción arbitral en la liga.",
      tags: ["Economía del Deporte", "Gestión Deportiva", "Ética"],
      scoreMental: 40,
      scorePedag: 80,
      isMock: true,
      dataType: "MOCK" as const
    },
    {
      id: "es-4",
      title: "[SIMULACIÓN] Reinvención de la identidad más allá del tenis profesional tras jubilación temprana",
      source: "[MOCK] Marca",
      language: "ES" as const,
      summary: "Conversación de simulación sobre los retos de jubilarse a los 30 años y la pérdida de la etiqueta de 'deportista activo'.",
      tags: ["Resiliencia", "Transición", "Tenis"],
      scoreMental: 85,
      scorePedag: 90,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "es-5",
      title: "[SIMULACIÓN] Mediocampista y la gestión de la frustración durante una larga lesión de rodilla",
      source: "[MOCK] AS",
      language: "ES" as const,
      summary: "Cómo el carácter hipercompetitivo de Gavi fue encauzado simuladamente por el staff médico para evitar la ansiedad por inactividad física.",
      tags: ["Frustración", "Disciplina", "Fútbol"],
      scoreMental: 80,
      scorePedag: 80,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "de-2",
      title: "[SIMULACIÓN] Erwartungsdruck und Kaderplanung in einem Spitzenclub",
      source: "[MOCK] Kicker",
      language: "DE" as const,
      summary: "Análisis simulado del estrés ante una temporada sin títulos y el peso de las expectativas corporativas en directivas y plantilla.",
      tags: ["Presión", "Gestión Deportiva", "Fútbol"],
      scoreMental: 75,
      scorePedag: 80,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "de-3",
      title: "[SIMULACIÓN] Jugendreform: Weniger Ergebnisdruck und mehr freies Spiel für Kinder",
      source: "[MOCK] Sportschau",
      language: "DE" as const,
      summary: "La federación alemana reforma simuladamente el fútbol base eliminando tablas de clasificación en categorías tempranas para cuidar la salud mental.",
      tags: ["Entorno", "Familia", "Pedagogía"],
      scoreMental: 85,
      scorePedag: 95,
      isMock: true,
      dataType: "MOCK" as const
    },
    {
      id: "de-4",
      title: "[SIMULACIÓN] Rennfahrer über mentale Disziplin und Zügelung von Frustration",
      source: "[MOCK] DW",
      language: "DE" as const,
      summary: "El piloto de carreras de élite explica cómo aprende a controlar sus emociones en momentos de fallas mecánicas de alta velocidad.",
      tags: ["Disciplina", "Frustración", "Motorsport"],
      scoreMental: 80,
      scorePedag: 80,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    },
    {
      id: "de-5",
      title: "[SIMULACIÓN] Olympia-Druck: Athleten klagen über mangelnde Förderung und Existenzsorgen",
      source: "[MOCK] Süddeutsche Zeitung Sport",
      language: "DE" as const,
      summary: "Deportistas olímpicos de disciplinas minoritarias sufren estrés existencial simulado por falta de apoyo financiero.",
      tags: ["Economía del Deporte", "Presión", "Salud Mental"],
      scoreMental: 85,
      scorePedag: 85,
      isMock: true,
      dataType: "MOCK" as const
    },
    {
      id: "de-6",
      title: "[SIMULACIÓN] Befreiung vom Stigma des ewigen Zweiten",
      source: "[MOCK] FAZ Sport",
      language: "DE" as const,
      summary: "Cómo el nuevo entrenador trabajó la psicología colectiva de la plantilla para superar décadas de derrotas frustrantes.",
      tags: ["Liderazgo", "Resiliencia", "Fútbol"],
      scoreMental: 85,
      scorePedag: 90,
      isMock: true,
      dataType: "MOCK_DERIVED_FROM_PUBLIC_CONTEXT" as const
    }
  ];

  additionalTemplates.forEach(t => {
    seedCandidates.push({
      id: t.id,
      title: t.title,
      source: t.source,
      language: t.language,
      date: "2026-06-12",
      link: `https://mock.example.com/sports/${t.id}`,
      realSourceUrl: "",
      sourceUrl: `https://mock.example.com/sports/${t.id}`,
      sourceName: t.source.replace("[MOCK] ", ""),
      verificationStatus: "mock",
      summary: t.summary,
      entities: [t.title.split(' ')[0]],
      tags: t.tags,
      criteria: {
        sportMentalHealth: t.scoreMental,
        publicInterest: 75,
        sportImpact: 75,
        publicMentalHealth: 60,
        economicImpact: t.tags.includes("Economía del Deporte") ? 90 : 30,
        novelty: 80,
        pedagogicalPotential: t.scorePedag,
        audiovisualClarity: 75,
        brandAlignment: 80
      },
      penalties: {
        isRumor: false,
        isWeakSource: false,
        hasDefamationRisk: false,
        hasMinorWithoutFocus: false,
        hasDiagnosticRisk: false,
        hasNoOwnStance: false
      },
      status: "idea",
      isMock: t.isMock,
      dataType: t.dataType,
      editorialCard: {
        summary: `Resumen simulado de: ${t.title}`,
        context: t.summary,
        whyItMatters: "Este tema ilustra dinámicas críticas de presión y sostenibilidad en el deporte contemporáneo.",
        psychologicalAngle: "El manejo de las expectativas, la tolerancia a la frustración y el soporte ambiental.",
        managementAngle: "Cómo influyen las directivas y los contratos en el bienestar de los profesionales.",
        salvadorStance: "Enfocar el comentario desde el aprendizaje: el rendimiento es la consecuencia del equilibrio y la estructura lógica, no de forzar límites de forma insana.",
        counterArgument: "La cultura deportiva tradicional exige rendimiento incondicional.",
        simplificationRisk: "Reducir el problema a flojera o falta de compromiso.",
        phrasesToAvoid: ["es débil", "sufre de depresión severa"],
        verifiedSources: [`Fuente de Contexto Simulada: ${t.source}`],
        complianceNote: "Mantener rigor explicativo sin emitir diagnósticos clínicos."
      },
      scripts: {
        s30: `HOOK: ¿El talento es suficiente cuando la presión te desborda? Hablemos de ${t.title.split(']')[1]?.trim().split(' ')[0] || 'esto'}. COMENTARIO: El alto rendimiento exige disciplina, pero la mente necesita descanso y soporte para tomar decisiones rápidas bajo presión. EJEMPLO: Los líderes que cuidan su salud logran carreras más longevas y estables. CTA: Deja tu opinión abajo.`,
        s60: `HOOK: El peso invisible de la gloria: por qué el caso de ${t.title.split(']')[1]?.trim().split(' ')[0] || 'este atleta'} nos afecta a todos. CONTEXTO: Las declaraciones simuladas demuestras el nivel de exigencia actual en el deporte. COMENTARIO: Salvador comenta: Confundimos disciplina con sobrecarga. Ningún profesional rinde al máximo bajo estrés crónico sin herramientas de resiliencia y un entorno familiar o de club estable. EJEMPLO: Trabajar la psicología deportiva marca la diferencia entre el éxito pasajero y la consistencia. CTA: ¿Opinas que se exige demasiado?`,
        s90: `HOOK: ¿Cómo se maneja el éxito bajo el microscopio público? El análisis psicológico del caso de ${t.title.split(']')[1]?.trim().split(' ')[0] || 'este atleta'}. CONTEXTO: El deportista o directiva enfrenta escrutinio constante y altas exigencias comerciales. COMENTARIO: Salvador explica: La resiliencia no se hereda, se entrena. En el deporte contemporáneo, la gestión de la marca personal y los contratos influye tanto como el entrenamiento físico. El error común es desestimar la mente y centrarse solo en la técnica. Un deportista enfocado y seguro toma mejores decisiones y sufre menos lesiones. EJEMPLO: El entrenamiento psicológico estructurado previene bloqueos en los momentos cumbre. CTA: Únete a la conversación sana en comentarios.`,
        captionTiktok: `Análisis sobre ${t.title.split(']')[1]?.trim().split(' ')[0] || 'deporte'} 🧠⚽️. Deporte, mente y gestión explicados en simple. #deporte #psicologia #alto-rendimiento`,
        captionInstagram: `El rendimiento sostenible requiere el balance entre preparación mental y gestión eficiente de recursos. Analizamos el caso de ${t.title.split(']')[1]?.trim().split(' ')[0] || 'deporte'}. 🧠📊 #Deporte #PsicologíaDeportiva #Gestión`,
        hashtags: ["deporte", "psicologia", "gestion", "resiliencia", "disciplina"]
      },
      overlayPlan: {
        background: "Captura de pantalla de la noticia de prensa sobre el tema.",
        headline: t.title,
        sourceCitation: `Fuente simulada: ${t.source}`,
        salvadorPosition: "Centro inferior",
        largeText: "MENTE Y RENDIMIENTO",
        timeline: [
          { time: "0:00", action: "Mostrar Salvador e introducir el titular de prensa." },
          { time: "0:30", action: "Mostrar texto clave en pantalla." }
        ],
        recsTiktok: "Texto dinámico vertical 9:16.",
        recsInstagram: "Diseño elegante y sobrio."
      },
      history: []
    });
  });

  const finalCandidates: Candidate[] = seedCandidates.map(c => {
    const scoreResult = calculateRanking(c.criteria, c.penalties, c.title);
    return {
      ...c,
      scoreResult
    } as Candidate;
  });

  return {
    candidates: finalCandidates,
    analytics: [
      {
        id: "an-1",
        candidateId: "en-1",
        title: "[SIMULACIÓN] Simone Biles talks pressure and gymnastics mental blocks before major tournament",
        platform: "tiktok",
        views: 45000,
        likes: 3800,
        comments: 120,
        shares: 450,
        saves: 890,
        retentionRate: 58.5,
        publishDate: "2026-06-13",
        hookUsed: "¿Qué pasa cuando tu propio cerebro se apaga en el aire?",
        duration: 58
      },
      {
        id: "an-2",
        candidateId: "en-1",
        title: "[SIMULACIÓN] Simone Biles talks pressure and gymnastics mental blocks before major tournament",
        platform: "instagram",
        views: 28000,
        likes: 2400,
        comments: 65,
        shares: 110,
        saves: 720,
        retentionRate: 61.2,
        publishDate: "2026-06-13",
        hookUsed: "La verdadera fortaleza mental no es aguantar hasta romperse.",
        duration: 58
      }
    ],
    ingestHistory: [],
    lastIngestTime: "",
    editorialPackages: []
  };
};

export function initDB(): DBData {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialSeed = getInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
    return initialSeed;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DBData;
    
    // Check if schema requires migration (dataType missing or missing array fields)
    if (parsed.candidates.length > 0 && typeof parsed.candidates[0].dataType === 'undefined') {
      const initialSeed = getInitialSeed();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
      return initialSeed;
    }
    
    // Ensure array fields exist
    if (!parsed.ingestHistory) {
      parsed.ingestHistory = [];
    }
    if (!parsed.editorialPackages) {
      parsed.editorialPackages = [];
    }
    
    return parsed;
  } catch (e) {
    const initialSeed = getInitialSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
    return initialSeed;
  }
}

export function saveDB(data: DBData): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function getCandidates(): Candidate[] {
  const db = initDB();
  return db.candidates;
}

export function addCandidate(candidate: Candidate): void {
  const db = initDB();
  // Check duplicates by link/url
  if (db.candidates.some(c => c.link === candidate.link)) return;
  db.candidates.push(candidate);
  saveDB(db);
}

export function getCandidateById(id: string): Candidate | undefined {
  const db = initDB();
  return db.candidates.find(c => c.id === id);
}

export function updateCandidateStatus(
  id: string,
  newStatus: Candidate['status'],
  note: string
): Candidate | undefined {
  const db = initDB();
  const idx = db.candidates.findIndex(c => c.id === id);
  if (idx === -1) return undefined;

  const oldStatus = db.candidates[idx].status;
  db.candidates[idx].status = newStatus;
  db.candidates[idx].history.push({
    timestamp: new Date().toISOString(),
    fromStatus: oldStatus,
    toStatus: newStatus,
    note
  });

  saveDB(db);
  return db.candidates[idx];
}

export function updateCandidate(updated: Candidate): void {
  const db = initDB();
  const idx = db.candidates.findIndex(c => c.id === updated.id);
  if (idx !== -1) {
    db.candidates[idx] = updated;
    saveDB(db);
  }
}

export function getAnalytics(): AnalyticsRecord[] {
  const db = initDB();
  return db.analytics;
}

export function addAnalytics(record: Omit<AnalyticsRecord, 'id'>): AnalyticsRecord {
  const db = initDB();
  const newRecord: AnalyticsRecord = {
    ...record,
    id: `an-${Date.now()}`
  };
  db.analytics.push(newRecord);
  saveDB(db);
  return newRecord;
}

export function getIngestHistory(): IngestionLog[] {
  const db = initDB();
  return db.ingestHistory || [];
}

export function addIngestLogs(logs: IngestionLog[]): void {
  const db = initDB();
  if (!db.ingestHistory) db.ingestHistory = [];
  db.ingestHistory.push(...logs);
  db.lastIngestTime = new Date().toISOString();
  saveDB(db);
}

export function getLastIngestTime(): string {
  const db = initDB();
  return db.lastIngestTime || "";
}

export function getEditorialPackages(): EditorialPackage[] {
  const db = initDB();
  return db.editorialPackages || [];
}

export function getEditorialPackageById(id: string): EditorialPackage | undefined {
  const db = initDB();
  return (db.editorialPackages || []).find(p => p.id === id);
}

export function addEditorialPackage(pkg: EditorialPackage): void {
  const db = initDB();
  if (!db.editorialPackages) db.editorialPackages = [];
  if (db.editorialPackages.some(p => p.id === pkg.id)) return;
  db.editorialPackages.push(pkg);
  saveDB(db);
}

export function updateEditorialPackage(pkg: EditorialPackage): void {
  const db = initDB();
  if (!db.editorialPackages) db.editorialPackages = [];
  const idx = db.editorialPackages.findIndex(p => p.id === pkg.id);
  if (idx !== -1) {
    db.editorialPackages[idx] = pkg;
    saveDB(db);
  }
}
