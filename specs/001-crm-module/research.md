# Investigación: Módulo CRM (Customer Relationship Management)

> **Nota de fusión (2026-11-23)**: este documento integra el contenido íntegro de `002-research.md` (decisiones D-001 a D-009) en la sección final. Las referencias FR/SC de esa feature se renombraron a FR-089–FR-102 / SC-031–SC-035; las decisiones base se conservan sin cambios.

> **Actualización (2026-11-24)**: se añaden decisiones para US31 (recuadro «Contáctanos», [spec.md](spec.md)). La spec asigna `FR-103`/`SC-036` a US31; se conserva `US31/CA-31.1–CA-31.3` como referencia original.

## Decisión: Usar Vite con HTML, CSS y JavaScript vanilla

**Justificación**: El alcance del MVP es un módulo CRM de frontend con datos ficticios. Vite proporciona un flujo de desarrollo rápido y una compilación simple sin añadir un framework pesado. JavaScript vanilla mantiene el módulo fácil de entender, probar y extender por otros módulos ERP.

**Alternativas consideradas**

- React o Vue: mejor ecosistema de componentes, pero añade abstracción y dependencias innecesarias para el alcance actual.
- HTML estático sin Vite: más simple, pero Vite ofrece un mejor flujo de desarrollo y un paso de construcción para crecimiento futuro.
- Persistencia con backend y base de datos: innecesaria para un módulo de espacio único; la capa de almacenamiento está aislada, por lo que un backend puede introducirse más adelante sin reescribir la lógica de dominio.

## Decisiones

- **Vite + JavaScript vanilla**: seleccionados para un arranque rápido, artefactos estáticos simples y configuración mínima. Se prefirió sobre React/Vue para evitar dependencias innecesarias.
- **Vitest + jsdom**: seleccionados para validar reglas de negocio, búsqueda, filtrado, integridad referencial y comportamiento de la interfaz sin depender de un navegador real.
- **Persistencia en `localStorage`**: adecuada para la entrega MVP, datos ficticios y ejecución local sin backend. Las claves con prefijo `crm_module:` evitan colisiones; se mantienen claves `erp_base_module:*` solo para compatibilidad.
- **Alcance histórico vs FR-070–FR-073**: cuando exista conflicto, prevalecen las salvaguardas transversales de `spec.md` (confirmación de salida dirty, conservación de huérfanos, recuperación explícita ante corrupción con criterios/categorías/fiabilidad, persistencia/aplicación temprana de tema y accesibilidad asociada) sobre comportamientos legacy o supuestos previos.

- **Eliminación lógica**: clientes y empleados se archivan (`archived = true`) en lugar de eliminarse físicamente; sus oportunidades e interacciones se conservan íntegras. Se eligió sobre la eliminación en cascada para preservar el historial y la trazabilidad. Las oportunidades e interacciones sí admiten eliminación física.
- **Correo único**: `storage.js` normaliza (trim + minúsculas) y rechaza duplicados en alta y edición, incluyendo correos de clientes archivados.
- **Integridad referencial**: solo se pueden asignar clientes y empleados existentes y no archivados a nuevas oportunidades e interacciones. Si al cargar se detecta una referencia inexistente, se reporta visiblemente.
- **Transiciones de oportunidad**: validadas en `domain.js`/`storage.js`, permitiendo solo `Evaluación → Propuesta → Negociación → Ganado/Perdido` y ningún cambio desde etapas terminales.
- **Cálculo de dashboard**: `computeDashboardMetrics()` deriva indicadores de los datos actuales al renderizar o al entrar al dashboard; no se recalcula automáticamente mientras el dashboard permanece abierto.
- **Campos personalizados**: `ModuleConfig.customFields` se aplican en formularios, listas, validación y búsqueda; los valores se almacenan junto al registro base.
- **Configuración inválida**: se valida al cargar, se reportan errores visibles y se hace fallback controlado a los valores predeterminados.
- **Saneamiento XSS**: toda cadena introducida por el usuario se escapa antes de insertarse en el DOM; no se usa `innerHTML` con datos sin sanear.
- **Rendimiento**: búsqueda, filtros y renderizado se validan con 500 clientes y sus registros asociados (≤10 s búsqueda, ≤2 s renderizado inicial).
- **Accesibilidad**: etiquetas asociadas a campos, orden de foco lógico, `aria-current` en la navegación, encabezados semánticos y contraste suficiente.

