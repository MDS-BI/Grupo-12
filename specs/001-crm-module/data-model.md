# Modelo de Datos: Módulo CRM (Customer Relationship Management)

**Funcionalidad**: `001-crm-module` (incluye el cierre de brechas históricas, antes `002-crm-historical-gaps`) | **Especificación**: [spec.md](spec.md)
**MER de referencia**: [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md)

> **Nota de fusión (2026-11-23)**: este modelo integra el contenido íntegro de `002-data-model.md`. No se modifica el significado de las entidades base: se añaden los atributos/relaciones observables de la ruta real, las entidades derivadas de solo lectura y las claves de estado UI `crm.gaps002.ui.*`.

## Visión General

El modelo se compone de entidades de dominio CRM —**Cliente**, **Empleado**, **Oportunidad** e **Interacción**— más objetos de apoyo: **ModuleConfig**, **Preferencia de Tema**, **Preferencia de Sesión**, **Vista Activa** y **Diálogo de Confirmación** (estado UI). Las correcciones US16–US24 no añaden backend; extienden reglas de persistencia, navegación y accesibilidad sobre el frontend existente.

## Principios incorporados del cierre de brechas

- Reusar stores canónicas existentes de 001: `crm_customers`, `crm_employees`, `crm_opportunities`, `crm_interactions`.
- No crear segunda fuente de verdad para KPIs canónicos 001. `getCRMOverview()` permanece canónico.
- Nuevas claves solo para estado UI no canónico de esta feature: prefijo `crm.gaps002.ui.*`.

## Entidades de dominio

### Cliente

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---:|---|
| `id` | string | Sí | Identidad interna única |
| `companyName` / `nombreEmpresa` / `name` | string | Sí | Normalizado según capa; no vacío |
| `contactName` / `personaContacto` | string | Sí | No vacío |
| `email` / `correo` | string | Sí | Formato válido, único sin distinguir mayúsculas, reservado aunque archived |
| `phone` / `telefono` | string | Sí | No vacío |
| `status` / `estado` | enum | Sí | `Posible`, `Activo`, `Inactivo` |
| `archived` | boolean | Sí | Eliminación lógica |
| `customFields...` | mixed | No | Persistidos aunque queden huérfanos por config |

**Reglas incorporadas (spec 002, FR-100/FR-091)**: `archived` default `false`; archivar/restaurar desde UI; archivados fuera de listas/selectores operativos por defecto; ficha 360° (US28/FR-096) consultable incluso para clientes archivados; el correo sigue reservado (FR-069).

### Empleado

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---:|---|
| `id` | string | Sí | Único |
| `name` / `nombre` | string | Sí | No vacío |
| `role` / `cargo` | string | Sí | No vacío |
| `archived` | boolean | Sí | Eliminación lógica |
| `createdAt` / `updatedAt` | string ISO | No | Opcional según patrón actual de la store canónica |

**Relaciones**: referenciado por `Opportunity.employeeId` e `Interaction.employeeId`.  
**Reglas incorporadas (spec 002, FR-089–FR-091)**: `archived` default `false` (soft-archive); archivado no aparece en selectores operativos; historial conserva referencia; UI real expone crear/editar/archivar/restaurar; `deleteEmployee` se mantiene como alias compatible.

### Oportunidad

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---:|---|
| `id` | string | Sí | Único |
| `clientId` / `clienteId` | string | Sí | Referencia cliente existente/no archivado al crear/editar |
| `employeeId` / `empleadoId` | string | No/según UI | Referencia empleado válido si aplica |
| `amount` / `montoEstimado` | number | Sí | `>= 0` |
| `currency` | string | Sí en MVP | Moneda del registro; regla MVP normaliza/etiqueta |
| `stage` / `etapa` | enum | Sí | `Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido` |
| `closeDate` / `fechaEstimadaCierre` | date string | Sí | `YYYY-MM-DD` válida |
| `archived` | boolean | No | Si se usa, excluye de operación; dashboard sigue regla por etapa/definición canónica |

**Regla US17**: La oportunidad creada/actualizada/eliminada desde la UI debe reflejarse en la fuente canónica consumida por `getCRMOverview()`. No debe existir divergencia entre formulario/listado y KPI.

