# Codex Migration Audit - IMPULSO

## IMP-CX-0001

Fecha: 2026-06-13
Tipo: Auditoria tecnica de migracion desde Antigravity a Codex.
Decision: Avanzar con cautela.

## Estado general

IMPULSO existe como una webapp interna Next.js con App Router, React, TypeScript y CSS propio. El MVP base compila y la suite automatizada existente pasa correctamente.

Hallazgos principales:

- `D:\Impulso` no contiene carpeta `.git`; no hay historial Git verificable en esta ruta.
- `data/db.json` no existia fisicamente al inspeccionar el filesystem; `src/lib/db.ts` lo genera bajo demanda cuando se ejecuta `initDB()`.
- Hay preparacion parcial para fuentes RSS reales (`src/lib/sources/sourceRegistry.ts` y `src/lib/sources/rssParser.ts`), pero no hay endpoint, UI ni job de ingesta real conectado.
- La documentacion heredada afirmaba estado cerrado/aprobado de checkpoint; Codex confirma una parte importante, pero no confirma ingesta real controlada.

## Stack real detectado

- Next.js 16.2.9.
- React 19.2.4.
- React DOM 19.2.4.
- TypeScript 5.
- ESLint 9 con `eslint-config-next`.
- `tsx` para ejecutar tests TypeScript.
- Persistencia local con filesystem JSON implementada en `src/lib/db.ts`.
- CSS global propio en `src/app/globals.css`.

## Scripts disponibles

- `npm.cmd run dev`: servidor local Next.
- `npm.cmd run build`: build de produccion.
- `npm.cmd run start`: servidor de produccion.
- `npm.cmd run lint`: ESLint.
- `npm.cmd test`: `tsx src/tests/run_tests.ts`.

## Dependencias

Runtime: `next`, `react`, `react-dom`.

Dev: `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `tsx`, `typescript`.

`npm.cmd install` reporto 2 vulnerabilidades moderadas. No se ejecuto `npm audit fix --force` porque puede introducir cambios de version fuera del alcance de esta auditoria.

## Estructura de carpetas

- `docs/`: documentacion de producto, QA, compliance, ranking, checkpoint y log legado Antigravity.
- `src/app/`: dashboard, layout, estilos globales y rutas API.
- `src/app/api/candidates/route.ts`: API de candidatos, actualizacion de estado y guardado.
- `src/app/api/analytics/route.ts`: API de analytics manual.
- `src/lib/`: scoring, compliance, persistencia JSON y preparacion de fuentes.
- `src/lib/sources/`: registro de fuentes y parser RSS basico.
- `src/tests/run_tests.ts`: suite automatizada propia.
- `.next/` y `node_modules/`: artefactos/dependencias locales.

No se encontro carpeta `data/` durante la inspeccion previa a tocar APIs o `initDB()`.

## Funcionalidades realmente existentes

- Radar diario con lista de candidatos en `src/app/page.tsx`.
- Scoring editorial explicable en `src/lib/ranking.ts`.
- Compliance bilingue ES/EN en `src/lib/compliance.ts`.
- Tipos de datos `MOCK`, `MOCK_DERIVED_FROM_PUBLIC_CONTEXT`, `REAL_SOURCE`, `MANUAL_URL` definidos en `src/lib/db.ts`.
- Data seed mock en `src/lib/db.ts` marcada con `isMock` y `dataType`.
- Banner UI para datos simulados en `src/app/page.tsx`.
- Preview/plan mobile 9:16 como representacion UI y campos `overlayPlan`.
- Cola de aprobacion y cambio de estados con historial.
- Calendario editorial semanal estatico.
- Analytics manual con formulario y tabla.
- Tests automatizados de ranking y compliance.
- Registro de fuentes RSS/manuales en `sourceRegistry.ts`.
- Parser RSS basico en `rssParser.ts`.

## Funcionalidades reportadas pero no verificadas

- Radar real automatico: no verificado como funcional. Hay fuentes y parser, pero no endpoint/job/UI de ingesta.
- Carga manual de URLs: no verificada como funcional en UI o API.
- Separacion visible entre `REAL_SOURCE` y `MANUAL_URL`: tipos existen, pero no se verifico flujo real que cree o muestre esos casos.
- Validacion visual real con navegador durante IMP-CX-0001: no ejecutada; la auditoria fue de filesystem, tests y build.
- Archivo fisico `data/db.json`: documentado por el proyecto, pero no existia durante la inspeccion.

## Tests ejecutados

```bash
npm.cmd test
```

Resultado:

```text
TEST RUN SUMMARY: 9 passed, 0 failed.
```

## Resultado de build

```bash
npm.cmd run build
```

Resultado:

```text
Compiled successfully
Finished TypeScript
Route (app)
/
/_not-found
/api/analytics
/api/candidates
```

Build exitoso con Next.js 16.2.9 y Turbopack.

## Riesgos tecnicos

- No hay repositorio Git detectable en `D:\Impulso`; dificulta rollback, revision y trazabilidad.
- Persistencia JSON sin bloqueo transaccional ni control de concurrencia.
- `data/db.json` se genera bajo demanda, por lo que el estado real de datos puede variar segun si se inicializo la app/API.
- Parser RSS usa regex sobre XML; suficiente para prototipo, fragil ante feeds complejos.
- No hay tests de API ni tests de UI.
- `npm install` reporta 2 vulnerabilidades moderadas.

## Riesgos editoriales

- Los datos mock estan marcados, pero varios casos usan nombres de deportistas reales con escenarios simulados derivados de contexto publico.
- Riesgo de que un usuario interprete una simulacion como noticia verificada si se copia fuera de la UI.
- El calendario editorial es estatico y puede sugerir temas aunque no esten verificados.

## Riesgos legales/copyright

- No hay descarga de videos, remocion de marcas de agua ni scraping agresivo implementado.
- Las futuras fuentes RSS deben respetar terminos de uso y limitarse a titulares/resumenes con enlace a fuente.
- Antes de usar `REAL_SOURCE`, debe guardarse URL, fuente, fecha y estado de verificacion.

## Riesgos de salud mental

- Compliance evita diagnosticos clinicos directos en ES/EN, pero la cobertura no es exhaustiva.
- No hay compliance en aleman pese a existir data DE.
- Deben mantenerse reglas contra diagnosticar atletas desde fuera, burlarse, explotar crisis o exponer menores.

## Recomendacion

Avanzar con cautela.

El MVP compila y las pruebas existentes pasan. La siguiente fase no debe integrar TikTok/Instagram ni publicacion automatica. Debe enfocarse en cerrar la brecha entre tipos preparados y flujos reales: ingesta controlada, carga manual, trazabilidad de fuentes y tests para esos caminos.

## Proxima instruccion sugerida

IMP-CX-0002: implementar radar real controlado sin publicar automaticamente:

- endpoint de ingesta RSS manual/supervisada;
- carga manual de URL;
- persistencia explicita de `REAL_SOURCE` y `MANUAL_URL`;
- UI con badges visibles para `MOCK`, `MOCK_DERIVED_FROM_PUBLIC_CONTEXT`, `REAL_SOURCE` y `MANUAL_URL`;
- tests para parser RSS, deduplicacion, marcado de data y compliance basico de candidatos ingresados.
