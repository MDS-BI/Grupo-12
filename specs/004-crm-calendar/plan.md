# Implementation Plan: Calendario CRM

**Branch**: `004-crm-calendar` | **Date**: 2026-11-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-crm-calendar/spec.md`

## Summary

Agregar al módulo CRM un calendario lateral de tareas personales (crear/editar/cambiar estado/consultar, solo usuario actual) y un calendario general con vistas anual/mensual/semanal para gestionar actividades comerciales (reunión, evento, llamada, seguimiento, actividad comercial). Las llamadas/reuniones se reflejan como actividades programadas coherentes con el historial de Interacciones CRM, sin capturar resultado/notas en el flujo de creación del calendario. La implementación reutiliza la arquitectura SPA existente (`index.html` + `src/*` + `localStorage`), extendiendo storage/domain/app con nuevas entidades y vistas sin modificar `specs/001-crm-module/spec.md` ni contratos existentes.

## Technical Context

**Language/Version**: JavaScript ES modules (browser), Node/npm toolchain for tests/lint  
**Primary Dependencies**: Vite 8.x (dev/build), Vitest 4.x + jsdom (tests), ESLint 9.x, Prettier 3.x; sin frameworks UI  
**Storage**: Browser `localStorage` con claves canónicas `crm_module:*` y compatibilidad `erp_base_module:*` existente; nuevas claves para calendario/tareas en namespace `crm_module:*`  
**Testing**: `vitest`/`vitest run`, jsdom; contratos unitarios + integración DOM real  
**Target Platform**: Navegador desktop/mobile moderno (SPA estática servida por Vite)  
**Project Type**: Single-page web application (frontend-only, sin backend)  
**Performance Goals**: Actualización de vistas afectadas en la misma sesión (SC-003); operaciones de calendario responsivas con volumen CRM típico (<=500 registros); sin recarga manual  
**Constraints**: No modificar `specs/001-crm-module/spec.md`; mantener coherencia visual/arquitectónica; no introducir backend; reutilizar entidades CRM (clientes/oportunidades/interacciones/empleados); accesibilidad teclado/ARIA; responsive sin scroll horizontal en acciones principales  
**Scale/Scope**: Uso por usuario comercial individual/equipo pequeño; tareas personales y actividades CRM en horizonte operativo diario/mensual/anual; volumen objetivo alineado a presupuesto existente (500 registros)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Code Quality & Maintainability | Modular changes, existing style, no unnecessary abstractions | PASS | Extend `domain.js`, `storage.js`, `app.js`, `styles.css`, `index.html` using current patterns. |
| II. Test-First & Verification | New behavior covered by automated tests; regressions checked | PASS | Plan includes unit + integration DOM tests; run `npm run test:run` and `npm run lint`. |
| III. User Experience Consistency | Consistent layout, validation, empty/loading/error states, accessibility | PASS | Reuse accessible confirm dialogs, inline validation, empty states, keyboard/focus patterns. |
| IV. Performance & Reliability | Responsive critical paths, no avoidable blocking work | PASS | In-memory filtering/grouping over existing arrays; render by active view/period only. |

**Post-Phase 1 re-check**: PASS - design uses local storage, no new deps, bounded entities, explicit storage contracts.

## Project Structure

### Documentation (this feature)

```text
specs/004-crm-calendar/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── calendar-storage.md
└── tasks.md             # Phase 2 output (/speckit.tasks - NOT created here)
```

### Source Code (repository root)

```text
index.html               # Nuevas secciones/vistas: calendario lateral, calendario general, formularios/detalle
src/
├── app.js               # Render/handlers calendario lateral y general, navegación, filtros, integración UI
├── domain.js            # Tipos/estados actividad, reglas vencimiento 24h, transiciones/validaciones fecha
├── storage.js           # CRUD tareas/actividades, persistencia, integración con interacciones CRM
├── module-config.js     # Labels/config opcional para calendario/tareas si aplica
├── styles.css           # Estilos calendario lateral/general, responsive, estados vencimiento
└── main.js              # Boot sin cambios de contrato, salvo wiring necesario

tests/
├── unit/
│   ├── calendar-domain.test.js
│   └── calendar-storage.test.js
└── integration/
    ├── calendar-sidebar.test.js
    ├── calendar-general.test.js
    └── calendar-interactions-sync.test.js
```

**Structure Decision**: Single-project SPA existente. Se extiende la estructura actual en lugar de crear subproyectos. Los tests siguen la convención `tests/unit` y `tests/integration`.

## Complexity Tracking

No constitution violations requiring justification.

