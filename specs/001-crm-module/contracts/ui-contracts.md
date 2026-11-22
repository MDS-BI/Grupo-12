# Contrato de Interfaz: Interfaz SaaS Profesional del CRM

**Funcionalidad**: `001-crm-module` | **Especificación**: [../spec.md](../spec.md) | **Modelo**: [../data-model.md](../data-model.md)

## Propósito

Define los selectores, estados, atributos y textos observables de la interfaz. Es la referencia para las pruebas de contrato con Vitest + jsdom; cualquier cambio de estos identificadores debe actualizar este documento y las pruebas.

## 1. Pantalla de acceso (FR-047 a FR-052, FR-078)

| Elemento | Selector | Contrato |
|---|---|---|
| Vista de acceso | `#login-view` | visible cuando no hay sesión; oculta tras acceso válido |
| Panel de marca | `.login-brand-panel` | presente y visible en escritorio |
| Panel de formulario | `.login-form-panel` | presente y visible en escritorio |
| Usuario | `#login-username` | campo de texto accesible |
| Contraseña | `#login-password` | `type="password"` por defecto; conserva su `value` al alternar |
| Control de visibilidad | `#login-password-toggle` | `button[type=button]`, `aria-pressed` (`false`/`true`), `aria-label` «Mostrar contraseña»/«Ocultar contraseña», contiene `.icon-eye` y `.icon-eye-off` con SVG inline `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `aria-hidden="true"`, `focusable="false"` |
| Recordar sesión | `#login-remember` | checkbox visible; marcado => sesión persiste en `localStorage`; desmarcado => sesión en `sessionStorage` |
| Error | `#login-error` | mensaje claro en español; nunca contiene la contraseña introducida |

**Persistencia sesión**: `erp.authenticatedUser` en `localStorage` o `sessionStorage` según `#login-remember`. El cierre de sesión elimina ambas.

## 2. Menú lateral colapsable (FR-053 a FR-056)

| Elemento | Selector | Contrato |
|---|---|---|
| Botón | `#menu-toggle` | dentro de `.topbar`, antes de `.brand`; SVG hamburguesa; `aria-controls="sidebar"`, `aria-expanded` sincronizado, `aria-label` «Contraer menú lateral»/«Expandir menú lateral» |
| Barra lateral | `#sidebar` | `aria-label="Navegación principal"`; contiene `#nav-dashboard`, `#nav-entities`, `#nav-documents`, `#nav-search` |
| Módulo activo | `.nav-module[aria-current="page"]` | exactamente uno en la vista actual; no cambia al contraer |
| Contenedor | `#app-shell` | clase `sidebar-collapsed` presente solo cuando el menú está contraído |

**Persistencia menú**: `sessionStorage['erp.sidebarCollapsed']`.

## 3. Dashboard (FR-057 a FR-060, FR-076, FR-077, FR-088)

| Elemento | Selector | Contrato |
|---|---|---|
| Banner | `#welcome-title` | contiene «Bienvenido» y el nombre de `erp.authenticatedUser` |
| Clientes activos | `#stat-clients`, `#stat-clients-label` | entero, neutro `0` |
| Oportunidades activas | `#stat-opportunities`, `#stat-opportunities-label` | entero, neutro `0` |
| Ingresos estimados | `#stat-revenue`, `#stat-revenue-label` | moneda base CLP, neutro `$0` |
| Tasa de conversión | `#stat-conversion`, `#stat-conversion-label` | porcentaje entero, neutro `0 %` |
| Aviso inconsistencia etapas | `#dashboard-data-warning` (o equivalente) | visible solo cuando hay oportunidades con etapa ausente/nula/inválida; texto claro + cantidad afectada; no bloqueante; oculto cuando no hay inconsistencias |

**Fuente**: KPIs calculados desde la misma fuente canónica que CRUD de oportunidades; sin divergencia tras crear/editar/eliminar.

## 4. Formularios (FR-061 a FR-064, FR-070, FR-073, FR-086-FR-087)

