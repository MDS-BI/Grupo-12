# Plan de Implementación: Módulo CRM (Customer Relationship Management)

**Rama**: `001-crm-module` | **Fecha**: 2026-07-08 | **Actualizada**: 2026-11-21 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificaciones de la funcionalidad desde `/specs/001-crm-module/spec.md` (módulo CRM + interfaz SaaS profesional + correcciones US16–US24)

## Resumen

Desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP que permita administrar clientes, mantener un catálogo de empleados responsables, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta. El MVP estará enfocado en el **frontend**, usará **datos ficticios** y persistirá en el navegador; no incluye backend ni roles, y reutiliza el acceso frontend ya implementado.

El alcance funcional se organiza en las historias de la especificación: gestión de clientes con estado `Posible/Activo/Inactivo`, catálogo de empleados, oportunidades con monto, fecha de cierre y transiciones de etapa (`Evaluación → Propuesta → Negociación → Ganado/Perdido`), registro de interacciones (`Llamada/Correo/Reunión`), ficha 360° del cliente, dashboard con indicadores, búsqueda y filtros, integridad referencial con eliminación lógica, configuración del módulo y un espacio de trabajo consistente.

La extensión del backlog (US16–US24, FR-074–FR-088) incorpora correcciones y mejoras priorizadas: tema oscuro coherente por tokens, dashboard alineado con la fuente de verdad de oportunidades, preferencia “Recordar mi sesión” efectiva, confirmaciones de eliminación accesibles, búsqueda unificada de clientes/oportunidades, listados escalables, restauración de vista activa, accesibilidad completa de formularios/diálogos y regla consistente de moneda.

El modelo de dominio y las reglas se documentan en [data-model.md](data-model.md) y en el MER de referencia [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md).

El trabajo se realiza **sobre el DOM real que se ejecuta** (`index.html`, `src/styles.css`, `src/main.js`, `src/app.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`), no sobre `src/components/*`, que no está conectado al arranque. Las fases 3–13 se conservan como registro histórico; las correcciones nuevas se implementan sobre la ruta activa validada por tests del DOM real. No se introduce backend, framework de UI ni dependencias nuevas. Investigación: [research.md](research.md). Contratos: [ui-contracts.md](contracts/ui-contracts.md), [crm-storage.md](contracts/crm-storage.md) y [dashboard-metrics.md](contracts/dashboard-metrics.md).

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
├── contracts/
│   ├── crm-storage.md
│   ├── ui-contracts.md
│   ├── dashboard-metrics.md
│   └── corrections-us16-us24.md
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
