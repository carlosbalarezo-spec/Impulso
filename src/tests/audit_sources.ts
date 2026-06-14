import { SOURCE_REGISTRY, SourceConfig } from '../lib/sources/sourceRegistry';
import { parseRSS } from '../lib/sources/rssParser';

console.log("=========================================");
console.log("    RUNNING SOURCES EMPIRICAL AUDIT     ");
console.log("=========================================\n");

async function auditAll() {
  const enabledSources = SOURCE_REGISTRY.filter(s => s.enabled);
  console.log(`Fuentes habilitadas a auditar: ${enabledSources.length}\n`);

  let successCount = 0;
  let failureCount = 0;
  let totalItems = 0;
  let hasES = false;
  let hasEN = false;
  let hasDE = false;

  for (const source of enabledSources) {
    if (!source.feedUrl) {
      console.error(`✗ [FAIL] Fuente: ${source.name} (${source.id}) - No tiene feedUrl configurado.`);
      failureCount++;
      continue;
    }

    try {
      const start = Date.now();
      const response = await fetch(source.feedUrl, {
        headers: { 'User-Agent': 'IMPULSO-Audit/1.0' }
      });
      const duration = Date.now() - start;

      if (!response.ok) {
        console.error(`✗ [FAIL] Fuente: ${source.name} (${source.id}) - HTTP Status: ${response.status} (${response.statusText})`);
        failureCount++;
        continue;
      }

      const xmlText = await response.text();
      const items = parseRSS(xmlText);
      const newestDate = items.length > 0 ? items[0].pubDate : "N/A";
      const isSportsContent = xmlText.toLowerCase().includes("sport") || 
                              xmlText.toLowerCase().includes("deporte") || 
                              xmlText.toLowerCase().includes("fussball") || 
                              xmlText.toLowerCase().includes("soccer") ||
                              xmlText.toLowerCase().includes("kicker") ||
                              xmlText.toLowerCase().includes("liga") ||
                              xmlText.toLowerCase().includes("copa") ||
                              xmlText.toLowerCase().includes("athlet");

      console.log(`✓ [OK] ${source.name} (${source.id})`);
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Duración: ${duration}ms`);
      console.log(`   - Items parseados: ${items.length}`);
      console.log(`   - Más reciente: ${newestDate}`);
      console.log(`   - Contenido deportivo: ${isSportsContent ? "Sí" : "No detectado explícitamente"}`);
      console.log(`   --------------------------------------------`);

      if (items.length === 0) {
        console.error(`✗ [FAIL] Fuente: ${source.name} (${source.id}) - Devolvió 0 items.`);
        failureCount++;
        continue;
      }

      successCount++;
      totalItems += items.length;
      if (source.language === 'es') hasES = true;
      if (source.language === 'en') hasEN = true;
      if (source.language === 'de') hasDE = true;

    } catch (error: any) {
      console.error(`✗ [FAIL] Fuente: ${source.name} (${source.id}) - Error de red/parseo: ${error.message}`);
      failureCount++;
    }
  }

  console.log("\n=========================================");
  console.log("             AUDIT SUMMARY               ");
  console.log("=========================================");
  console.log(`Total Fuentes Auditadas: ${enabledSources.length}`);
  console.log(`Fuentes Exitosas       : ${successCount}`);
  console.log(`Fuentes Fallidas       : ${failureCount}`);
  console.log(`Items Totales Parseados: ${totalItems}`);
  console.log(`Idiomas con al menos una fuente viva:`);
  console.log(`   - Español: ${hasES ? "SÍ" : "NO"}`);
  console.log(`   - Inglés : ${hasEN ? "SÍ" : "NO"}`);
  console.log(`   - Alemán : ${hasDE ? "SÍ" : "NO"}`);
  console.log("=========================================\n");

  // VALIDATION CRITERIA FOR PROCESS EXIT
  if (enabledSources.length === 0) {
    console.error("ERROR: No hay ninguna fuente habilitada.");
    process.exit(1);
  }

  if (successCount === 0) {
    console.error("ERROR: Ninguna fuente habilitada respondió con éxito.");
    process.exit(1);
  }

  if (!hasES || !hasEN || !hasDE) {
    console.error("ERROR: No queda al menos una fuente viva por idioma (es, en, de).");
    process.exit(1);
  }

  process.exit(0);
}

auditAll();
