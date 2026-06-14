# IMPULSO — Deporte, Mente y Rendimiento

Este es el repositorio de **IMPULSO**, una mesa editorial inteligente y supervisada diseñada para Salvador para gestionar la creación de contenido de video vertical 9:16 (TikTok e Instagram Reels) centrado en psicología deportiva, rendimiento y gestión.

---

## 1. Arquitectura y Tecnologías
- **Framework**: Next.js 16+ (App Router, React, TypeScript).
- **Estilos**: Vanilla CSS (CSS Modules y variables globales) para lograr un diseño premium oscuro con efectos glassmorphism.
- **Base de Datos**: Sistema de persistencia basado en archivos JSON en disco (`src/lib/db.ts`).
- **Motores Core**:
  - `src/lib/ranking.ts`: Algoritmo de scoring explicable de 0 a 100, extendido con penalizaciones de confianza de fuentes, antigüedad y carga manual no verificada.
  - `src/lib/compliance.ts`: Detección de frases prohibidas y validación de guiones y metadatos.
  - `src/lib/sources/ingest.ts`: Motor de ingesta de noticias RSS seguro y parseador libre de scripts externos.
  - `src/lib/editorial/packageGenerator.ts`: Generador determinístico de paquetes editoriales (briefs, guiones 30/60/90, planes de overlay y checklist éticos).

### 1.1. Documentación de Persistencia (Filesystem JSON)
El MVP de IMPULSO utiliza almacenamiento en un archivo plano JSON (`data/db.json`) en lugar de SQLite o Postgres.
- **Motivo**: Portabilidad total e inmediata en entornos de desarrollo local en Windows. Evita la necesidad de compilación nativa de binarios de C++ (ej. `node-gyp` o `better-sqlite3` que suelen fallar en terminales locales sin herramientas de build de Visual Studio).
- **Limitaciones**:
  - No admite concurrencia masiva de escritura (bloqueo de archivos).
  - No es óptimo para volúmenes de miles de transacciones o consultas complejas de búsqueda relacional.
- **Riesgos**:
  - Posibilidad de corrupción del archivo `db.json` si el servidor de Next.js se apaga abruptamente en medio de una operación de guardado (`fs.writeFileSync`).
- **Plan de Migración Futuro**:
  Para migrar a una base de datos SQLite o PostgreSQL relacional en fases avanzadas de producción, solo es necesario reemplazar la implementación interna de [src/lib/db.ts](file:///d:/Impulso/src/lib/db.ts). Las siguientes interfaces públicas **deben mantenerse idénticas** para que la migración no rompa la aplicación Next.js:
  - `getCandidates()`: Retorna un arreglo de `Candidate`.
  - `getCandidateById(id: string)`: Retorna un `Candidate` o `undefined`.
  - `updateCandidateStatus(id, newStatus, note)`: Modifica el estado y añade un registro de auditoría.
  - `updateCandidate(updated)`: Sobrescribe la información de un candidato (ficha o guion).
  - `getAnalytics()`: Retorna el histórico de analytics.
  - `addAnalytics(record)`: Añade un registro de analítica manual.
  - `getIngestHistory()`: Obtiene el log de ingesta de fuentes RSS.
  - `addIngestLogs(logs)`: Registra el resultado de la última ejecución de ingesta.
  - `getEditorialPackages()`: Retorna todos los paquetes editoriales guardados.
  - `getEditorialPackageById(id: string)`: Retorna un paquete editorial por ID.
  - `addEditorialPackage(pkg)`: Registra un paquete generado en la base de datos.
  - `updateEditorialPackage(pkg)`: Actualiza las modificaciones de un paquete editorial.

---

## 2. Estructura de Carpetas
```
/docs                   - Políticas editoriales, ranking, compliance, e ingesta de fuentes
/src/app                - Rutas de la webapp y endpoints de API
  /api                  - Endpoints para candidatos, ingesta RSS, paquetes editoriales y analytics
  /globals.css          - Variables de diseño global, tipografía y estilo general
  /page.tsx             - Dashboard principal que integra todas las secciones (incluido el panel Paquete Editorial)
  /layout.tsx           - Estructura general de la webapp y SEO
/src/lib                - Motores de scoring, compliance, ingesta RSS, base de datos local y generación de paquetes
/data                   - Almacenamiento persistente en archivo de base de datos (db.json)
/src/tests              - Pruebas unitarias automatizadas para scoring, compliance y paquetes editoriales
```

---

## 3. Guía de Ejecución Local y Testing

### Prerrequisitos
- Node.js (v18 o superior)
- npm (v9 o superior)

### Instalación y Ejecución
1. Instalar las dependencias en la raíz del proyecto:
   ```bash
   npm.cmd install
   ```
2. Ejecutar las pruebas unitarias de scoring, compliance y paquetes editoriales:
   ```bash
   npm.cmd test
   ```
3. Ejecutar la auditoría real de salud de fuentes RSS:
   ```bash
   npm.cmd run test:sources
   ```
4. Ejecutar el servidor de desarrollo local:
   ```bash
   npm.cmd run dev
   ```
5. Abrir en el navegador [http://localhost:3000](http://localhost:3000).

---

## 4. Gobernanza de Instrucciones
Todas las instrucciones de desarrollo son registradas en el archivo [docs/antigravity_instruction_log.md](file:///d:/Impulso/docs/antigravity_instruction_log.md). La iteración actual corresponde a `IMP-AG-0005` (Paquete editorial real: ficha, guion, overlay y aprobación responsable).
