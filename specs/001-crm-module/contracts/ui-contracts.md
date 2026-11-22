# Contrato de Interfaz: Interfaz SaaS Profesional del CRM

**Funcionalidad**: `001-crm-module` | **Especificación**: [spec.md](../spec.md) | **Modelo**: [data-model.md](../data-model.md)

## Propósito

Define los selectores, estados, atributos y textos observables de la interfaz. Es la referencia para las pruebas de contrato con Vitest + jsdom; cualquier cambio de estos identificadores debe actualizar este documento y las pruebas.

## 1. Pantalla de acceso (FR-047 a FR-052)

| Elemento | Selector | Contrato |
|---|---|---|
| Vista de acceso | `#login-view` | visible cuando no hay sesión; oculta tras acceso válido |
| Panel de marca | `.login-brand-panel` | presente y visible en escritorio |
| Panel de formulario | `.login-form-panel` | presente y visible en escritorio |
| Usuario | `#login-username` | campo de texto accesible |
| Contraseña | `#login-password` | `type="password"` por defecto; conserva su `value` al alternar |
| Control de visibilidad | `#login-password-toggle` | `button[type=button]`, `aria-pressed` (`false`/`true`), `aria-label` «Mostrar contraseña» / «Ocultar contraseña» |
| Iconos del control | `.icon-eye`, `.icon-eye-off` | exactamente uno visible según `aria-pressed`; cumplen el contrato SVG del apartado 5 |
| Error | `#login-error` | `textContent` comprensible en español; nunca contiene la contraseña |
| Envío | `#login-submit` | con credenciales válidas guarda `erp.authenticatedUser`, muestra `#app-shell` y `#view-dashboard` |

**Responsive**: a ≤ 820 px los paneles se apilan (`src/styles.css`, bloque `@media (max-width: 820px)`) sin desplazamiento horizontal.

## 2. Shell y navegación colapsable (FR-053 a FR-056)

| Elemento | Selector | Contrato |
|---|---|---|
| Shell | `#app-shell` | clase `sidebar-collapsed` presente solo en estado contraído |
| Botón de menú | `#menu-toggle` | `button[type=button]`, `aria-controls="sidebar"`, `aria-expanded` sincronizado, `aria-label` «Contraer menú lateral» / «Expandir menú lateral» |
| Icono del botón | `#menu-toggle svg` | cumple el contrato SVG; `aria-hidden="true"` y `focusable="false"` |
| Barra lateral | `#sidebar` | presente en el DOM en ambos estados; `aria-label="Navegación principal"`; en móvil contraída se comporta como capa superpuesta |
| Enlaces | `#nav-dashboard`, `#nav-entities`, `#nav-documents`, `#nav-search` | `.nav-module` enfocables en ambos estados; etiquetas ocultas solo visualmente al contraer; `aria-current="page"` sobre la sección activa |
| Contenido | `.content-area` | se ensancha al contraer sin superponerse ni ocultar información |

**Persistencia**: `sessionStorage['erp.sidebarCollapsed']` con `'true'`/`'false'`; se restaura al arrancar y se elimina al cerrar sesión. No se escribe en `localStorage`.

**Interacción**: contraer/expandir no cambia `#view-*` visible ni `aria-current`; en ≤ 900 px, el overlay se cierra con Escape, clic fuera y nueva activación del botón, devolviendo el foco a `#menu-toggle`.

## 3. Dashboard (FR-057 a FR-060)

| Elemento | Selector | Contrato |
|---|---|---|
| Saludo | `#welcome-title` | contiene saludo en español y el valor de `erp.authenticatedUser` |
| Rejilla de KPI | `.stats-grid` | contiene exactamente cuatro `.stat-card` |
| Clientes | `#stat-clients`, `#stat-clients-label` | etiqueta «Clientes activos»; valor entero |
| Oportunidades | `#stat-opportunities`, `#stat-opportunities-label` | etiqueta «Oportunidades activas»; valor entero |
| Ingresos | `#stat-revenue`, `#stat-revenue-label` | etiqueta «Ingresos estimados»; valor monetario |
| Conversión | `#stat-conversion`, `#stat-conversion-label` | etiqueta «Tasa de conversión»; valor entero seguido de « %» |
| Estado vacío | las cuatro tarjetas | `0`, `$0` o `0 %` según corresponda; sin texto de error |

