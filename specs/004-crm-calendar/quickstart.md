# Quickstart: Calendario CRM (004-crm-calendar)

## Purpose
Validate the planned CRM calendar feature: personal task sidebar and general CRM calendar with year/month/week views and commercial activity management.

## Prerequisites
- Node/npm installed
- Repo dependencies installed: `npm install`
- Branch: `004-crm-calendar`

## Planned implementation areas
- `index.html` - calendar sidebar and general calendar views/controls
- `src/domain.js` - task/activity enums, due-state rules, date validation
- `src/storage.js` - `crm_module:tasks`, `crm_module:calendarActivities`, interaction sync
- `src/app.js` - rendering, filters, CRUD handlers, view navigation
- `src/styles.css` - calendar layout, overdue/due-soon states, responsive behavior
- `tests/unit/calendar-domain.test.js`
- `tests/unit/calendar-storage.test.js`
- `tests/integration/calendar-sidebar.test.js`
- `tests/integration/calendar-general.test.js`
- `tests/integration/calendar-interactions-sync.test.js`

## Manual validation scenarios

1. **Sidebar tasks (personal)**
   - Create tasks with past, next-24h, future, and no due date.
   - Verify only current user's tasks appear.
   - Verify overdue and due-soon visual indicators.
   - Edit task and change status; confirm immediate update.

2. **General calendar views**
   - Create activities across days/weeks/months.
   - Switch year/month/week views; confirm same reference period context.
   - Navigate previous/next periods; confirm empty state when none.

3. **Activity CRUD**
   - Create meeting/event/call/follow-up/commercial activity.
   - Edit and confirm all affected views update in-session.
   - Delete with confirmation; confirm removal from all views.

4. **CRM relations & sync**
   - Link activity to existing customer/contact/opportunity.
   - Create call/meeting: verify planned interaction reflected in Interactions CRM history.
   - Complete interaction result/notes in Interactions flow; calendar keeps planned activity.
   - Event/follow-up/commercial activity: no interaction record created.

5. **Edge cases**
   - End before start: validation error, no save.
   - Missing required fields: inline errors, preserve input.
   - Archived/missing related record: activity remains visible, relation marked unavailable.
   - Keyboard navigation and narrow screen: no horizontal scroll for main actions.

## Automated checks
```powershell
npm run lint
npm run test:run
```

## Success criteria mapping
- SC-001: sidebar overdue/due-soon identifiable quickly.
- SC-002: create valid activity < 60s in usability test.
- SC-003: in-session updates without reload.
- SC-004: relation labels visible in detail.
- SC-005: users complete core flows unassisted.
- SC-006: no horizontal scroll for main actions on desktop/narrow screens.

## Implementación validada (2026-11-25)
- Calendario integrado en la ERP final: `index.html`, `src/app.js`, `src/domain.js`, `src/storage.js` y `src/styles.css`.
- `npx vitest run tests/unit/calendar-domain.test.js tests/unit/calendar-storage.test.js tests/integration/calendar-sidebar.test.js tests/integration/calendar-general.test.js tests/integration/calendar-interactions-sync.test.js`: 19/19 pruebas del calendario en verde.
- `npm run lint`: sin errores tras `npm install`.
- `npm run build`: compilación de producción correcta.
- `npm run test:run`: 132/133 pruebas en verde; la única falla restante es preexistente y ajena al calendario (`storage-recovery.test.js` no simula el fallo de `setItem` con el spy actual). `performance-dom.test.js` quedó en verde tras evitar renderizados del calendario fuera de la vista activa.
