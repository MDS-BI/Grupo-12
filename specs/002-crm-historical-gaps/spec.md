# Feature Specification: Cierre de brechas históricas del CRM

**Feature Branch**: `002-crm-historical-gaps`  
**Created**: 2026-11-22  
**Status**: Draft  
**Input**: User description: "Cierre de brechas históricas del CRM - auditar 13 tareas históricas de 001-crm-module y especificar solo brechas reales"

## Contexto y auditoría obligatoria (Paso 0)

Se auditó el código actual (`index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`, `tests/`) contra las 13 tareas históricas de `specs/001-crm-module/tasks.md`. No se modifica `specs/001-crm-module`.

| Tarea | Estado | Evidencia | Decisión |
|---|---|---|---|
| T025 | **Parcial** | Storage/API existen: `loadEmployees`, `addEmployee`, `updateEmployee`, `deleteEmployee` en `src/storage.js`. UI real no expone CRUD de empleados en `index.html`/`src/app.js`; pruebas existentes (`tests/integration/employees.test.js`) usan `mountApp`/`src/components/*`, ruta histórica no conectada al DOM real. | Brecha real: UI real de empleados. |
| T030 | **Parcial** | `src/app.js` tiene formulario de oportunidades/documentos con alta/edición/eliminación y validación básica; `src/storage.js` tiene `addOpportunity/updateOpportunity`. Falta flujo completo observable de transición por etapa con `opportunityLifecycle` configurable, reglas de transición visibles y validación de transición en la UI real. | Brecha real: flujo completo de oportunidades con lifecycle. |
| T036 | **Parcial** | Storage/API existen: `loadInteractions`, `addInteraction`, `updateInteraction`, `deleteInteraction` en `src/storage.js`. No hay sección/formulario/historial de interacciones en `index.html`/`src/app.js`; `tests/integration/interactions.test.js` depende de componentes históricos. | Brecha real: UI real de interacciones. |
| T041 | **No cubierta** | No existe ficha cliente 360° en DOM real ni navegación lista→ficha→lista preservando contexto. `getCustomerActivity` existe en `src/storage.js`, pero `src/app.js` no la expone en UI. `tests/integration/client-detail.test.js` usa componentes históricos. | Brecha real: ficha cliente 360°. |
| T046 | **Parcial** | `getCRMOverview()` calcula `upcomingClosures` en `src/storage.js`; dashboard en `src/app.js` muestra KPIs y refresca al mostrar dashboard. No hay sección visible "Próximos cierres" ni accesos rápidos conectados a ese listado en DOM real. | Brecha real: sección Próximos cierres. |
| T051 | **Cubierta** | US20/US21 implementaron búsqueda unificada y listados con filtro/acciones en DOM real (`src/app.js`, `index.html`, `tests/integration/search.test.js`, `tests/integration/entities.test.js`, `tests/integration/documents.test.js`, T197). | No especificar de nuevo. |
| T052 | **Parcial** | Existe presupuesto unitario/storage en `tests/unit/performance-budget.test.js` (500 registros, búsqueda/render en memoria). No hay evidencia de prueba/optimización equivalente sobre ruta DOM real con filtros/listados visibles. | Brecha real: optimización/rendimiento observable en DOM real. |
| T055 | **Parcial** | Storage tiene archivado lógico (`deleteCustomer` marca archived, `deleteEmployee` marca archived, filtros por archived). UI real expone eliminación de cliente/oportunidad pero no acción visible de archivar/restaurar ni consulta de historial archivado en vista operativa. | Brecha real: archivado/restauración visible. |
| T056 | **Parcial** | Storage excluye archivados en varias consultas (`loadActiveCustomers`, `loadOpportunities` filtra por clientes activos en algunos casos, `getCRMOverview` cuenta activos). En DOM real no hay control visible para incluir archivados/historial y falta verificación explícita de exclusión en todos los selectores/listas operativas tras archivar/restaurar desde UI. | Brecha real: exclusión visible y consistente en UI. |
| T057 | **No cubierta** | No hay reporte visible de integridad referencial en UI real. `src/storage.js` valida formas/referencias en algunas operaciones, pero no expone un reporte de registros con referencias inexistentes al cargar datos; no hay banner/sección en `index.html`/`src/app.js`. | Brecha real: reporte de integridad referencial. |
| T058 | **Cubierta** | US23 cerró accesibilidad/validación consistente con `aria-invalid`, `aria-describedby`, foco, y pruebas (`tests/integration/corrections-us16-us24.test.js`, `tests/integration/ui-contracts.test.js`). | No especificar de nuevo. |
| T062 | **Parcial** | `src/module-config.js` define `statusLifecycle`/transiciones; `src/app.js` usa `statusLifecycle` para poblar estados. No hay aplicación completa y observable de transiciones configuradas en el flujo de edición/cambio de etapa con feedback claro de transición inválida. | Brecha real: lifecycle configurable aplicado. |
| T064 | **Parcial** | `src/main.js` carga config con `loadModuleConfig()` y arranca con `normalizeConfig`. No hay banner visible de errores de configuración en DOM real; errores solo quedan en resultado de normalización/tests. | Brecha real: banner visible de errores de config. |

