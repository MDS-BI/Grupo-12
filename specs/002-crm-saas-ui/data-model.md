# Modelo de Datos: Interfaz SaaS Profesional del CRM

**Rama**: `002-crm-saas-ui` | **Especificación**: [spec.md](spec.md) | **Decisiones**: [research.md](research.md)

## Propósito

Describe las entidades y los estados que manipula esta funcionalidad. No se crean tablas ni esquemas nuevos: se reutilizan los repositorios de `src/storage.js`, la sesión de `src/main.js` y la preferencia de `sessionStorage`. Los contratos observables están en [contracts/ui-contracts.md](contracts/ui-contracts.md) y [contracts/dashboard-metrics.md](contracts/dashboard-metrics.md).

## Entidad: Usuario de sesión

| Campo | Origen | Uso en esta funcionalidad |
|---|---|---|
| `nombre` | `localStorage['erp.authenticatedUser']` (`src/main.js:5,16`) | se muestra en `#welcome-title` del banner con saludo en español |
| `credenciales` | `VALID_USER` / `VALID_PASSWORD` en `src/main.js:6-7` | solo validación de acceso; nunca se renderizan ni se incluyen en mensajes |
| `estadoSesion` | presencia/ausencia de la clave de autenticación | determine vista de acceso o shell de aplicación |

**Reglas**: el nombre se inserta con `textContent`; no se añaden métodos de autenticación; al cerrar sesión se elimina también la preferencia del menú.

## Entidad: Preferencia de navegación

| Campo | Tipo | Valores | Regla |
|---|---|---|---|
| `collapsed` | booleano persistido como `'true'`/`'false'` | `true`, `false` | `sessionStorage['erp.sidebarCollapsed']`; ausente = expandido |
| `seccionActiva` | derivada del DOM | `dashboard`, `entities`, `documents`, `search` | no cambia al contraer; se refleja en `aria-current="page"` |

**Transiciones de estado**:

| Estado actual | Acción | Estado siguiente | Efectos |
|---|---|---|---|
| Expandido | activar `#menu-toggle` | Contraído | clase `sidebar-collapsed`, `aria-expanded="false"`, etiqueta «Expandir menú lateral», escritura en sesión |
| Contraído | activar `#menu-toggle` | Expandido | sin clase, `aria-expanded="true"`, etiqueta «Contraer menú lateral», escritura en sesión |
| Cualquiera | recargar dentro de la sesión | estado almacenado | se restaura antes de enlazar el botón |
| Cualquiera | cerrar sesión | Expandido | se elimina la clave de sesión |

## Entidad: Cliente

Fuente: `crm_module:customers` a través de `addCustomer()`/`updateCustomer()` (`src/storage.js:645-689`). El formulario estático mantiene además el registro `erp_base_module:entities` por compatibilidad.

| Campo | Tipo | Origen en el formulario | Regla |
|---|---|---|---|
| `companyName` | texto | `#name` | obligatorio; `sanitizeCRMText` |
| `contactName` | texto | opcional / alias `contactName` | sanitizado |
| `email` | texto | `#email` | obligatorio y único entre clientes no archivados (`src/storage.js:635-640`) |
| `phone` | texto | `#phone` | opcional |
| `status` | enumeración | valor por defecto | `Posible`, `Activo`, `Inactivo`; por defecto `Posible` |
| `archived` | booleano | eliminación lógica | excluye al cliente de listados y métricas |
| `creditLimit`, `paymentTerms` | texto/numérico | `#creditLimit`, `#paymentTerms` | se conservan en el registro ERP y se trasladan al adaptador CRM |

**Relación**: un cliente puede tener varias oportunidades (`clientId`); todas las tarjetas KPI se derivan del conjunto de clientes y oportunidades no archivados.

## Entidad: Oportunidad

Fuente: `crm_module:opportunities`. Campos normalizados: `clientId`, `employeeId`, `stage`, `amount`, `closeDate`, `archived`.

| Campo | Regla |
|---|---|
| `stage` | `Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`; las dos últimas son terminales (`src/domain.js:20`) |
| `amount` | numérico ≥ 0; `Number(amount) || 0` para agregados |
| `archived` | excluye la oportunidad de `getCRMOverview()` |

**Transición relevante**: al pasar a `Ganado` o `Perdido` deja de contar como oportunidad abierta y pasa a formar parte del denominador de conversión.

## Entidad: Métrica del Dashboard

| KPI | Expresión | Neutro | Presentación |
|---|---|---|---|
| Clientes activos | `getCRMOverview().activeCustomers` | `0` | entero |
| Oportunidades activas | `getCRMOverview().openOpportunities` | `0` | entero |
| Ingresos estimados | `getCRMOverview().totalPipeline` | `$0` | moneda con separadores |
| Tasa de conversión | `computeConversionRate(overview.opportunities)` | `0 %` | entero seguido de «%» |

`computeConversionRate()` cuenta `stage === 'Ganado'` y `stage === 'Perdido'` (con fallback a `etapa`), calcula `Math.round(won / (won + lost) * 100)` y devuelve `0` cuando `won + lost === 0`. No modifica registros. Detalles en [dashboard-metrics.md](contracts/dashboard-metrics.md).

## Entidad: Icono SVG de control

| Atributo | Valor obligatorio |
|---|---|
| `viewBox` | `0 0 24 24` |
| `fill` / `stroke` | `none` / `currentColor` |
| `stroke-width` | `2` |
| `stroke-linecap` / `stroke-linejoin` | `round` / `round` |
| `aria-hidden` / `focusable` | `true` / `false` |
| Estado | `aria-pressed` (ojo) u `aria-expanded` + `aria-controls="sidebar"` (hamburguesa) |

Aplica al ojo, al ojo tachado y a la hamburguesa; el nombre accesible permanece en el botón que contiene el icono.

## Relaciones

```text
Usuario de sesión ──lee──> nombre ──> Banner de bienvenida
Usuario de sesión ──posee──> Preferencia de navegación (sessionStorage)
Cliente ──1:N──> Oportunidad ──> Métricas del Dashboard
Formulario de cliente ──escribe──> erp_base_module:entities
Formulario de cliente ──adaptador──> crm_module:customers ──> KPI
Control ──contiene──> Icono SVG ──> estado ARIA del control
```

## Validación de esta funcionalidad

- `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` deben aparecer literalmente en el DOM, no solo visualmente.
- Ningún bloque de formulario puede guardar con campos obligatorios vacíos; el error se sitúa junto al campo.
- La contraseña se enmascara por defecto y se conserva al alternar su visibilidad.
- El texto mostrado no puede contener U+FFFD ni secuencias de reemplazo para caracteres del español.
- `dist/index.html` no se edita: se regenera desde las fuentes.
