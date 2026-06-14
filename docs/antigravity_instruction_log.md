# Antigravity Instruction Log — IMPULSO

## IMP-AG-0003
Fecha: 2026-06-13 20:30
Tipo: Implementación de Radar Real Controlado e Ingesta de Noticias RSS
Objetivo: Implementar un motor de ingesta seguro, registro de fuentes por idioma y confianza, parser de RSS seguro libre de scripts/HTML, registro manual de referencias de redes sociales con advertencias éticas y bloqueo de aprobación, extender el scoring con penalizaciones por antigüedad/falta de fecha/URL manual sin verificar, extender el compliance para lenguaje de burla/choke y asegurar 100% de éxito en tests, compilación e integridad de documentación.
Alcance:
- Registro de fuentes configurables en `src/lib/sources/sourceRegistry.ts`.
- Módulo parser RSS seguro (regex y limpieza de CDATA) en `src/lib/sources/rssParser.ts`.
- Motor de ingesta automático por RSS en `src/lib/sources/ingest.ts`.
- Formulario de carga manual de URLs en frontend y backend con limitación exclusiva a metadatos.
- Restricción de cambio de estado en la cola de aprobación si el candidato está marcado como `needs_review`.
- Expansión de scoring (`ranking.ts`) con bonos/penalizaciones de fuente, edad (>5 días), fecha ausente y URL manual.
- Expansión de compliance (`compliance.ts`) con frases prohibidas adicionales de burla ("pecho frío", "cagón", "se arrugó", "choked", "bottled it").
- Nuevos endpoints: `/api/sources`, `/api/ingest`, `/api/ingest/status`, `/api/candidates/manual`.
- Creación de `docs/source_ingestion_policy.md` y actualización de políticas en `/docs` y README.md.
Archivos modificados:
- [NEW] `src/lib/sources/sourceRegistry.ts`
- [NEW] `src/lib/sources/rssParser.ts`
- [NEW] `src/lib/sources/ingest.ts`
- [NEW] `src/app/api/sources/route.ts`
- [NEW] `src/app/api/ingest/route.ts`
- [NEW] `src/app/api/ingest/status/route.ts`
- [NEW] `src/app/api/candidates/manual/route.ts`
- [NEW] `docs/source_ingestion_policy.md`
- [MODIFY] `src/lib/db.ts`
- [MODIFY] `src/lib/ranking.ts`
- [MODIFY] `src/lib/compliance.ts`
- [MODIFY] `src/app/page.tsx`
- [MODIFY] `src/tests/run_tests.ts`
- [MODIFY] `README.md`
- [MODIFY] `docs/product_brief.md`
- [MODIFY] `docs/editorial_policy.md`
- [MODIFY] `docs/compliance_policy.md`
- [MODIFY] `docs/ranking_model.md`
- [MODIFY] `docs/checkpoint_001.md`
- [MODIFY] `docs/changelog.md`
- [MODIFY] `docs/qa_report.md`
Riesgos:
- Ninguno crítico. El motor está completamente aislado de scraping agresivo o descargas de multimedia protegidas por copyright.
Pruebas ejecutadas:
- Suite de pruebas unitarias extendida mediante `npm.cmd test` (14/14 aprobadas).
- Compilación de producción con `npm.cmd run build` (Exitoso, compilado sin errores).
- Validación de filtros por idioma, tipo de datos y restricciones de estado en UI.
Resultado: Completado con éxito.
Pendientes:
- Ninguno para esta iteración.
Decisión: Avanzar (Instrucción IMP-AG-0003 cerrada).

---

## IMP-AG-0002
Fecha: 2026-06-13 18:30
Tipo: Auditoría y Endurecimiento de Checkpoint 001
Objetivo: Auditar la estructura de archivos, etiquetar y formatear honestamente los datos semilla como simulados (MOCK), documentar formalmente la persistencia basada en JSON, ampliar las validaciones de compliance al inglés y añadir un conjunto de pruebas unitarias automatizadas para scoring y compliance.
Alcance:
- Verificación del repositorio de archivos (eliminación y rectificación de carpetas duplicadas).
- Modificación de semillas en `src/lib/db.ts` con indicadores `isMock: true` y URLs de simulación.
- Banner de advertencia de simulación en la interfaz web de `src/app/page.tsx`.
- Documentación detallada en README.md, product_brief.md, qa_report.md y checkpoint_001.md del almacenamiento JSON.
- Integración de biblioteca de desarrollo `tsx` y creación de `src/tests/run_tests.ts`.
- Pruebas automatizadas de scoring y compliance ejecutables con `npm.cmd test`.
Archivos modificados:
- [MODIFY] `package.json`
- [MODIFY] `src/lib/db.ts`
- [MODIFY] `src/lib/compliance.ts`
- [MODIFY] `src/app/page.tsx`
- [MODIFY] `README.md`
- [MODIFY] `docs/product_brief.md`
- [MODIFY] `docs/editorial_policy.md`
- [MODIFY] `docs/compliance_policy.md`
- [MODIFY] `docs/checkpoint_001.md`
- [MODIFY] `docs/changelog.md`
- [MODIFY] `docs/qa_report.md`
- [NEW] `src/tests/run_tests.ts`
Riesgos:
- Ninguno crítico.
Pruebas ejecutadas:
- Suite de pruebas unitarias mediante `npm.cmd test` (9/9 aprobadas).
- Compilación de producción con `npm.cmd run build` (Exitoso).
- Validación visual de banners MOCK en el dashboard y visualización del simulador móvil 9:16.
Resultado: Completado con éxito. Checkpoint 001 cerrado y aprobado formalmente.
Pendientes:
- Ninguno para esta fase de auditoría.
Decisión: Avanzar (Instrucción IMP-AG-0002 cerrada).

---

## IMP-AG-0001
Fecha: 2026-06-13 18:15
Tipo: Inicialización y MVP Checkpoint 001
Objetivo: Configurar el entorno de desarrollo base, crear la documentación de gobernanza inicial y construir la aplicación web MVP con radar diario, scoring editorial explicable, ficha editorial, generador de guiones, cola de aprobación y analytics manual para comprobar Checkpoint 001.
Alcance:
- Estructura Next.js con TypeScript, ESLint y Vanilla CSS.
- Motores de scoring (0-100) y compliance.
- 20 temas de seed data simulados en español, inglés y alemán.
- Interfaz gráfica premium (Dark/Glassmorphism) con vista vertical 9:16 móvil.
- Documentos de gobernanza obligatorios en `/docs`.
Archivos modificados:
- [NEW] All project files in `d:\Impulso`
Riesgos:
- Bloqueo de instalación de paquetes de Node.js en Windows (Mitigado usando `npx.cmd`).
- Errores de compilación nativa en SQLite (Mitigado implementando base de datos basada en archivos JSON estructurados de forma portable).
Pruebas ejecutadas:
- Compilación del proyecto mediante `npm.cmd run build` (Exitoso).
- Ejecución local mediante servidor de desarrollo (Exitoso).
- Testeo de motores de scoring y de compliance con frases permitidas/prohibidas (Exitoso).
Resultado: Completado con éxito.
Pendientes:
- Ninguno para la fase inicial. Listo para integración con APIs de scraping de noticias y plataformas en fases posteriores.
Decisión: Avanzar (Instrucción IMP-AG-0001 cerrada).