| Elemento | Selector | Contrato |
|---|---|---|
| Formulario | `#entity-form` | contenedor visible en alta y edición |
| Secciones | `.form-section` | exactamente dos; primera con “DATOS DEL CLIENTE”, segunda con “CONDICIONES COMERCIALES” |
| Campos DATOS | `#name`, `#code`, `#taxId`, `#category`, `#email`, `#phone`, `#address` | presentes dentro de la primera sección |
| Campos CONDICIONES | `#entity-currency`, `#creditLimit`, `#paymentTerms`, `#targetDate` | presentes dentro de la segunda sección |
| Errores | `#error-name`, `#error-code`, `#error-taxId`, `#error-email`, `#error-phone`, `#error-creditLimit`, `#error-targetDate` | visibles junto al campo; mismo patrón en alta y edición |
| Accesibilidad error | campo inválido | `aria-invalid="true"` y `aria-describedby` incluye el id del mensaje; foco al primer inválido en submit inválido |
| Selector de tema | `#theme-select` | accesible por teclado, etiqueta visible/programática, expone valor actual; no depende solo del color (FR-073) |

**Cambios sin guardar (FR-070)**: un formulario CRM es dirty cuando el valor serializado actual de campos editables (`input`, `select`, `textarea`) difiere de la línea base capturada al cargar, limpiar, guardar con éxito o descartar. Campos deshabilitados/solo lectura no cuentan. Guardar/descartar restablece la línea base.
## 5. Diálogos modales (FR-070, FR-079, FR-080, FR-087)

### Cambios sin guardar

- `#unsaved-dialog`, `#unsaved-stay`, `#unsaved-discard`.
- Focus trap, Escape cierra/cancela seguro según regla actual, foco vuelve al disparador.

### Confirmación de eliminación

- Diálogo propio del CRM (reutilizable), no `window.confirm`.
- `role="dialog"`, `aria-modal="true"`, título/descripcion claros.
- Botón cancelar y botón destructivo confirmar.
- Focus trap, Escape cancela, foco restaurado al disparador.

## 6. Búsqueda y listados (FR-081 a FR-084)

| Elemento | Selector | Contrato |
|---|---|---|
| Búsqueda | `#search-input` | busca clientes y oportunidades |
| Resultados | `#search-results-list` | items tipados: Cliente u Oportunidad |
| Vacío | `#search-empty` | visible sin coincidencias |
| Listado clientes | contenedor en `#view-entities` | filas con acciones Editar/Eliminar |
| Listado oportunidades | contenedor en `#view-documents` | filas con acciones Editar/Eliminar |

Seleccionar resultado/fila navega/carga registro en formulario. Gestión principal no depende solo de `<select>`.

## 7. Navegación y vista activa (FR-085)

- Vista activa válida se restaura tras recarga.
- Clave propuesta: `localStorage['erp.activeView']` con whitelist `dashboard|entities|documents|search`.
- Valor inválido/no autenticado => fallback seguro (dashboard o login según auth).

## 8. Codificación y tema (FR-065 a FR-067, FR-073 a FR-075)

- `<meta charset="UTF-8" />` presente.
- Sin U+FFFD/mojibake en textos visibles.
- `data-theme="light|dark"` aplicado temprano desde `crm.theme`.
- Cobertura visual coherente en ambos temas.


## 9. Recuperación de almacenamiento (FR-072)

| Elemento | Contrato |
|---|---|
| Estado de bloqueo | visible cuando hay corrupción no resuelta; mensaje claro con categoría/clave afectada |
| Acción primaria | botón "Reiniciar datos afectados" disponible mientras haya corrupción |
| Cancelar/ignorar | mantiene bloqueo y mensaje visible; no habilita operaciones sobre datos afectados |
| Acciones dependientes | crear/editar/eliminar/cargar listados dependientes de claves afectadas deshabilitadas u ocultas |
| Fallo de reinicio | muestra error de recuperación con detalle comprensible y control "Reintentar"; no altera claves no afectadas; no marca recuperado |
| Reintento exitoso | limpia error, claves afectadas en `[]`, habilita UI, estado vacío controlado; preserva sesión/tema/vista/sidebar |

## Verificación

Pruebas en `tests/integration/ui-contracts.test.js`, `tests/integration/sidebar-collapse.test.js`, `tests/integration/theme.test.js`, `tests/integration/unsaved-changes.test.js` y pruebas nuevas para US16–US24.