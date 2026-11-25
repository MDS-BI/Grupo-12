# Tasks: Calendario CRM

**Input**: Design documents from `/specs/004-crm-calendar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/calendar-storage.md, quickstart.md

**Tests**: Included - constitution requires automated tests for user-visible behavior and business logic.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label ([US1]..[US4]) for story phases only
- Every task includes exact file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare feature scaffolding and test fixtures.

- [X] T001 Create calendar test scaffolding and shared fixtures in tests/helpers.js and tests/integration/live-dom.js
- [X] T002 [P] Add calendar feature constants/enums placeholders in src/domain.js
- [X] T003 [P] Add calendar storage key placeholders and empty-array defaults in src/storage.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain/storage/UI infrastructure required by all stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T004 Implement calendar domain models and validators (task/activity/relation enums, due-state 24h rule, date range validation) in src/domain.js
- [X] T005 [P] Implement task storage CRUD and owner scoping contract in src/storage.js
- [X] T006 [P] Implement calendar activity storage CRUD and range/filter contract in src/storage.js
- [X] T007 Extend FR-072 storage corruption detection/recovery/reset to include `crm_module:tasks` and `crm_module:calendarActivities` as affected entity keys in src/storage.js
- [X] T008 [P] Add calendar shell markup containers (sidebar, general calendar view, dialogs) and nav entry placeholders in index.html
- [X] T009 [P] Add base calendar layout/responsive/empty-state styles in src/styles.css
- [X] T010 Add CRM calendar navigation and view routing (VIEW_KEYS, nav buttons, showView/persistActiveView, calendar sidebar/general view activation) in src/app.js and index.html

**Checkpoint**: Domain/storage contracts, FR-072 recovery coverage, and UI shell/routing ready for user story implementation.

---

## Phase 3: User Story 1 - Gestionar tareas en calendario lateral (Priority: P1) 🎯 MVP

**Goal**: Agenda personal lateral con tareas del usuario actual: ver pendientes/futuras, identificar atrasadas/próximas a vencer, consultar detalle, crear/editar/cambiar estado.

**Independent Test**: Crear tarea futura, editarla, cambiar estado; verificar lista solo usuario actual, orden por vencimiento, indicadores atrasada/próxima a vencer (24h), detalle visible sin perder contexto.

### Tests for User Story 1

- [X] T011 [P] [US1] Create unit tests for task due-state classification and validation in tests/unit/calendar-domain.test.js
- [X] T012 [P] [US1] Create integration tests for sidebar task CRUD, overdue/due-soon indicators, and personal scope in tests/integration/calendar-sidebar.test.js

### Implementation for User Story 1

- [X] T013 [US1] Implement task domain helpers (sort by due proximity, overdue/due-soon/status transitions) in src/domain.js
- [X] T014 [US1] Implement `loadTasks`, `addTask`, `updateTask` with owner validation in src/storage.js
- [X] T015 [US1] Add sidebar task list, detail panel, and create/edit/status form markup in index.html
- [X] T016 [US1] Implement sidebar task render, form handlers, and state updates in src/app.js
- [X] T017 [US1] Add overdue/due-soon/pending visual states and sidebar responsive behavior in src/styles.css
- [X] T018 [US1] Wire sidebar initialization and in-session refresh after task mutations in src/app.js

**Checkpoint**: US1 fully functional and independently testable (MVP).

---

## Phase 4: User Story 2 - Visualizar calendario general CRM por períodos (Priority: P1)

**Goal**: Calendario general con vistas anual/mensual/semanal, navegación por períodos, default personal y filtro equipo/CRM.

**Independent Test**: Con actividades en distintos días/semanas/meses y usuarios, abrir calendario general y verificar default personal, filtro equipo, cambio de vista y navegación con estado vacío.

### Tests for User Story 2

- [X] T019 [P] [US2] Create unit tests for period range calculation and view-state navigation in tests/unit/calendar-domain.test.js
- [X] T020 [P] [US2] Create integration tests for year/month/week views, period navigation, personal/team filter in tests/integration/calendar-general.test.js

### Implementation for User Story 2

- [X] T021 [US2] Implement calendar view-state and period range helpers (year/month/week) in src/domain.js
- [X] T022 [US2] Implement `loadCalendarActivities` range/team filtering in src/storage.js
- [X] T023 [US2] Add general calendar view controls, period navigation, team filter, and containers in index.html
- [X] T024 [US2] Implement year/month/week renderers, navigation, and empty states in src/app.js
- [X] T025 [US2] Add calendar grid styles for year/month/week views and responsive layout in src/styles.css

**Checkpoint**: US2 calendar visualization works independently with seeded/existing activities.

---

## Phase 5: User Story 3 - Gestionar actividades comerciales en calendario general (Priority: P1)

**Goal**: Crear/editar/eliminar actividades (reunión, evento, llamada, seguimiento, actividad comercial) con validación, confirmación de eliminación, relaciones CRM y sincronización llamada/reunión con Interacciones CRM.

**Independent Test**: Crear reunión/llamada/seguimiento, editar, relacionar registros CRM, eliminar con confirmación; verificar reflejo en vistas y sincronización con Interacciones CRM para llamada/reunión.

### Tests for User Story 3

- [X] T026 [P] [US3] Create unit/storage tests for activity validation, relation integrity, and call/meeting interaction sync in tests/unit/calendar-storage.test.js
- [X] T027 [P] [US3] Create integration tests for activity CRUD, delete confirmation, and interaction sync in tests/integration/calendar-interactions-sync.test.js

### Implementation for User Story 3

- [X] T028 [US3] Implement activity validation, type/status rules, and relation normalization in src/domain.js
- [X] T029 [US3] Implement `addCalendarActivity`, `updateCalendarActivity`, `deleteCalendarActivity` in src/storage.js
- [X] T030 [US3] Implement call/meeting synchronization with `crm_module:interactions` (planned, no result/notes capture) in src/storage.js
- [X] T031 [US3] Add activity create/edit/delete form markup with relation selectors in index.html
- [X] T032 [US3] Implement activity CRUD handlers, confirmation dialog, and view refresh in src/app.js
- [X] T033 [US3] Implement CRM relation resolution/display for customer/contact/opportunity in src/app.js; contact uses deterministic `contact:<customerId>` from customer contact info, relations marked unavailable when archived/missing
- [X] T034 [US3] Add form/dialog/validation/error styling for activity management in src/styles.css

**Checkpoint**: US3 activity management works independently and keeps calendar views/interactions consistent.

---

## Phase 6: User Story 4 - Consultar detalle y contexto de actividades (Priority: P2)

**Goal**: Consultar detalle de actividad desde cualquier vista con tipo, horario, descripción, estado y relaciones CRM legibles.

**Independent Test**: Seleccionar actividad desde vista semanal y mensual; confirmar mismo detalle, relaciones claras y mensaje cuando no hay relaciones.

### Tests for User Story 4

- [X] T035 [P] [US4] Create integration tests for activity detail panel open from week/month views, consistent content, no-relation state, and focus restore in tests/integration/calendar-general.test.js
- [X] T036 [P] [US4] Create unit tests for activity detail view-model formatting and relation labels in tests/unit/calendar-domain.test.js

### Implementation for User Story 4

- [X] T037 [US4] Implement activity detail view-model/formatters in src/domain.js
- [X] T038 [US4] Add activity detail drawer/panel markup with accessible labels in index.html
- [X] T039 [US4] Implement activity detail panel open/close/render, selection from year/month/week views, and focus restore on close in src/app.js
- [X] T040 [US4] Add detail panel styling, relation badges, and no-relation empty state in src/styles.css

**Checkpoint**: US4 detail/context opens from any calendar view, shows consistent data/relations, restores focus, and is independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cross-story hardening, accessibility, performance, and docs.

- [X] T041 [P] Add keyboard focus management and ARIA labels for calendar controls/dialogs in src/app.js and index.html
- [X] T042 [P] Add responsive refinements and no-horizontal-scroll checks for main calendar actions in src/styles.css
- [X] T043 Run quickstart validation scenarios and update notes in specs/004-crm-calendar/quickstart.md
- [X] T044 Run lint and test suite, fixing regressions in src/domain.js, src/storage.js, src/app.js, tests/unit/calendar-domain.test.js, tests/unit/calendar-storage.test.js, tests/integration/calendar-sidebar.test.js, tests/integration/calendar-general.test.js, tests/integration/calendar-interactions-sync.test.js

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 - MVP.
- **Phase 4 (US2)**: Depends on Phase 2; integrates with calendar shell/routing from Foundational.
- **Phase 5 (US3)**: Depends on Phase 2 and US2 view containers/refresh hooks.
- **Phase 6 (US4)**: Depends on US2 view rendering, US3 activity/relation data, and US4 detail markup.
- **Phase 7 (Polish)**: Depends on desired stories complete.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; no dependency on US2-US4.
- **US2 (P1)**: Independent after Foundational; can use seeded data before US3.
- **US3 (P1)**: Depends on US2 calendar surfaces for full in-view CRUD reflection.
- **US4 (P2)**: Depends on US2 selection surfaces and US3 activity/relation data.

### Within Each User Story

- Tests written first and fail before implementation.
- Domain/storage before app wiring.
- Markup/style alongside app behavior as needed.
- Story checkpoint passes before moving to next priority.

## Parallel Opportunities

- **Setup**: T002, T003 parallel.
- **Foundational**: T005/T006 parallel; T008/T009 parallel after requirements known; T007 and T010 sequential where they touch shared files.
- **US1**: T011/T012 parallel; T015/T017 parallel after handler contracts stable.
- **US2**: T019/T020 parallel; T023/T025 parallel with T024 coordination.
- **US3**: T026/T027 parallel; T031/T034 parallel after handler contract.
- **US4**: T035/T036 parallel; T038/T040 parallel after T039 contract.
- **Polish**: T041/T042 parallel.

## Parallel Example: User Story 1

```bash
# Tests in parallel:
Task: "T011 [US1] Unit tests in tests/unit/calendar-domain.test.js"
Task: "T012 [US1] Integration tests in tests/integration/calendar-sidebar.test.js"

# After storage/domain ready, UI split:
Task: "T015 [US1] Sidebar markup in index.html"
Task: "T017 [US1] Sidebar styles in src/styles.css"
```

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently via T011-T012 and quickstart scenario 1.
4. Demo/deploy MVP.

### Incremental Delivery

1. Setup + Foundational → base ready.
2. US1 → personal task sidebar MVP.
3. US2 → period calendar visualization.
4. US3 → activity CRUD + CRM interaction sync.
5. US4 → detail/context polish.
6. Polish phase → accessibility/responsive/regression pass.

## Notes

- [P] tasks touch different files or isolated sections with no incomplete dependency.
- All story tasks include `[US#]` labels and exact file paths.
- No tasks modify `specs/001-crm-module/spec.md`; CRM integration is additive.
- Call/meeting activities sync to Interactions as planned; execution result/notes stay in Interactions flow.
- New `crm_module:tasks` and `crm_module:calendarActivities` keys are included in FR-072 corruption detection/recovery.
