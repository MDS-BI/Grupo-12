# Plan de Implementación: Módulo CRM (Customer Relationship Management)

**Rama**: `001-crm-module` | **Fecha**: 2026-07-08 | **Actualizada**: 2026-11-23 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificaciones de la funcionalidad desde `/specs/001-crm-module/spec.md` (módulo CRM + interfaz SaaS profesional + correcciones US16–US24 + cierre de brechas históricas US25–US30/FR-089–FR-102)

> **Nota de fusión (2026-11-23)**: este plan integra el contenido íntegro del `002-plan.md` (cierre de brechas históricas) en la sección final "Cierre de brechas históricas". Los identificadores incorporados se renombraron a US25–US30, FR-089–FR-102 y SC-031–SC-035 para no colisionar con el módulo base; las tareas correspondientes son T198–T249 en `tasks.md`.

## Resumen

Desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP que permita administrar clientes, mantener un catálogo de empleados responsables, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta. El MVP estará enfocado en el **frontend**, usará **datos ficticios** y persistirá en el navegador; no incluye backend ni roles, y reutiliza el acceso frontend ya implementado.

El alcance funcional se organiza en las historias de la especificación: gestión de clientes con estado `Posible/Activo/Inactivo`, catálogo de empleados, oportunidades con monto, fecha de cierre y transiciones de etapa (`Evaluación → Propuesta → Negociación → Ganado/Perdido`), registro de interacciones (`Llamada/Correo/Reunión`), ficha 360° del cliente, dashboard con indicadores, búsqueda y filtros, integridad referencial con eliminación lógica, configuración del módulo y un espacio de trabajo consistente.

La extensión del backlog (US16–US24, FR-074–FR-088) incorpora correcciones y mejoras priorizadas: tema oscuro coherente por tokens, dashboard alineado con la fuente de verdad de oportunidades, preferencia “Recordar mi sesión” efectiva, confirmaciones de eliminación accesibles, búsqueda unificada de clientes/oportunidades, listados escalables, restauración de vista activa, accesibilidad completa de formularios/diálogos y regla consistente de moneda.

El modelo de dominio y las reglas se documentan en [data-model.md](data-model.md) y en el MER de referencia [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md).

El trabajo se realiza **sobre el DOM real que se ejecuta** (`index.html`, `src/styles.css`, `src/main.js`, `src/app.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`), no sobre `src/components/*`, que no está conectado al arranque. Las fases 3–13 se conservan como registro histórico; las correcciones nuevas se implementan sobre la ruta activa validada por tests del DOM real. No se introduce backend, framework de UI ni dependencias nuevas. Investigación: [research.md](research.md). Contratos: [ui-contracts.md](contracts/ui-contracts.md) (incluye el contrato DOM del cierre de brechas), [crm-storage.md](contracts/crm-storage.md) (incluye las claves `crm.gaps002.ui.*` y la API aditiva), [dashboard-metrics.md](contracts/dashboard-metrics.md), [corrections-us16-us24.md](contracts/corrections-us16-us24.md) y [performance.md](contracts/performance.md).

## Contexto Técnico

**Lenguaje/Versión**: JavaScript ES modules, HTML5, CSS3; Node/npm toolchain en `package.json` (Vite 8, Vitest 4, ESLint 9, jsdom 30).  
**Dependencias Principales**: Vite, Vitest, jsdom, ESLint, Prettier; sin framework de UI ni dependencias runtime nuevas.  
**Almacenamiento**: `localStorage` (`erp.authenticatedUser`, `erp_base_module:*`, `crm_module:*`, `crm.theme`, y nueva clave de vista/sesión según diseño) y `sessionStorage` (`erp.sidebarCollapsed`, y sesión no recordada si se adopta).  
**Pruebas**: `vitest run` con jsdom; pruebas unitarias e integración sobre DOM real (`tests/integration/live-dom.js`).  
**Plataforma Destino**: Navegador moderno de escritorio/móvil, app Vite estática.  
**Tipo de Proyecto**: Aplicación web frontend single-page, un solo `index.html`.  
**Objetivos de Rendimiento**: Búsqueda ≤ 10 s y renderizado/listados usables con 500 clientes y registros asociados (SC-002/SC-004); listados editables con 50 registros identificables en < 15 s (SC-027); sin trabajo bloqueante en UI.  
**Restricciones**: Sin backend; sin dependencias nuevas; no editar `src/components/*` ni `dist/` a mano; preservar compatibilidad con tests existentes y contratos; cambios accesibles por teclado.  
**Escala/Alcance**: MVP de espacio único; US16–US24 son correcciones incrementales sobre CRM existente.

