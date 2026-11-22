# Tareas: Cierre de brechas históricas del CRM

**Entrada**: Documentos de diseño desde `/specs/002-crm-historical-gaps/`  
**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio), research.md, data-model.md, contracts/ui-dom.md, contracts/storage.md, contracts/performance.md, quickstart.md

**Pruebas**: OBLIGATORIAS. Principio II de la constitución: comportamiento visible y lógica de negocio deben cubrirse con pruebas automatizadas antes o junto a la implementación. Cada historia incluye tareas de prueba que DEBEN escribirse y FALLAR antes de implementar.

**Organización**: Tareas agrupadas por historia de usuario (US1-US6) para implementación y prueba independiente.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[USn]**: Historia de usuario de `spec.md` (US1-US6)
- Incluir rutas exactas en descripciones

## Ruta activa (obligatoria)

- Implementación: `index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`
- Pruebas: `tests/unit/*`, `tests/integration/*`
- `src/components/*` es **histórico/no conectado**: NO crear ni modificar tareas sobre esa ruta.
- No modificar `specs/001-crm-module/`.

## Trazabilidad histórica

> Los IDs T### citados en las descripciones (p. ej. T025, T030, T062) son tareas históricas de specs/001-crm-module; los IDs de esta feature son T001–T052.

| Tarea histórica | Cobertura en esta feature |
|---|---|
| T025 | US1 - empleados UI real |
| T030 | US3 - flujo completo oportunidades + lifecycle |
| T036 | US2 - interacciones UI real |
| T041 | US4 - ficha cliente 360° |
| T046 | US5 - próximos cierres dashboard |
| T052 | US6 - rendimiento DOM real 500 registros |
| T055 | US1/US6 - archivar/restaurar visible |
| T056 | US1/US6 - exclusión archivados en listas/selectores |
| T057 | US5 - reporte integridad referencial |
| T062 | US3 - `opportunityLifecycle` configurable aplicado |
| T064 | US3 - banner visible errores de configuración |

---

## Fase 1: Setup (Infraestructura compartida)

**Propósito**: Preparar fixtures/helpers de pruebas DOM real para las nuevas vistas, sin tocar `src/components/*`.

- [ ] T001 Revisar y alinear helpers de montaje DOM real en `tests/integration/live-dom.js` para soportar nuevas vistas `#view-employees`, `#view-interactions`, `#view-client-360` según `specs/002-crm-historical-gaps/contracts/ui-dom.md`
- [ ] T002 [P] Crear helper de seed determinista de 500 clientes/registros asociados para rendimiento en `tests/integration/helpers/seed-performance.js` (o archivo equivalente bajo `tests/integration/`), citando `specs/002-crm-historical-gaps/contracts/performance.md`
- [ ] T003 [P] Documentar en comentarios de prueba la convención de claves UI `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.*` según `specs/002-crm-historical-gaps/contracts/storage.md`

---

## Fase 2: Fundacional (Prerrequisitos bloqueantes)

**Propósito**: Base compartida de dominio/storage/UI que bloquea US1-US6. **CRÍTICO**: completar antes de historias.

- [ ] T004 Crear pruebas unitarias de transición `opportunityLifecycle` (permitida, inválida, fallback) en `tests/unit/lifecycle-transitions.test.js` cubriendo FR-006, FR-007, FR-013, SC-002; incluir nota de que `opportunityLifecycle` proviene de `module-config.statusLifecycle` normalizado
- [ ] T005 [P] Crear pruebas unitarias de reporte de integridad referencial en `tests/unit/referential-integrity.test.js` cubriendo FR-011, SC-004
- [ ] T006 Implementar funciones puras de lifecycle en `src/domain.js`: validación de transición con `opportunityLifecycle` canónico (normalizado desde `module-config.statusLifecycle`), fallback seguro y mensajes; hacer pasar T004 (FR-006, FR-007, FR-013)
- [ ] T007 [P] Implementar utilidades derivadas read-only en `src/storage.js`/`src/domain.js` para `getReferentialIntegrityReport()` y `getUpcomingClosures({windowDays:30})`, sin modificar `getCRMOverview()` canónico 001; hacer pasar T005 (FR-010, FR-011)
- [ ] T008 Añadir contratos de estado UI con defaults seguros en `src/app.js` o módulo pequeño dedicado bajo `src/` para claves `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.entities`, `crm.gaps002.ui.archivedFilter.employees` según `specs/002-crm-historical-gaps/contracts/storage.md`
- [ ] T009 Añadir en `src/main.js` exposición/propagación del resultado de `loadModuleConfig()` (config, errors/usedFallback) para que `src/app.js` pueda renderizar `#config-error-banner`; contrato `specs/002-crm-historical-gaps/contracts/ui-dom.md` (FR-013, T064)
- [ ] T010 [P] Añadir estilos base compartidos para nuevas vistas/banners/badges/estados vacíos en `src/styles.css` reutilizando tokens existentes (sin repetir tema T051/US16); cubrir `#config-error-banner`, `.badge-archived`, secciones 360/próximos cierres/integridad

