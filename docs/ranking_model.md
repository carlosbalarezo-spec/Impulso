# Ranking Model — IMPULSO

El sistema de ranking evalúa cada tema deportivo candidato con un score de `0 a 100` para determinar si es apto y relevante para las cuentas de Salvador.

## 1. Ponderación de Criterios (Suma 100%)
1. **Salud Mental Deportiva (20%)**: Relevancia para hablar de presión, resiliencia, frustración, o psicología del atleta.
2. **Interés Público (15%)**: Volumen de conversación, tendencia o relevancia mediática del suceso.
3. **Impacto Deportivo (15%)**: Relevancia en los resultados, carrera del atleta o el desarrollo de la disciplina.
4. **Salud Mental Pública (10%)**: Conexión pedagógica con problemas que afecten a la población general (ej. manejo de estrés diario, expectativas familiares).
5. **Impacto Económico / Gestión (10%)**: Relación con gobernanza, contratos, finanzas de clubes o patrocinio deportivo.
6. **Novedad (10%)**: Ocurrencia del hecho dentro de las últimas 24–72 horas.
7. **Potencial Pedagógico (10%)**: Facilidad para extraer una lección o aprendizaje accionable.
8. **Claridad Audiovisual (5%)**: Facilidad para ilustrar con titulares limpios, imágenes con fuentes claras y un gancho rápido.
9. **Alineación con Marca (5%)**: Qué tanto se ajusta al perfil editorial de Salvador ("Deporte, mente y rendimiento").

## 2. Ajustes por Calidad de Fuente
* **Bono de Fuente Confiable**: +5 puntos adicionales sobre el puntaje base si el tema proviene de una fuente oficial o altamente reputada (`REAL_SOURCE` + `trustTier: "high"`).
* **Penalización por Fuente de Baja Reputación**: -15 puntos si el `trustTier` de la fuente es `"low"`.

## 3. Penalizadores Automáticos (Restan directo sobre el score final)
* **Riesgo ético / de Difamación**: -40 puntos.
* **Riesgo de Diagnóstico Psicológico Directo**: -40 puntos (bloqueo automático si se intenta diagnosticar clínicamente).
* **Rumor no confirmado**: -30 puntos.
* **Involucra menor de edad sin enfoque adecuado**: -30 puntos.
* **Sin Ángulo Transformativo Propio**: -25 puntos.
* **Fuente de baja calidad / Dudosa**: -20 puntos.
* **Noticia antigua (>5 días)**: -15 puntos (penaliza la obsolescencia frente a la velocidad de las redes sociales).
* **URL manual sin verificar**: -15 puntos (se aplica a candidatos `MANUAL_URL` que sigan en revisión).
* **Ausencia de fecha de publicación**: -10 puntos (por la imposibilidad de evaluar su actualidad temporal).

## 4. Rangos de Recomendación
- **90 – 100**: **Publicar** (Prioridad alta, excelente alineación y mínimo riesgo).
- **60 – 89**: **Revisar** (Buen tema, requiere ajustar el ángulo o verificar fuentes).
- **0 – 59**: **Descartar** (Falta de alineación, fuentes débiles o alto riesgo ético/legal).