## Comprobación de Constitución

*COMPROBACIÓN: Debe pasar antes de la Fase 0. Reverificar tras la Fase 1.*

- **I. Calidad y mantenibilidad**: PASA. Cambios incrementales en módulos existentes; extraer helpers pequeños (almacén de sesión, fuente canónica de oportunidades, diálogo accesible reutilizable) solo donde reduzcan duplicación. Sin refactor masivo de `app.js` en este incremento salvo extracciones puntuales necesarias para testabilidad.
- **II. Pruebas primero y verificación**: PASA CON PLAN. Cada US16–US24 tendrá cobertura automatizada (unitaria/integración/contrato según corresponda) antes o junto a implementación. Cierre requiere `npm run test:run`, `npm run lint`, `npm run build`.
- **III. Consistencia de experiencia de usuario**: PASA. Tokens de tema, diálogo modal compartido, estados vacíos, mensajes y patrones de foco/ARIA consistentes con contratos existentes.
- **IV. Rendimiento y fiabilidad**: PASA CON RIESGO CONTROLADO. Búsqueda unificada y listados deben filtrar en memoria y renderizar incrementalmente/simple; fuente única para dashboard evita divergencia. Persistencia de vista/sesión debe tener fallback seguro ante datos inválidos.

**Complejidad justificada**: Ninguna violación. No se introducen nuevos proyectos, frameworks ni capas backend.

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
│   ├── requirements.md
│   └── data-integrity.md
├── contracts/
│   ├── crm-storage.md
│   ├── ui-contracts.md
│   ├── dashboard-metrics.md
│   ├── corrections-us16-us24.md
│   └── performance.md
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
index.html
src/
├── main.js              # sesión/auth, tema temprano, arranque
├── app.js               # navegación, vistas, formularios, dashboard, búsqueda/listados
├── storage.js           # persistencia, validación, integridad, overview/KPI
├── domain.js            # reglas de dominio y métricas
├── module-config.js     # configuración y campos visibles
├── sanitize.js          # escape/sanitización
└── styles.css           # tokens, layout, componentes, temas

