# Checkpoint 001 — IMPULSO

Este documento valida que la fase inicial del MVP (IMP-AG-0001 y su endurecimiento en IMP-AG-0002) cumpla con los requisitos mínimos de producto, gobernanza y calidad editorial antes de proceder a fases de integración avanzada.

## 1. Criterios de Aceptación
- [x] **Estructura del Proyecto**: Next.js App Router corriendo sin Tailwind CSS (usando Vanilla CSS estructurado).
- [x] **Documentación Base**: README, brief de producto, políticas editoriales y compliance creados.
- [x] **Persistencia JSON**: Declaración honesta de persistencia local en archivos JSON (`data/db.json`) y definición de interfaces en `db.ts` para migración a SQLite o Postgres en fases de producción.
- [x] **Base de Datos Semilla**: 20 temas de noticias deportivas simulados y precargados en tres idiomas (ES, EN, DE) marcados con `isMock: true`.
- [x] **Lógica de Negocio**:
  - [x] Algoritmo de scoring evaluando con precisión los criterios (0-100) y sumando/restando penalizadores.
  - [x] Filtro de compliance detectando frases diagnósticas prohibidas (en español e inglés) y recomendando alternativas.
- [x] **Pruebas Unitarias**: Suite de pruebas automatizadas en `src/tests/run_tests.ts` que valida el motor de ranking y compliance con 100% de éxito.
- [x] **Ficha Editorial**: Vista de detalle que presenta de forma estructurada el contexto, postura sugerida, contraargumento y compliance.
- [x] **Generador de Guiones**: Produce tres longitudes (30s, 60s, 90s) y adapta el gancho y los captions para TikTok y Reels.
- [x] **Plan de Overlay 9:16**: Mapeo visual y cronológico de subtítulos, overlays gráficos e indicaciones de planos para video de móvil.
- [x] **Cola de Aprobación**: Modificación de estados con logs de auditoría interna.
- [x] **Analytics Manual**: Registro manual de métricas y resumen agregador básico.

## 2. Registro de Evaluación de Guiones (Prueba de Campo)
- **Tema Probado 1**: Caso de presión competitiva (Simone Biles — `en-1`).
  - *Resultado de Scoring*: **90/100 (Recomendación: Publicar)**. Recibe altos puntajes en Salud Mental Deportiva (95) e Interés Público (90). No activa penalizadores por cumplir cabalmente con las normas de uso de fuentes y no diagnosticar clínicamente.
  - *Validación de Compliance*: Cero frases diagnósticas prohibidas. El guion se enfoca en el concepto del autocuidado y terapia como pilar del rendimiento deportivo.
- **Tema Probado 2**: Caso de menor de edad (Presión en fútbol base — `es-2`).
  - *Resultado de Scoring*: **79/100 (Recomendación: Revisar)**. Puntuación reducida por tratar de menores de edad (penalizador preventivo mitigado por el enfoque educativo y no difamatorio). Apto para producción tras revisar el enfoque del guion.
  - *Validación de Compliance*: Activación automática de modo sensible. El análisis se enfoca 100% en la conducta adulta de los padres y entrenadores, evitando juicios de carácter sobre los niños.

## 3. Conclusión de Salvador (MVP)
- *¿Ayuda a decidir mejor y con mayor criterio?*
  - **Respuesta**: Sí. El sistema estructura los riesgos de salud mental en lugar de automatizar resúmenes genéricos, lo cual obliga a reflexionar sobre los ángulos éticos antes de grabar.
- *Estado del Checkpoint*: **CERRADO Y APROBADO** tras la auditoría de endurecimiento `IMP-AG-0002`.

---

## 4. Cierre del Hito de Radar Real Controlado (IMP-AG-0003)
En la iteración `IMP-AG-0003` se implementó la capa de ingesta e integración de fuentes de información reales sin incurrir en riesgos de copyright ni scraping agresivo:
- [x] **Registro de Fuentes**: Definición configurable de fuentes válidas en `src/lib/sources/sourceRegistry.ts` por idioma y nivel de confianza.
- [x] **Parser RSS Seguro**: Implementación libre de HTML/scripts en `src/lib/sources/rssParser.ts` limpiando CDATA.
- [x] **Motor de Ingesta**: Descarga con timeout y control de duplicidad por URL en `src/lib/sources/ingest.ts`.
- [x] **Carga Manual Protegida**: Formulario para registro de referencias de redes sociales con advertencias éticas de no descarga y bloqueo de aprobación automática (`needs_review`).
- [x] **Ajustes en Scoring & Compliance**: Penalizadores por obsolescencia temporal, falta de fecha, y fuentes no verificadas. Compliance de burla extendido para términos en grada y "choke".
- [x] **Distinción Transparente de Datos**: Visualización segregada en UI de MOCK / REAL / MANUAL.

---

## 5. Cierre del Hito de Auditoría Empírica de Fuentes (IMP-AG-0004)
En la iteración `IMP-AG-0004` se auditó en terreno el estado y confiabilidad de las fuentes reales:
- [x] **Auditoría Empírica**: Herramienta `src/tests/audit_sources.ts` para chequear el estado HTTP y validez deportiva de feeds RSS.
- [x] **Fuentes Depuradas**: Desactivación del motor automático para AS, Sportschau y Kicker tras registrar fallos en terreno.
- [x] **Trazabilidad de Ingesta**: Registro detallado de estadísticas de ingesta (runId, items found/saved/duplicate, durationMs).
- [x] **Enforcement de sourceUrl**: Queda estrictamente verificado que un candidato de tipo `REAL_SOURCE` debe contar con un enlace original público.
- [x] **Compliance Integral**: Ampliación de las validaciones a títulos, resúmenes y notas editoriales.
- [x] **UI de Salud de Fuentes**: Incorporación de un panel premium en la interfaz que reporta la salud técnica de los feeds y despliega los logs de error detallados.
- [x] **Tests Automatizados**: Expansión y ejecución exitosa de 17/17 pruebas en `run_tests.ts`.