**Checkpoint**: fundación lista; US1-US6 pueden iniciar.

---

## Fase 3: User Story 1 - Gestionar empleados desde la UI real (Prioridad: P1) 🎯 MVP

**Objetivo**: CRUD visible de empleados con archivar/restaurar y exclusión de archivados en selectores operativos.  
**Prueba independiente**: Crear/editar/archivar/restaurar empleado desde UI real y verificar selectores operativos.  
**FR/SC**: FR-001, FR-002, FR-003, FR-012 (parcial), SC-001. **Históricas**: T025, T055, T056.

### Pruebas para User Story 1 (escribir primero, FALLAR antes de implementar) ⚠️

- [ ] T011 [P] [US1] Crear prueba de integración DOM real en `tests/integration/employees-ui.test.js` para alta/edición/listado/filtro de empleados usando `#nav-employees`, `#view-employees`, `#employee-form`, `#employee-name`, `#employee-role`, `#employee-list`, `#employee-list-filter`, `#employee-list-empty` (contrato `contracts/ui-dom.md`, FR-001, SC-001, T025)
- [ ] T012 [P] [US1] Añadir prueba de integración DOM real en `tests/integration/archive-restore-ui.test.js` para archivar/restaurar empleado con `#employee-show-archived`, `[data-action="archive-employee"]`, `[data-action="restore-employee"]`, `.badge-archived`, y exclusión en selectores operativos (FR-002, FR-003, SC-001, T055, T056)

### Implementación para User Story 1

- [ ] T013 [US1] Añadir markup de vista Empleados en `index.html`: `#nav-employees`, `#view-employees`, `#employee-form`, `#employee-id`, `#employee-name`, `#employee-role`, `#employee-submit`, `#employee-reset`, `#employee-list-filter`, `#employee-show-archived`, `#employee-list`, `#employee-list-empty` según `specs/002-crm-historical-gaps/contracts/ui-dom.md`
- [ ] T014 [US1] Implementar API aditiva/compatible de empleados en `src/storage.js`: `loadEmployees({includeArchived})`/filtro equivalente, `archiveEmployee(id)`, `restoreEmployee(id)`, preservando historial y compatibilidad con claves canónicas (FR-002, FR-003, T025, T055)
- [ ] T015 [US1] Implementar render/handlers de empleados en `src/app.js`: `renderEmployeeList()`, `fillEmployeeForm()`, `resetEmployeeForm()`, create/update, filtro, toggle archivados usando `crm.gaps002.ui.employeesView` (FR-001, FR-002, FR-003)
- [ ] T016 [US1] Integrar acciones archivar/restaurar por fila y refrescar selectores de responsable en `src/app.js` para excluir empleados archivados por defecto (FR-003, FR-012, T056)
- [ ] T017 [US1] Añadir estilos específicos de vista empleados en `src/styles.css` (tabla responsive, acciones fila, badge archivado) manteniendo consistencia visual existente

**Checkpoint**: US1 funcional e independientemente testeable.

---

## Fase 4: User Story 2 - Registrar interacciones con historial visible (Prioridad: P1)