**Reglas incorporadas (spec 002, FR-094/FR-095)**: `stage`/`status` debe pertenecer al lifecycle vigente; `opportunityLifecycle` es el nombre canónico (spec FR-094/SC-032) y proviene de la configuración `module-config.statusLifecycle` normalizada por `module-config.js`. Transición `from -> to` permitida solo si `opportunityLifecycle.transitions[from]` incluye `to` o la regla definida por config normalizada; transición inválida no se persiste y muestra feedback. `employeeId` debe referirse a empleado activo para nuevos registros; `archived` default `false`.

### Interacción

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---:|---|
| `id` | string | Sí | Único |
| `clientId` / `clienteId` | string | Sí | Cliente existente/no archivado |
| `employeeId` / `empleadoId` | string | Sí | Empleado existente/no archivado |
| `date` / `fecha` | date string | Sí | `YYYY-MM-DD` |
| `type` / `tipo` | enum | Sí | `Llamada`, `Correo`, `Reunión` |
| `description` / `descripcion` | string | No | Texto saneado |
| `notes` | string | No | Alias observable de `description` en la vista real |
| `archived` | boolean | No | Default `false`; opcional según patrón de store |

**Reglas incorporadas (spec 002, FR-092/FR-093)**: CRUD visible desde la ruta DOM real; eliminar requiere confirmación accesible; historial por cliente visible en la ficha 360°; `clientId`/`customerId` y `employeeId` obligatorios y referencias existentes; `type` dentro de tipos configurados/default; orden determinista del historial (fecha descendente o definido).

## Entidades de soporte / estado UI

### Preferencia de Tema

| Campo | Tipo | Clave | Regla |
|---|---|---|---|
| `theme` | `'Claro' \| 'Oscuro'` | `crm.theme` | Se aplica antes del primer render visible; persiste entre recargas; no usa claves `crm_module:*` ni `erp_*` salvo las ya definidas. |

### Preferencia de Sesión (US18)

| Campo | Tipo | Clave | Regla |
|---|---|---|---|
| `authenticatedUser` | string | `erp.authenticatedUser` | Si “Recordar mi sesión” marcado: `localStorage`. Si desmarcado: `sessionStorage`. Logout limpia ambas. |
| `rememberSession` | boolean (UI) | N/A o derivado | No altera validación de credenciales; controla persistencia. |

### Vista Activa (US22)

| Campo | Tipo | Clave | Regla |
|---|---|---|---|
| `activeView` | enum | `erp.activeView` (propuesta) | Valores válidos: `dashboard`, `entities`, `documents`, `search`. Solo se restaura si autenticado y valor válido; fallback `dashboard`. |

### Diálogo Modal Accesible (US19/US23)

| Campo | Tipo | Regla |
|---|---|---|
| `open` | boolean | Controla visibilidad |
| `kind` | enum | `unsaved-changes`, `confirm-delete`, futuros |
| `trigger` | HTMLElement ref | Recibe foco al cerrar |
| `onConfirm` | function | Acción destructiva/descartar |
| `onCancel` | function | Cierra sin efectos |

**Accesibilidad**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, foco inicial, focus trap Tab/Shift+Tab, Escape cierra/cancela según caso, restaura foco.

### Entidades derivadas del cierre de brechas (read-only)

#### UpcomingClosureItem

| Campo | Tipo | Origen |
|---|---|---|
| `opportunityId` | string | `Opportunity.id` |
| `clientId` | string | `Opportunity.clientId` |
| `clientName` | string | `Customer.companyName/name` |
| `closeDate` | YYYY-MM-DD | `Opportunity.closeDate` |
| `stage` | string | `Opportunity.stage` |
| `amount` | number | `Opportunity.amount` |
| `daysUntilClose` | number | calculado |

**Regla**: incluir solo oportunidades abiertas, no archivadas, con `closeDate` válida en ventana 30 días desde hoy. No modifica KPIs base (FR-098).

#### ReferentialIntegrityIssue

