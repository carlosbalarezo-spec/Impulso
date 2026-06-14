export interface SourceConfig {
  id: string;
  name: string;
  language: "en" | "es" | "de";
  countryOrRegion?: string;
  type: "rss" | "manual" | "official" | "disabled";
  feedUrl?: string;
  homepageUrl?: string;
  trustTier: "high" | "medium" | "low";
  enabled: boolean;
  notes?: string;
}

export const SOURCE_REGISTRY: SourceConfig[] = [
  // --- INGLÉS ---
  {
    id: "bbc-sport",
    name: "BBC Sport",
    language: "en",
    countryOrRegion: "UK",
    type: "rss",
    feedUrl: "https://feeds.bbci.co.uk/sport/rss.xml",
    homepageUrl: "https://www.bbc.com/sport",
    trustTier: "high",
    enabled: true,
    notes: "Feed oficial público de BBC Sport."
  },
  {
    id: "the-guardian-sport",
    name: "The Guardian Sport",
    language: "en",
    countryOrRegion: "UK",
    type: "rss",
    feedUrl: "https://www.theguardian.com/sport/rss",
    homepageUrl: "https://www.theguardian.com/sport",
    trustTier: "high",
    enabled: true,
    notes: "Feed de deportes general de The Guardian."
  },
  {
    id: "espn-sport",
    name: "ESPN",
    language: "en",
    countryOrRegion: "US",
    type: "rss",
    feedUrl: "https://www.espn.com/espn/rss/news",
    homepageUrl: "https://www.espn.com",
    trustTier: "medium",
    enabled: true,
    notes: "Noticias principales de ESPN."
  },
  {
    id: "reuters-sport",
    name: "Reuters Sport",
    language: "en",
    type: "manual",
    homepageUrl: "https://www.reuters.com/sports",
    trustTier: "high",
    enabled: false,
    notes: "Sin RSS público gratuito validado. Configurado como manual."
  },
  {
    id: "ap-sports",
    name: "Associated Press Sports",
    language: "en",
    type: "manual",
    homepageUrl: "https://apnews.com/sports",
    trustTier: "high",
    enabled: false,
    notes: "Ingreso manual por falta de feed RSS libre directo."
  },

  // --- ESPAÑOL ---
  {
    id: "el-pais-deportes",
    name: "El País Deportes",
    language: "es",
    countryOrRegion: "España",
    type: "rss",
    feedUrl: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/deportes/portada",
    homepageUrl: "https://elpais.com/deportes",
    trustTier: "high",
    enabled: true,
    notes: "Feed oficial de la sección de deportes de El País."
  },
  {
    id: "marca-deportes",
    name: "Marca",
    language: "es",
    countryOrRegion: "España",
    type: "rss",
    feedUrl: "https://e00-marca.uecdn.es/rss/futbol/primera-division.xml",
    homepageUrl: "https://www.marca.com",
    trustTier: "medium",
    enabled: true,
    notes: "Noticias de Primera División de Marca."
  },
  {
    id: "as-deportes",
    name: "AS",
    language: "es",
    countryOrRegion: "España",
    type: "disabled",
    feedUrl: "https://as.com/rss/deportes/portada.xml",
    homepageUrl: "https://as.com",
    trustTier: "medium",
    enabled: false,
    notes: "Deshabilitada en IMP-AG-0004: feed no respondió / feed devolvió HTTP 404."
  },
  {
    id: "espn-deportes",
    name: "ESPN Deportes",
    language: "es",
    type: "manual",
    homepageUrl: "https://espndeportes.espn.com",
    trustTier: "medium",
    enabled: false,
    notes: "Configurada para ingreso manual."
  },

  // --- ALEMÁN ---
  {
    id: "sportschau-de",
    name: "Sportschau",
    language: "de",
    countryOrRegion: "Alemania",
    type: "disabled",
    feedUrl: "https://www.sportschau.de/sportschau-index~rss.xml",
    homepageUrl: "https://www.sportschau.de",
    trustTier: "high",
    enabled: false,
    notes: "Deshabilitada en IMP-AG-0004: feed no respondió / feed devolvió HTTP 404."
  },
  {
    id: "kicker-de",
    name: "Kicker",
    language: "de",
    countryOrRegion: "Alemania",
    type: "disabled",
    feedUrl: "https://rss.kicker.de/news/aktuell",
    homepageUrl: "https://www.kicker.de",
    trustTier: "high",
    enabled: false,
    notes: "Deshabilitada en IMP-AG-0004: feed no respondió / fetch failed."
  },
  {
    id: "dw-sport-de",
    name: "DW Sport",
    language: "de",
    countryOrRegion: "Alemania",
    type: "rss",
    feedUrl: "https://rss.dw.com/xml/rss-de-sport",
    homepageUrl: "https://www.dw.com/de/sport",
    trustTier: "high",
    enabled: true,
    notes: "Feed de deportes en alemán de Deutsche Welle."
  },
  {
    id: "spiegel-sport-de",
    name: "Der Spiegel Sport",
    language: "de",
    type: "manual",
    homepageUrl: "https://www.spiegel.de/sport",
    trustTier: "medium",
    enabled: false,
    notes: "Configurado como manual."
  }
];

export function getEnabledSources(): SourceConfig[] {
  return SOURCE_REGISTRY.filter(s => s.enabled);
}

export function getSourceById(id: string): SourceConfig | undefined {
  return SOURCE_REGISTRY.find(s => s.id === id);
}
