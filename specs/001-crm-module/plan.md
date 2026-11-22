# Plan de Implementación: Módulo CRM (Customer Relationship Management)

**Rama**: `001-crm-module` | **Fecha**: 2026-07-08 | **Actualizada**: 2026-11-21 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificaciones de la funcionalidad desde `/specs/001-crm-module/spec.md` (módulo CRM + interfaz SaaS profesional)

## Resumen

Desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP que permita administrar clientes, mantener un catálogo de empleados responsables, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta. El MVP estará enfocado en el **frontend**, usará **datos ficticios** y persistirá en el navegador; no incluye backend ni roles, y reutiliza el acceso frontend ya implementado.

El alcance funcional se organiza en las historias de la especificación: gestión de clientes con estado `Posible/Activo/Inactivo`, catálogo de empleados, oportunidades con monto, fecha de cierre y transiciones de etapa (`Evaluación → Propuesta → Negociación → Ganado/Perdido`), registro de interacciones (`Llamada/Correo/Reunión`), ficha 360° del cliente, dashboard con indicadores, búsqueda y filtros, integridad referencial con eliminación lógica, configuración del módulo y un espacio de trabajo consistente.

El modelo de dominio y las reglas se documentan en [data-model.md](data-model.md) y en el MER de referencia [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md).

Actualizar la capa visual ya implementada del CRM para que exprese un producto SaaS profesional y coherente: acceso con pantalla dividida y visibilidad de contraseña, menú lateral colapsable con hamburguesa SVG, Dashboard con banner personalizado y cuatro tarjetas KPI, formularios con los bloques exactos `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES`, y texto en español sin caracteres mal formados.

El trabajo se realiza **sobre el DOM real que se ejecuta** (`index.html`, `src/styles.css`, `src/main.js`, `src/app.js`), no sobre `src/components/*`, que no está conectado al arranque. La cadena ejecutable es Fase 14 → Fase 15 → Fases 16–20 → Fase 21 → Fase 22; las Fases 3–13 se conservan como registro histórico de la arquitectura de componentes y no son prerrequisitos bloqueantes. Sus comportamientos se validan en el DOM real en Fases 14–22. No se introduce backend, framework de UI ni dependencias nuevas. Investigación: [research.md](research.md). Contratos: [ui-contracts.md](contracts/ui-contracts.md), [crm-storage.md](contracts/crm-storage.md) y [dashboard-metrics.md](contracts/dashboard-metrics.md).

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS  
**Dependencias Principales**: Vite, sin framework de interfaz pesado  
**Almacenamiento**: `localStorage` del navegador para una instancia de espacio único  
**Pruebas**: Vitest con jsdom para pruebas unitarias y de integración  
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles  
**Tipo de Proyecto**: Aplicación web de página única  
**Objetivos de Rendimiento**: con al menos 500 clientes y sus oportunidades e interacciones asociadas, búsqueda ≤10 s y renderizado inicial de listas ≤2 s en el navegador de referencia (FR-042, SC-002, SC-004)
**Restricciones**: Huella mínima de librerías, despliegue simple, sin backend; estructura extensible para módulos personalizados  
**Seguridad**: Todo contenido introducido por el usuario se sanitiza antes de renderizarse (FR-041)

### Contexto técnico adicional (interfaz SaaS)

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

### Implicaciones de las clarificaciones de 2026-11-21 (FR-068 a FR-073)

- **Métricas**: `getCRMOverview()` en `src/storage.js` es la fuente canónica y debe seguir excluyendo clientes archivados del KPI de clientes activos, pero no puede filtrar oportunidades por el estado `archived` del cliente; la regla de «abierta» depende solo de la etapa. `getDashboardMetrics()` se mantiene únicamente como alias de compatibilidad. `contracts/dashboard-metrics.md` y `data-model.md` reflejan esta corrección.
- **Almacenamiento**: las lecturas de `src/storage.js` distinguen clave ausente, dato válido y dato corrupto; ante corrupción se informa y se ofrece reinicio explícito sin borrar nada automáticamente.
- **Navegación**: `src/app.js` concentra el cambio de vista para interceptar salidas de formularios con cambios sin guardar y ofrecer «Permanecer»/«Descartar».
- **Configuración**: `src/module-config.js` deriva los campos visibles de la configuración activa; las actualizaciones fusionan con el registro almacenado para conservar valores de campos eliminados.
- **Tema**: el espacio de trabajo expone el selector `Claro`/`Oscuro` (FR-073); la preferencia se guarda en `localStorage['crm.theme']`, clave nueva y separada de `crm_module:*`/`erp_*`, y se aplica antes del primer render.
- Estas decisiones se incorporaron desde la rama `003-spec-clarifications`; los contratos y las pruebas correspondientes se enumeran en `tasks.md`.

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **Calidad (I)**: La implementación usará módulos JavaScript pequeños y enfocados (dominio, almacenamiento, sanitización, configuración, componentes de vista), con nombres consistentes y límites claros entre la capa de persistencia y la lógica de presentación.
- **Pruebas (II)**: Cada historia de usuario incluirá pruebas unitarias de la lógica de dominio/almacenamiento y pruebas de integración del flujo de interfaz **antes o junto a** la implementación. Los flujos críticos (alta de cliente, transiciones de etapa, archivado con preservación de historial, unicidad de correo, dashboard, búsqueda/filtros) tendrán cobertura automatizada y no se considerarán completos hasta que las pruebas pasen.
- **Experiencia de Usuario (III)**: Todas las pantallas compartirán un marco con barra superior y barra lateral, mensajes de validación claros, estados vacíos explícitos y retroalimentación consistente; la navegación será operable en ventanas estrechas.
- **Rendimiento (IV)**: La búsqueda, los filtros y el renderizado de listas se optimizarán para 500 clientes y sus registros asociados; las actualizaciones del DOM serán ligeras y no habrá trabajo bloqueante evitable.