## Decisiones de la interfaz SaaS

- **Selector de iconos**: SVG inline con `stroke="currentColor"` y tamaños controlados por CSS.
- **Ancho de la barra lateral**: 260 px expandida y 64 px contraída en escritorio; capa superpuesta a ≤ 900 px.
- **Persistencia del estado del menú**: `sessionStorage['erp.sidebarCollapsed']`, lectura antes de enlazar eventos, escritura en cada alternancia y borrado en cierre de sesión.
- **Fuente de métricas del Dashboard**: `getCRMOverview()` (base canónica) y `computeConversionRate()` para tasa de conversión. Las vistas no deben crear una fuente paralela.
- **Adaptador del formulario estático**: el alta/edición de `#entity-form` se sincroniza con la fuente canónica que alimenta los KPI.
- **Codificación y mojibake**: `<meta charset="UTF-8" />`, revisión de literales en español, inserción de texto con `textContent` y prueba contra U+FFFD/secuencias mojibake.

## Decisiones US31 (recuadro «Contáctanos»)

### US31.1 Ubicación en la vista de inicio

- **Decisión**: renderizar dos instancias del mismo recuadro desde una única fuente: `#login-contact-info` en `.login-form-panel` tras `.login-footer` para visitantes, y `#dashboard-contact-info` dentro de `#view-dashboard` tras `.welcome-banner` para usuarios autenticados.
- **Rationale**: la spec dice «usuario o visitante» y «pantalla principal / login o dashboard inicial según corresponda». El login y el shell autenticado son mutuamente excluyentes, y `erp.activeView` puede restaurar una vista distinta del dashboard; una sola ubicación dejaría el recuadro invisible para parte de los usuarios. Poner la instancia del dashboard dentro de `#view-dashboard` preserva el bloqueo de corrupción de FR-072.
- **Alternativas consideradas**: solo login (invisible tras autenticarse); solo dashboard (invisible para visitantes); barra lateral/shell global (fuera del alcance «inicio» y visible en cada pantalla). Se descartan por cobertura incompleta o alcance excesivo.

### US31.2 Fuente de los datos de contacto

- **Decisión**: contenido estático e inmutable en un módulo local `src/contact-info.js`, con datos ficticios de demostración: correo `contacto@crm.demo`, teléfono `+56 2 1234 5678`, dirección `Av. Providencia 1234, Santiago, Chile` y horario `Lunes a viernes, 09:00–18:00`. El helper escribe los valores con `textContent`; no hay `localStorage`, `sessionStorage`, `crm.gaps002.ui.*`, configuración ni bandera de descarte.
- **Rationale**: son datos de soporte fijos, no entidades con identidad/CRUD ni preferencias de usuario. La ruta activa tiene un defecto conocido donde `loadModuleConfig()` es async pero se consume como síncrono, por lo que depender de config haría que el contenido desapareciera silenciosamente. Una clave de storage añadiría categorías fuera de la validación FR-072.
- **Alternativas consideradas**: literal HTML duplicado en `index.html` (riesgo de divergencia entre las dos instancias); configuración `ModuleConfig` (no fiable en la ruta actual y fuera de XR-001–XR-005); almacenamiento con dismiss (sin requisito en la spec y más estado que mantener). Se elige el módulo estático único.

### US31.3 Iconografía, tema y responsive

