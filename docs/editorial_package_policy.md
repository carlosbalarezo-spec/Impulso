# Política de Paquete Editorial de IMPULSO

Esta política regula el ciclo de vida, contenido y criterios de aprobación de los **Paquetes Editoriales** dentro de la plataforma IMPULSO. El objetivo es garantizar que la creación de contenido de Salvador sea éticamente responsable, legalmente segura, pedagógicamente útil y libre de riesgos clínicos o de copyright.

---

## 1. ¿Qué es un Paquete Editorial?

Un Paquete Editorial es una entidad de trabajo estructurada que transforma una noticia o candidato preseleccionado del radar en un conjunto unificado de recursos listos para la grabación humana. Su finalidad es evitar la improvisación y asegurar la trazabilidad del proceso editorial.

Cada paquete está asociado de forma unívoca a un `Candidate` del radar diario.

---

## 2. Contenido del Paquete Editorial

Cada paquete editorial contiene:

### A. Ficha Editorial
*   **Resumen breve:** Extracto conciso del hecho noticioso.
*   **Contexto:** Antecedentes e información complementaria contrastada.
*   **Por qué importa:** Valor social, relevancia deportiva u organizativa.
*   **Ángulo de psicología deportiva:** Foco en procesos cognitivos, ansiedad, liderazgo, motivación o tolerancia a la frustración.
*   **Ángulo de gestión deportiva:** Enfoque en gobernanza, finanzas, infraestructura o contratos.
*   **Postura sugerida de Salvador:** Recomendación de opinión constructiva alineada con la marca.
*   **Contraargumento:** Opiniones alternativas o reacciones habituales en la grada.
*   **Riesgo de simplificación:** Identificación de reduccionismos para evitar conclusiones banales.
*   **Frases a evitar:** Expresiones prohibidas por compliance.
*   **Fuentes verificadas:** Listado de enlaces a medios de comunicación de confianza que sustentan la noticia.
*   **Nota de compliance:** Directrices de protección y respeto en salud mental.

### B. Guiones Estructurados (30s, 60s, 90s)
Tres adaptaciones de tiempo que contienen la misma estructura lógica para diferentes formatos de redes sociales:
*   **Hook (Gancho):** Frase inicial impactante.
*   **Contexto:** Explicación simple del hecho de forma breve.
*   **Comentario central:** La postura razonada y analítica de Salvador.
*   **Ejemplo:** Caso de aplicación o hecho concreto para ilustrar.
*   **Cierre:** Conclusión de la idea.
*   **CTA no agresivo:** Pregunta abierta para motivar la participación respetuosa en comentarios.
*   **Subtítulos sugeridos:** Directrices visuales.
*   **Captions y Hashtags:** Textos de acompañamiento específicos para TikTok e Instagram.

### C. Plan de Overlay
Regula los aspectos de soporte visual del video vertical:
*   **Formato:** Relación de aspecto vertical 9:16.
*   **Posición de Salvador:** Ubicación del presentador en la pantalla (ej. centro inferior) para dejar espacio libre a los gráficos.
*   **Titular y Fuente visible:** Captura o cita clara del medio origen del tema, garantizando honestidad intelectual.
*   **Momento de énfasis:** Línea de tiempo que define en qué segundo del video aparece cada gráfico.

### D. Checklist de Aprobación Responsable
Un conjunto de verificación de 10 puntos booleanos críticos:
1.  **Fuente visible:** El medio original se muestra en el video.
2.  **URL guardada:** El enlace original está registrado como evidencia.
3.  **No diagnóstico clínico:** Se ha verificado que no se califique al atleta de enfermo.
4.  **No burla:** El guion no incluye insultos o descalificaciones de grada.
5.  **No menor expuesto:** Protección absoluta de menores de edad.
6.  **No contenido privado:** No se divulgan intimidades.
7.  **No video tercero descargado:** Cero descargas de material completo de terceros.
8.  **No artículo completo copiado:** La información es analizada de forma transformativa.
9.  **Postura propia presente:** Salvador expone su visión personal constructiva.
10. **Revisión humana realizada:** El editor certifica la revisión manual.

---

## 3. Criterios Estrictos de Aprobación (Bloqueo de Estado)

Queda terminantemente prohibido cambiar el estado de un Paquete Editorial a **`approved`** si se presenta cualquiera de las siguientes condiciones:

1.  **Fallo de Compliance:** La presencia de cualquier término clínico prohibido ("sufre depresión", "débil mental", "pecho frío", "choked", etc.) en la ficha o guiones.
2.  **Estado "needs_review" en Candidato:** Si la noticia origen está en revisión por dudas sobre su veracidad.
3.  **Ausencia de sourceUrl:** Falta el enlace a la fuente original del tema.
4.  **MANUAL_URL sin revisión:** Ingresos manuales que no han sido validados explícitamente (`verificationStatus` diferente a `source_verified`).
5.  **Menor expuesto en Modo Sensible:** Si el contenido involucra a un menor de edad (por tags o contenido) y no se ha marcado el check crítico de protección `noMinorExposed`.
6.  **Checklist crítico incompleto:** Si cualquiera de los 10 puntos del checklist de aprobación responsable no ha sido marcado como verificado (`true`).

El sistema bloqueará la transición de forma automatizada tanto en la API como en la UI, detallando los motivos precisos del bloqueo.

---

## 4. Protección de Salvador y Terceros

*   **Protección de Salvador:** Al automatizar los escaneos de compliance y checklists éticos, se impide la publicación por impulso de opiniones agresivas o diagnósticos no profesionales que dañen la credibilidad de Salvador.
*   **Protección de Terceros:** Se prohíbe el diagnóstico de salud mental desde fuera. Se habla de "presión", "fatiga mental" o "desgaste", respetando el principio de que los diagnósticos clínicos pertenecen al ámbito privado y médico.
*   **Prevención de Riesgos de Copyright:** Queda prohibida la descarga de clips completos de partidos o publicaciones ajenas para re-subirlos. Los overlays deben ser capturas de titulares de prensa de forma estática como sustento informativo (bajo doctrina de Fair Use), promoviendo el uso de b-roll propio grabado con el iPhone.
