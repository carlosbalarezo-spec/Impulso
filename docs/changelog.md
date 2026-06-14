# Changelog — IMPULSO

## [0.4.0] — 2026-06-13
### Añadido
- **Auditoría Empírica de Fuentes**: Módulo auditor [src/tests/audit_sources.ts](file:///d:/Impulso/src/tests/audit_sources.ts) para verificar estado HTTP, cantidad de items y contenido deportivo de feeds RSS.
- **Auditoría de Ingesta Avanzada**: Seguimiento detallado en `db.ts` de la ingesta con runId, duración en ms, e items duplicados/guardados/encontrados.
- **Panel de Salud de Fuentes**: Interfaz premium en el radar diario que visualiza métricas de fuentes habilitadas/exitosas/fallidas, errores y logs en tiempo real.
- **Scoring de Salud**: Penalizaciones de -10 puntos para candidatos que pertenezcan a fuentes con fallos técnicos o inactivas.
- **Restricción de sourceUrl**: Enforcement estricto que requiere un enlace original público válido para registrar candidatos como `REAL_SOURCE`.
- **Compliance de Metadatos**: Integración de la función `checkCandidateCompliance` que escanea títulos originales, resúmenes, y notas editoriales además del guion.
- **Tests de Integración**: Pruebas ampliadas a 17/17 casos en `run_tests.ts` y nuevo script `"test:sources"` en `package.json`.

### Modificado
- Se deshabilitaron AS (`as-deportes`), Sportschau (`sportschau-de`) y Kicker (`kicker-de`) tras fallar conexión real en la auditoría empírica.
- El bono de fuente de alta confianza (+5) ahora está estrictamente condicionado a que el estado sea `source_verified`.

---

## [0.3.0] — 2026-06-13
### Añadido
- **Radar Real Controlado**: Motor de ingesta seguro en [src/lib/sources/ingest.ts](file:///d:/Impulso/src/lib/sources/ingest.ts) que descarga de forma controlada feeds RSS públicos de deportes.
- **Registro de Fuentes**: Lista configurable de medios deportivos en [src/lib/sources/sourceRegistry.ts](file:///d:/Impulso/src/lib/sources/sourceRegistry.ts) organizados por idioma y nivel de confianza (`trustTier`).
- **Parser RSS Seguro**: Módulo de análisis regex de XML en [src/lib/sources/rssParser.ts](file:///d:/Impulso/src/lib/sources/rssParser.ts) para evitar inyección de HTML o ejecución de scripts remotos.
- **Carga Manual de URLs**: Formulario e interfaz en `src/app/page.tsx` para registrar referencias de TikTok/Instagram limitando el almacenamiento a metadatos editoriales (sin descargas de IP ni scraping agresivo).
- **Verificación Estricta**: Campo `verificationStatus` en candidatos. Restringe la aprobación final si el estado es `needs_review` en la cola editorial.
- **Nuevas Reglas de Scoring**: Penalizaciones por obsolescencia temporal (>5 días), ausencia de fecha, reputación de la fuente y estado de verificación manual.
- **Ampliación de Compliance**: Detección de frases descalificativas de grada ("pecho frío", "cagón", "se arrugó") y términos de "choke" en inglés ("choked", "bottled it").
- **Política de Ingesta**: Creación de la política formal en [docs/source_ingestion_policy.md](file:///d:/Impulso/docs/source_ingestion_policy.md).
- **Nuevos Casos de Pruebas**: Suite ampliada a 14/14 tests automatizados de ranking y compliance.

### Modificado
- Integración de la UI para separar visualmente datos `MOCK`, `REAL_SOURCE` y `MANUAL_URL`.
- Modificación de endpoints de API para soportar `/api/sources`, `/api/ingest`, `/api/ingest/status`, y `/api/candidates/manual`.

---

## [0.2.0] — 2026-06-13
### Añadido
- Suite de pruebas unitarias automatizadas en [src/tests/run_tests.ts](file:///d:/Impulso/src/tests/run_tests.ts) y comando `"test": "tsx src/tests/run_tests.ts"` en `package.json`.
- Integración de dependencias de desarrollo: `tsx`.
- Soporte para reglas de compliance en inglés (ej. "mentally weak", "not built for competition").
- Alerta visual roja en el Workspace y badge de "SIMULADO" en el Radar para identificar temas mock.
- Campos `isMock` y `dataType` a la estructura del candidato en base de datos.
- Sección "1.1 Documentación de Persistencia" en `README.md` detallando las interfaces de migración y el uso de archivos JSON.

### Modificado
- Semillas de candidatos en `src/lib/db.ts` para usar nombres, fuentes y URLs explícitamente mock.
- Políticas editoriales y de compliance para normar el uso de datos simulados y prohibir su publicación como noticias verificadas.

---

## [0.1.0] — 2026-06-13
### Añadido
- Documentación inicial de gobernanza:
  - `README.md`
  - `docs/product_brief.md`
  - `docs/editorial_policy.md`
  - `docs/compliance_policy.md`
  - `docs/ranking_model.md`
  - `docs/checkpoint_001.md`
  - `docs/changelog.md`
  - `docs/qa_report.md`
  - `docs/antigravity_instruction_log.md`
- Estructura base de Next.js (App Router) en TypeScript y Vanilla CSS.
- Módulos del Core Backend:
  - `src/lib/ranking.ts` (scoring 0-100 con explicaciones)
  - `src/lib/compliance.ts` (filtro de salud mental y frases prohibidas)
  - `src/lib/db.ts` (almacenamiento de archivos JSON local y 20 semillas de noticias)
- Rutas de la API de Next.js para candidatos, cola de aprobación y analytics manual.
- Interfaz del Dashboard en `src/app/page.tsx` con secciones:
  - Radar Diario
  - Ficha Editorial y Guion (30/60/90s)
  - Plan de Overlay móvil 9:16
  - Cola de Aprobación
  - Calendario Editorial
  - Analytics Manual
- Estilos de diseño premium de globals.css y variables de color.