### Brechas reales incluidas

- Empleados e Interacciones con UI real (T025, T036).
- Flujo completo de oportunidades (T030) y ficha cliente 360° (T041).
- Dashboard "Próximos cierres" y reporte de integridad referencial (T046, T057).
- Archivado/restauración visible y exclusión de listas/selectores (T055, T056).
- Lifecycle configurable y banner visible de errores de configuración (T062, T064).
- Optimización real para 500 registros (T052).

### Exclusiones explícitas

- No repetir T051/T058 ni funcionalidades ya cerradas (tema, auth, storage recovery, filtros/listados US20/US21/T197).
- No modificar `specs/001-crm-module`.
- `src/components/*` se considera histórico/no conectado; la implementación objetivo es la ruta activa `index.html` + `src/*`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar empleados desde la UI real (Priority: P1)

Como usuario comercial, quiero crear, editar y archivar empleados desde la interfaz real para asignar responsables válidos a oportunidades e interacciones.

**Why this priority**: Sin empleados visibles no se puede completar el flujo comercial real; T025 y parte de T056 dependen de esto.

**Independent Test**: Abrir vista Empleados, crear empleado, editarlo, archivarlo y verificar que aparece/no aparece en selectores operativos.

**Acceptance Scenarios**:

1. **Given** usuario autenticado, **When** navega a Empleados y guarda un empleado válido, **Then** el empleado aparece en listado y en selectores de responsable activos.
2. **Given** empleado existente, **When** edita nombre/cargo y guarda, **Then** el listado y los selectores muestran datos actualizados.
3. **Given** empleado activo, **When** lo archiva, **Then** deja de aparecer en selectores de nuevos registros pero sigue consultable en historial/archivados.

---

### User Story 2 - Registrar interacciones con historial visible (Priority: P1)

Como usuario comercial, quiero registrar, editar y eliminar interacciones desde la UI real para mantener el historial de contacto por cliente.

**Why this priority**: Cierra T036 y habilita la ficha 360° con datos reales.

**Independent Test**: Crear cliente y empleado, registrar interacción, verla en listado/historial, editarla y eliminarla con confirmación.

**Acceptance Scenarios**:

1. **Given** cliente y empleado activos, **When** registro una interacción con fecha, tipo, cliente y responsable, **Then** se guarda y aparece en el historial visible.
2. **Given** interacción existente, **When** la edito, **Then** el historial refleja los cambios sin duplicar registros.
3. **Given** interacción existente, **When** la elimino y confirmo, **Then** desaparece del historial y la UI muestra estado coherente.

---

### User Story 3 - Flujo completo de oportunidades con lifecycle configurable (Priority: P1)

Como usuario comercial, quiero avanzar oportunidades según etapas/transiciones configuradas para que el pipeline refleje reglas reales del negocio.

**Why this priority**: Cierra T030/T062 en el comportamiento visible principal del CRM.

**Independent Test**: Configurar lifecycle, crear oportunidad, aplicar transición permitida, intentar transición no permitida y verificar feedback/estado.

**Acceptance Scenarios**:

1. **Given** una oportunidad en etapa inicial, **When** selecciono una transición permitida por `opportunityLifecycle`, **Then** la etapa se actualiza y se persiste.
2. **Given** una oportunidad en etapa X, **When** intento cambiar a una etapa no permitida, **Then** la UI bloquea el cambio y muestra mensaje claro sin corromper datos.
3. **Given** configuración de lifecycle inválida o parcial, **When** inicia la app, **Then** se usa fallback seguro y se muestra banner visible de error de configuración.

---

### User Story 4 - Ficha cliente 360° (Priority: P2)