**Objetivo**: CRUD visible de interacciones con historial por cliente y confirmación de eliminación.  
**Prueba independiente**: Crear/editar/eliminar interacción desde UI real y ver historial.  
**FR/SC**: FR-004, FR-005, SC-001. **Histórica**: T036.

### Pruebas para User Story 2 (escribir primero, FALLAR antes de implementar) ⚠️

- [ ] T018 [P] [US2] Crear prueba de integración DOM real en `tests/integration/interactions-ui.test.js` para crear interacción válida con `#interaction-form`, `#interaction-client-id`, `#interaction-employee-id`, `#interaction-date`, `#interaction-type`, `#interaction-notes`, y verla en `#interaction-list` (FR-004, FR-005, SC-001, T036)
- [ ] T019 [P] [US2] Extender `tests/integration/interactions-ui.test.js` para editar sin duplicar, eliminar con confirmación accesible existente, y estado vacío `#interaction-list-empty` (FR-004, FR-005, SC-001)

### Implementación para User Story 2

- [ ] T020 [US2] Añadir markup de vista Interacciones en `index.html`: `#nav-interactions`, `#view-interactions`, `#interaction-form`, `#interaction-id`, `#interaction-client-id`, `#interaction-employee-id`, `#interaction-date`, `#interaction-type`, `#interaction-notes`, `#interaction-list-filter`, `#interaction-list`, `#interaction-list-empty` según `contracts/ui-dom.md`
- [ ] T021 [US2] Implementar/ajustar API de interacciones en `src/storage.js` para CRUD visible, `loadInteractionsByCustomer(customerId)`, validación de refs activas y orden determinista (FR-004, FR-005, T036)
- [ ] T022 [US2] Implementar render/handlers de interacciones en `src/app.js`: listado, filtro, fill/reset, create/update, delete con diálogo accesible existente, y refresco de historial relacionado (FR-004, FR-005)
- [ ] T023 [US2] Poblar selectores de interacción con clientes/empleados activos no archivados en `src/app.js` y mantener exclusión tras archive/restore (FR-003, FR-004, T056)
- [ ] T024 [US2] Añadir estilos de vista/historial de interacciones en `src/styles.css` (lista/tabla, campos, empty state)

**Checkpoint**: US2 funcional e independientemente testeable.

---

## Fase 5: User Story 3 - Flujo completo de oportunidades con lifecycle configurable (Prioridad: P1)

**Objetivo**: Aplicar `opportunityLifecycle` canónico, bloquear transiciones inválidas con feedback claro y mostrar banner visible de errores de configuración.  
**Prueba independiente**: Transición permitida persiste; inválida no persiste y muestra feedback; config inválida muestra banner con fallback seguro.  
**FR/SC**: FR-006, FR-007, FR-013, SC-002. **Históricas**: T030, T062, T064.

### Pruebas para User Story 3 (escribir primero, FALLAR antes de implementar) ⚠️

- [ ] T025 [P] [US3] Crear prueba de integración DOM real en `tests/integration/opportunities-lifecycle.test.js` para transición permitida persistida y transición inválida bloqueada con feedback en `#status`/`#error-status` o `#lifecycle-feedback` (FR-006, FR-007, SC-002, T030, T062)
- [ ] T026 [P] [US3] Añadir prueba de integración DOM real en `tests/integration/opportunities-lifecycle.test.js` para banner `#config-error-banner`/`#config-error-detail` cuando `loadModuleConfig()` devuelve error/fallback, manteniendo app utilizable (FR-013, SC-002, T064)

### Implementación para User Story 3

- [ ] T027 [US3] Actualizar `src/main.js` y/o `src/app.js` para recibir resultado de `loadModuleConfig()` y renderizar `#config-error-banner`/`#config-error-detail`/`#config-error-dismiss` según `contracts/ui-dom.md` sin bloquear CRUD básico (FR-013, T064)
- [ ] T028 [US3] Integrar validación de transición en `src/storage.js` y `src/app.js` usando `opportunityLifecycle` canónico normalizado desde `module-config.statusLifecycle`; rechazar transición inválida sin persistir (FR-006, FR-007, T030, T062)
- [ ] T029 [US3] Actualizar UI de oportunidad en `index.html`/`src/app.js` para poblar `#status` desde lifecycle vigente y mostrar feedback accesible de transición inválida (FR-006, FR-007)
- [ ] T030 [US3] Añadir estilos/estados de banner de configuración y feedback lifecycle en `src/styles.css` respetando tokens y accesibilidad

