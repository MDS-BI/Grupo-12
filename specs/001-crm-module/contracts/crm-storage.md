# Contrato de Almacenamiento del Módulo CRM

**Funcionalidad**: `001-crm-module` | **Modelo**: [../data-model.md](../data-model.md)

## Propósito

Define claves de almacenamiento, reglas de integridad, recuperación y nuevas claves de sesión/vista para US16–US24.

## Claves de almacenamiento

- `erp.authenticatedUser` — sesión. Ubicación: `localStorage` si “Recordar mi sesión” marcado; `sessionStorage` si desmarcado. Logout limpia ambas.
- `erp.sidebarCollapsed` (`sessionStorage`) — preferencia del menú.
- `erp.activeView` (`localStorage`, propuesta FR-085) — última vista interna válida.
- `erp_base_module:entities` — compatibilidad.
- `erp_base_module:documents` — compatibilidad; no debe ser fuente divergente de KPIs.
- `crm_module:customers`
- `crm_module:employees`
- `crm_module:opportunities` — fuente canónica de oportunidades/KPIs.
- `crm_module:interactions`
- `crm.theme` — preferencia Claro/Oscuro.

## Reglas US17/FR-076-077

- Las operaciones de oportunidad desde UI deben actualizar la fuente canónica usada por `getCRMOverview()`.
- Se prohíbe divergencia entre listado/formulario y dashboard.
- Si se conserva `erp_base_module:documents`, se sincroniza en la misma acción del usuario.

## Reglas US18/FR-078

- Recordar marcado: persistir auth en `localStorage`; borrar auth en `sessionStorage`.
- Recordar desmarcado: persistir auth en `sessionStorage`; borrar auth en `localStorage`.
- Logout: borrar auth de ambas ubicaciones.
- Reapertura navegador: solo restaura si estaba en `localStorage`.

## Reglas US22/FR-085

- Guardar vista al navegar: solo valores `dashboard|entities|documents|search`.
- Restaurar al iniciar: requiere sesión válida; vista inválida => `dashboard`.

## Validación y recuperación (FR-072)

- **Momento**: validar en cada arranque, antes de renderizar estado operativo.
- **Criterio de corrupción**: JSON inválido; valor parseado no conforme a la forma esperada. Claves de entidad `crm_module:customers|employees|opportunities|interactions` deben ser arreglos; cada registro objeto con `id` string no vacío. Oportunidades con `stage` ausente/nula/inválida se tratan como inconsistencia recuperable reportada, no como corrupción total salvo forma estructural inválida. Claves de compatibilidad `erp_base_module:entities|documents`, si son leídas por la ruta activa, deben ser arreglos de objetos.
- **Categorías de clave**:
  - Entidad CRM afectable: `crm_module:customers`, `crm_module:employees`, `crm_module:opportunities`, `crm_module:interactions`.
  - Compatibilidad afectable solo si se usa y está corrupta: `erp_base_module:entities`, `erp_base_module:documents`.
  - No afectadas por reset de corrupción: `erp.authenticatedUser`, `erp.sidebarCollapsed`, `erp.activeView`, `crm.theme`.
- **Comportamiento observable de bloqueo**: UI muestra estado de error visible con mensaje claro y categoría/clave afectada, más acción primaria "Reiniciar datos afectados". Acciones de crear/editar/eliminar/cargar listados dependientes de claves afectadas quedan deshabilitadas u ocultas; navegación no destructiva independiente puede permanecer disponible. Cancelar/ignorar mantiene bloqueo y mensaje visible.
- **Reintento ante fallo**: si falla la escritura del reinicio, mantener bloqueo, mostrar error de recuperación con detalle comprensible y control "Reintentar"; no borrar claves no afectadas ni marcar recuperación completada. Reintento exitoso escribe `[]` solo en claves afectadas, limpia error, habilita UI y continúa en estado vacío controlado.
- **Fiabilidad**: detección en 100% de arranques; reinicio exitoso deja claves afectadas en `[]`.

## Campos personalizados huérfanos (FR-071)

- Valores huérfanos se conservan en almacenamiento.
- No se muestran en formularios/listas/búsqueda si la config ya no los declara.

## Integridad

- Correo de cliente archivado reservado (FR-069).
- Oportunidades abiertas de clientes archivados cuentan por etapa (FR-068).
- Sin eliminación en cascada al archivar cliente/empleado.

---

## Cierre de brechas históricas (contrato `storage.md` integrado)

**Principio**: no doble verdad con KPIs canónicos base.  
**Nota de fusión (2026-11-23)**: esta sección reproduce íntegramente el contrato de storage de la feature 002 (antes `contracts/storage.md`). Las FR/SC de esa feature se citan con su numeración fusionada (FR-089–FR-102 / SC-031–SC-035).

### Stores canónicas (reusar)

| Clave | Propósito | Canonicidad |
|---|---|---|
| `crm_customers` | Clientes | Canónica de dominio |
| `crm_employees` | Empleados | Canónica de dominio |
| `crm_opportunities` | Oportunidades | Canónica de dominio |
| `crm_interactions` | Interacciones | Canónica de dominio |
| `erp_base_module:*` / contratos base | Config/UI base existente | Canónicos según 001 |

### Claves propias feature (UI no canónica)

| Clave | Tipo | Valor | Fallback |
|---|---|---|---|
| `crm.gaps002.ui.employeesView` | JSON | `{filter, showArchived}` | defaults |
| `crm.gaps002.ui.clients360` | JSON | `{openClientId, returnFilter, returnScrollY?}` | defaults |
| `crm.gaps002.ui.archivedFilter.entities` | JSON/bool | mostrar archivados clientes | `false` |
| `crm.gaps002.ui.archivedFilter.employees` | JSON/bool | mostrar archivados empleados | `false` |

Ninguna de estas claves es fuente canónica de KPIs, lifecycle, o integridad.

### API esperada en `src/storage.js` (aditiva/compatible)

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

### Reglas del cierre de brechas

- **Archivado**: soft flag `archived`; no borrar historial.
- **Selectores operativos**: solo activos no archivados.
- **Integridad**: reporte no muta datos.
- **Lifecycle**: transición inválida no se persiste.
- **Config errors**: `loadModuleConfig()` ya normaliza; la UI debe recibir/consultar errores para banner; no se inventa otra fuente de config.