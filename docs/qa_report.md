# QA Report — IMPULSO

## 1. Métricas de Calidad
Este reporte certifica las pruebas realizadas sobre el MVP de IMPULSO (IMP-AG-0001 e IMP-AG-0002), la integración del Radar Real Controlado (IMP-AG-0003) y la auditoría empírica de fuentes (IMP-AG-0004) para validar su correcto funcionamiento técnico y su conformidad con los estándares de producto.

### Pruebas de Compilación y Sintaxis
- **Next.js Build**: Éxito (compilado con Turbopack exitosamente).
- **TypeScript Compilation**: Éxito (cero errores encontrados).
- **ESLint Validation**: Éxito (comprobaciones de sintaxis y tipado correctas).

### Pruebas Automatizadas de Logic Engines (`npm test`)
Ejecutadas mediante `tsx src/tests/run_tests.ts`. 
- **Resultados**: 17 tests ejecutados, 17 aprobados, 0 fallados.

#### Pruebas del Motor de Scoring (`ranking.ts`)
- **Alta calidad y bajo riesgo**: Puntuación base 90. Recomendación: publicar. Penalizaciones: 0. (Aprobado)
- **Menor de edad involucrado**: Se aplica penalización de -30. Puntuación final: 60. Recomendación: revisar. (Aprobado)
- **Fuente débil**: Se aplica penalización de -20. Puntuación final: 70. Recomendación: revisar. (Aprobado)
- **Rumor no confirmado**: Se aplica penalización de -30. Puntuación final: 60. Recomendación: revisar. (Aprobado)
- **Riesgo de diagnóstico clínico**: Se aplica penalización de -40. Puntuación final: 50. Recomendación: descartar. (Aprobado)
- **Alto interés público pero alto riesgo ético**: Se aplican penalizaciones acumulativas de -80. Puntuación final: 12. Recomendación: descartar. (Aprobado)
- **Fuente real de alta confianza**: `REAL_SOURCE` con `trustTier: "high"` recibe bono de +5. (Aprobado)
- **URL manual sin verificar**: Se aplica penalización de -15. Recomendación: revisar. (Aprobado)
- **Fuente sin fecha**: Se aplica penalización de -10. (Aprobado)
- **Fuente de bajo trust**: Se aplica penalización de -15. (Aprobado)
- **Noticia antigua (>5 días)**: Se aplica penalización de -15. (Aprobado)
- **Fuente con problemas de salud**: Se aplica penalización de -10 si `sourceFailing` es true. (Aprobado)

#### Pruebas del Motor de Compliance (`compliance.ts`)
- **Detección en Español**: Identificación de las 8 frases clínicas prohibidas (ej. "tiene depresión", "es débil", "fracasó por falta de carácter") y sugerencia de alternativas empáticas de opinión. (Aprobado)
- **Detección en Inglés**: Identificación de las 7 frases clínicas prohibidas en inglés (ej. "he is depressed", "mentally weak", "not built for competition") y sugerencia de alternativas correctas. (Aprobado)
- **Guion limpio**: Pasa sin generar violaciones. (Aprobado)
- **Detección de Burla e Híper-Simplificación**: Identificación de términos descalificativos y de "choke" en español e inglés ("choked", "bottled it", "se arrugó", "pecho frío", "cagón", "se rompió mentalmente"). (Aprobado)
- **Títulos y metadatos riesgosos**: Escaneo del título original para términos prohibidos ("choked", "se quebró mentalmente", "débil mental", "no tiene cabeza para competir"). (Aprobado)
- **Escaneo de candidato completo**: Valida todos los metadatos y resúmenes de un candidato (`checkCandidateCompliance`). (Aprobado)

### Auditoría Real de Salud de Fuentes (`npm run test:sources`)
Ejecutada mediante `tsx src/tests/audit_sources.ts`. 
- **Resultados**: 6/6 fuentes habilitadas responden exitosamente con status HTTP 200 y contenido deportivo validado. Se desactivaron automáticamente en registry las 3 fuentes con errores (HTTP 404/fetch failed).

### Auditoría Visual Mobile 9:16
- **Legibilidad**: Los textos se renderizan sobre fondos semitransparentes oscuros (`rgba(0, 0, 0, 0.75)`) para garantizar contraste y legibilidad.
- **Rostro de Salvador**: El simulador de presentador (`.phone-presenter-mock`) se ubica en el centro-inferior, dejando la parte superior libre para las capturas de prensa y fuentes.
- **Visualización de Fuente**: Citado en la cabecera del video de forma legible.
- **Adaptabilidad**: El contenedor usa Flexbox y es totalmente legible tanto en viewports de móvil como de escritorio sin desbordarse.

### Auditoría de Datos Mock y Ingesta Real
- **Marcado de Datos**: Los temas de simulación contienen los campos `isMock: true` y `dataType` debidamente asignados.
- **Fuentes RSS Reales**: Noticias reales obtenidas automáticamente a través de feeds seguros y atribuidas de forma correcta como `REAL_SOURCE` en color azul en la UI.
- **Carga Manual Protegida**: Registros guardados de forma manual con estado `needs_review` y advertencia en UI. Bloquea aprobación automática.

## 2. Resultados de las Pruebas
| Componente | Caso de Prueba | Resultado Esperado | Resultado Real | Estado |
| :--- | :--- | :--- | :--- | :--- |
| Core Logic | Calcular score noticia semilla #1 | Score detallado y fundamentado (90/100) | Score 90, desglose correcto | OK |
| Core Logic | Filtrar frases prohibidas en guion | Detección de "es débil" y "has anxiety" | Detectado correctamente en ES e EN | OK |
| Core Logic | Test Suite Automatizado | 17 tests unitarios aprobados | 17/17 tests aprobados | OK |
| Backend API | Obtener lista de candidatos | Retorna todos los items reales y mock | Devuelve candidatos con tags y tipo | OK |
| Backend API | Ingestar feeds RSS (`POST /api/ingest`) | Ingesta de feeds activos sin romper | Ingesta completa y logs guardados | OK |
| Backend API | Crear candidato manual | Registra URL manual con `needs_review` | Creado exitosamente en DB local | OK |
| Backend API | Actualizar estado en la cola | Guarda el nuevo estado e historial | Guarda log de auditoría correctamente | OK |
| Frontend UI | Cargar Dashboard | Renderiza layout sin errores de consola | Cargado con UI premium (Dark) | OK |
| Frontend UI | Filtros de radar | Filtra por idioma y procedencia | Filtros funcionales (MOCK/REAL/MANUAL) | OK |
| Frontend UI | Mobile 9:16 Preview | Muestra el simulador de pantalla vertical | Simula el iPhone y los overlays | OK |
| Frontend UI | Aprobación restringida | Bloquea "Aprobar" si es `needs_review` | Botón deshabilitado con advertencia | OK |
| Frontend UI | Salud de fuentes | Panel de estado de fuentes e informes | Renderizado e integrado en tiempo real | OK |