- **Decisión**: cuatro SVG inline por instancia con `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `aria-hidden="true"`, `focusable="false"` y clase `.contact-icon`; estilos con tokens (`--panel`, `--border`, `--text`, `--muted`, `--accent-soft`, `--shadow-card`, `--radius-*`) y grid compacto que se apila a ≤900 px y ≤640 px.
- **Rationale**: reutiliza la convención SVG existente y evita fondos claros fijos en dark mode (US16); el box es decorativo/no interactivo y no debe añadir foco ni depender del color para comunicar.
- **Alternativas consideradas**: librería de iconos (dependencia nueva); imágenes raster (no escalables y rompen convención); estados hover/click (no pedidos por la spec). Se descartan.

### US31.4 Verificación

- **Decisión**: `tests/unit/contact-box-contract.test.js` comprueba literales UTF-8, atributos SVG y reglas CSS responsive; `tests/integration/contact-box.test.js` comprueba visibilidad por auth, coincidencia de los cuatro campos entre login y dashboard, `aria-labelledby` resuelto y ausencia de claves nuevas de storage; `tests/unit/svg-icon-contract.test.js` incorpora `.contact-icon svg`.
- **Rationale**: jsdom no evalúa media queries, por lo que el responsive se valida por contrato de código CSS igual que `layout-contract.test.js`, mientras que la visibilidad y accesibilidad se validan sobre el DOM real mediante `live-dom.js`.
- **Alternativas consideradas**: solo revisión manual (no repetible); snapshot visual (incompatible con la toolchain actual). Se prefiere contrato + integración.

## Decisiones US16–US24 (correcciones incrementales)

### US16 - Tema oscuro coherente

- **Decisión**: Completar el dark mode mediante tokens/variables CSS y reemplazo de colores fijos en componentes críticos (`.topbar`, `.form-section`, `.action-button`, `.empty-state`, `.search-*`, `.confirm-dialog-card`, `.logout-button`, login/form controls, badges/estados).
- **Rationale**: Ya existe `crm.theme`, `applyTheme()` y un script temprano en `index.html`; el defecto actual es cobertura incompleta de estilos, no falta de mecanismo.
- **Alternativas**: Crear una hoja de tema separada (más mantenimiento); usar clases por componente sin variables (propenso a regresión). Se descarta duplicar lógica JS.

### US17 - Dashboard coherente con oportunidades gestionadas

- **Decisión**: Establecer una única fuente de verdad para oportunidades del dashboard. La UI de oportunidades debe persistir en la estructura que `getCRMOverview()` consume (`crm_module:opportunities`) mediante un adaptador de normalización; `erp_base_module:documents` puede mantenerse solo como compatibilidad temporal si se sincroniza desde la misma operación.
- **Rationale**: Hoy `handleDocumentSubmit()` guarda en documentos base y el dashboard lee overview CRM, causando KPIs desactualizados. La corrección debe eliminar la divergencia, no duplicar cálculos.
- **Alternativas**: Hacer que `getCRMOverview()` lea también documentos base (rápido pero perpetúa dualidad); migración completa a CRM opportunities (más limpia). Se prefiere adaptador canónico con sincronización en una sola operación y pruebas de regresión.

### US18 - Recordar mi sesión

- **Decisión**: Implementar persistencia condicionada por `#login-remember`. Marcado: guardar sesión en `localStorage` y limpiar copia en `sessionStorage`; desmarcado: guardar en `sessionStorage` y limpiar `localStorage`. `isAuthenticated()`/arranque consulta ambas. Cierre de sesión limpia ambas.
- **Rationale**: El control ya existe en UI; la expectativa del usuario y FR-078 favorecen comportamiento real. `sessionStorage` representa sesión de navegador/pestaña; es el mejor ajuste frontend sin backend.
- **Alternativas**: Eliminar checkbox (alcance menor, pero pierde funcionalidad visible); cookie con expiración (innecesaria en MVP frontend). Se descarta eliminar por ahora.

### US19 - Confirmación de eliminación accesible

- **Decisión**: Reemplazar `window.confirm()` por un diálogo modal del CRM reutilizable, con `role="dialog"`, `aria-modal="true"`, mensaje, Confirmar/Cancelar, focus trap, Escape, y restauración de foco al disparador.
- **Rationale**: `confirm()` no es estilizable, no consistente, y tiene accesibilidad/comportamiento variable. El proyecto ya tiene patrón de diálogo (`#unsaved-dialog`).
- **Alternativas**: Mantener `confirm()` (incumple FR-079/080); crear diálogo por entidad (duplicación). Se elige componente/patrón reutilizable.

### US20 - Búsqueda de clientes y oportunidades

- **Decisión**: Extender la búsqueda a resultados tipados de clientes y oportunidades. Cada resultado muestra tipo, etiqueta principal y detalle; al seleccionar navega a la vista correspondiente y precarga el registro.
- **Rationale**: FR-081/082 exigen alcance claro y navegación. La vista ya existe (`#view-search`).
- **Alternativas**: Dos cajas de búsqueda separadas (más UI, menos simple); solo aclarar texto (no cumple valor). Se elige búsqueda unificada con tipo visible.

