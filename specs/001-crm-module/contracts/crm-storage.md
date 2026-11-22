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
- **Reinicio explícito**: escribe `[]` solo en claves afectadas de las categorías afectables. No modifica claves no afectadas.
- **Flujos alternos/excepción**: cancelar/ignorar reinicio mantiene bloqueo de operaciones sobre datos afectados y el error visible con acción disponible. Si falla la escritura del reinicio, mostrar error de recuperación con opción de reintentar; no borrar claves no afectadas; no marcar recuperación completada.
- **Fiabilidad**: detección en 100% de arranques; reinicio exitoso deja claves afectadas en `[]` y permite estado vacío controlado.

## Campos personalizados huérfanos (FR-071)

- Valores huérfanos se conservan en almacenamiento.
- No se muestran en formularios/listas/búsqueda si la config ya no los declara.

## Integridad

- Correo de cliente archivado reservado (FR-069).
- Oportunidades abiertas de clientes archivados cuentan por etapa (FR-068).
- Sin eliminación en cascada al archivar cliente/empleado.