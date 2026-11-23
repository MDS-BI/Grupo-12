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

---

## Cierre de brechas históricas (contrato `ui-dom.md` integrado)

**Ruta activa**: `index.html` + `src/app.js` + `src/styles.css`  
**No usar**: `src/components/*` (histórico/no conectado)  
**Nota de fusión (2026-11-23)**: esta sección reproduce íntegramente el contrato DOM de la feature 002 (antes `contracts/ui-dom.md`). Sus FR se renombraron a FR-089–FR-102 y sus historias a US25–US30.

### Convenciones

- IDs nuevos son estables y requeridos por pruebas.
- Reusar patrones ARIA/validación existentes (US23/T058 ya cubierto): `aria-invalid`, `aria-describedby`, `role="alert"` donde aplique, foco en primer error.
- Reusar diálogo de confirmación accesible existente para eliminaciones/acciones destructivas.

### Navegación y vistas

| Elemento | Selector | Contrato |
|---|---|---|
| Nav empleados | `#nav-employees` | botón/nav visible en sidebar; abre `#view-employees` |
| Nav interacciones | `#nav-interactions` | abre `#view-interactions` |
| Vista empleados | `#view-employees` | `section.view`, oculta salvo activa |
| Vista interacciones | `#view-interactions` | `section.view` |
| Vista/ficha 360 | `#view-client-360` | vista `section.view` única y canónica; visible al abrir ficha; contiene retorno a clientes |

### Grupo 1 - Empleados (FR-089–FR-091)

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

### Grupo 2 - Interacciones (FR-092–FR-093)

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

### Grupo 3 - Oportunidades lifecycle + config banner (FR-094–FR-095, FR-101)

| Elemento | Selector | Contrato |
|---|---|---|
| Etapa | `#status` | opciones permitidas según lifecycle vigente |
| Feedback lifecycle | `#error-status` o `#lifecycle-feedback` | mensaje claro ante transición inválida; no persiste cambio |
| Banner config | `#config-error-banner` | visible cuando hay errores/fallback de config; no bloquea uso básico |
| Detalle config | `#config-error-detail` | texto accesible con resumen de error/fallback |
| Cerrar banner | `#config-error-dismiss` | opcional; si existe, oculta visualmente pero no borra condición subyacente hasta recarga/config válida |

### Grupo 4 - Ficha cliente 360° (FR-096–FR-097)

| Elemento | Selector | Contrato |
|---|---|---|
| Abrir ficha | `[data-action="view-client-360"]` | en fila cliente; abre ficha |
| Contenedor | `#client-360` | muestra resumen cliente |
| Volver | `#client-360-back` | regresa a `#view-entities`, restaura `#entity-list-filter`, cliente/fila seleccionada (`#entity_id` o `data-selected`) y vista activa `#view-entities`; usa `crm.gaps002.ui.clients360` y, sin estado previo, vacío |
| Resumen | `#client-360-summary` | nombre, contacto, estado, archivado |
| Oportunidades | `#client-360-opportunities` | lista/tabla relacionada |
| Interacciones | `#client-360-interactions` | lista/tabla relacionada |
| Vacío oportunidades | `#client-360-opportunities-empty` | estado vacío |
| Vacío interacciones | `#client-360-interactions-empty` | estado vacío |

### Grupo 5 - Próximos cierres e integridad (FR-098–FR-099)

| Elemento | Selector | Contrato |
|---|---|---|
| Sección próximos cierres | `#upcoming-closures-section` | visible en dashboard |
| Lista | `#upcoming-closures-list` | filas con cliente, oportunidad, fecha, etapa, monto |
| Vacío | `#upcoming-closures-empty` | "No hay cierres próximos" o equivalente claro |
| Acción ver | `[data-action="open-upcoming-opportunity"]` | navega a oportunidad en `#view-documents` |
| Reporte integridad | `#integrity-report` | visible cuando hay hallazgos; no bloqueante |
| Lista integridad | `#integrity-report-list` | ítems con tipo, registro, referencia faltante |
| Vacío/ok | `#integrity-report-empty` | visible u omitido cuando no hay hallazgos, sin falso positivo |

### Grupo 6 - Archivado visible (FR-100, FR-091, FR-102)

| Elemento | Selector | Contrato |
|---|---|---|
| Toggle archivados clientes | `#entity-show-archived` | incluye archivados en listado clientes |
| Toggle archivados empleados | `#employee-show-archived` | incluye archivados en listado empleados |
| Badge archivado | `.badge-archived` / `[data-archived="true"]` | indicador visible |
| Acción restaurar cliente | `[data-action="restore-entity"]` o `restore-customer` | devuelve a estado operativo |
| Selectores operativos | `#entity_id`, `#interaction-client-id`, `#interaction-employee-id` | excluyen archivados por defecto |

### Accesibilidad mínima del cierre de brechas

- Navegación completa por teclado en nuevas vistas/acciones.
- Foco visible en filas/botones/controles.
- Estados vacíos con texto legible; no solo color.
- Banners/reportes con `role="status"` o `role="alert"` según severidad, sin robar foco innecesariamente.