### Interfaz SaaS profesional

*COMPROBACIÓN: Debe pasar antes de la Fase 0. Reverificar tras la Fase 1.*

- **I. Calidad y mantenibilidad**: cambios concentrados en módulos existentes; única abstracción nueva, `computeConversionRate()` en `src/domain.js`, documentada en [dashboard-metrics.md](contracts/dashboard-metrics.md). No se resucitan componentes huérfanos.
- **II. Pruebas primero**: cada historia tiene pruebas planificadas en `tests/integration/ui-contracts.test.js`, `tests/integration/sidebar-collapse.test.js` y `tests/unit/conversion-rate.test.js`, cargando el DOM real de `index.html`. Ninguna historia se cierra sin `npm run test:run`, `npm run lint` y `npm run build`.
- **III. Consistencia de experiencia**: tokens de diseño, contrato único de SVG, estados expandido/contraído, mensajes comunes, estados vacíos neutros y ARIA (`aria-expanded`, `aria-pressed`, `aria-current`).
- **IV. Rendimiento y fiabilidad**: preferencia leída una vez al arrancar; KPI calculados en memoria con una sola llamada a `getCRMOverview()`; sin trabajo bloqueante.

### Reverificación tras la Fase 1 (interfaz SaaS)

Sigue en **PASA** sin violaciones. La sincronización del formulario con el almacén CRM es un adaptador delgado en `src/app.js`, no una nueva capa. Las suites heredadas basadas en `src/components/*` se declaran fuera de alcance y se registran como deuda conocida en [research.md](research.md). No hay entradas en Seguimiento de Complejidad.

## Diseño de Interfaz (Interfaz SaaS Profesional)

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
specs/001-crm-module/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
├── contracts/
│   ├── crm-storage.md
│   ├── ui-contracts.md
│   └── dashboard-metrics.md
├── Features/
│   └── spec(borrador).md
├── Feature001.md
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
index.html
src/
├── main.js              (punto de entrada: carga configuración y monta la app)
├── app.js               (enrutamiento por módulos y orquestación de vistas)
├── styles.css           (tokens de diseño, shell, formularios, listas, estados)
├── domain.js            (enumeraciones, reglas de transición, cálculos de dashboard)
├── storage.js           (repositorios localStorage, validación, unicidad, archivado, integridad)
├── sanitize.js          (escape de contenido introducido por el usuario)
├── module-config.js     (carga/validación de configuración y valores por defecto)
└── components/
    ├── shell.js         (barra superior, logotipo SVG, barra lateral, módulo activo)
    ├── dashboard.js     (indicadores comerciales + accesos rápidos)
    ├── client-form.js   (alta/edición de clientes)
    ├── client-list.js   (lista operativa de clientes)
    ├── client-detail.js (ficha 360°: datos + oportunidades + interacciones)
    ├── employee-form.js (alta/edición de empleados)
    ├── employee-list.js (catálogo de empleados)
    ├── opportunity-form.js (alta/edición + transición de etapa)
    ├── opportunity-list.js (lista con filtros por etapa, responsable y fecha)
    ├── interaction-form.js (registro de interacciones)
    ├── interaction-list.js (historial de interacciones)
    └── search.js        (búsqueda de clientes y filtros de oportunidades)

tests/
├── unit/
├── integration/
└── setup/
```

**Decisión de Estructura**: Una aplicación Vite simple con un único punto de entrada HTML, módulos JavaScript pequeños y CSS en un archivo separado. `storage.js` concentra la identidad, las marcas de tiempo, la unicidad del correo, la integridad referencial y la eliminación lógica; `domain.js` contiene las enumeraciones y las reglas de transición/cálculo para que las vistas no dupliquen lógica. `module-config.js` centraliza los puntos de adaptación (nombre, etiquetas, campos personalizados, ciclo de vida de oportunidades y color de acento). `shell.js` envuelve todas las vistas para que la marca y la navegación permanezcan consistentes sin duplicar marcado. `sanitize.js` se aplica antes de insertar cualquier dato introducido por el usuario en el DOM. La separación cliente/empleado (datos maestros) frente a oportunidad/interacción (registros transaccionales) refleja el MER y permite que los módulos personalizados reutilicen cada par de forma independiente.

**Decisión de Estructura (interfaz SaaS)**: se mantiene la aplicación Vite de un solo `index.html`. La jerarquía visual vive en el HTML estático y sus estados en los módulos ya conectados: `main.js` posee sesión y acceso; `app.js` posee navegación, Dashboard y formularios; `storage.js`/`domain.js` aportan los datos. Las pruebas nuevas cargan el HTML real con JSDOM, siguiendo `tests/integration/relabeling.test.js`, porque los helpers actuales apuntan a la arquitectura huérfana de `src/components/*`.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución. La eliminación lógica (en lugar de cascada) y la unicidad de correo se resuelven en la capa de almacenamiento para mantener la integridad referencial sin acoplar las vistas a las reglas de dominio.

Para la interfaz SaaS: este plan no introduce violaciones de la constitución; los cambios son incrementales, reutilizan los módulos conectados y añaden cobertura automatizada para cada comportamiento visible. La deuda preexistente (componentes no usados, claves de almacenamiento divergentes y suites heredadas) se documenta en [research.md](research.md) y no se resuelve en esta funcionalidad más allá del adaptador necesario para FR-060.