tests/
├── unit/
├── integration/
│   ├── live-dom.js
│   ├── theme.test.js
│   ├── unsaved-changes.test.js
│   └── ...
└── setup/
```

**Decisión de Estructura**: Mantener la aplicación Vite single-page. Las correcciones se aplican sobre la ruta ejecutable real. `src/components/*` permanece histórico/no conectado. Se permite agregar contratos/docs de prueba; no se agregan dependencias.

## Fase 0: Esquema y Investigación

Ver [research.md](research.md) para decisiones detalladas. No quedan NEEDS CLARIFICATION críticos para planificar; las decisiones de diseño quedan fijadas con alternativas.

### Decisiones clave (resumen)

| Área | Decisión | Motivo |
|---|---|---|
| Tema oscuro | Completar cobertura con variables CSS/tokens y clases semánticas; evitar colores fijos en componentes críticos | FR-074/075, bajo riesgo, coherente con `crm.theme` existente |
| Fuente dashboard | Unificar oportunidades guardadas por UI con la fuente que consume `getCRMOverview()`; adaptar/migrar datos legacy de documentos CRM a registros/opportunities canónicas del overview | FR-076/077; corrige divergencia real |
| Recordar sesión | Implementar preferencia real: marcada = `localStorage`, desmarcada = `sessionStorage`; logout limpia ambas | FR-078; respeta control existente |
| Confirmación eliminación | Reemplazar `window.confirm` por diálogo modal CRM reutilizable con focus trap/Escape/restore focus | FR-079/080/087 |
| Búsqueda | Extender `#view-search` a clientes+oportunidades con tipo, campos relevantes y navegación a registro | FR-081/082 |
| Listados escalables | Agregar tabla/lista con acciones por fila en Clientes/Oportunidades; mantener selectores solo como compatibilidad secundaria si no estorban | FR-083/084 |
| Vista activa | Persistir `erp.activeView` (o clave equivalente) y restaurar con whitelist + auth guard | FR-085 |
| Accesibilidad formularios | `aria-invalid`, `aria-describedby`, primer error enfocado/anunciado; focus trap en todos los diálogos | FR-086/087 |
| Moneda | Definir regla MVP: montos individuales muestran moneda registrada/normalizada; KPI agregados en moneda base CLP con etiqueta clara; evitar mezcla ambigua | FR-088 |

## Fase 1: Diseño y Contratos

### Artefactos generados

- [data-model.md](data-model.md): entidades/estado afectado por US16–US24.
- [contracts/corrections-us16-us24.md](contracts/corrections-us16-us24.md): contratos de UI, almacenamiento, navegación, accesibilidad y moneda.
- [contracts/dashboard-metrics.md](contracts/dashboard-metrics.md): actualizar regla de fuente canónica.
- [contracts/crm-storage.md](contracts/crm-storage.md): actualizar claves de sesión/vista y regla de oportunidad/dashboard.
- [contracts/ui-contracts.md](contracts/ui-contracts.md): actualizar selectores/ARIA/diálogos/listados/búsqueda.
- [quickstart.md](quickstart.md): escenarios manuales verificables para US16–US24.

### Diseño por historia

#### US16 - Tema oscuro coherente (P1, FR-074/075, SC-022)
- Auditar `styles.css` por colores fijos en topbar, form sections, botones secundarios, empty states, badges, login, dialogs, search items.
- Añadir variables faltantes para superficies/elevación/estado en dark mode.
- Verificar contraste en estados: error, vacío, badge, focus-visible, disabled.
- Pruebas: integración DOM real activa tema oscuro y comprueba clases/variables/atributos clave; snapshot de estilos computados en elementos críticos.

#### US17 - Dashboard coherente con oportunidades (P1, FR-076/077, SC-023)
- Identificar divergencia: `handleDocumentSubmit` escribe `erp_base_module:documents`; dashboard lee `getCRMOverview()` desde `crm_module:*`.
- Decisión: al guardar oportunidad desde formulario, persistir también en fuente canónica de oportunidades usada por overview, o hacer que overview lea documentos normalizados de oportunidad. Preferir un adaptador único con tests de compatibilidad; evitar doble verdad.
- Recalcular KPIs al mostrar dashboard y tras crear/editar/eliminar.
- Pruebas: integración crea oportunidad por UI y verifica KPIs; unitarias para overview con registros normalizados.

#### US18 - Recordar mi sesión (P2, FR-078, SC-024)
- `index.html` ya tiene `login-remember`; `main.js` siempre usa `localStorage`.
- Implementar: leer preferencia marcada; marcada => `localStorage.setItem(AUTH_STORAGE_KEY, user)` y limpiar session; desmarcada => `sessionStorage.setItem(AUTH_STORAGE_KEY, user)` y limpiar local. `isAuthenticated()`/restore revisa ambas con prioridad definida.
- Logout limpia ambas y preferencia de menú como hoy.
- Pruebas: integración jsdom simulando checkbox marcado/desmarcado; validar que no se restaura tras logout.

#### US19 - Confirmación accesible de eliminación (P2, FR-079/080, SC-025)
- Reemplazar `globalThis.confirm` por diálogo modal reutilizable `#confirm-dialog` (o reutilizar patrón de `#unsaved-dialog` con variante destructiva).
- Requisitos: título/mensaje, Cancelar, Eliminar destructivo, focus inicial, Tab/Shift+Tab trap, Escape cancela, restore foco al disparador, `aria-modal`, `role="dialog"`.
- Aplicar a clientes y oportunidades.
- Pruebas: integración teclado y cancel/confirm.

#### US20 - Búsqueda de clientes y oportunidades (P2, FR-081/082, SC-026)
- Extender búsqueda para devolver resultados tipados: `{type:'cliente'|'oportunidad', id, label, detail}`.
- Buscar en campos cliente: nombre, código, email, taxId, categoría, campos personalizados visibles. Oportunidad: serie, folio, estado, cliente asociado, monto, moneda, campos personalizados visibles.
- UI: badge/tipo por resultado; click navega a vista y carga registro.
- Mantener estado vacío claro.
- Pruebas: integración con datos sembrados y navegación por resultado.

#### US21 - Listados escalables (P2, FR-083/084, SC-027)
- Añadir contenedores de lista/tabla en `#view-entities` y `#view-documents` con filas, columnas clave y acciones Editar/Eliminar.
- Sincronizar con formularios existentes y selección actual.
- Filtro/búsqueda local en vista opcional simple; mínimo cumplir acciones por fila y escalabilidad básica.
- Evitar dependencia exclusiva de `<select>` para gestión principal; se puede conservar select como acceso rápido si no rompe UX.
- Pruebas: integración con 30+ registros, editar/eliminar desde fila.

#### US22 - Restaurar vista activa (P3, FR-085, SC-028)
- Persistir vista activa válida en `localStorage` (p.ej. `erp.activeView`) al navegar.
- Al iniciar app autenticada, leer y validar contra whitelist `VIEW_KEYS`; fallback dashboard.
- No restaurar antes de auth.
- Pruebas: integración recarga simulada/restauración con `reloadLiveDom` o re-import controlado.

#### US23 - Accesibilidad completa en formularios y diálogos (P1, FR-086/087, SC-029)
- Formularios: al validar, set `aria-invalid="true"` en campos con error; `aria-describedby` apuntando a `error-*`; limpiar al corregir.
- Enviar con errores: foco al primer campo inválido.
- Diálogos: focus trap reutilizable para `#unsaved-dialog` y diálogo de eliminación; Escape comportamiento definido; restore focus.
- `unsaved-dialog`: ya tiene Escape implícito? Actualmente no; añadir. También asegurar foco inicial.
- Pruebas: integración con keyboard/focus.

#### US24 - Moneda clara y consistente (P3, FR-088, SC-030)
- Definir regla MVP: moneda base `CLP` para KPIs agregados; montos individuales muestran moneda del registro (`currency`/`entity-currency`) con formato consistente; si moneda no soportada o vacía, normalizar a base con etiqueta.
- `formatCurrency` debe aceptar moneda o usar regla base; dashboard etiqueta indica moneda base.
- Evitar hardcode visual contradictorio.
- Pruebas: unitarias de formato y integración de UI.

## Comprobación de Constitución Post-Diseño

- **I. Calidad**: PASA. Diseño favorece helpers pequeños y contratos claros; se evita refactor grande.
- **II. Pruebas**: PASA. Cada FR nuevo mapeado a pruebas planificadas en quickstart/contratos.
- **III. UX**: PASA. Contratos cubren consistencia visual, ARIA y estados vacíos/errores.
- **IV. Rendimiento**: PASA. Búsqueda/listados en memoria con filtros simples; sin dependencias nuevas; render acotado por DOM existente.


## Alineación de integridad (Fase 34, tasks.md)

Secuencia/dependencias de Fase 34 ya definidas en `tasks.md`:
- **T190 → T191 (US8, FR-072)**: pruebas primero, implementación después; flujo observable de bloqueo/reintento/reset en `tests/integration/storage-recovery.test.js`, `src/storage.js`, `src/app.js`.
- **T192 → T193 (US6, FR-058)**: pruebas primero, implementación después; aviso no bloqueante de inconsistencia y exclusión de etapas inválidas en `tests/unit/dashboard-metrics.test.js`, `src/domain.js`, `src/storage.js`, `src/app.js`.
- **T189 (US14, FR-070)** y **T194 (US16, FR-073)**: independientes, paralelizables con coordinación de archivos compartidos.

## Fase 2: Planificación de Implementación (entrada para /speckit.tasks)

### Orden recomendado

1. **Base P1**: US23 accesibilidad formularios/diálogos (habilita US19), US16 tema oscuro coherente, US17 dashboard fuente canónica.
2. **P2**: US19 confirmación eliminación (usa patrón US23), US18 recordar sesión, US20 búsqueda unificada, US21 listados escalables.
3. **P3**: US22 restaurar vista activa, US24 moneda consistente.
4. **Cierre**: actualización contratos/docs, quickstart, lint/test/build, revisión manual.

### Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Divergencia entre `erp_base_module:documents` y `crm_module:opportunities` | Definir adaptador canónico y pruebas de migración/compatibilidad; no romper datos existentes |
| Regresiones en tests existentes de theme/unsaved/search | Ejecutar suite dirigida durante implementación; extender contratos, no cambiarlos arbitrariamente |
| `app.js` grande dificulta cambios seguros | Extraer solo helpers puntuales; mantener comportamiento y añadir pruebas antes de editar |
| Accesibilidad incompleta en diálogos custom | Implementar util de focus trap reutilizable y probar Tab/Shift+Tab/Escape/foco retorno |
| Moneda mixta en datos existentes | Regla explícita MVP: agregar en CLP/base; mostrar moneda individual; documentar supuestos |

## Seguimiento de Complejidad

Sin violaciones de constitución.

---

# Cierre de brechas históricas del CRM (integrado de `002-plan.md`)

**Rama/Contexto original**: `main` (sin crear rama) | **Fecha original**: 2026-11-22 | **Spec**: [spec.md](spec.md)  
**Entrada original**: `/specs/001-crm-module/002-spec.md` (ahora fusionada en `spec.md`)

## Resumen del cierre de brechas

Cerrar las brechas reales de las tareas históricas T025, T030, T036, T041, T046, T052, T055, T056, T057, T062, T064 sobre la **ruta ejecutable real** (`index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`). `src/components/*` es histórico/no conectado y queda fuera del plan. No se repite lo ya cubierto: tema, auth, storage recovery, búsqueda/filtros US20/US21/T197 (T051) y validación accesible US23 (T058). La restricción original de "no modificar `specs/001-crm-module`" se conserva como contexto histórico de la feature 002; tras la fusión de 2026-11-23 sus documentos son estos mismos archivos.

Enfoque técnico: extender DOM real con vistas/secciones para empleados, interacciones, ficha 360°, próximos cierres e integridad referencial; aplicar lifecycle configurable en oportunidades; hacer archivado/restauración visible y consistente; agregar prueba de rendimiento DOM real con 500 registros. Los contratos nuevos usan claves propias `crm.gaps002.*`/selectores propios, y no crean una segunda fuente de verdad para KPIs canónicos de 001 (`getCRMOverview()` sigue siendo canónico para el dashboard base; ver FR-076, FR-077 y FR-088 de este plan).

## Contexto Técnico del cierre de brechas

**Lenguaje/Versión**: JavaScript ES modules, HTML5, CSS3; Node/npm (Vite 8, Vitest 4, ESLint 9, jsdom 30).  
**Dependencias Principales**: Ninguna nueva dependencia runtime. Reusar stack existente.  
**Almacenamiento**: `localStorage` existente (`crm_module:*`, `erp_base_module:*`, claves 001) + claves propias de feature para estado UI no canónico: `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.entities`, `crm.gaps002.ui.archivedFilter.employees`. Datos de dominio siguen en stores canónicas existentes (`crm_customers`, `crm_employees`, `crm_opportunities`, `crm_interactions`) vía `src/storage.js`.  
**Pruebas**: Vitest + jsdom, ruta DOM real (`tests/integration/live-dom.js`/mount de app real). Unitarias para reglas puras; integración para UI observable; contrato DOM/storage para nuevos IDs/claves.  
**Plataforma Destino**: Navegador moderno desktop/móvil, app Vite estática.  
**Tipo de Proyecto**: SPA frontend single-file shell (`index.html`) con módulos `src/*`.  
**Objetivos de Rendimiento**: SC-035: con 500 clientes y registros asociados en ruta DOM real, búsqueda/filtro completa <= 10 s y renderizado inicial de listado <= 2 s, medido por prueba automatizada.  
**Restricciones**: Sin backend; sin deps nuevas; no tocar `src/components/*` ni `dist/`; preservar contratos base; accesibilidad por teclado/ARIA en nuevos controles; sin doble verdad de KPIs del dashboard base.  
**Escala/Alcance**: 6 grupos de brechas, 14 FR (FR-089–FR-102), 6 US (US25–US30).

## Comprobación de Constitución del cierre de brechas

*GATE: Pre-fase 0 y post-fase 1 (según el plan 002 original).*

| Principio | Estado | Aplicación |
|---|---|---|
| I. Calidad y mantenibilidad | PASS | Cambios pequeños por grupo, helpers puros en `domain.js/storage.js`, render por sección en `app.js`, IDs/keys documentados en contratos. |
| II. Pruebas primero/verificación | PASS CON PLAN | Cada FR obtiene prueba automatizada antes o junto a implementación; cierre con `npm run test:run`, `npm run lint`, `npm run build`. |
| III. Consistencia UX | PASS | Reusar patrones existentes: formularios, banners, tablas responsivas, estados vacíos, diálogos confirmación, `aria-*`, foco, teclado. |
| IV. Rendimiento y fiabilidad | PASS CON RIESGO CONTROLADO | Render de listados por filas; filtros en memoria con normalización simple; prueba DOM 500 registros; sin recálculos automáticos fuera de eventos/render. |

**Post-diseño (Fase 1)**: PASS. No se introducen nuevos proyectos/capas. Contratos separan estado UI feature (`crm.gaps002.*`) de stores canónicas base.

## Estructura del Proyecto del cierre de brechas

### Documentación (integrada en esta carpeta)

```text
specs/001-crm-module/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md  # documentos fusionados 001 + 002
├── contracts/
│   ├── ui-contracts.md, crm-storage.md    # incluyen las secciones 002 (antes ui-dom.md y storage.md)
│   ├── performance.md                     # contrato 002 de rendimiento DOM
│   ├── dashboard-metrics.md, corrections-us16-us24.md
│   └── ...
└── checklists/
    └── requirements.md                    # lista 001 + notas de auditoría 002
```

### Código fuente (raíz del repositorio)

```text
index.html                 # nuevas vistas/secciones/banners/controles DOM real
src/
├── app.js                 # wiring UI, render, eventos, archivado/restauración, 360, próximos cierres, integridad
├── main.js                # arranque: exponer errores de config normalizada para banner visible
├── storage.js             # CRUD/archive/restore empleados-interacciones, integridad referencial, consultas 360/próximos cierres
├── domain.js              # reglas lifecycle/transiciones, ventana próximos cierres, normalización integridad
├── module-config.js       # ya existe; se consume lifecycle/config errors sin duplicar verdad
├── styles.css             # estilos nuevas vistas/banners/tablas/estados
└── components/*           # HISTÓRICO/NO CONECTADO - NO TOCAR

tests/
├── integration/
│   ├── employees-ui.test.js          # nuevo (DOM real)
│   ├── interactions-ui.test.js       # nuevo
│   ├── opportunities-lifecycle.test.js # nuevo
│   ├── client-360.test.js            # nuevo
│   ├── dashboard-upcoming-integrity.test.js # nuevo
│   ├── archive-restore-ui.test.js    # nuevo
│   └── performance-dom.test.js       # nuevo
└── unit/
    ├── lifecycle-transitions.test.js # nuevo
    └── referential-integrity.test.js # nuevo
```

**Structure Decision**: Mantener SPA Vite single-page. Toda implementación en ruta activa. Tests nuevos orientados a DOM real; tests históricos en `src/components/*` no se usan como objetivo de implementación.

## Fase 0 del cierre de brechas: Esquema e Investigación

Ver [research.md](research.md). Decisiones cierran incógnitas sin NEEDS CLARIFICATION.

| Área | Decisión | Rationale | Alternativa rechazada |
|---|---|---|---|
| Ruta activa | Solo `index.html` + `src/*` | `src/components/*` no está conectado al arranque | Adaptar componentes históricos: duplicaría UI y contratos |
| Estado UI feature | Claves `crm.gaps002.ui.*` en localStorage | Aísla estado de esta feature; evita colisión con 001 | Reusar claves ad-hoc: riesgo de colisión/romper 001 |
| Dashboard canónico | `getCRMOverview()` sigue canónico para KPIs base; próximos cierres/integridad son vistas derivadas con contratos propios | Evita doble verdad de KPIs | Recalcular KPIs en app.js: divergencia |
| Lifecycle | Validar transición con `opportunityLifecycle` (nombre canónico; la configuración `module-config.statusLifecycle` se normaliza como `opportunityLifecycle`); fallback seguro si inválido | Cumple FR-094/FR-095/FR-101 | Hardcodear etapas: ignora configuración |
| Archivado | Soft-delete/archived flag existente; UI agrega restore y filtros archived | Reusa modelo actual y preserva historial | Borrado físico: pierde historial |
| Integridad referencial | Reporte derivado en carga/render, no destructivo | FR-099 seguro y observable | Auto-reparar/borrar: riesgo de pérdida |
| Rendimiento 500 | Prueba automatizada DOM real con `performance.now()` y umbrales SC-035 | Evidencia observable | Solo prueba en memoria: no cubre DOM real |

## Fase 1 del cierre de brechas: Diseño y Contratos

Artefactos: [data-model.md](data-model.md), [contracts/ui-contracts.md](contracts/ui-contracts.md) (sección "Cierre de brechas históricas"), [contracts/crm-storage.md](contracts/crm-storage.md) (sección "Cierre de brechas históricas"), [contracts/performance.md](contracts/performance.md), [quickstart.md](quickstart.md).

### Diseño por grupo

#### Grupo 1 - Empleados con UI real (T025, T055/T056 parcial; US25, FR-089–FR-091)

- **DOM**: agregar nav `#nav-employees`, vista `#view-employees`, formulario `#employee-form`, campos `#employee-id`, `#employee-name`, `#employee-role`, listado `#employee-list`, filtro `#employee-list-filter`, toggle archivados `#employee-show-archived`, empty state `#employee-list-empty`. El estado operativo se gestiona con archivar/restaurar (soft-archive), no con un campo `status` en el formulario.
- **App**: `renderEmployeeList()`, `fillEmployeeForm()`, `resetEmployeeForm()`, submit crea/actualiza; archivar/restaurar por acción de fila; selectores de responsable en oportunidades/interacciones usan solo empleados activos no archivados.
- **Storage**: reusar `loadEmployees/addEmployee/updateEmployee`; agregar `archiveEmployee(id)`, `restoreEmployee(id)`, `loadEmployees({includeArchived})` o filtro equivalente; mantener `deleteEmployee` como alias compatible si ya usado por tests históricos, pero UI usa archivar/restaurar.
- **Pruebas**: integración DOM real CRUD + archive/restore + exclusión en selectores.

#### Grupo 2 - Interacciones con UI real (T036; US26, FR-092–FR-093)

- **DOM**: nav `#nav-interactions`, vista `#view-interactions`, formulario `#interaction-form`, campos `#interaction-id`, `#interaction-client-id`, `#interaction-employee-id`, `#interaction-date`, `#interaction-type`, `#interaction-notes`, listado `#interaction-list`, filtro `#interaction-list-filter`, empty `#interaction-list-empty`.
- **App**: CRUD visible, confirmación de eliminación reutilizando diálogo accesible existente, refresco de historial en ficha 360° y dashboard si aplica.
- **Storage**: reusar add/update/delete/load interactions; validar refs activas; exponer consulta por cliente para 360°.
- **Pruebas**: integración DOM real crear/editar/eliminar, historial visible, estado vacío.

#### Grupo 3 - Flujo completo de oportunidades con lifecycle configurable (T030, T062, T064; US27, FR-094/FR-095/FR-101)

- **DOM**: en `#view-documents` agregar/ajustar control de etapa `#status` gobernado por lifecycle, feedback `#error-status`/`#lifecycle-feedback`, banner config `#config-error-banner` visible cuando `normalizeConfig` reporte errores/fallback.
- **Config/Main**: `src/main.js` captura `loadModuleConfig()` resultado (`config`, `errors`, `usedFallback`/equivalente) y lo pasa a app o lo expone por contrato; `app.js` renderiza banner no bloqueante con detalle accesible.
- **Domain**: función pura `canTransitionOpportunity(from,to,lifecycle)` / `validateOpportunityStageTransition(...)`; normalizar etapas desconocidas con fallback seguro.
- **App**: antes de guardar cambio de etapa, validar transición; si inválida, mostrar mensaje claro, no persistir etapa inválida, mantener foco/ARIA.
- **Storage**: `updateOpportunity`/`updateDocument` rechaza transición inválida cuando se provee lifecycle/contexto; no corrompe registro.
- **Pruebas**: unit lifecycle; integración UI transición permitida/no permitida; banner config visible con config inválida.

#### Grupo 4 - Ficha cliente 360° (T041; US28, FR-096–FR-097)

- **DOM**: botón/acción "Ver ficha" en fila cliente; vista `#view-client-360` con `#client-360-back`, `#client-360-summary`, `#client-360-opportunities`, `#client-360-interactions`, estados vacíos.
- **App**: navegación lista→ficha→lista; al volver con `#client-360-back` se restauran `#entity-list-filter`, el cliente/fila seleccionada (`#entity_id` o `data-selected`) y la vista `#view-entities` activa; esos datos se guardan en `crm.gaps002.ui.clients360` y, sin estado previo, se usa vacío. No alterar `erp.activeView` semántica base salvo compatibilidad.
- **Storage/Domain**: `getCustomer360(customerId)` compone cliente, oportunidades e interacciones (reusar `getCustomerActivity` si encaja).
- **Pruebas**: integración DOM real abrir ficha, ver secciones, volver y conservar filtro/selección visible.

#### Grupo 5 - Dashboard Próximos cierres + Integridad referencial (T046, T057; US29, FR-098–FR-099)

- **DOM**: sección `#upcoming-closures-section`, tabla/lista `#upcoming-closures-list`, empty `#upcoming-closures-empty`; reporte `#integrity-report`, lista `#integrity-report-list`, empty/ok `#integrity-report-empty`.
- **Domain/Storage**: `getUpcomingClosures({windowDays=30, fromDate})` derivado de oportunidades abiertas; `getReferentialIntegrityReport()` retorna hallazgos `{type,id,missingRef,refType,message}`. Ambas funciones son **derivadas/read-only**, no fuente canónica de KPIs base.
- **App**: render al cargar y al mostrar dashboard; click en cierre próximo navega a oportunidad relacionada. Reporte visible pero no bloqueante.
- **Pruebas**: integración DOM real con datos próximos y huérfanos; estados vacíos claros.

#### Grupo 6 - Archivado visible y rendimiento 500 (T052, T055, T056; US30, FR-100/FR-091/FR-102)

- **DOM**: acciones Archivar/Restaurar en filas de clientes/empleados; toggles `#entity-show-archived`, `#employee-show-archived`; badges "Archivado".
- **App**: listas operativas por defecto excluyen archivados; selectores de nuevos registros excluyen archivados; restaurar repuebla.
- **Rendimiento**: optimizar render con DocumentFragment/batch y evitar recomputar colecciones innecesarias; prueba DOM real con 500 clientes + registros asociados, midiendo filtro completo y render inicial con umbrales SC-035.
- **Pruebas**: integración archivado/restauración; integración performance DOM.

## Contratos y no-doble-verdad del cierre de brechas

- **KPIs base canónicos**: `getCRMOverview()`/`getCrmDashboardMetrics()` permanecen fuente canónica para tarjetas KPI existentes. Esta feature no recalcula ni persiste KPI alternativos.
- **Nuevas claves propias**: `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.entities`, `crm.gaps002.ui.archivedFilter.employees`. El reporte de integridad referencial se deriva en cada render/carga; no se persiste en localStorage.
- **Stores canónicas de dominio**: seguir usando `crm_customers`, `crm_employees`, `crm_opportunities`, `crm_interactions` a través de `src/storage.js`.
- **Contratos DOM**: todos los IDs nuevos quedan en `contracts/ui-contracts.md` (sección del cierre de brechas); cualquier cambio requiere actualizar contrato y prueba.

## Estrategia de Pruebas del cierre de brechas

| Tipo | Cobertura | Archivo objetivo |
|---|---|---|
| Unit | transiciones lifecycle, normalización config fallback, integridad referencial, ventana próximos cierres | `tests/unit/lifecycle-transitions.test.js`, `tests/unit/referential-integrity.test.js` |
| Integration DOM | empleados, interacciones, lifecycle UI, 360, dashboard próximos cierres/integridad, archivado/restaurar | `tests/integration/*` nuevos |
| Performance DOM | 500 registros, filtro <=10s, render inicial <=2s | `tests/integration/performance-dom.test.js` |
| Regresión | suites existentes `npm run test:run` | existentes |

## Rollout / Riesgos del cierre de brechas

- **Riesgo**: colisión con contratos base. *Mitigación*: claves `crm.gaps002.*`, suite completa.
- **Riesgo**: `src/app.js` crece. *Mitigación*: funciones pequeñas por grupo y helpers puros en domain/storage.
- **Riesgo**: rendimiento jsdom distinto a browser. *Mitigación*: usar umbrales SC-035 ya definidos como proxy automatizado; evitar asserts frágiles de tiempo sub-ms.
- **Riesgo**: lifecycle inválido bloquea flujo. *Mitigación*: fallback seguro + banner visible + no bloquear CRUD básico.

## Complejidad Tracking del cierre de brechas

Sin violaciones de constitución.
