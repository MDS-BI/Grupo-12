# Contrato: Correcciones US16–US24

**Funcionalidad**: `001-crm-module` | **Especificación**: [../spec.md](../spec.md)

## Propósito

Define contratos observables para las correcciones priorizadas US16–US24. Complementa [ui-contracts.md](ui-contracts.md), [crm-storage.md](crm-storage.md) y [dashboard-metrics.md](dashboard-metrics.md).

## US16 - Tema oscuro coherente (FR-074, FR-075, SC-022)

- `#theme-select` conserva valores `Claro` y `Oscuro`.
- `document.documentElement.dataset.theme` es `dark` u `light` antes del primer render visible.
- En `dark`, las superficies críticas usan tokens/variables; no debe haber fondos claros fijos en: `.topbar`, `.sidebar`, `.view`, `.form-section`, `.action-button`, `.stat-card`, `.search-field`/resultados, `.empty-state`, `.confirm-dialog-card`, `.login-form-panel`, `.selector-panel`, `.storage-error`, badges y mensajes de validación.
- Texto/iconos/bordes mantienen legibilidad en ambos temas.
- `crm.theme` persiste en `localStorage`.

## US17 - Dashboard coherente con oportunidades (FR-076, FR-077, SC-023)

- Crear/editar/eliminar oportunidad desde UI actualiza la fuente canónica consumida por `getCRMOverview()`.
- Al entrar a `#view-dashboard`, los KPI se recalculan desde esa fuente.
- No puede haber divergencia entre datos guardados por formulario y KPIs.
- Si se mantiene compatibilidad con `erp_base_module:documents`, la operación de guardado debe sincronizar en la misma transacción lógica del frontend.

## US18 - Recordar mi sesión (FR-078, SC-024)

- `#login-remember` controla persistencia.
- Marcado: credencial autenticada persiste en `localStorage[erp.authenticatedUser]` y se elimina de `sessionStorage`.
- Desmarcado: persiste en `sessionStorage[erp.authenticatedUser]` y se elimina de `localStorage`.
- `isAuthenticated()`/arranque acepta cualquiera de las dos ubicaciones según política definida, con comportamiento determinista.
- Logout elimina ambas claves y no restaura sesión.
- La preferencia no altera validación de credenciales ni expone secretos.

## US19 - Confirmación accesible de eliminación (FR-079, FR-080, SC-025)

- No se usa `window.confirm()`.
- Diálogo modal CRM con `role="dialog"`, `aria-modal="true"`, etiqueta/título.
- Botones: cancelar y confirmar eliminación destructiva.
- Focus trap dentro del diálogo; Tab/Shift+Tab ciclan.
- Escape cierra/cancela sin eliminar.
- Al cerrar, foco vuelve al control que abrió el diálogo.
- Confirmar elimina y refresca UI.

## US20 - Búsqueda unificada (FR-081, FR-082, SC-026)

- `#search-input` busca clientes y oportunidades.
- Resultado contiene tipo visible (`Cliente`/`Oportunidad`), texto principal y detalle.
- Estado vacío: mensaje claro cuando no hay coincidencias.
- Seleccionar resultado navega a vista correspondiente y carga registro para consulta/edición.
- Campos personalizados huérfanos no participan (FR-071).

## US21 - Listados escalables (FR-083, FR-084, SC-027)

- `#view-entities` y `#view-documents` incluyen listado con filas/ítems y acciones por fila: Editar, Eliminar.
- Editar carga formulario con registro seleccionado.
- Eliminar usa diálogo de US19.
- El listado se actualiza tras guardar/eliminar.
- La gestión principal no depende exclusivamente de un `<select>`.

## US22 - Restaurar vista activa (FR-085, SC-028)

- Clave propuesta: `erp.activeView` en `localStorage`.
- Valores permitidos: `dashboard`, `entities`, `documents`, `search`.
- Al iniciar autenticado, restaura vista válida.
- Valor inválido/ausente: fallback `dashboard`.
- No autenticado: no restaura vista interna antes de login.

## US23 - Accesibilidad formularios y diálogos (FR-086, FR-087, SC-029)

- Campo inválido: `aria-invalid="true"` y `aria-describedby` incluye id del mensaje de error.
- Al limpiar/volver válido: elimina `aria-invalid` o lo pone `false`.
- Submit inválido mueve foco al primer campo inválido.
- `#unsaved-dialog` y diálogos de confirmación: foco inicial, trap, Escape, restauración de foco.
- Sin fuga de foco al contenido detrás del modal.

## US24 - Moneda clara y consistente (FR-088, SC-030)

- Moneda base MVP: `CLP`.
- KPI agregados muestran moneda base de forma explícita y consistente.
- Montos individuales muestran moneda del registro o etiqueta normalizada.
- No mezclar símbolos contradictorios en la misma vista.
- `formatCurrency(value, currency?)` o helper equivalente debe centralizar la regla.