# Plan de Implementación: Interfaz SaaS Profesional del CRM

**Rama**: `002-crm-saas-ui` | **Fecha**: 2026-11-17 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificación de la funcionalidad desde `/specs/002-crm-saas-ui/spec.md`

## Resumen

Actualizar la capa visual ya implementada del CRM para que exprese un producto SaaS profesional y coherente: acceso con pantalla dividida y visibilidad de contraseña, menú lateral colapsable con hamburguesa SVG, Dashboard con banner personalizado y cuatro tarjetas KPI, formularios con los bloques exactos `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES`, y texto en español sin caracteres mal formados.

El trabajo se realiza **sobre el DOM real que se ejecuta** (`index.html`, `src/styles.css`, `src/main.js`, `src/app.js`), no sobre `src/components/*`, que no está conectado al arranque. No se introduce backend, framework de UI ni dependencias nuevas. Investigación: [research.md](research.md). Contratos: [ui-contracts.md](contracts/ui-contracts.md) y [dashboard-metrics.md](contracts/dashboard-metrics.md).

## Contexto Técnico

**Lenguaje/Versión**: JavaScript ES2022 (módulos), HTML5, CSS3
**Dependencias Principales**: Vite `^8.2.1`; sin framework de UI; Vitest `^4.1.10` + jsdom `^30.0.1`
**Almacenamiento**: `localStorage` (`erp.authenticatedUser`, `erp_base_module:*`, `crm_module:*`) y `sessionStorage` (`erp.sidebarCollapsed`)
**Pruebas**: `npm run test:run`, `npm run lint`, `npm run build`; no hay script de typecheck
**Plataforma Objetivo**: navegadores modernos de escritorio y móviles; referencia 1366 × 768
**Tipo de Proyecto**: aplicación web de página única, estática, con un único `index.html`
**Objetivos de Rendimiento**: alternar menú y visibilidad en menos de 2 s sin recarga; banner y cuatro KPI visibles sin desplazamiento vertical en 1366 × 768; sin rondas adicionales
**Restricciones**: UTF-8 declarado y conservado; iconos SVG en línea con contrato único; sin dependencias nuevas; `dist/` es generado y no se edita a mano
**Seguridad**: se conserva la autenticación existente; texto dinámico solo con `textContent`; la contraseña nunca aparece en mensajes ni atributos
**Alcance**: 5 vistas, 4 KPI y 2 bloques de formulario estandarizados

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la Fase 0. Reverificar tras la Fase 1.*

- **I. Calidad y mantenibilidad**: cambios concentrados en módulos existentes; única abstracción nueva, `computeConversionRate()` en `src/domain.js`, documentada en [dashboard-metrics.md](contracts/dashboard-metrics.md). No se resucitan componentes huérfanos.
- **II. Pruebas primero**: cada historia tiene pruebas planificadas en `tests/integration/ui-contracts.test.js`, `tests/integration/sidebar-collapse.test.js` y `tests/unit/conversion-rate.test.js`, cargando el DOM real de `index.html`. Ninguna historia se cierra sin `npm run test:run`, `npm run lint` y `npm run build`.
- **III. Consistencia de experiencia**: tokens de diseño, contrato único de SVG, estados expandido/contraído, mensajes comunes, estados vacíos neutros y ARIA (`aria-expanded`, `aria-pressed`, `aria-current`).
- **IV. Rendimiento y fiabilidad**: preferencia leída una vez al arrancar; KPI calculados en memoria con una sola llamada a `getCRMOverview()`; sin trabajo bloqueante.

### Reverificación tras la Fase 1

Sigue en **PASA** sin violaciones. La sincronización del formulario con el almacén CRM es un adaptador delgado en `src/app.js`, no una nueva capa. Las suites heredadas basadas en `src/components/*` se declaran fuera de alcance y se registran como deuda conocida en [research.md](research.md). No hay entradas en Seguimiento de Complejidad.

## Diseño de Interfaz

### Estructura visual

| Área | Diseño | Fuente |
|---|---|---|
| Acceso | Fondo degradado oscuro; tarjeta `grid-template-columns: 45% 55%` con panel de marca y panel de formulario; apilado a ≤ 820 px | `index.html`, `src/styles.css` |
| Shell | Barra superior fija de 64 px; rejilla `260px minmax(0,1fr)`; al contraer, `64px minmax(0,1fr)` con franja de iconos | `src/styles.css` |
| Dashboard | Banner degradado con saludo y nombre del usuario; rejilla `repeat(auto-fit, minmax(220px, 1fr))` con cuatro tarjetas | `index.html`, `src/styles.css` |
| Formularios | Dos `.form-section`, encabezados literales en mayúsculas, rejilla `minmax(240px,1fr)`, error junto al campo | `index.html`, `src/styles.css` |

