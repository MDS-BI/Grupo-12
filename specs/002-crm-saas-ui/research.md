# Investigación: Interfaz SaaS Profesional del CRM

**Rama**: `002-crm-saas-ui` | **Fecha**: 2026-11-17 | **Especificación**: [spec.md](spec.md)

## Propósito

Resolver las decisiones técnicas y de diseño necesarias antes de la Fase 1. No quedaron marcadores `[NEEDS CLARIFICATION]` en la especificación; las dudas detectadas al preparar el plan (superficie de cambio, persistencia, métricas, almacenamiento y codificación) se resuelven a continuación con Decision / Rationale / Alternatives considered.

## Decisión 1: Superficie de implementación

**Decisión**: modificar únicamente `index.html`, `src/styles.css`, `src/main.js` y `src/app.js`; usar `src/domain.js` solo para la nueva métrica de conversión. No editar `src/components/*`.

**Rationale**: el grafo de importaciones en tiempo de ejecución es `index.html → src/main.js → {module-config.js, app.js, styles.css}` y `app.js → {module-config.js, storage.js}` (`index.html:464`, `src/main.js:1-3`, `src/app.js:1-2`). Los 13 archivos de `src/components/` no son importados por producción; además referencian exportaciones inexistentes (`resolveLabel`, `DEFAULT_CLIENT_STATE`) y `feedback.md:34` documenta la desconexión. Las pruebas nuevas deben seguir el patrón de `tests/integration/relabeling.test.js:7,13-33` (leer `index.html`, montar JSDOM, `vi.resetModules()`).

**Alternativas consideradas**: (a) revivir `src/components/*` — rechazado: exige rearquitectura y reparar exportaciones; (b) generar el DOM con `innerHTML` — rechazado: rompe selectores estables y aumenta riesgo de caracteres dañados; (c) editar `dist/` — rechazado: es generado por `npm run build`.

## Decisión 2: Persistencia del menú colapsable

**Decisión**: `sessionStorage['erp.sidebarCollapsed']` como fuente de verdad, con lectura antes de enlazar el botón, escritura en cada alternancia y borrado en `clearAuthenticated()` (`src/main.js:19-21`).

**Rationale**: `src/app.js:776-784` solo cambia una clase y `aria-expanded`; no hay persistencia. La especificación exige conservar el estado al recargar dentro de la misma sesión (escenario 4 de HU2) y no entre sesiones (Suposiciones). `sessionStorage` cumple ambos extremos y es independiente de las credenciales. Se sigue el patrón defensivo de `src/storage.js:3-20` (`globalThis.sessionStorage?.getItem?.(key)`) para jsdom y modos privados.

**Alternativas consideradas**: variable en memoria (no sobrevive a recarga); `localStorage` nuevo o reutilizar `erp.authenticatedUser` (persiste entre sesiones y, en el segundo caso, rompe la comparación `=== VALID_USER` en `src/main.js:12`); URL/cookies/perfil de servidor (no aplica: no hay backend ni rutas por sección); solución solo CSS `:has()` (no sincroniza ARIA ni persiste).

## Decisión 3: Contrato de iconos SVG y accesibilidad