Los valores se recalculan al entrar al Dashboard y tras cada alta/edición que afecte a clientes u oportunidades. La derivación se especifica en [dashboard-metrics.md](dashboard-metrics.md).

## 4. Formularios estandarizados (FR-061 a FR-064)

| Elemento | Selector | Contrato |
|---|---|---|
| Bloque 1 | `#entity-form .form-section:nth-of-type(1)` | encabezado `DATOS DEL CLIENTE`; contiene identificación y contacto |
| Bloque 2 | `#entity-form .form-section:nth-of-type(2)` | encabezado `CONDICIONES COMERCIALES`; contiene moneda/importe y plazos |
| Texto del encabezado | `.form-section-title-text` | `textContent.trim()` exactamente igual a la cadena en mayúsculas |
| Estructura repetida | `.form-section > .form-grid > .field` | misma clase y orden en ambos bloques |
| Errores | `.validation-error` | junto al campo inválido; misma redacción y ubicación en ambos bloques |
| Guardado | `#entity-form` | con campos obligatorios vacíos no crea registros y muestra los errores |

Nota: `#entity-form` mantiene su persistencia `erp_base_module:entities` y, mediante el adaptador descrito en [research.md](../research.md), refleja el alta/edición en `crm_module:customers` para que los KPI se actualicen.

## 5. Contrato de iconos SVG

Aplica a `.icon-eye`, `.icon-eye-off` y `#menu-toggle svg`:

```text
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round"
aria-hidden="true"
focusable="false"
```

Sin atributos `width`/`height` en línea: el tamaño se define en CSS (22 px para la hamburguesa, 18 px para el ojo). El nombre accesible y el estado residen en el botón contenedor, nunca en el SVG.

## 6. Codificación (FR-065 a FR-067)

- `index.html` declara `<html lang="es">` y `<meta charset="UTF-8" />`.
- Todo texto dinámico se inserta con `textContent`; no se interpolan valores de usuario en `innerHTML`.
- `document.body.textContent` no contiene U+FFFD, `Ã`, `â€` ni entidades HTML de acentos.
- Los encabezados en mayúsculas se leen completos y sin cortes en los cuatro breakpoints definidos.

## 7. Cambios sin guardar, tema y errores de almacenamiento (FR-070, FR-072, FR-073)

| Situación | Elemento/contrato observable | Comportamiento |
|---|---|---|
| Cualquier formulario CRM con cambios sin guardar | formularios del DOM real y la navegación (`#nav-*`) | Al intentar salir se muestra un diálogo con «Permanecer» y «Descartar»; sin confirmación explícita no se navega ni se pierden los datos (FR-070) |
| Elección de «Permanecer» | diálogo de confirmación | Cierra el diálogo, mantiene la vista y los valores introducidos |
| Elección de «Descartar» | diálogo de confirmación | Cierra el diálogo, descarta los cambios y navega al destino solicitado |
| Selector de tema `Claro`/`Oscuro` | selector del espacio de trabajo y `localStorage['crm.theme']` | El selector está disponible en el espacio de trabajo; guarda la elección en el mismo navegador y la aplica desde el primer render tras recargar (FR-073, SC-021) |
| Datos corruptos al arrancar | `#storage-error`, `#storage-reset` | Se muestra un mensaje comprensible y una acción explícita para reiniciar; no se descartan datos automáticamente |

La navegación interna debe pasar por un único punto de control para que la confirmación no pueda evitarse con enlaces del menú ni con otros controles de la aplicación. La recarga de la página y el botón Atrás del navegador quedan fuera del alcance definido en FR-070.

## 8. Criterios de aceptación verificables

Cada fila anterior es comprobable sin conocer la implementación: consultando el DOM, sus atributos, el texto visible y el almacenamiento del navegador. Las pruebas se agrupan en `tests/integration/ui-contracts.test.js` y `tests/integration/sidebar-collapse.test.js`, cargando el `index.html` real.
