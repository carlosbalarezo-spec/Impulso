# IMP-CX-0001 — Migración de IMPULSO desde Antigravity a Codex

Estoy migrando el desarrollo del proyecto **IMPULSO** desde Antigravity hacia Codex.

Ruta local del proyecto:

```text
D:\Impulso
```

Nombre del producto:

# IMPULSO
## Deporte, mente y rendimiento

IMPULSO es una webapp interna para ayudar a Salvador a manejar de forma unificada cuentas de TikTok e Instagram sobre:

- deporte;
- gestión deportiva;
- psicología deportiva;
- salud mental en el deporte;
- rendimiento;
- presión competitiva;
- disciplina;
- frustración;
- resiliencia;
- liderazgo;
- entorno familiar/deportivo;
- toma de decisiones en atletas.

La app funciona como una **mesa editorial inteligente y supervisada**, no como publicador automático.

---

## Regla operativa principal

No te limites a presentar planes.

Debes:

1. Inspeccionar el repo.
2. Leer documentación existente.
3. Verificar estado real.
4. Ejecutar cambios razonables.
5. Correr pruebas.
6. Correr build.
7. Actualizar documentación.
8. Registrar la instrucción.
9. Reportar con precisión.

Solo debes detenerte a pedir aprobación si:

- vas a eliminar archivos importantes;
- vas a cambiar el stack;
- vas a introducir una dependencia riesgosa;
- vas a usar credenciales, APIs pagadas o scraping agresivo;
- vas a integrar TikTok/Instagram;
- hay riesgo legal, privacidad o copyright evidente.

---

## Contexto heredado

El proyecto fue iniciado por Antigravity con estas instrucciones:

- `IMP-AG-0001`: MVP base de IMPULSO.
- `IMP-AG-0002`: auditoría y endurecimiento de `checkpoint_001`.
- `IMP-AG-0003`: instrucción preparada para pasar de mock controlado a radar real controlado, con fuentes verificables, RSS público, carga manual de URLs y separación visible `MOCK` / `REAL` / `MANUAL`.

No asumas que todo lo reportado por Antigravity es cierto.  
Debes verificarlo en el filesystem.

---

## Gobernanza nueva para Codex

A partir de ahora, toda instrucción ejecutada por Codex debe tener código correlativo:

- `IMP-CX-0001`
- `IMP-CX-0002`
- `IMP-CX-0003`

Donde:

- `IMP` = IMPULSO
- `CX` = Codex
- número correlativo de cuatro dígitos

Crear o actualizar:

```text
docs/codex_instruction_log.md
```

Formato mínimo:

```md
# Codex Instruction Log — IMPULSO

## IMP-CX-0001
Fecha:
Tipo:
Objetivo:
Alcance:
Archivos inspeccionados:
Archivos modificados:
Pruebas ejecutadas:
Build:
Riesgos:
Resultado:
Pendientes:
Decisión:
```

También debes actualizar, si existen:

- `docs/changelog.md`
- `docs/qa_report.md`
- `docs/checkpoint_001.md`
- `README.md`

No borres el log de Antigravity.  
Mantén `docs/antigravity_instruction_log.md` como historial legado.

---

## Objetivo de IMP-CX-0001

Tomar control del proyecto en Codex y producir una auditoría técnica de migración.

No construyas todavía features nuevas salvo correcciones menores necesarias para que el repo compile o los tests corran.

---

## Tareas obligatorias

### 1. Inspección del repo

Entra a:

```text
D:\Impulso
```

Inspecciona:

- estructura de carpetas;
- `package.json`;
- scripts disponibles;
- dependencias;
- `README.md`;
- carpeta `docs`;
- `src/app`;
- `src/lib`;
- `src/tests`;
- rutas API;
- archivo de data local;
- logs de Antigravity;
- walkthroughs o artefactos heredados.

Detecta:

- carpetas duplicadas;
- archivos mal ubicados;
- rutas inconsistentes;
- docs obsoletos;
- scripts rotos;
- errores TypeScript;
- data mock mal marcada;
- deuda técnica evidente.

---

### 2. Verificar estado real

Ejecuta, en este orden:

```bash
npm.cmd install
```

Luego:

```bash
npm.cmd test
```

Luego:

```bash
npm.cmd run build
```

Si alguno falla:

- no maquilles el resultado;
- identifica causa probable;
- corrige solo si es razonable;
- vuelve a ejecutar;
- documenta el antes y después.

---

### 3. Verificar cumplimiento de checkpoint_001

Confirma si realmente existe:

- radar diario;
- scoring editorial explicable;
- compliance bilingüe;
- separación `MOCK` / `REAL` / `MANUAL`, si ya fue implementada;
- data mock marcada explícitamente;
- preview mobile 9:16;
- cola de aprobación;
- calendario editorial;
- analytics manual;
- documentación de gobernanza;
- tests de scoring;
- tests de compliance.

No confíes en reportes previos.  
Verifica archivos y comportamiento.

---

### 4. Crear reporte de migración

Crear:

```text
docs/codex_migration_audit.md
```

Debe incluir:

1. Estado general del proyecto.
2. Stack real detectado.
3. Scripts disponibles.
4. Dependencias.
5. Estructura de carpetas.
6. Funcionalidades realmente existentes.
7. Funcionalidades reportadas pero no verificadas.
8. Tests ejecutados.
9. Resultado de build.
10. Riesgos técnicos.
11. Riesgos editoriales.
12. Riesgos legales/copyright.
13. Riesgos de salud mental.
14. Recomendación: avanzar / bloquear.
15. Próxima instrucción sugerida.

---

## Reglas editoriales que debes preservar

IMPULSO no debe:

- diagnosticar deportistas desde fuera;
- burlarse de atletas;
- explotar crisis de salud mental;
- exponer menores;
- descargar videos de terceros;
- remover marcas de agua;
- evadir paywalls;
- hacer scraping agresivo;
- publicar automáticamente en TikTok o Instagram;
- confundir data mock con data real.

Debe distinguir claramente:

- `MOCK`
- `MOCK_DERIVED_FROM_PUBLIC_CONTEXT`
- `REAL_SOURCE`
- `MANUAL_URL`

Si eso aún no existe, registrarlo como pendiente para `IMP-CX-0002`.

---

## Resultado esperado

Al terminar `IMP-CX-0001`, entrega un reporte final con:

1. Archivos inspeccionados.
2. Archivos creados.
3. Archivos modificados.
4. Resultado exacto de `npm.cmd test`.
5. Resultado exacto de `npm.cmd run build`.
6. Estado real del checkpoint.
7. Principales riesgos.
8. Decisión: avanzar / bloquear.
9. Recomendación concreta para `IMP-CX-0002`.

No presentes solo un plan.  
Ejecuta la auditoría.
