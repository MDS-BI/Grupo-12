# Contrato Storage: Cierre de brechas históricas del CRM

**Feature**: 002-crm-historical-gaps  
**Principio**: no doble verdad con KPIs canónicos 001.

## Stores canónicas (reusar)

| Clave | Propósito | Canonicidad |
|---|---|---|
| `crm_customers` | Clientes | Canónica de dominio |
| `crm_employees` | Empleados | Canónica de dominio |
| `crm_opportunities` | Oportunidades | Canónica de dominio |
| `crm_interactions` | Interacciones | Canónica de dominio |
| `erp_base_module:*` / contratos 001 | Config/UI 001 existente | Canónicos según 001 |

## Claves propias feature (UI no canónica)

| Clave | Tipo | Valor | Fallback |
|---|---|---|---|
| `crm.gaps002.ui.employeesView` | JSON | `{filter, showArchived}` | defaults |
| `crm.gaps002.ui.clients360` | JSON | `{openClientId, returnFilter, returnScrollY?}` | defaults |
| `crm.gaps002.ui.archivedFilter.entities` | JSON/bool | mostrar archivados clientes | `false` |
| `crm.gaps002.ui.archivedFilter.employees` | JSON/bool | mostrar archivados empleados | `false` |

Ninguna de estas claves es fuente canónica de KPIs, lifecycle, o integridad.

## API esperada en `src/storage.js` (aditiva/compatible)

| Función | Contrato |
|---|---|
| `loadEmployees({includeArchived?})` / filtro equivalente | por defecto operativos; opción incluye archivados |
| `archiveEmployee(id)` | set `archived=true`, preserva historial |
| `restoreEmployee(id)` | set `archived=false` |
| `archiveCustomer(id)` / `restoreCustomer(id)` | alias explícito sobre soft-archive; compatible con `deleteCustomer` |
| `loadInteractionsByCustomer(customerId)` | para 360°; orden determinista (fecha desc o definida) |
| `loadOpportunitiesByCustomer(customerId)` | para 360° |
| `getUpcomingClosures({windowDays=30, now})` | read-only derivado; no modifica overview |
| `getReferentialIntegrityReport()` | read-only; detecta refs inexistentes en customers/employees/opportunities/interactions |
| `validateOpportunityTransition(from,to,lifecycle)` | o delega en domain; rechaza inválida |

## Reglas

- **Archivado**: soft flag `archived`; no borrar historial.
- **Selectores operativos**: solo activos no archivados.
- **Integridad**: reporte no muta datos.
- **Lifecycle**: transición inválida no se persiste.
- **Config errors**: `loadModuleConfig()` ya normaliza; la UI debe recibir/consultar errores para banner; no se inventa otra fuente de config.
