# Plan de Implementación: Cierre de brechas históricas del CRM

**Rama/Contexto**: `main` (sin crear rama) | **Fecha**: 2026-11-22 | **Spec**: [spec.md](spec.md)  
**Entrada**: `/specs/002-crm-historical-gaps/spec.md`

## Resumen

Cerrar las brechas reales de las tareas históricas T025, T030, T036, T041, T046, T052, T055, T056, T057, T062, T064 sobre la **ruta ejecutable real** (`index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`). `src/components/*` es histórico/no conectado y queda fuera del plan. No se modifica `specs/001-crm-module` ni se repite lo ya cubierto: tema, auth, storage recovery, búsqueda/filtros US20/US21/T197 (T051) y validación accesible US23 (T058).

Enfoque técnico: extender DOM real con vistas/secciones para empleados, interacciones, ficha 360°, próximos cierres e integridad referencial; aplicar lifecycle configurable en oportunidades; hacer archivado/restauración visible y consistente; agregar prueba de rendimiento DOM real con 500 registros. Los contratos nuevos usan claves propias `crm.gaps002.*`/selectores propios, y no crean una segunda fuente de verdad para KPIs canónicos de 001 (`getCRMOverview()` sigue siendo canónico para dashboard 001).

## Contexto Técnico

**Lenguaje/Versión**: JavaScript ES modules, HTML5, CSS3; Node/npm (Vite 8, Vitest 4, ESLint 9, jsdom 30).  
**Dependencias Principales**: Ninguna nueva dependencia runtime. Reusar stack existente.  
**Almacenamiento**: `localStorage` existente (`crm_module:*`, `erp_base_module:*`, claves 001) + claves propias de feature para estado UI no canónico: `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.entities`, `crm.gaps002.ui.archivedFilter.employees`. Datos de dominio siguen en stores canónicas existentes (`crm_customers`, `crm_employees`, `crm_opportunities`, `crm_interactions`) vía `src/storage.js`.  
**Pruebas**: Vitest + jsdom, ruta DOM real (`tests/integration/live-dom.js`/mount de app real). Unitarias para reglas puras; integración para UI observable; contrato DOM/storage para nuevos IDs/claves.  
**Plataforma Destino**: Navegador moderno desktop/móvil, app Vite estática.  
**Tipo de Proyecto**: SPA frontend single-file shell (`index.html`) con módulos `src/*`.  
**Objetivos de Rendimiento**: SC-005: con 500 clientes y registros asociados en ruta DOM real, búsqueda/filtro completa <= 10 s y renderizado inicial de listado <= 2 s, medido por prueba automatizada.  
**Restricciones**: Sin backend; sin deps nuevas; no tocar `src/components/*` ni `specs/001-crm-module`; no crear ramas; preservar contratos 001; accesibilidad por teclado/ARIA en nuevos controles; sin doble verdad de KPIs dashboard 001.  
**Escala/Alcance**: 6 grupos de brechas, 14 FR, 6 US.

## Comprobación de Constitución

*GATE: Pre-fase 0 y post-fase 1.*

| Principio | Estado | Aplicación |
|---|---|---|
| I. Calidad y mantenibilidad | PASS | Cambios pequeños por grupo, helpers puros en `domain.js/storage.js`, render por sección en `app.js`, IDs/keys documentados en contratos. |
| II. Pruebas primero/verificación | PASS CON PLAN | Cada FR obtiene prueba automatizada antes o junto a implementación; cierre con `npm run test:run`, `npm run lint`, `npm run build`. |
| III. Consistencia UX | PASS | Reusar patrones existentes: formularios, banners, tablas responsivas, estados vacíos, diálogos confirmación, `aria-*`, foco, teclado. |
| IV. Rendimiento y fiabilidad | PASS CON RIESGO CONTROLADO | Render de listados por filas; filtros en memoria con normalización simple; prueba DOM 500 registros; sin recálculos automáticos fuera de eventos/render. |

**Post-diseño (Fase 1)**: PASS. No se introducen nuevos proyectos/capas. Contratos separan estado UI feature (`crm.gaps002.*`) de stores canónicas 001.

## Project Structure

### Documentación (esta feature)

