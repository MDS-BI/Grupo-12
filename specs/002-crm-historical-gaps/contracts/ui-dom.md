# Contrato DOM/UI: Cierre de brechas históricas del CRM

**Feature**: 002-crm-historical-gaps  
**Ruta activa**: `index.html` + `src/app.js` + `src/styles.css`  
**No usar**: `src/components/*` (histórico/no conectado)

## Convenciones

- IDs nuevos son estables y requeridos por pruebas.
- Reusar patrones ARIA/validación existentes (US23/T058 ya cubierto): `aria-invalid`, `aria-describedby`, `role="alert"` donde aplique, foco en primer error.
- Reusar diálogo de confirmación accesible existente para eliminaciones/acciones destructivas.

## Navegación y vistas

| Elemento | Selector | Contrato |
|---|---|---|
| Nav empleados | `#nav-employees` | botón/nav visible en sidebar; abre `#view-employees` |
| Nav interacciones | `#nav-interactions` | abre `#view-interactions` |
| Vista empleados | `#view-employees` | `section.view`, oculta salvo activa |
| Vista interacciones | `#view-interactions` | `section.view` |
| Vista/ficha 360 | `#view-client-360` o `#client-360-panel` | visible al abrir ficha; contiene retorno a clientes |

## Grupo 1 - Empleados (FR-001..003)

| Elemento | Selector | Contrato |
|---|---|---|
| Formulario | `#employee-form` | create/update empleado |
| ID | `#employee-id` | hidden/text readonly; vacío en alta |
| Nombre | `#employee-name` | requerido |
| Cargo | `#employee-role` | requerido |
| Guardar | `#employee-submit` | submit |
| Cancelar/limpiar | `#employee-reset` | opcional, limpia formulario |
| Listado | `#employee-list` | filas con acciones por fila |
| Filtro | `#employee-list-filter` | filtra por nombre/cargo |
| Mostrar archivados | `#employee-show-archived` | checkbox/toggle; default off |
| Empty | `#employee-list-empty` | visible cuando no hay resultados |
| Acción archivar/restaurar | `[data-action="archive-employee"]`, `[data-action="restore-employee"]` | por fila; actualiza UI y selectores |

## Grupo 2 - Interacciones (FR-004..005)

| Elemento | Selector | Contrato |
|---|---|---|
| Formulario | `#interaction-form` | create/update |
| ID | `#interaction-id` | hidden |
| Cliente | `#interaction-client-id` | select de clientes activos/no archivados por defecto |
| Responsable | `#interaction-employee-id` | select de empleados activos/no archivados |
| Fecha | `#interaction-date` | `type="date"`, requerido |
| Tipo | `#interaction-type` | select requerido; opciones desde config/default |
| Notas | `#interaction-notes` | opcional |
| Listado | `#interaction-list` | historial visible con fecha, tipo, cliente, responsable, notas/resumen |
| Filtro | `#interaction-list-filter` | filtra historial visible |
| Empty | `#interaction-list-empty` | estado vacío claro |
| Acciones | `[data-action="edit-interaction"]`, `[data-action="delete-interaction"]` | por fila; delete usa confirmación accesible |

## Grupo 3 - Oportunidades lifecycle + config banner (FR-006..007, FR-013)

| Elemento | Selector | Contrato |
|---|---|---|
| Etapa | `#status` | opciones permitidas según lifecycle vigente |
| Feedback lifecycle | `#error-status` o `#lifecycle-feedback` | mensaje claro ante transición inválida; no persiste cambio |
| Banner config | `#config-error-banner` | visible cuando hay errores/fallback de config; no bloquea uso básico |
| Detalle config | `#config-error-detail` | texto accesible con resumen de error/fallback |
| Cerrar banner | `#config-error-dismiss` | opcional; si existe, oculta visualmente pero no borra condición subyacente hasta recarga/config válida |

## Grupo 4 - Ficha cliente 360° (FR-008..009)

| Elemento | Selector | Contrato |
|---|---|---|
| Abrir ficha | `[data-action="view-client-360"]` | en fila cliente; abre ficha |
| Contenedor | `#client-360` | muestra resumen cliente |
| Volver | `#client-360-back` | regresa a `#view-entities` preservando filtro/selección visible |
| Resumen | `#client-360-summary` | nombre, contacto, estado, archivado |
| Oportunidades | `#client-360-opportunities` | lista/tabla relacionada |
| Interacciones | `#client-360-interactions` | lista/tabla relacionada |
| Vacío oportunidades | `#client-360-opportunities-empty` | estado vacío |
| Vacío interacciones | `#client-360-interactions-empty` | estado vacío |

## Grupo 5 - Próximos cierres e integridad (FR-010..011)

| Elemento | Selector | Contrato |
|---|---|---|
| Sección próximos cierres | `#upcoming-closures-section` | visible en dashboard |
| Lista | `#upcoming-closures-list` | filas con cliente, oportunidad, fecha, etapa, monto |
| Vacío | `#upcoming-closures-empty` | "No hay cierres próximos" o equivalente claro |
| Acción ver | `[data-action="open-upcoming-opportunity"]` | navega a oportunidad en `#view-documents` |
| Reporte integridad | `#integrity-report` | visible cuando hay hallazgos; no bloqueante |
| Lista integridad | `#integrity-report-list` | ítems con tipo, registro, referencia faltante |
| Vacío/ok | `#integrity-report-empty` | visible u omitido cuando no hay hallazgos, sin falso positivo |

## Grupo 6 - Archivado visible (FR-012, FR-003, FR-014)

| Elemento | Selector | Contrato |
|---|---|---|
| Toggle archivados clientes | `#entity-show-archived` | incluye archivados en listado clientes |
| Toggle archivados empleados | `#employee-show-archived` | incluye archivados en listado empleados |
| Badge archivado | `.badge-archived` / `[data-archived="true"]` | indicador visible |
| Acción restaurar cliente | `[data-action="restore-entity"]` o `restore-customer` | devuelve a estado operativo |
| Selectores operativos | `#entity_id`, `#interaction-client-id`, `#interaction-employee-id` | excluyen archivados por defecto |

## Accesibilidad mínima

- Navegación completa por teclado en nuevas vistas/acciones.
- Foco visible en filas/botones/controles.
- Estados vacíos con texto legible; no solo color.
- Banners/reportes con `role="status"` o `role="alert"` según severidad, sin robar foco innecesariamente.
