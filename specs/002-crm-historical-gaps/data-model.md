# Data Model: Cierre de brechas históricas del CRM

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Principios

- Reusar stores canónicas existentes de 001: `crm_customers`, `crm_employees`, `crm_opportunities`, `crm_interactions`.
- No crear segunda fuente de verdad para KPIs canónicos 001. `getCRMOverview()` permanece canónico.
- Nuevas claves solo para estado UI no canónico de esta feature: prefijo `crm.gaps002.ui.*`.

## Entidades de dominio

### Employee (existente, extendido en UI)

| Campo | Tipo | Reglas |
|---|---|---|
| id | string | obligatorio, único |
| name | string | obligatorio, no vacío |
| role/cargo | string | obligatorio |
| archived | boolean | default false; soft-archive |
| createdAt/updatedAt | string ISO | opcional según patrón actual |

**Relaciones**: referenciado por Opportunity.employeeId, Interaction.employeeId.  
**Reglas**: archivado no aparece en selectores operativos; historial conserva referencia.

### Interaction (existente, extendido en UI)

| Campo | Tipo | Reglas |
|---|---|---|
| id | string | obligatorio |
| clientId/customerId | string | obligatorio, referencia cliente existente |
| employeeId | string | obligatorio, referencia empleado existente |
| date/fecha | string YYYY-MM-DD | obligatorio, fecha válida |
| type/tipo | string | obligatorio, dentro de tipos configurados/default |
| notes/description | string | opcional |
| archived | boolean | opcional, default false |

**Reglas**: CRUD visible; eliminar requiere confirmación; historial por cliente visible en 360°.

### Opportunity (existente, lifecycle aplicado)

| Campo | Tipo | Reglas |
|---|---|---|
| id | string | obligatorio |
| clientId | string | ref cliente |
| employeeId | string | ref empleado activo para nuevos registros |
| amount | number | >=0 |
| closeDate | YYYY-MM-DD | obligatorio para cierres/próximos cierres |
| stage/status | string | debe pertenecer a lifecycle vigente |
| archived | boolean | default false |

**Transición**: `from -> to` permitida solo si `opportunityLifecycle.transitions[from]` incluye `to`, o regla de transición definida por config normalizada. Transición inválida: no persistir, feedback claro.  
**Nota**: `opportunityLifecycle` es el nombre canónico (spec FR-006/SC-002); proviene de la configuración `module-config.statusLifecycle` normalizada por `module-config.js`.

### Customer (existente, archivado visible)

| Campo | Tipo | Reglas |
|---|---|---|
| id | string | obligatorio |
| companyName/name | string | obligatorio |
| contactName/email/phone | string | según validación actual |
| archived | boolean | default false |

**Reglas**: archivar/restaurar desde UI; archivados fuera de listas/selectores operativos por defecto; ficha 360° consultable.

## Entidades derivadas (read-only)

### UpcomingClosureItem

| Campo | Tipo | Origen |
|---|---|---|
| opportunityId | string | Opportunity.id |
| clientId | string | Opportunity.clientId |
| clientName | string | Customer.companyName/name |
| closeDate | YYYY-MM-DD | Opportunity.closeDate |
| stage | string | Opportunity.stage |
| amount | number | Opportunity.amount |
| daysUntilClose | number | calculado |

**Regla**: incluir solo oportunidades abiertas, no archivadas, con closeDate válida en ventana 30 días desde hoy. No modifica KPIs 001.

### ReferentialIntegrityIssue

| Campo | Tipo | Regla |
|---|---|---|
| issueId | string | estable para render (`type:recordId:field:missingId`) |
| recordType | string | `customer|employee|opportunity|interaction` |
| recordId | string | id del registro afectado |
| field | string | campo referencia (`clientId`, `employeeId`, etc.) |
| missingId | string | id referenciado inexistente |
| severity | string | `warning` |
| message | string | legible para UI |

**Regla**: reporte informativo, no destructivo; se genera al cargar/refresh de datos.

### Client360ViewModel

| Campo | Tipo | Origen |
|---|---|---|
| customer | object | Customer |
| opportunities | array | Opportunities por clientId |
| interactions | array | Interactions por clientId |
| isArchived | boolean | Customer.archived |
| emptyStates | object | flags por sección |

## Estado UI (claves propias feature)

| Clave | Tipo | Propósito | Default |
|---|---:|---|---|
| `crm.gaps002.ui.employeesView` | JSON | filtro/mostrar archivados empleados | `{filter:"",showArchived:false}` |
| `crm.gaps002.ui.clients360` | JSON | id cliente abierto, filtro de retorno | `{openClientId:null,returnFilter:""}` |
| `crm.gaps002.ui.archivedFilter.entities` | JSON/bool | incluir archivados en clientes | `false` |
| `crm.gaps002.ui.archivedFilter.employees` | JSON/bool | incluir archivados en empleados | `false` |

Todas son opcionales, no canónicas, y toleran ausencia/corrupción con fallback seguro.

## Reglas de validación

- Empleado: name y role requeridos.
- Interacción: clientId, employeeId, date, type requeridos; refs deben existir.
- Oportunidad: transición de etapa debe ser permitida por lifecycle; etapa final/actual válida.
- Archivado: no eliminar historial; solo excluir de operación activa por defecto.
- Integridad: referencias faltantes se reportan; no se borran automáticamente.