### US21 - Listas escalables para editar/eliminar

- **Decisión**: Añadir listados/tablas en Clientes y Oportunidades con acciones por fila (Editar/Eliminar). El `<select>` existente puede mantenerse temporalmente como compatibilidad, pero la gestión principal pasa a la lista.
- **Rationale**: Selects no escalan y FR-083/084 piden gestión por fila y sincronización con formulario.
- **Alternativas**: Solo mejorar select con búsqueda (insuficiente); virtualización compleja (innecesaria para 50-500 en MVP). Se usa renderizado simple en memoria.

### US22 - Restaurar vista activa tras recargar

- **Decisión**: Persistir la última vista interna válida en `localStorage` (clave dedicada, p.ej. `erp.activeView`) al navegar; restaurar al iniciar solo si autenticado y vista en whitelist; fallback a dashboard.
- **Rationale**: Mejora continuidad y es de bajo riesgo con whitelist/fallback.
- **Alternativas**: Usar `location.hash` (visible pero cambia contrato de URL); `sessionStorage` (no cubre recarga con nueva sesión navegador según expectativa; localStorage es aceptable para vista UI). Se elige `localStorage` con validación.

### US23 - Accesibilidad completa en formularios y diálogos

- **Decisión**: Estandarizar accesibilidad: campos inválidos reciben `aria-invalid="true"` y `aria-describedby` al mensaje; foco al primer inválido en submit; todos los diálogos modales usan focus trap, Escape, y restauración de foco. `#unsaved-dialog` debe alinearse también.
- **Rationale**: FR-086/087 y SC-029 requieren comportamiento verificable por teclado/AT.
- **Alternativas**: Solo `role="alert"` (insuficiente para asociación de campo); librería de focus trap (dependencia nueva, innecesaria). Se implementa utilidad pequeña local.

### US24 - Moneda clara y consistente

- **Decisión**: Regla MVP explícita: KPI agregados del dashboard se expresan en moneda base `CLP` (etiqueta visible) y no mezclan monedas. Montos individuales muestran la moneda del registro cuando exista; si falta, se normaliza a CLP. `formatCurrency` recibe moneda/config.
- **Rationale**: Hay ambigüedad actual: `formatCurrency()` fija CLP, formularios permiten capturar moneda.
- **Alternativas**: Conversión automática multi-moneda (fuera de MVP, requiere tasas); bloquear captura a CLP solamente (simple, pero menos flexible). Se elige regla clara con normalización y etiquetado; si se detectan monedas mixtas, agregados usan solo CLP con nota/normalización definida por implementación y tests.

## Riesgos / Deuda conocida

- `src/components/*` es arquitectura histórica no conectada; no se debe reactivar.
- Existe dualidad `erp_base_module:*` y `crm_module:*`; US17 debe reducirla sin romper tests heredados.
- `app.js` concentra mucha lógica; los cambios deben ser quirúrgicos y cubrirse con pruebas.
- La accesibilidad de diálogos custom requiere cuidado con foco y listeners para no filtrar eventos globales.
- US31 depende de que el contenido se renderice desde una sola fuente; duplicar literales en las dos vistas rompería el contrato de igualdad.
- La spec asigna `FR-103`/`SC-036` a US31: conservar `US31/CA-31.1–CA-31.3` en plan/contratos como criterios originales y verificar la trazabilidad en `spec.md`.

## Decisiones del cierre de brechas históricas (integradas de `002-research.md`)

**Fecha original**: 2026-11-22.

### D-001 Ruta ejecutable real
- **Decision**: Implementar solo en `index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`.
- **Rationale**: Es la ruta conectada al arranque y validada por tests DOM real. `src/components/*` es histórico/no conectado.
- **Alternatives considered**: Migrar/usar `src/components/*`. Rechazado por duplicación y desconexión del runtime real.

### D-002 Fuente canónica de KPIs
- **Decision**: `getCRMOverview()`/`getCrmDashboardMetrics()` en `src/storage.js` siguen siendo la única fuente canónica para KPIs del dashboard base.
- **Rationale**: Evita doble verdad (FR-076/077, FR-088). Próximos cierres e integridad son derivados read-only con contratos propios.
- **Alternatives considered**: Calcular KPIs en `app.js` o nuevo servicio. Rechazado por divergencia.

