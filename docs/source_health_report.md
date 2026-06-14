# Source Health Report — IMPULSO

Este reporte presenta los resultados de la auditoría empírica de fuentes RSS realizada en `IMP-AG-0004` para verificar el estado HTTP, cantidad de items y contenido deportivo real de las fuentes.

---

## Estado de Salud de las Fuentes (Auditoría Real)

| Fuente | Idioma | Feed | Estado HTTP | Items | Item más reciente | Resultado | Observación |
|---|---|---|---|---:|---|---|---|
| BBC Sport | en | https://feeds.bbci.co.uk/sport/rss.xml | 200 | 75 | Sat, 13 Jun 2026 18:10:10 GMT | ÉXITO | Feed deportivo activo y estable. |
| The Guardian Sport | en | https://www.theguardian.com/sport/rss | 200 | 52 | Sun, 14 Jun 2026 01:37:21 GMT | ÉXITO | Feed deportivo activo y estable. |
| ESPN | en | https://www.espn.com/espn/rss/news | 200 | 34 | Sat, 13 Jun 2026 20:22:07 EST | ÉXITO | Feed activo con noticias generales y deportes. |
| El País Deportes | es | https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/deportes/portada | 200 | 28 | Fri, 05 Jun 2026 16:08:40 GMT | ÉXITO | Feed deportivo activo y estable. |
| Marca | es | https://e00-marca.uecdn.es/rss/futbol/primera-division.xml | 200 | 50 | Sat, 13 Jun 2026 17:11:48 +0200 | ÉXITO | Feed deportivo de fútbol activo. |
| DW Sport | de | https://rss.dw.com/xml/rss-de-sport | 200 | 9 | Sat, 13 Jun 2026 16:02:00 GMT | ÉXITO | Feed deportivo alemán activo. |
| AS | es | https://as.com/rss/deportes/portada.xml | 404 | 0 | N/A | FALLO | Devuelve HTTP 404. Deshabilitada en registry. |
| Sportschau | de | https://www.sportschau.de/sportschau-index~rss.xml | 404 | 0 | N/A | FALLO | Devuelve HTTP 404. Deshabilitada en registry. |
| Kicker | de | https://rss.kicker.de/news/aktuell | Falló | 0 | N/A | FALLO | Petición fetch falló / Red bloqueada. Deshabilitada. |

---

## Conclusiones de la Auditoría

1. **Estado de Salud General**: 6 fuentes de las 9 habilitadas inicialmente respondieron de forma exitosa y contienen metadatos deportivos válidos.
2. **Fuentes Deshabilitadas**: Se desactivaron de forma automática las fuentes AS (`as-deportes`), Sportschau (`sportschau-de`) y Kicker (`kicker-de`) en `src/lib/sources/sourceRegistry.ts` tras registrar fallas persistentes de conexión y errores HTTP 404 en sus endpoints públicos.
3. **Representatividad por Idioma**: Se mantiene al menos una fuente de alta confianza activa para cada uno de los tres idiomas de trabajo:
   * **Español**: El País Deportes y Marca.
   * **Inglés**: BBC Sport, The Guardian y ESPN.
   * **Alemán**: DW Sport.
4. **Verificación de Contenido**: Se corroboró mediante análisis lexical que el 100% de las fuentes de éxito retornan contenido relacionado con el rendimiento, disciplina y noticias de atletas.