Como usuario comercial, quiero ver una ficha 360° del cliente con sus datos, oportunidades e interacciones para entender el contexto antes de actuar.

**Why this priority**: Cierra T041 y mejora la usabilidad del CRM sobre datos ya existentes.

**Independent Test**: Desde listado de clientes abrir ficha, verificar secciones de datos/oportunidades/interacciones, volver al listado conservando contexto.

**Acceptance Scenarios**:

1. **Given** cliente con oportunidades e interacciones, **When** abro su ficha, **Then** veo datos del cliente, oportunidades relacionadas e interacciones en la misma vista.
2. **Given** cliente sin historial, **When** abro su ficha, **Then** veo estados vacíos claros por sección.
3. **Given** estoy en ficha 360°, **When** vuelvo al listado, **Then** regreso al listado y conservo filtros/selección visible según el contexto previo.

---

### User Story 5 - Dashboard operativo y calidad de datos (Priority: P2)

Como usuario, quiero ver próximos cierres y problemas de integridad referencial para priorizar trabajo y detectar datos inconsistentes.

**Why this priority**: Cierra T046/T057 con señales operativas visibles.

**Independent Test**: Sembrar oportunidades con fechas próximas y referencias inválidas; verificar sección Próximos cierres y reporte de integridad al cargar.

**Acceptance Scenarios**:

1. **Given** oportunidades abiertas con fecha de cierre próxima, **When** abro dashboard, **Then** veo sección "Próximos cierres" con registros y acceso al detalle.
2. **Given** datos con referencias inexistentes, **When** carga la app, **Then** veo reporte visible de integridad referencial con tipo de registro y referencia faltante.
3. **Given** no hay cierres próximos o inconsistencias, **When** abro dashboard/app, **Then** veo estados vacíos/no-error claros sin bloquear uso normal.

---

### User Story 6 - Archivado visible y rendimiento real (Priority: P3)

Como usuario, quiero archivar/restaurar registros desde la UI y mantener buen rendimiento con 500 registros para operar el CRM a escala básica.

**Why this priority**: Cierra T055/T056/T052; importante pero posterior al flujo funcional principal.

**Independent Test**: Archivar/restaurar cliente/empleado desde UI, confirmar exclusión en listas/selectores; ejecutar prueba DOM con 500 registros.

**Acceptance Scenarios**:

1. **Given** cliente o empleado activo, **When** lo archivo desde UI, **Then** se oculta de listas/selectores operativos y queda disponible en vista de archivados.
2. **Given** registro archivado, **When** lo restauro, **Then** vuelve a estar disponible en listas/selectores operativos.
3. **Given** 500 clientes con registros asociados, **When** uso búsqueda/filtros/listados en DOM real, **Then** la interacción cumple presupuesto definido y la UI sigue utilizable.

### Edge Cases

- Lifecycle configurado con etapa faltante o transición inválida: usar fallback seguro, registrar/revelar error visible, no bloquear CRUD básico.
- Empleado archivado asignado a oportunidades/interacciones históricas: conservar historial, impedir nuevas asignaciones.
- Cliente archivado con ficha 360° abierta: permitir consulta histórica, indicar estado archivado y bloquear nuevas interacciones/oportunidades si la regla lo exige.
- Referencias inexistentes detectadas al cargar: mostrar reporte, no borrar datos automáticamente, permitir continuar con áreas no afectadas.
- 500 registros con filtros combinados: resultados vacíos deben ser claros y rápidos; selección actual no debe perderse si el registro sigue visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE exponer una vista de Empleados en la ruta DOM real (`index.html` + `src/app.js`) con listado y formulario para crear y editar empleados activos.
- **FR-002**: El sistema DEBE permitir archivar y restaurar empleados desde la UI real, manteniendo su historial asociado.
- **FR-003**: El sistema DEBE excluir empleados archivados de selectores de responsables para nuevos registros, manteniéndolos consultables en historial/archivados.
- **FR-004**: El sistema DEBE exponer una vista/sección de Interacciones en la ruta DOM real para crear, editar y eliminar interacciones asociadas a cliente y empleado.
- **FR-005**: El sistema DEBE mostrar historial visible de interacciones por cliente con fecha, tipo, responsable y descripción.
- **FR-006**: El sistema DEBE aplicar `opportunityLifecycle` configurado a la creación/edición/cambio de etapa de oportunidades, permitiendo solo transiciones válidas.
- **FR-007**: El sistema DEBE mostrar feedback claro cuando una transición de etapa no es permitida y no persistir el cambio inválido.
- **FR-008**: El sistema DEBE exponer una ficha cliente 360° accesible desde el listado de clientes, mostrando datos, oportunidades e interacciones relacionadas.
- **FR-009**: El sistema DEBE permitir volver desde la ficha 360° al listado de clientes preservando el contexto visible observable: al accionar `#client-360-back` se restaura el valor de `#entity-list-filter`, el cliente/fila seleccionada (`#entity_id` o `data-selected`) y la vista `#view-entities` activa; esos datos se guardan en `crm.gaps002.ui.clients360` y, sin estado previo, se usa vacío.
- **FR-010**: El dashboard DEBE mostrar una sección visible "Próximos cierres" con oportunidades abiertas cuyo cierre esté dentro de la ventana operativa definida.
- **FR-011**: El sistema DEBE mostrar un reporte visible de integridad referencial al cargar datos cuando existan registros con referencias inexistentes.
- **FR-012**: El sistema DEBE permitir archivar y restaurar clientes desde la UI real, excluyendo archivados de listas/selectores operativos por defecto.
- **FR-013**: El sistema DEBE cargar configuración al arrancar con fallback seguro y mostrar banner visible cuando existan errores de configuración.
- **FR-014**: El sistema DEBE mantener rendimiento utilizable en la ruta DOM real con 500 clientes y registros asociados en búsqueda/filtros/listados.

