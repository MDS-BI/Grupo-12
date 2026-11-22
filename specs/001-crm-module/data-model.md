# Modelo de Datos: Módulo CRM (Customer Relationship Management)

**Funcionalidad**: `001-crm-module` | **Especificación**: [spec.md](spec.md)
**MER de referencia**: [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md)

## Visión General

El modelo se compone de entidades de dominio CRM —**Cliente**, **Empleado**, **Oportunidad** e **Interacción**— más objetos de apoyo: **ModuleConfig**, **Preferencia de Tema**, **Preferencia de Sesión**, **Vista Activa** y **Diálogo de Confirmación** (estado UI). Las correcciones US16–US24 no añaden backend; extienden reglas de persistencia, navegación y accesibilidad sobre el frontend existente.

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

### Empleado

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---:|---|
| `id` | string | Sí | Único |
| `name` / `nombre` | string | Sí | No vacío |
| `role` / `cargo` | string | Sí | No vacío |
| `archived` | boolean | Sí | Eliminación lógica |

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

### Interacción

| Atributo | Tipo | Obligatorio | Reglas |
|---|---|---:|---|
| `id` | string | Sí | Único |
| `clientId` / `clienteId` | string | Sí | Cliente existente/no archivado |
| `employeeId` / `empleadoId` | string | Sí | Empleado existente/no archivado |
| `date` / `fecha` | date string | Sí | `YYYY-MM-DD` |
| `type` / `tipo` | enum | Sí | `Llamada`, `Correo`, `Reunión` |
| `description` / `descripcion` | string | No | Texto saneado |

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