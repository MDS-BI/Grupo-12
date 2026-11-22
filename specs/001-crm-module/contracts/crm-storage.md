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

- Clave ausente: estado vacío.
- JSON inválido/forma incorrecta en claves `crm_module:*`: error visible, no sobrescribir automáticamente, reinicio explícito.
- Reinicio solo afecta claves CRM de entidad; no toca sesión, tema, vista activa salvo decisión explícita documentada.

## Campos personalizados huérfanos (FR-071)

- Valores huérfanos se conservan en almacenamiento.
- No se muestran en formularios/listas/búsqueda si la config ya no los declara.

## Integridad

- Correo de cliente archivado reservado (FR-069).
- Oportunidades abiertas de clientes archivados cuentan por etapa (FR-068).
- Sin eliminación en cascada al archivar cliente/empleado.