```text
specs/002-crm-historical-gaps/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-dom.md
│   ├── storage.md
│   └── performance.md
└── tasks.md             # creado por /speckit.tasks, no por /speckit.plan
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

## Fase 0: Esquema e Investigación

Ver [research.md](research.md). Decisiones cierran incógnitas sin NEEDS CLARIFICATION.

| Área | Decisión | Rationale | Alternativa rechazada |
|---|---|---|---|
| Ruta activa | Solo `index.html` + `src/*` | `src/components/*` no está conectado al arranque | Adaptar componentes históricos: duplicaría UI y contratos |
| Estado UI feature | Claves `crm.gaps002.ui.*` en localStorage | Aísla estado de esta feature; evita colisión con 001 | Reusar claves ad-hoc: riesgo de colisión/romper 001 |
| Dashboard canónico | `getCRMOverview()` sigue canónico para KPIs 001; próximos cierres/integridad son vistas derivadas con contratos propios | Evita doble verdad de KPIs | Recalcular KPIs en app.js: divergencia |
| Lifecycle | Validar transición con `opportunityLifecycle` (nombre canónico; la configuración `module-config.statusLifecycle` se normaliza como `opportunityLifecycle`); fallback seguro si inválido | Cumple FR-006/007/013 | Hardcodear etapas: ignora configuración |
| Archivado | Soft-delete/archived flag existente; UI agrega restore y filtros archived | Reusa modelo actual y preserva historial | Borrado físico: pierde historial |
| Integridad referencial | Reporte derivado en carga/render, no destructivo | FR-011 seguro y observable | Auto-reparar/borrar: riesgo de pérdida |
| Rendimiento 500 | Prueba automatizada DOM real con `performance.now()` y umbrales SC-005 | Evidencia observable | Solo prueba en memoria: no cubre DOM real |

## Fase 1: Diseño y Contratos

Artefactos: [data-model.md](data-model.md), [contracts/ui-dom.md](contracts/ui-dom.md), [contracts/storage.md](contracts/storage.md), [contracts/performance.md](contracts/performance.md), [quickstart.md](quickstart.md).

### Diseño por grupo

#### Grupo 1 - Empleados con UI real (T025, T055/T056 parcial)

- **DOM**: agregar nav `#nav-employees`, vista `#view-employees`, formulario `#employee-form`, campos `#employee-id`, `#employee-name`, `#employee-role`, listado `#employee-list`, filtro `#employee-list-filter`, toggle archivados `#employee-show-archived`, empty state `#employee-list-empty`. El estado operativo se gestiona con archivar/restaurar (soft-archive), no con un campo `status` en el formulario.
- **App**: `renderEmployeeList()`, `fillEmployeeForm()`, `resetEmployeeForm()`, submit crea/actualiza; archivar/restaurar por acción de fila; selectores de responsable en oportunidades/interacciones usan solo empleados activos no archivados.
- **Storage**: reusar `loadEmployees/addEmployee/updateEmployee`; agregar `archiveEmployee(id)`, `restoreEmployee(id)`, `loadEmployees({includeArchived})` o filtro equivalente; mantener `deleteEmployee` como alias compatible si ya usado por tests históricos, pero UI usa archivar/restaurar.
- **Pruebas**: integración DOM real CRUD + archive/restore + exclusión en selectores.

#### Grupo 2 - Interacciones con UI real (T036)

- **DOM**: nav `#nav-interactions`, vista `#view-interactions`, formulario `#interaction-form`, campos `#interaction-id`, `#interaction-client-id`, `#interaction-employee-id`, `#interaction-date`, `#interaction-type`, `#interaction-notes`, listado `#interaction-list`, filtro `#interaction-list-filter`, empty `#interaction-list-empty`.
- **App**: CRUD visible, confirmación de eliminación reutilizando diálogo accesible existente, refresco de historial en ficha 360° y dashboard si aplica.
- **Storage**: reusar add/update/delete/load interactions; validar refs activas; exponer consulta por cliente para 360°.
- **Pruebas**: integración DOM real crear/editar/eliminar, historial visible, estado vacío.

#### Grupo 3 - Flujo completo de oportunidades con lifecycle configurable (T030, T062, T064)

- **DOM**: en `#view-documents` agregar/ajustar control de etapa `#status` gobernado por lifecycle, feedback `#error-status`/`#lifecycle-feedback`, banner config `#config-error-banner` visible cuando `normalizeConfig` reporte errores/fallback.
- **Config/Main**: `src/main.js` captura `loadModuleConfig()` resultado (`config`, `errors`, `usedFallback`/equivalente) y lo pasa a app o lo expone por contrato; `app.js` renderiza banner no bloqueante con detalle accesible.
- **Domain**: función pura `canTransitionOpportunity(from,to,lifecycle)` / `validateOpportunityStageTransition(...)`; normalizar etapas desconocidas con fallback seguro.
- **App**: antes de guardar cambio de etapa, validar transición; si inválida, mostrar mensaje claro, no persistir etapa inválida, mantener foco/ARIA.
- **Storage**: `updateOpportunity`/`updateDocument` rechaza transición inválida cuando se provee lifecycle/contexto; no corrompe registro.
- **Pruebas**: unit lifecycle; integración UI transición permitida/no permitida; banner config visible con config inválida.

#### Grupo 4 - Ficha cliente 360° (T041)

- **DOM**: botón/acción "Ver ficha" en fila cliente; vista `#view-client-360` con `#client-360-back`, `#client-360-summary`, `#client-360-opportunities`, `#client-360-interactions`, estados vacíos.
- **App**: navegación lista→ficha→lista; al volver con `#client-360-back` se restauran `#entity-list-filter`, el cliente/fila seleccionada (`#entity_id` o `data-selected`) y la vista `#view-entities` activa; esos datos se guardan en `crm.gaps002.ui.clients360` y, sin estado previo, se usa vacío. No alterar `erp.activeView` semántica 001 salvo compatibilidad.
- **Storage/Domain**: `getCustomer360(customerId)` compone cliente, oportunidades e interacciones (reusar `getCustomerActivity` si encaja).
- **Pruebas**: integración DOM real abrir ficha, ver secciones, volver y conservar filtro/selección visible.

#### Grupo 5 - Dashboard Próximos cierres + Integridad referencial (T046, T057)

- **DOM**: sección `#upcoming-closures-section`, tabla/lista `#upcoming-closures-list`, empty `#upcoming-closures-empty`; reporte `#integrity-report`, lista `#integrity-report-list`, empty/ok `#integrity-report-empty`.
- **Domain/Storage**: `getUpcomingClosures({windowDays=30, fromDate})` derivado de oportunidades abiertas; `getReferentialIntegrityReport()` retorna hallazgos `{type,id,missingRef,refType,message}`. Ambas funciones son **derivadas/read-only**, no fuente canónica de KPIs 001.
- **App**: render al cargar y al mostrar dashboard; click en cierre próximo navega a oportunidad relacionada. Reporte visible pero no bloqueante.
- **Pruebas**: integración DOM real con datos próximos y huérfanos; estados vacíos claros.

#### Grupo 6 - Archivado visible y rendimiento 500 (T052, T055, T056)

- **DOM**: acciones Archivar/Restaurar en filas de clientes/empleados; toggles `#entity-show-archived`, `#employee-show-archived`; badges "Archivado".
- **App**: listas operativas por defecto excluyen archivados; selectores de nuevos registros excluyen archivados; restaurar repuebla. 
- **Rendimiento**: optimizar render con DocumentFragment/batch y evitar recomputar colecciones innecesarias; prueba DOM real con 500 clientes + registros asociados, midiendo filtro completo y render inicial con umbrales SC-005.
- **Pruebas**: integración archivado/restauración; integración performance DOM.

## Contratos y no-doble-verdad

- **KPIs 001 canónicos**: `getCRMOverview()`/`getCrmDashboardMetrics()` permanecen fuente canónica para tarjetas KPI existentes. Esta feature no recalcula ni persiste KPI alternativos.
- **Nuevas claves propias**: `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.entities`, `crm.gaps002.ui.archivedFilter.employees`. El reporte de integridad referencial se deriva en cada render/carga; no se persiste en localStorage. 
- **Stores canónicas de dominio**: seguir usando `crm_customers`, `crm_employees`, `crm_opportunities`, `crm_interactions` a través de `src/storage.js`.
- **Contratos DOM**: todos los IDs nuevos quedan en `contracts/ui-dom.md`; cualquier cambio requiere actualizar contrato y prueba.

## Estrategia de Pruebas

| Tipo | Cobertura | Archivo objetivo |
|---|---|---|
| Unit | transiciones lifecycle, normalización config fallback, integridad referencial, ventana próximos cierres | `tests/unit/lifecycle-transitions.test.js`, `tests/unit/referential-integrity.test.js` |
| Integration DOM | empleados, interacciones, lifecycle UI, 360, dashboard próximos cierres/integridad, archivado/restaurar | `tests/integration/*` nuevos |
| Performance DOM | 500 registros, filtro <=10s, render inicial <=2s | `tests/integration/performance-dom.test.js` |
| Regresión | suites existentes `npm run test:run` | existentes |

## Rollout / Riesgos

- **Riesgo**: colisión con contratos 001. *Mitigación*: claves `crm.gaps002.*`, no editar spec 001, correr suite completa.
- **Riesgo**: `src/app.js` crece. *Mitigación*: funciones pequeñas por grupo y helpers puros en domain/storage.
- **Riesgo**: rendimiento jsdom distinto a browser. *Mitigación*: usar umbrales SC-005 ya definidos como proxy automatizado; evitar asserts frágiles de tiempo sub-ms.
- **Riesgo**: lifecycle inválido bloquea flujo. *Mitigación*: fallback seguro + banner visible + no bloquear CRUD básico.

## Complejidad Tracking

Sin violaciones de constitución.