**Checkpoint**: US3 funcional; transiciones y config visible cumplen SC-002.

---

## Fase 6: User Story 4 - Ficha cliente 360° (Prioridad: P2)

**Objetivo**: Vista 360° de cliente con datos, oportunidades e interacciones; volver conserva contexto.  
**Prueba independiente**: Abrir ficha desde listado, ver secciones/estados vacíos, volver conservando filtro/selección.  
**FR/SC**: FR-008, FR-009, SC-003. **Histórica**: T041.

### Pruebas para User Story 4 (escribir primero, FALLAR antes de implementar) ⚠️

- [ ] T031 [P] [US4] Crear prueba de integración DOM real en `tests/integration/client-360.test.js` para abrir `[data-action="view-client-360"]`, renderizar `#client-360-summary`, `#client-360-opportunities`, `#client-360-interactions` y estados vacíos (FR-008, SC-003, T041)
- [ ] T032 [P] [US4] Extender `tests/integration/client-360.test.js` para verificar que `#client-360-back` restaura contexto visible observable: `#entity-list-filter`, cliente/fila seleccionada (`#entity_id` o `data-selected`) y vista `#view-entities` activa; los datos se guardan en `crm.gaps002.ui.clients360` y, sin estado previo, se usa vacío (FR-009, SC-003)

### Implementación para User Story 4

- [ ] T033 [US4] Añadir markup de ficha 360 en `index.html`: `#view-client-360` (selector público canónico único), `#client-360-back`, `#client-360-summary`, `#client-360-opportunities`, `#client-360-opportunities-empty`, `#client-360-interactions`, `#client-360-interactions-empty` según `contracts/ui-dom.md`
- [ ] T034 [US4] Implementar consultas de composición en `src/storage.js`/`src/domain.js` (`getCustomer360` o reutilización de `getCustomerActivity`) con oportunidades/interacciones relacionadas y flags de vacío (FR-008)
- [ ] T035 [US4] Implementar navegación lista→ficha→lista en `src/app.js`, preservando filtro/selección visible y estado `crm.gaps002.ui.clients360` (FR-009)
- [ ] T036 [US4] Añadir estilos de ficha 360 en `src/styles.css` (layout, secciones, empty states, responsive)

**Checkpoint**: US4 funcional e independientemente testeable.

---

## Fase 7: User Story 5 - Dashboard operativo y calidad de datos (Prioridad: P2)

**Objetivo**: Mostrar “Próximos cierres” e integridad referencial visible sin romper KPIs canónicos 001.  
**Prueba independiente**: Sembrar oportunidades próximas y referencias inválidas; verificar secciones y estados vacíos.  
**FR/SC**: FR-010, FR-011, SC-004. **Históricas**: T046, T057.

### Pruebas para User Story 5 (escribir primero, FALLAR antes de implementar) ⚠️

- [ ] T037 [P] [US5] Crear prueba de integración DOM real en `tests/integration/dashboard-upcoming-integrity.test.js` para renderizar `#upcoming-closures-section`, `#upcoming-closures-list`, `#upcoming-closures-empty` y navegación `[data-action="open-upcoming-opportunity"]` (FR-010, SC-004, T046)
- [ ] T038 [P] [US5] Extender `tests/integration/dashboard-upcoming-integrity.test.js` para reporte `#integrity-report`, `#integrity-report-list`, `#integrity-report-empty` con hallazgos de referencia inexistente y sin falsos positivos (FR-011, SC-004, T057)

### Implementación para User Story 5