| Campo | Tipo | Regla |
|---|---|---|
| `issueId` | string | estable para render (`type:recordId:field:missingId`) |
| `recordType` | string | `customer|employee|opportunity|interaction` |
| `recordId` | string | id del registro afectado |
| `field` | string | campo referencia (`clientId`, `employeeId`, etc.) |
| `missingId` | string | id referenciado inexistente |
| `severity` | string | `warning` |
| `message` | string | legible para UI |

**Regla**: reporte informativo, no destructivo; se genera al cargar/refresh de datos (FR-099).

#### Client360ViewModel

| Campo | Tipo | Origen |
|---|---|---|
| `customer` | object | `Customer` |
| `opportunities` | array | Opportunities por `clientId` |
| `interactions` | array | Interactions por `clientId` |
| `isArchived` | boolean | `Customer.archived` |
| `emptyStates` | object | flags por sección |

### Estado UI del cierre de brechas (claves propias)

| Clave | Tipo | Propósito | Default |
|---|---|---|---|
| `crm.gaps002.ui.employeesView` | JSON | filtro/mostrar archivados empleados | `{filter:"",showArchived:false}` |
| `crm.gaps002.ui.clients360` | JSON | id cliente abierto, filtro de retorno | `{openClientId:null,returnFilter:""}` |
| `crm.gaps002.ui.archivedFilter.entities` | JSON/bool | incluir archivados en clientes | `false` |
| `crm.gaps002.ui.archivedFilter.employees` | JSON/bool | incluir archivados en empleados | `false` |

Todas son opcionales, no canónicas, y toleran ausencia/corrupción con fallback seguro. El retorno de ficha 360° también puede conservar `returnScrollY?` según el contrato de storage.

## Reglas de validación y estado

### Dashboard (US17, US24)

- KPIs usan la misma fuente canónica que operaciones CRUD de oportunidades.
- `openOpportunities`: etapas no terminales.
- `totalPipeline`: suma montos abiertos; en MVP se expresa en moneda base CLP.
- `conversionRate`: `ganadas / (ganadas + perdidas) * 100`, 0 si no hay cerradas.
- Montos individuales mantienen moneda del registro; agregados no mezclan símbolos contradictorios.

### Búsqueda (US20)

- Resultado de búsqueda: cliente u oportunidad.
- Campos mínimos: tipo, id, título/etiqueta, detalle secundario.
- Navegación: al seleccionar, activa vista y carga registro en modo consulta/edición.

### Listados escalables (US21)

- Fila de cliente: nombre, código/email, estado/categoría, acciones Editar/Eliminar.
- Fila de oportunidad: cliente, serie/folio o identificador, etapa/estado, monto, fecha, acciones.
- La selección por fila sincroniza formulario activo.

### Validaciones del cierre de brechas (spec 002)

- Empleado: `name` y `role` requeridos.
- Interacción: `clientId`, `employeeId`, `date`, `type` requeridos; refs deben existir.
- Oportunidad: transición de etapa debe ser permitida por lifecycle; etapa final/actual válida.
- Archivado: no eliminar historial; solo excluir de operación activa por defecto.
- Integridad: referencias faltantes se reportan; no se borran automáticamente.

## Transiciones de estado

### Sesión

```text
Anonimo -> Autenticado(recordar=true)  => persiste localStorage
Anonimo -> Autenticado(recordar=false) => persiste sessionStorage
Autenticado -> Logout => limpia localStorage+sessionStorage auth, vuelve login
```

### Navegación

```text
Vista activa válida -> recarga -> restaura vista
Vista inválida/ausente -> recarga -> dashboard
No autenticado -> intento restaurar vista interna -> login
```

### Diálogo de eliminación

```text
Cerrado -> Abrir desde acción destructiva -> Abierto(foco en diálogo)
Abierto -> Cancelar/Escape -> Cerrado(restaurar foco, sin cambios)
Abierto -> Confirmar -> Ejecutar eliminación -> Cerrado(actualizar UI)
```

### Lifecycle de oportunidad aplicado (spec 002)

```text
Etapa actual -> transición permitida por opportunityLifecycle -> nueva etapa persistida
Etapa actual -> transición no permitida -> cambio bloqueado, feedback visible, registro sin corromper
Config inválida/parcial -> fallback seguro + banner visible -> CRUD básico sigue disponible
```