### Key Entities *(include if feature involves data)*

- **Empleado**: Responsable comercial; atributos clave: nombre, cargo, estado archivado; referencia de oportunidades e interacciones.
- **Interacción**: Registro de contacto; atributos clave: cliente, empleado, fecha, tipo, descripción, archivado/eliminación según regla.
- **Oportunidad**: Negocio comercial; atributos clave: cliente, empleado, monto, fecha cierre, etapa, estado archivado; sujeta a lifecycle configurable.
- **Cliente**: Cuenta comercial; atributos clave: identificación/contacto, estado, archivado; agrega oportunidades e interacciones en ficha 360°.
- **Reporte de integridad referencial**: Hallazgo visible de registros huérfanos; atributos clave: tipo de registro, id, referencia faltante, acción sugerida.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% de las operaciones CRUD/archive/restore de Empleados e Interacciones son ejecutables desde la UI real sin usar consola.
- **SC-002**: 100% de los cambios de etapa de oportunidad respetan `opportunityLifecycle`; transiciones inválidas son bloqueadas con mensaje visible.
- **SC-003**: Un usuario puede abrir ficha 360° de un cliente y volver al listado en <= 3 interacciones, preservando contexto visible.
- **SC-004**: Dashboard muestra "Próximos cierres" y el reporte de integridad referencial es visible cuando hay datos correspondientes; en estado vacío no hay falsos positivos.
- **SC-005**: Con 500 clientes y registros asociados en la ruta DOM real, la búsqueda/filtro completa tarda <= 10 s y el renderizado inicial del listado <= 2 s, medido por prueba automatizada (umbrales heredados de FR-042/SC-004 de 001-crm-module).

## Traceability Matrix

| ID | Cubre tareas históricas | Historia | Criterio de éxito |
|---|---|---|---|
| FR-001, FR-002, FR-003 | T025, T055, T056 | US1, US6 | SC-001 |
| FR-004, FR-005 | T036 | US2, US4 | SC-001 |
| FR-006, FR-007, FR-013 | T030, T062, T064 | US3 | SC-002 |
| FR-008, FR-009 | T041 | US4 | SC-003 |
| FR-010, FR-011 | T046, T057 | US5 | SC-004 |
| FR-012 | T055, T056 | US6 | SC-001, SC-004 |
| FR-014 | T052 | US6 | SC-005 |

## Assumptions

- La ruta activa sigue siendo `index.html` + `src/app.js`/`src/main.js`/`src/storage.js`/`src/domain.js`/`src/module-config.js`/`src/styles.css`; `src/components/*` no se conecta.
- "Próximos cierres" usa la ventana operativa ya definida por el dominio/storage (30 días) salvo ajuste explícito futuro.
- El reporte de integridad referencial es informativo y no elimina datos automáticamente.
- El presupuesto de rendimiento se valida con pruebas automatizadas en entorno de prueba, como proxy observable del DOM real.