- [ ] T039 [US5] Añadir markup de dashboard en `index.html` para próximos cierres e integridad referencial según `contracts/ui-dom.md`, sin alterar tarjetas KPI canónicas 001
- [ ] T040 [US5] Implementar render derivado read-only en `src/app.js` usando `getUpcomingClosures()` y `getReferentialIntegrityReport()`; no recalcular ni duplicar `getCRMOverview()` (FR-010, FR-011, T046, T057)
- [ ] T041 [US5] Conectar navegación desde cierre próximo a oportunidad en `src/app.js` (`#view-documents` + selección/carga) preservando comportamiento existente (FR-010)
- [ ] T042 [US5] Añadir estilos de secciones dashboard/próximos cierres/integridad en `src/styles.css` (tablas/listas, estados vacíos, severidad warning)

**Checkpoint**: US5 funcional; dashboard 001 conserva fuente canónica.

---

## Fase 8: User Story 6 - Archivado visible y rendimiento real (Prioridad: P3)

**Objetivo**: Archivar/restaurar clientes desde UI, excluir archivados consistentemente y cumplir SC-005 en DOM real con 500 registros.  
**Prueba independiente**: Archivar/restaurar cliente/empleado desde UI; prueba DOM 500 registros cumple umbrales.  
**FR/SC**: FR-012, FR-014, FR-003 (consistencia), SC-001, SC-005. **Históricas**: T052, T055, T056.

### Pruebas para User Story 6 (escribir primero, FALLAR antes de implementar) ⚠️

- [ ] T043 [P] [US6] Extender `tests/integration/archive-restore-ui.test.js` para archivar/restaurar cliente con `#entity-show-archived`, `[data-action="restore-entity"]`/`restore-customer`, exclusión en `#entity_id` y `#interaction-client-id` (FR-012, FR-003, SC-001, T055, T056)
- [ ] T044 [P] [US6] Crear prueba de rendimiento DOM real en `tests/integration/performance-dom.test.js` que siembra 500 clientes con registros asociados y verifica SC-005: filtro/búsqueda completa <= 10 s y renderizado inicial de listado <= 2 s (`contracts/performance.md`, FR-014, T052)

### Implementación para User Story 6

- [ ] T045 [US6] Implementar/ajustar `archiveCustomer`/`restoreCustomer` y filtros `includeArchived` en `src/storage.js` manteniendo compatibilidad con `deleteCustomer` soft-archive (FR-012, T055)
- [ ] T046 [US6] Añadir controles y acciones de archivado/restauración de clientes en `index.html` y `src/app.js` (`#entity-show-archived`, acciones por fila, badges) según `contracts/ui-dom.md` (FR-012)
- [ ] T047 [US6] Aplicar exclusión consistente de archivados en listas/selectores operativos de clientes/empleados/oportunidades/interacciones en `src/app.js` (FR-003, FR-012, T056)
- [ ] T048 [US6] Optimizar render/filtro DOM real en `src/app.js` para dataset 500 (DocumentFragment, evitar recomputación innecesaria) sin cambiar comportamiento funcional; validar con T044 (FR-014, SC-005, T052)

**Checkpoint**: US6 funcional; rendimiento SC-005 verificado.

---

## Fase 9: Polish & Cross-Cutting Concerns

**Propósito**: Consolidación transversal, regresión y evidencia de quickstart.

- [ ] T049 [P] Actualizar `specs/002-crm-historical-gaps/quickstart.md` con resultados/ajustes reales de ejecución si cambian IDs o pasos, manteniendo trazabilidad FR/SC/T históricas
- [ ] T050 Ejecutar regresión completa `npm run test:run`, `npm run lint`, `npm run build` en raíz del repo y corregir fallos en ruta activa (`index.html`, `src/*`, `tests/*`) sin tocar `src/components/*` ni `specs/001-crm-module/`
- [ ] T051 [P] Revisar cobertura final FR-001..FR-014 y SC-001..SC-005 contra pruebas en `tests/unit/*` y `tests/integration/*`; añadir ajuste menor solo si falta evidencia automatizada
- [ ] T052 Verificar manualmente escenarios de `specs/002-crm-historical-gaps/quickstart.md` para US1-US6 y registrar cualquier brecha como tarea nueva en futura fase (no reescribir tareas existentes)

---

## Dependencias y orden de ejecución

### Dependencias de fase