### D-003 Claves propias de feature
- **Decision**: Estado UI no canónico de esta feature usa prefijo `crm.gaps002.ui.*`.
- **Rationale**: Evita colisiones con claves base (`erp.activeView`, `crm_module:*`, etc.) y facilita limpieza/diagnóstico.
- **Alternatives considered**: Reusar claves existentes o sin prefijo. Rechazado por riesgo de regresión.

### D-004 Modelo de archivado
- **Decision**: Usar soft-archive con `archived: true/false` en clientes y empleados; UI expone Archivar/Restaurar. Historial asociado permanece.
- **Rationale**: Alineado con comportamiento actual de storage (`deleteCustomer/deleteEmployee` ya marcan archived) y FR-090/FR-091/FR-100.
- **Alternatives considered**: Borrado físico. Rechazado por pérdida de historial y riesgo referencial.

### D-005 Lifecycle de oportunidades
- **Decision**: Validar transiciones con `opportunityLifecycle` normalizado (nombre canónico; proviene de `module-config.statusLifecycle` en `module-config.js`) usando función pura de dominio para `canTransition`. En config inválida, fallback seguro + banner visible.
- **Rationale**: Cumple FR-094/FR-095/FR-101 y mantiene reglas testeables.
- **Alternatives considered**: Validar solo en UI; hardcodear etapas. Rechazado por fragilidad y desacople de configuración.

### D-006 Integridad referencial
- **Decision**: Generar reporte read-only en carga/render con hallazgos por registro/referencia faltante; no auto-reparar.
- **Rationale**: FR-099 pide visibilidad; auto-reparación puede borrar datos válidos en casos ambiguos.
- **Alternatives considered**: Reparación automática/silenciosa. Rechazado por riesgo de pérdida.

### D-007 Próximos cierres
- **Decision**: Derivar de oportunidades abiertas con `closeDate` válida dentro de ventana 30 días (`domain/storage`), renderizar sección en dashboard con navegación a oportunidad.
- **Rationale**: Reusa regla existente de overview; añade visibilidad FR-098 sin cambiar KPI canónico.
- **Alternatives considered**: Nueva KPI card o nueva fuente. Rechazado por duplicidad.

### D-008 Rendimiento DOM real 500 registros
- **Decision**: Prueba de integración DOM real que siembra 500 clientes + registros asociados, mide búsqueda/filtro y render inicial con `performance.now()`; umbrales SC-035.
- **Rationale**: Cierra brecha de T052; la prueba existente es en memoria.
- **Alternatives considered**: Solo unit test. Rechazado: no observa DOM.

### D-009 Accesibilidad
- **Decision**: Reusar patrón US23 existente (`aria-invalid`, `aria-describedby`, foco primer error, diálogos accesibles) para nuevas vistas.
- **Rationale**: Consistencia y cumplimiento constitución III; no repetir T058, extenderlo a nuevas pantallas.
- **Alternatives considered**: Validación ad-hoc por vista. Rechazado por inconsistencia.

### Clarificaciones resueltas del cierre de brechas

No quedan NEEDS CLARIFICATION. Supuestos documentados en spec: ventana 30 días, reporte informativo no destructivo, `src/components/*` histórico.

---

## Investigación del Calendario CRM (integrada de `004-crm-calendar/research.md`)

> **Nota de fusión (2026-11-25)**: se incorpora íntegramente la investigación de 004 sin modificar ni eliminar las decisiones previas de este documento; la carpeta original se conserva. Las decisiones D-010–D-017 corresponden a Decisiones 1–8 del documento original. Las referencias a FR/SC se leen con la numeración fusionada (FR-104–FR-121, SC-037–SC-042).

### D-010 Modelo de datos separado para tareas y actividades

- **Decisión**: Crear entidades nuevas `crm_tasks` (agenda personal lateral) y `crm_calendar_activities` (calendario general), en lugar de sobrecargar `crm_interactions`.
- **Justificación**: Las tareas tienen semántica de vencimiento/estado personal (FR-105–FR-108); las actividades incluyen tipos no-interacción (evento, seguimiento, actividad comercial) y rango inicio/fin. Reutilizar interacciones forzaría campos ambiguos y rompería el historial CRM.
- **Alternativas consideradas**: extender `crm_interactions` (rechazado: mezcla planificación, ejecución e historial); solo actividades con flag "tarea" (rechazado: UX lateral personal y reglas de vencimiento distintas).

