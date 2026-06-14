# Compliance Policy — IMPULSO

## 1. Restricciones Cruciales en Salud Mental
IMPULSO no es una consulta clínica ni Salvador debe actuar como terapeuta de atletas desde fuera.

### Frases Prohibidas (Español / Inglés)
Queda estrictamente prohibido utilizar o sugerir términos diagnósticos definitivos, descalificaciones de carácter o etiquetas degradantes y burlescas.
- **Español Prohibido (Diagnóstico & Carácter)**: "Este deportista tiene depresión", "está deprimido", "sufre ansiedad", "es débil", "débil mental", "le faltan huevos", "no tiene mentalidad ganadora", "fracasó por falta de carácter".
- **Español Prohibido (Burla & Grada)**: "se arrugó", "pecho frío", "cagón", "se rompió mentalmente", "se quebró mentalmente".
- **Inglés Prohibido (Diagnóstico & Carácter)**: "he is depressed", "she is depressed", "has depression", "has anxiety", "mentally weak", "weak mindset", "weak mentality", "not built for competition".
- **Inglés Prohibido (Burla & Choke)**: "choked", "bottled it".
- **Permitido (Alternativas Responsables)**: "no podemos diagnosticar desde fuera, pero este caso ilustra la presión competitiva o el desgaste físico y mental", "la fortaleza mental no significa no sentir presión o no flaquear", "el entorno influyó críticamente en cómo procesó el momento decisivo", "sufrió una parálisis por análisis o una sobrecarga de presión en el cierre".

## 2. Protección de Menores de Edad
Cuando la noticia involucre a atletas menores de 18 años:
- **Modo Sensible Activo**: No especular sobre su salud mental ni sobre sus dinámicas familiares privadas.
- **Sin Ridiculización**: Está prohibido hacer comentarios humorísticos o sarcásticos sobre sus fallos deportivos.
- **Enfoque Pedagógico**: Centrar el análisis en la responsabilidad de los adultos (entrenadores, padres, federaciones) y en la cultura deportiva que los rodea.

## 3. Uso Justo de Contenido de Terceros (Fair Use) y Redes Sociales
Salvador graba comentarios propios. Los overlays o referencias de noticias de terceros deben seguir estas reglas estrictas:
- **No descarga completa**: Queda terminantemente prohibido descargar videos completos de TikTok, Instagram, YouTube u otras plataformas para republicar.
- **Atribución Clara**: Mostrar la fuente de la captura de pantalla o titular (ej. "BBC Sport", "Marca") de forma visible.
- **Comentario Transformativo**: El overlay sirve de evidencia de apoyo; el núcleo del video debe ser el análisis original de Salvador en primer plano.
- **Sin Eliminación de Marcas de Agua**: No se alterarán ni recortarán los clips originales de plataformas ajenas para ocultar su procedencia.
- **Carga Manual Referencial**: Las URLs cargadas manualmente no descargan archivos de plataformas externas; funcionan como referencia exclusiva de análisis de opinión y se bloquean automáticamente con el estado `needs_review` hasta su debida inspección.

## 4. Compliance de Datos en Simulación (Mock Data)
- **Filtro de Verificación**: Ningún tema calificado con `isMock: true` debe ser publicado como noticia verificada.
- En caso de usar temas inspirados en el contexto público (etiquetados como `MOCK_DERIVED_FROM_PUBLIC_CONTEXT`), Salvador debe corroborar los hechos de forma externa e independiente y reemplazar los campos por datos reales verificados antes de cambiar el estado de la cola a "Listo para Grabar".