- **Fase 1 (Setup)**: sin dependencias.
- **Fase 2 (Fundacional)**: depende de Fase 1; **bloquea US1-US6**.
- **Fases 3-8 (US1-US6)**: dependen de Fase 2; pueden avanzar por prioridad P1→P2→P3, o en paralelo donde no haya solapamiento de archivo.
- **Fase 9 (Polish)**: depende de historias deseadas completas.

### Dependencias de historias

- **US1 (P1)**: tras Fundacional; base para selectores de empleados.
- **US2 (P1)**: tras Fundacional; integra con US1 para selectores de empleado activo.
- **US3 (P1)**: tras Fundacional; usa lifecycle/config base (T004/T006/T009).
- **US4 (P2)**: tras Fundacional; se beneficia de datos US1/US2 pero es testeable con seed propio.
- **US5 (P2)**: tras Fundacional; usa derivadas T007; navega a oportunidades existentes.
- **US6 (P3)**: tras US1/US2/US4 parcialmente por consistencia de archivado, pero sus pruebas deben seedear estado propio; cierra rendimiento SC-005.

### Dentro de cada historia

- Pruebas primero (deben fallar antes de implementar).
- Storage/domain antes de app wiring cuando aplique.
- Markup/contrato DOM antes o junto a render handlers.
- Historia completa y verde antes de pasar a la siguiente prioridad.

## Oportunidades paralelas

- T002, T003 en paralelo.
- T004 y T005 en paralelo; T006 y T007 en paralelo tras sus pruebas.
- En US1: T011 y T012 en paralelo.
- En US2: T018 y T019 en paralelo.
- En US3: T025 y T026 en paralelo.
- En US4: T031 y T032 en paralelo.
- En US5: T037 y T038 en paralelo.
- En US6: T043 y T044 en paralelo.

## Estrategia de implementación

### MVP primero (US1)
1. Completar Fase 1 y 2.
2. Completar US1 (T011-T017).
3. Validar US1 independientemente; demo de empleados + archivado básico.

### Entrega incremental
1. Setup + Fundacional.
2. US1 → US2 → US3 (P1 núcleo operativo).
3. US4 → US5 (P2 visibilidad/operación).
4. US6 (P3 archivado completo + rendimiento SC-005).
5. Polish y regresión completa.

## Cobertura FR/SC

| Requisito | Tareas principales | Prueba/evidencia |
|---|---|---|
| FR-001 | T011,T013,T015 | `tests/integration/employees-ui.test.js` |
| FR-002 | T012,T014,T015,T016 | `tests/integration/archive-restore-ui.test.js` |
| FR-003 | T012,T016,T023,T047 | archive/restore + selectores activos |
| FR-004 | T018,T019,T020,T021,T022 | `tests/integration/interactions-ui.test.js` |
| FR-005 | T018,T021,T022 | historial visible por cliente |
| FR-006 | T004,T006,T025,T028,T029 | `tests/unit/lifecycle-transitions.test.js`, `tests/integration/opportunities-lifecycle.test.js` |
| FR-007 | T004,T006,T025,T028,T029 | feedback transición inválida, no persiste |
| FR-008 | T031,T033,T034 | `tests/integration/client-360.test.js` |
| FR-009 | T032,T035 | retorno conserva contexto |
| FR-010 | T007,T037,T039,T040,T041 | `tests/integration/dashboard-upcoming-integrity.test.js` |
| FR-011 | T005,T007,T038,T039,T040 | reporte integridad visible |
| FR-012 | T012,T043,T045,T046,T047 | archive/restore clientes UI |
| FR-013 | T004,T009,T026,T027,T030 | banner config visible + fallback |
| FR-014 | T002,T044,T048 | `tests/integration/performance-dom.test.js` |
| SC-001 | T011,T012,T018,T019,T043 | CRUD/archive/restore UI real (Clientes, Empleados e Interacciones) |
| SC-002 | T004,T025,T026,T028 | lifecycle + transiciones inválidas bloqueadas |
| SC-003 | T031,T032,T035 | 360° <=3 interacciones, contexto preservado |
| SC-004 | T037,T038,T040 | próximos cierres + integridad, vacíos claros |
| SC-005 | T002,T044,T048 | 500 registros, filtro <=10s, render <=2s |
