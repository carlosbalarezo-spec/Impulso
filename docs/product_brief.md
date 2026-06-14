# Product Brief — IMPULSO

## 1. Visión del Producto
**IMPULSO** es una mesa editorial inteligente y supervisada diseñada para Salvador, con el fin de unificar la estrategia y creación de contenido para sus cuentas de TikTok e Instagram (enfoque 9:16 vertical).

La aplicación ayuda a Salvador a responder la pregunta diaria fundamental:
> ¿Qué tema deportivo reciente merece que Salvador comente hoy, por qué importa, qué ángulo psicológico tiene y cómo se convierte en un video corto responsable, claro y publicable?

No se trata de publicar de forma automatizada, sino de proveer una herramienta de pensamiento estructurado, análisis crítico y scoring de idoneidad editorial.

## 2. Pilares de Contenido
- **Deporte y Gestión**: Decisiones en atletas, economía del deporte, liderazgo, gestión de entidades y dinámicas de equipo.
- **Mente y Rendimiento**: Psicología deportiva, salud mental bajo la presión de competencia, disciplina, resiliencia y el impacto de la frustración.
- **Entorno del Atleta**: El rol de la familia, entrenadores y el entorno social en el desarrollo de la carrera deportiva.

## 3. Flujo del Sistema
1. **Radar Real Controlado**: Consume feeds RSS públicos y oficiales en tres idiomas (Español, Inglés, Alemán) de fuentes con reputación periodística (BBC, The Guardian, DW, El País, Sportschau, Kicker, Marca, AS).
2. **Carga Manual Protegida**: Permite a Salvador registrar links manuales de redes sociales (TikTok/Instagram) u otros portales, guardando únicamente la URL y notas editoriales como referencia transformativa (sin scraping agresivo ni descarga de material con propiedad intelectual).
3. **Ranking y Selección**: Evalúa cada tema de 0 a 100 con criterios ponderados y penalizaciones por rumor, difamación, falta de fecha, antigüedad superior a 5 días, o URLs manuales pendientes de revisión.
4. **Ficha Editorial**: Desarrolla el análisis en profundidad con contraargumentos y directrices de cumplimiento ético.
5. **Generador de Guiones**: Produce tres variantes de guion (30s, 60s, 90s) estructuradas con gancho, desarrollo, ejemplo y llamado a la acción (CTA).
6. **Plan de Overlay**: Visualiza la disposición del video vertical (9:16) con overlays de texto, citas de fuentes y posición de Salvador.
7. **Cola de Aprobación**: Permite el seguimiento del estado de producción (Preseleccionada -> Guion Generado -> Listo para Grabar -> Grabado -> Editado -> Aprobado -> Publicado). Bloquea la aprobación final de temas manuales no verificados.
8. **Analytics Manual**: Permite registrar el rendimiento del video para aprender y retroalimentar futuras sugerencias.

## 4. Arquitectura y Persistencia de Datos
El MVP está diseñado bajo Next.js utilizando TypeScript para mayor robustez en el tipado. 
- **Persistencia**: La persistencia de datos local actual se maneja mediante un archivo JSON plano estructurado en el sistema de archivos (`data/db.json`).
- **Propósito**: Facilitar la portabilidad rápida en Windows, eliminando las dependencias nativas complejas que exigen SQLite o bases de datos externas en la fase inicial del proyecto.
- **Transición**: Se han desacoplado todas las consultas mediante un módulo de base de datos (`src/lib/db.ts`) con interfaces estándar, permitiendo que la transición a SQLite o Postgres se realice de manera transparente en la siguiente fase de desarrollo.