Se reutilizan los tokens de `:root` (`--accent: #2563eb`, `--panel`, `--border`, `--radius-md: 12px`, `--shadow-card`). Como el acento puede sobrescribirse por configuración, los iconos usan `currentColor`.

### Sistema de iconos SVG

Todo icono de control usa `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `aria-hidden="true"` y `focusable="false"`; el tamaño se fija en CSS y el nombre accesible vive en el botón. El ojo conserva `aria-pressed`; la hamburguesa conserva `aria-controls="sidebar"` y sincroniza `aria-expanded` y `aria-label`. Véase [ui-contracts.md](contracts/ui-contracts.md).

### Navegación colapsable

| Estado | Barra lateral | Contenido | Señal accesible |
|---|---|---|---|
| Expandido (default) | 260 px con icono y etiqueta | columna estándar | `aria-expanded="true"`, «Contraer menú lateral» |
| Contraído > 900 px | franja de 64 px, solo iconos enfocables | columna ancha, sin superposición | `aria-expanded="false"`, «Expandir menú lateral» |
| Contraído ≤ 900 px | capa superpuesta bajo la barra superior; cierra con Escape, clic fuera o el botón | todo el ancho, contenido visible | foco al primer enlace al abrir y de vuelta al botón al cerrar |

El estado se guarda en `sessionStorage['erp.sidebarCollapsed']`, se restaura antes de enlazar el botón y se borra al cerrar sesión. `aria-current="page"` no cambia al contraer.

### Estados y codificación

Los KPI vacíos muestran `0`, `$0` o `0 %`, nunca un error. Los mensajes de acceso y validación usan `textContent` con texto en español y no incluyen la contraseña. `index.html` conserva `<meta charset="UTF-8" />`; las pruebas comprueban ausencia de U+FFFD y secuencias mojibake en textos con acentos, «ñ» y símbolos monetarios.

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/002-crm-saas-ui/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── ui-contracts.md
│   └── dashboard-metrics.md
└── tasks.md            (salida de /speckit.tasks; no creada por /speckit.plan)
```

### Código Fuente (raíz del repositorio)

```text
index.html              marcado de acceso, shell, Dashboard y formularios
src/
├── main.js             arranque, rutas, autenticación y visibilidad de contraseña
├── app.js              boot de vistas, menú colapsable, banner, KPI y envío de formularios
├── styles.css          tokens, rejilla de acceso, franja/overlay lateral, tarjetas y formularios
├── domain.js           reglas de dominio y nueva función computeConversionRate()
├── storage.js          repositorios localStorage; getCRMOverview() como fuente de KPI
├── module-config.js    etiquetas y acento (sin cambios previstos)
├── sanitize.js         escape de texto (sin cambios previstos)
└── components/         módulos no conectados en esta versión: fuera de alcance

tests/
├── setup/test-setup.js
├── integration/
│   ├── ui-contracts.test.js      (nuevo: acceso, banner, KPI y formularios)
│   ├── sidebar-collapse.test.js  (nuevo: colapso, persistencia y accesibilidad)
│   └── relabeling.test.js        (referencia de arranque con DOM real)
└── unit/
    └── conversion-rate.test.js   (nuevo: deriving de tasa de conversión)

dist/                    artefacto generado con npm run build; no editar
```

**Decisión de Estructura**: se mantiene la aplicación Vite de un solo `index.html`. La jerarquía visual vive en el HTML estático y sus estados en los módulos ya conectados: `main.js` posee sesión y acceso; `app.js` posee navegación, Dashboard y formularios; `storage.js`/`domain.js` aportan los datos. Las pruebas nuevas cargan el HTML real con JSDOM, siguiendo `tests/integration/relabeling.test.js`, porque los helpers actuales apuntan a la arquitectura huérfana de `src/components/*`.

## Seguimiento de Complejidad

Este plan no introduce violaciones de la constitución: los cambios son incrementales, reutilizan los módulos conectados y añaden cobertura automatizada para cada comportamiento visible. La deuda preexistente (componentes no usados, claves de almacenamiento divergentes y suites heredadas) se documenta en [research.md](research.md) y no se resuelve en esta funcionalidad más allá del adaptador necesario para FR-014.