### D-011 Integración con Interacciones CRM para llamada/reunión

- **Decisión**: Al crear/editar una actividad tipo `call` o `meeting`, crear/actualizar un registro vinculado en `crm_module:interactions` con estado/fecha programada; no capturar resultado/notas de ejecución en el calendario. Eliminar/actualizar en calendario sincroniza el registro vinculado.
- **Justificación**: Cumple la clarificación "planificación primero" y FR-114/FR-118; evita duplicar la captura de resultado.
- **Alternativas consideradas**: duplicar resultado/notas en calendario (rechazado: doble captura); no sincronizar (rechazado: inconsistencia con el historial CRM).

### D-012 Visibilidad personal vs equipo

- **Decisión**: Tareas laterales: solo `ownerUserId === currentUser`. Calendario general: por defecto responsable/participante incluye al usuario actual; el filtro opcional "Equipo/CRM" muestra todas las actividades visibles.
- **Justificación**: Clarificaciones Q3/Q5; equilibra enfoque personal y coordinación comercial.
- **Alternativas consideradas**: todo el equipo por defecto (rechazado: ruido); solo personal sin filtro (rechazado: necesidad de coordinación).

### D-013 Vistas anual/mensual/semanal sin librería externa

- **Decisión**: Implementar las vistas con renderizado propio en `app.js`/HTML/CSS: mensual (grid de 7 columnas), semanal (grid de días con franjas), anual (12 mini-meses con conteo/indicadores y drill-down a mes).
- **Justificación**: El proyecto no usa framework ni librería de calendario; evita una dependencia nueva y mantiene control de accesibilidad y estilos.
- **Alternativas consideradas**: librería externa (rechazada: peso/dependencia y desalineación visual); solo vista mensual (rechazada: FR-109).

### D-014 Regla de vencimiento y estados

- **Decisión**: Tarea `atrasada` si está pendiente y `dueAt < now`; `próxima a vencer` si está pendiente y `now <= dueAt <= now+24h`; exactamente en `now` no es atrasada. Estados mínimos: `pending`, `in_progress`, `completed`, gestionables desde el lateral.
- **Justificación**: FR-106/FR-107 y caso límite determinista.
- **Alternativas consideradas**: umbral configurable (fuera de alcance); incluir completadas por defecto (rechazado por supuesto).

### D-015 Relaciones CRM y contactos

- **Decisión**: Relaciones por referencia tipada `{type: 'customer'|'contact'|'opportunity', id, labelSnapshot?}`. `customer` y `opportunity` usan IDs existentes; `contact` se resuelve a la información de contacto del cliente cuando no exista entidad Contacto separada, almacenando `customerId` y etiqueta.
- **Justificación**: FR-115/FR-120 y el supuesto de contacto no separado; preserva la etiqueta ante archivado o no disponibilidad.
- **Alternativas consideradas**: crear entidad Contacto nueva (rechazado: amplía alcance); solo customer/opportunity (rechazado: requisito explícito de contacto).

### D-016 Persistencia y claves

- **Decisión**: Usar `crm_module:tasks` y `crm_module:calendarActivities`. Incluirlas en la validación/recuperación de storage afectado por FR-072, con arrays vacíos por defecto y migración segura.
- **Justificación**: Alineado con el patrón `crm_module:*` y el contrato de almacenamiento existente.
- **Alternativas consideradas**: claves `erp_base_module:*` (rechazadas por naming CRM actual); localStorage fuera de contrato (rechazado: recuperabilidad inconsistente).

### D-017 Accesibilidad y responsive

- **Decisión**: Controles botón/tab, `aria-label` en navegación de período/vista, grid semántico/roles adecuados, foco gestionado en diálogos y layout CSS que colapsa lateral/general en pantallas estrechas.
- **Justificación**: Principio III, FR-119 y casos límite de teclado/lector de pantalla.
- **Alternativas consideradas**: grid solo visual sin semántica (rechazado por accesibilidad).