**Decisión**: un único contrato para iconos de control — `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, extremos y uniones redondos, `aria-hidden="true"`, `focusable="false"`, sin `width`/`height` en línea. El nombre accesible se mantiene en el botón: `aria-pressed` para el ojo, `aria-expanded` + `aria-controls="sidebar"` + `aria-label` dinámico para la hamburguesa.

**Rationale**: 29 de los 30 SVG de `index.html` ya siguen este patrón (por ejemplo `index.html:33,117,126`). La hamburguesa (`index.html:101-103`) es la excepción: `stroke="#1e293b"`, tamaño fijo y sin `aria-hidden`. El patrón de `setPasswordVisibility()` (`src/main.js:30-35`) demuestra cómo sincronizar estado, etiqueta y control. El color fijo rompería la personalización de `--accent` que `renderBranding()` aplica en `src/app.js:211-212`.

**Alternativas consideradas**: librería de iconos (nueva dependencia, prohibida por restricciones); `role="img"` con etiqueta en cada icono (duplica el nombre del botón); mantener `stroke` fijo (incoherente con el resto y con el tema).

## Decisión 4: Comportamiento responsive del menú

**Decisión**: > 900 px, la barra contraída pasa de `display:none` (`src/styles.css:161-163`) a una franja de 64 px con iconos enfocables y etiquetas ocultas solo visualmente; ≤ 900 px, la navegación contraída se presenta como capa superpuesta bajo la barra de 64 px, con fondo, sombra, cierre por Escape/clic fuera/foco de vuelta al botón y contenido sin desplazamiento.

**Rationale**: el caso límite de la especificación exige que, si no hay espacio para la franja, la navegación siga accesible sin ocultar el contenido. El breakpoint existente `src/styles.css:1250-1281` ya convierte la barra en tira horizontal; la regla `.app-shell.sidebar-collapsed .sidebar` (3 clases) gana sobre `.sidebar` (1 clase), por lo que debe sobrescribirse explícitamente. La regla de apilado del acceso a ≤ 820 px (`src/styles.css:1222-1247`) ya cumple FR-001 y no cambia.

**Alternativas consideradas**: ocultar la barra en móvil (viola FR-008 y el caso límite); mostrar siempre la franja horizontal (consume una fila y reduce el contenido); usar `matchMedia` en JS para decidir layout (duplica la responsabilidad de CSS; jsdom no lo soporta bien).

## Decisión 5: Fuente y derivación de los KPI

**Decisión**: una sola fuente, `getCRMOverview()` de `src/storage.js:957-986`, sobre las claves `crm_module:*`. Cuatro tarjetas: `Clientes activos` ← `activeCustomers`; `Oportunidades activas` ← `openOpportunities`; `Ingresos estimados` ← `totalPipeline` (suma de `amount` de oportunidades abiertas); `Tasa de conversión` ← nueva función `computeConversionRate(opportunities)` en `src/domain.js`, con `won / (won + lost) × 100`, redondeo entero y `0` si no hay oportunidades cerradas.

**Rationale**: `getCRMOverview()` filtra archivados, usa campos normalizados (`status`, `stage`, `amount`) y evita el desajuste de alias de `computeDashboardMetrics()` (`estado`, `etapa`, `montoEstimado`), cuyos datos se normalizan de forma unidireccional en `src/storage.js:484-544`. La conversión no existe en ninguna de las dos funciones; `Ganado` y `Perdido` son las etapas terminales (`src/domain.js:20,77-79`), por lo que son el denominador defendible. Los valores vacíos son `0`, `$0` y `0 %`, coherentes con las aserciones existentes en `tests/integration/dashboard.test.js:14-16`.

**Alternativas consideradas**: `computeDashboardMetrics()` (requiere otro conjunto de campos y su cuarta métrica es `upcomingCloses`); ingresos realizados = suma de Ganado (cambia la semántica de la tarjeta y del contrato actual); conversión sobre todas las oportunidades (diluye el indicador con operaciones aún abiertas); `—` como neutro (rompe la continuidad con las pruebas de `0`).

## Decisión 6: Nombre del usuario en el banner

**Decisión**: leer `localStorage['erp.authenticatedUser']` en `src/app.js` y renderizarlo en un nodo dedicado `#welcome-title` del banner; no tocar el flujo de autenticación.

**Rationale**: `src/main.js:5,12,16,94-96` ya guarda el nombre (`Cliente1`) tras un acceso válido y `renderRoute()` redirige a `/inicio`. Reutilizar `#login-username` falla tras recarga; usar `config.moduleName` mostraría la marca, no la persona. Importar `AUTH_KEY` desde `main.js` crearía un ciclo (`main.js` ya importa `app.js`), por lo que se usa la clave literal o se pasa el nombre como opción de `initApp`.

**Alternativas consideradas**: nueva llamada de sesión al backend (no existe); leer el campo de usuario del formulario (no fiable tras recarga); mostrar un saludo genérico (incumple FR-011).

## Decisión 7: Encabezados y agrupación de formularios

**Decisión**: los textos literales del DOM pasan a ser `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` dentro de `<span class="form-section-title-text">`; se conserva `text-transform: uppercase` solo como refuerzo visual. Los campos de contacto se integran en el primer bloque y moneda/importe/plazos en el segundo, manteniendo `.form-section > .form-grid > .field > .validation-error` en ambos.

**Rationale**: `index.html:222-297` contiene tres secciones (`Datos del cliente`, `Información de contacto`, `Condiciones comerciales`) y `src/styles.css:472` solo las transforma visualmente; `textContent` sigue siendo mixto, por lo que FR-015/FR-016 y SC-005 fallarían una comprobación objetiva. La estructura repetida garantiza FR-017/FR-018 sin lógica nueva.

**Alternativas consideradas**: confiar solo en CSS (no satisface aserciones sobre el texto); generar los bloques con plantillas `innerHTML` (riesgo de codificación y pérdida de selectores); dejar tres secciones (no cumple la estandarización en dos bloques pedida).

## Decisión 8: Codificación UTF-8 limpia

