# Política de Ingesta de Fuentes y Control de Radar — IMPULSO

Esta política establece las directrices éticas, operativas y de cumplimiento legal para la ingesta de noticias, datos y referencias públicas dentro del ecosistema **IMPULSO**.

---

## 1. Fuentes Autorizadas y Registro de Fuentes

El sistema de **Radar Real Controlado** se nutre exclusivamente de fuentes de información deportiva reconocidas internacionalmente y con feeds RSS públicos y gratuitos. Las fuentes se clasifican en tres niveles de confianza (`trustTier`):

### Nivel de Confianza Alto (`high`)
* **BBC Sport / BBC Mundo Deportes**: Feeds públicos de noticias de alta reputación periodística. (Habilitado)
* **The Guardian Sport**: Feed de deportes de alta calidad. (Habilitado)
* **El País Deportes**: Feed de deportes en español. (Habilitado)
* **DW Sport**: Feed deportivo en alemán. (Habilitado)
* **Sportschau / Kicker**: Deshabilitados en `IMP-AG-0004` por errores de red y HTTP 404 durante auditoría real.

### Nivel de Confianza Medio (`medium`)
* **ESPN**: Noticias de ESPN. (Habilitado)
* **Marca**: Diario deportivo en español. (Habilitado)
* **AS**: Deshabilitado en `IMP-AG-0004` tras registrar HTTP 404.

### Nivel de Confianza Bajo (`low`) o Deshabilitadas (`disabled`)
* Si una fuente no posee un feed RSS público gratuito verificado o arroja fallos técnicos/404, se deshabilita del motor automático (`enabled: false`, `type: "disabled"`) en `src/lib/sources/sourceRegistry.ts`. **Solo se mantienen fuentes con evidencia empírica de salud activa.**

---

## 2. Datos Almacenados vs. Datos Excluidos (Copyright & IP Protection)

Para evitar infracciones de propiedad intelectual (copyright) y proteger la marca de **IMPULSO**, la ingesta cumple con las siguientes reglas duras:

### Qué se guarda en la Base de Datos (`data/db.json`):
1. **originalTitle / Título original** (atribución literal).
2. **sourceName / Nombre del medio** (BBC, Marca, etc.).
3. **sourceUrl / Link original público** (link directo al sitio oficial del medio). **Enforcement: Si falta sourceUrl, no puede registrarse como REAL_SOURCE.**
4. **sourceFeedUrl / URL del feed RSS**.
5. **sourcePublishedAt / Fecha y hora de publicación original**. **Enforcement: Si falta la fecha, la noticia se guarda pero se etiqueta como `needs_review` y se le penaliza en el scoring.**
6. **ingestedAt / Fecha/hora de ingesta local**.
7. **contentStored: "metadata_only"** (marca de control obligatorio).
8. **Resumen generado internamente**: Un análisis propio, marcado explícitamente en la UI como *"Resumen de IMPULSO"*.

### Qué NO se guarda:
* **Artículos completos**: Queda terminantemente prohibido extraer el cuerpo completo del texto del medio original o evadir paywalls técnicos.
* **Contenido multimedia original**: No se descargan fotos, videos, audios ni recursos estáticos de terceros.
* **Marcas de agua o logos**: No se republican logos corporativos ajenos.

---

## 3. Tratamiento de URLs Manuales (TikTok / Instagram / Redes Sociales)

Salvador puede registrar referencias manuales de redes sociales (TikTok e Instagram) utilizando el formulario de **Carga Manual**. Para mitigar riesgos legales y éticos, se aplican los siguientes límites operativos:

* **Sin Scraping Activo**: No se realizan peticiones automatizadas (web scraping) a las APIs de TikTok o Instagram, evitando la violación de sus Términos de Servicio.
* **Solo Metadatos**: El formulario solo almacena la URL de referencia, un título descriptivo escrito por Salvador y notas editoriales iniciales.
* **Advertencia en UI**: La interfaz muestra una advertencia explícita recordando que está prohibido descargar o reutilizar videos de terceros o remover marcas de agua.
* **Estado Inicial**: Todo registro de red social se inicializa de forma obligatoria con:
  * `dataType: "MANUAL_URL"`
  * `verificationStatus: "needs_review"`
* **Bloqueo de Aprobación**: Los candidatos con estado `needs_review` **no se pueden aprobar ni publicar** en la interfaz hasta que se verifique manualmente su idoneidad ética y legal.

---

## 4. Trazabilidad y Separación Visible de Datos (UI/UX)

Para garantizar la honestidad intelectual frente al usuario final y a los auditores del proyecto, la aplicación distingue visualmente el origen del contenido mediante cuatro tipos de datos obligatorios (`CandidateDataType`):

| DataType | Origen de la Información | Badge en UI | Indicador de Simulación |
| :--- | :--- | :--- | :--- |
| `MOCK` | Datos 100% de prueba, generados con fines de desarrollo. | `MOCK` | Banner rojo de advertencia activa. |
| `MOCK_DERIVED_FROM_PUBLIC_CONTEXT` | Datos simulados basados en contexto público real. | `MOCK DERIVED` | Banner rojo de advertencia activa. |
| `REAL_SOURCE` | Noticias reales obtenidas automáticamente a través de feeds RSS seguros. | `REAL SOURCE` | Sin advertencia de simulación. Badge azul. |
| `MANUAL_URL` | Referencias de noticias o posts ingresadas manualmente por Salvador. | `MANUAL URL` | Alerta de revisión necesaria (bloquea aprobación). Badge naranja. |

---

## 5. Proceso de Verificación y Cambio de Estado

1. **Ingesta**: El motor de ingesta descarga el RSS, normaliza los campos y asocia `verificationStatus: "source_verified"` (para fuentes confiables del registro con fecha válida) o `verificationStatus: "needs_review"` (para noticias con fecha ausente, fuentes manuales o fuentes de baja reputación).
2. **Scoring**: El modelo de ranking aplica penalizaciones severas (-15 puntos) si un tema es `MANUAL_URL` no verificado o tiene un `trustTier: "low"`, y -10 puntos si la fuente presenta problemas de salud técnicos.
3. **Auditoría Editorial**: Salvador o el equipo editorial revisan el guion y el compliance.
4. **Liberación**: Una vez comprobado, se actualiza el estado en la base de datos a `source_verified` para desbloquear la aprobación final.