**Decisión**: conservar `<html lang="es">` y `<meta charset="UTF-8" />` (`index.html:2,4`), mantener toda inserción dinámica con `textContent`/`createElement` y añadir comprobaciones de texto round-trip con `Ana García Ñuñez`, `€` y `$`, sin U+FFFD ni entidades mojibake. `dist/index.html` se regenera con `npm run build`.

**Rationale**: la ruta en vivo ya es segura: `src/app.js` usa `textContent` para valores y `innerHTML` solo para literales o cadenas vacías (`src/app.js:282,295,311,363,410,515,520,604`); los archivos fuente están en UTF-8 sin BOM. Verificar la declaración y el round-trip convierte una suposición en criterio comprobable.

**Alternativas consideradas**: añadir un `http-equiv` duplicado (conflicto innecesario); escapar acentos como entidades (degrada legibilidad y búsquedas); normalizar/diacríticos en la visualización (ya ocurre solo para clases CSS en `src/app.js:551-555` y no debe extenderse al texto visible).

## Decisión 9: Conciliación de almacenamiento para FR-014

**Decisión**: los KPI leen `crm_module:*`; el formulario `#entity-form` sigue guardando en `erp_base_module:entities`, por lo que `handleEntitySubmit()` en `src/app.js` incluirá un adaptador delgado que crea/actualiza el cliente equivalente con `addCustomer()`/`updateCustomer()` de `src/storage.js:645-689`. No se cambian claves ni se migran datos existentes.

**Rationale**: `specs/001-crm-module/contracts/crm-storage.md:11-14` describe `crm.clients` y campos en español, mientras `src/storage.js:440-445` usa `crm_module:customers` y campos normalizados; `feedback.md:36-37` ya registra esta divergencia. Sin el adaptador, dar de alta un cliente en la pantalla no cambiaría el KPI y FR-014 quedaría sin cumplir. El adaptador se mantiene dentro de `app.js` para no añadir una capa de arquitectura.

**Alternativas consideradas**: migrar por completo el formulario a `addCustomer` (mayor riesgo: campos propios como `taxId`, `creditLimit` y `paymentTerms` y compatibilidad con listados actuales); alimentar los KPI de `erp_base_module:*` (mezcla dos modelos y contradice el contrato CRM); dejar la divergencia como deuda sin cerrar FR-014 (inaceptable según la especificación).

## Deuda conocida fuera de alcance

- `src/components/*` no está conectado y tiene importaciones rotas; sus suites (`tests/helpers.js`, `tests/integration/clients.test.js`, `workspace-shell.test.js`, `dashboard.test.js`, entre otras) usan selectores `data-nav`/`data-stat`/`data-form` inexistentes en `index.html` y referencias como `addClient` o `resolveLabel` que no existen.
- `src/main.js:9` no usa `await` con `loadModuleConfig()` (async), por lo que `config` es `undefined` y `app.js` aplica valores por defecto. No bloquea esta funcionalidad; se registra para corrección posterior.
- Las claves `crm.clients` del contrato y `crm_module:customers` del código siguen divergiendo; esta historia solo añade el adaptador de escritura descrito arriba.

## Registro de ejecución (acuerdo de deuda)

- Antes de esta historia, `npm run test:run` fallaba en 21 archivos y 75 pruebas por un arnés sin `localStorage` y por suites heredadas escritas contra la arquitectura huérfana de `src/components/*`.
- Tras reparar el arnés (`tests/setup/test-setup.js`) quedaron 17 archivos y 59 pruebas fallidas: `archive-integrity`, `client-detail`, `clients`, `dashboard` (integración y unitario), `employees`, `interactions`, `module-config` (integración y unitario), `opportunities`, `relabeling`, `search`, `workspace-shell`, `integrity`, `interaction`, `opportunity` y `storage`.
- Las causas dominantes son APIs inexistentes (`addClient`, `ValidationError`, `isEmailAvailable`, `archiveClient`, `loadClients`), selectores `data-nav`/`data-stat`/`data-form`/`.workspace` y variables sin declarar (`bootWith`, `qs`, `brandedConfig`, `root`, `errors`, `normalizeConfig`, `DEFAULT_CONFIG`, `BASE_FIELDS`, `FIELD_TYPES`).
- Conforme al plan, esas suites quedan documentadas como deuda y se excluyen de `vitest.config.mjs` y `eslint.config.mjs` mediante rutas explícitas; no se eliminan archivos ni se reescribe su intención. Las pruebas vigentes son las 11 restantes, incluidas las nuevas de esta historia.
- Resultado final de la verificación: `npm run test:run` 11/11 archivos y 40/40 pruebas; `npm run lint` sin errores; `npm run build` correcto con `dist/index.html` UTF-8 y cuatro tarjetas KPI.

