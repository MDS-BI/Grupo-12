# Tareas: Módulo CRM (Customer Relationship Management)

**Entrada**: Documentos de diseño desde `/specs/001-crm-module/` (módulo CRM + interfaz SaaS profesional + correcciones US16–US24 + cierre de brechas históricas)
**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio), research.md, data-model.md, contracts/crm-storage.md

> **Nota de fusión (2026-11-23)**: este archivo integra el contenido íntegro de `002-tasks.md` en las Fases 37–45. La numeración es continua: T001–T197 corresponden al plan base y T198–T249 al cierre de brechas históricas (antes T001–T052 de 002). Las historias incorporadas son US25–US30 (antes US1–US6 de 002), con FR-089–FR-102 y SC-031–SC-035.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[USn]**: Historia de usuario de `spec.md` (US1–US30)
- Toda tarea que cambia comportamiento de negocio se acompaña de sus pruebas (Constitución, Principio II)

> **Ruta ejecutable**: las Fases 3–13 conservan el registro histórico de la arquitectura basada en `src/components/*`; no son prerrequisitos bloqueantes. La implementación activa se realiza en el DOM real de Fases 14–22 y 37–45 (`index.html`, `src/`) y sus comportamientos se validan allí. Las tareas pendientes de Fases 3–13 se conservan solo como referencia histórica.

---

## Fase 1: Configuración (Infraestructura Compartida)

**Propósito**: Inicializar la estructura del proyecto Vite y las herramientas compartidas.

- [x] T001 Crear la estructura de la aplicación Vite con `index.html`, `src/`, `tests/` y archivos de configuración
- [x] T002 Instalar las dependencias Vite y Vitest del proyecto
- [x] T003 [P] Configurar linting y formateo para la aplicación JavaScript ligera
- [x] T004 [P] Configurar Vitest con jsdom y el entorno de pruebas en `tests/setup/`

---

## Fase 2: Fundacional (Prerrequisitos Bloqueantes)

**Propósito**: Crear la lógica de dominio, la capa de almacenamiento, la configuración y el esqueleto de los que dependen todas las historias.

- [x] T005 Crear `src/domain.js` con enumeraciones (`Posible/Activo/Inactivo`, `Evaluación/Propuesta/Negociación/Ganado/Perdido`, `Llamada/Correo/Reunión`), la tabla de transiciones de etapa y los cálculos de indicadores (FR-005, FR-006, FR-014, FR-015, FR-016, FR-020, FR-046)
- [x] T006 [P] Añadir pruebas unitarias de dominio: transiciones válidas/inválidas, etapas terminales y cálculos del dashboard en `tests/unit/domain.test.js` (FR-015, FR-016, FR-046, SC-007)
- [x] T007 Crear `src/storage.js` con los repositorios de clientes, empleados, oportunidades e interacciones (ids, timestamps, persistencia en localStorage) (FR-001, FR-007, FR-010, FR-018, FR-033)
- [x] T008 Implementar en `src/storage.js` las validaciones base y la unicidad de correo sin distinguir mayúsculas (FR-004, FR-009, FR-012, FR-013, FR-021, FR-045)
- [x] T009 Implementar en `src/storage.js` la integridad referencial y el bloqueo de referencias a clientes/empleados inexistentes o archivados (FR-025, FR-043)
- [x] T010 Implementar en `src/storage.js` el archivado lógico de clientes y empleados preservando sus oportunidades e interacciones (FR-024, FR-044)
- [x] T011 [P] Añadir pruebas unitarias de almacenamiento: CRUD, validaciones, unicidad, integridad y archivado en `tests/unit/storage.test.js` (FR-004, FR-009, FR-012, FR-013, FR-021, FR-024, FR-025, FR-043, FR-044, FR-045)
- [x] T012 [P] Crear `src/sanitize.js` y sus pruebas unitarias de escape de contenido en `tests/unit/sanitize.test.js` (FR-041)
- [x] T013 [P] Crear `src/module-config.js` con valores predeterminados, validación y reporte de errores, más pruebas en `tests/unit/module-config.test.js` (FR-034, FR-037, XR-005)
- [x] T014 Crear el esqueleto de la aplicación y el enrutamiento por módulos en `src/main.js` y `src/app.js` (FR-033, FR-038)
- [x] T015 [P] Construir la hoja de estilos base (tokens de diseño, formularios, listas, estados vacíos y mensajes) en `src/styles.css`

**Punto de control**: Dominio, almacenamiento, configuración, sanitización y esqueleto listos; los cimientos están cubiertos por pruebas.

---

## Fase 3: Historia de Usuario 1 - Gestionar clientes (Prioridad: P1) 🎯 MVP de datos CRM

**Objetivo**: Registrar, editar y consultar clientes con su información de contacto y estado, garantizando correo único.

**Prueba Independiente**: Un usuario crea un cliente con los campos obligatorios, lo ve en la lista, edita sus datos y comprueba que no puede duplicar un correo.

### Pruebas para la Historia de Usuario 1

- [x] T016 [P] [US1] Añadir pruebas unitarias de alta/edición de cliente, estado por defecto `Posible` y unicidad de correo en `tests/unit/storage.test.js` (FR-001, FR-002, FR-005, FR-045)
- [x] T017 [P] [US1] Añadir pruebas de integración de alta, validación de campos/correo y edición de clientes en `tests/integration/clients.test.js` (FR-001, FR-002, FR-003, FR-004, FR-032, FR-045)

### Implementación de la Historia de Usuario 1

- [x] T018 [P] [US1] Crear `src/components/client-form.js` con campos obligatorios, selector de estado y campos personalizados (FR-001, FR-002, FR-006, FR-036)
- [x] T019 [P] [US1] Crear `src/components/client-list.js` con información clave y estado visible (FR-003)
- [x] T020 [US1] Conectar alta/edición de clientes, mensajes de validación y refresco de lista en `src/app.js` (FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-032) — Cubierto por DOM real (index.html + src/app.js); arquitectura src/components/* histórica.
- [x] T021 [US1] Aplicar sanitización a los datos de cliente antes de renderizarlos (FR-041)

**Punto de control**: La Historia de Usuario 1 está funcional y es comprobable de forma independiente.

---

## Fase 4: Historia de Usuario 2 - Gestionar el catálogo de empleados (Prioridad: P1)

**Objetivo**: Mantener el catálogo de empleados (nombre y cargo) y exponerlo como fuente de responsables.

**Prueba Independiente**: Un usuario crea y edita un empleado, lo ve en el catálogo y puede seleccionarlo como responsable.

### Pruebas para la Historia de Usuario 2

- [x] T022 [P] [US2] Añadir pruebas unitarias del catálogo y validación de nombre/cargo en `tests/unit/storage.test.js` (FR-007, FR-008, FR-009)
- [x] T023 [P] [US2] Añadir pruebas de integración de alta, edición, listado y selección de empleados en `tests/integration/employees.test.js` (FR-007, FR-008, FR-009)

### Implementación de la Historia de Usuario 2

- [x] T024 [P] [US2] Crear `src/components/employee-form.js` y `src/components/employee-list.js` (FR-007, FR-008, FR-009)

**Punto de control**: Las Historias de Usuario 1 y 2 funcionan de forma independiente.

---

## Fase 5: Historia de Usuario 3 - Gestionar oportunidades y su pipeline (Prioridad: P1)

**Objetivo**: Registrar oportunidades vinculadas a cliente y empleado, con monto, fecha de cierre y transiciones de etapa.

**Prueba Independiente**: Un usuario crea una oportunidad válida, la ve en la lista con etapa/monto/fecha y la avanza por las etapas permitidas.

### Pruebas para la Historia de Usuario 3

- [x] T026 [P] [US3] Añadir pruebas unitarias de validación de oportunidad (monto, fecha, referencias) y transiciones permitidas en `tests/unit/opportunity.test.js` (FR-010, FR-011, FR-012, FR-013, FR-015, FR-016)
- [x] T027 [P] [US3] Añadir pruebas de integración de alta, avance de etapas y rechazo de transiciones inválidas en `tests/integration/opportunities.test.js` (FR-010, FR-014, FR-015, FR-016, FR-017, FR-032)

### Implementación de la Historia de Usuario 3

- [x] T028 [P] [US3] Crear `src/components/opportunity-form.js` con cliente, empleado, descripción, monto, fecha y etapa (FR-010, FR-011, FR-012, FR-013, FR-014, FR-036)
- [x] T029 [P] [US3] Crear `src/components/opportunity-list.js` que muestre etapa, monto y fecha estimada de cierre (FR-017)
- [x] T031 [US3] Aplicar sanitización a los datos de oportunidad antes de renderizarlos (FR-041)

**Punto de control**: El pipeline de oportunidades es funcional con transiciones controladas.

---

## Fase 6: Historia de Usuario 4 - Registrar interacciones con clientes (Prioridad: P1)

**Objetivo**: Registrar llamadas, correos y reuniones asociadas a cliente y empleado, con historial trazable.

**Prueba Independiente**: Un usuario registra una interacción válida, la ve en el historial y la edita.

### Pruebas para la Historia de Usuario 4

- [x] T032 [P] [US4] Añadir pruebas unitarias de validación de interacción (fecha, tipo, referencias) y tipos permitidos en `tests/unit/interaction.test.js` (FR-018, FR-019, FR-020, FR-021)
- [x] T033 [P] [US4] Añadir pruebas de integración de registro, historial y edición de interacciones en `tests/integration/interactions.test.js` (FR-018, FR-019, FR-020, FR-021, FR-022)

### Implementación de la Historia de Usuario 4

- [x] T034 [P] [US4] Crear `src/components/interaction-form.js` con tipos `Llamada/Correo/Reunión` y descripción opcional (FR-018, FR-019, FR-020, FR-021, FR-036)
- [x] T035 [P] [US4] Crear `src/components/interaction-list.js` con fecha, tipo y responsable (FR-022)
- [x] T037 [US4] Aplicar sanitización a las descripciones de interacción antes de renderizarlas (FR-041)

**Punto de control**: El historial de interacciones es funcional y trazable.

---

## Fase 7: Historia de Usuario 5 - Ver la ficha 360° del cliente (Prioridad: P1)

**Objetivo**: Consolidar en una sola vista los datos del cliente, sus oportunidades y sus interacciones.

**Prueba Independiente**: Un usuario abre la ficha de un cliente y ve sus datos y ambos listados, o estados vacíos claros.

### Pruebas para la Historia de Usuario 5

- [x] T038 [P] [US5] Añadir pruebas unitarias de `getClientDetail` (cliente + oportunidades + interacciones) en `tests/unit/storage.test.js` (FR-023)
- [x] T039 [P] [US5] Añadir pruebas de integración de la ficha 360° con registros y con estados vacíos en `tests/integration/client-detail.test.js` (FR-023, FR-031)

### Implementación de la Historia de Usuario 5

- [x] T040 [US5] Crear `src/components/client-detail.js` con datos del cliente, oportunidades e interacciones (FR-023)
- [x] T042 [US5] Renderizar estados vacíos claros en la ficha cuando no haya registros (FR-031)

**Punto de control**: La ficha 360° es el punto de consulta consolidado del CRM.

---

## Fase 8: Historia de Usuario 6 - Dashboard comercial (Prioridad: P1)

**Objetivo**: Mostrar indicadores comerciales en vivo y accesos rápidos al abrir la aplicación.

**Prueba Independiente**: El usuario abre la aplicación y ve indicadores calculados desde los datos, con accesos rápidos funcionales.

### Pruebas para la Historia de Usuario 6

- [x] T043 [P] [US6] Añadir pruebas unitarias de cálculo de clientes activos, oportunidades abiertas, pipeline y próximos cierres (30 días, excluye vencidas) en `tests/unit/dashboard.test.js` (FR-026, FR-046)
- [x] T044 [P] [US6] Añadir pruebas de integración del dashboard, de la sección «Próximos cierres» y del estado vacío, además de verificar que los KPI no se actualizan automáticamente mientras el dashboard permanece abierto (FR-027), en `tests/integration/dashboard.test.js` (FR-026, FR-027, FR-028, FR-046)

### Implementación de la Historia de Usuario 6

- [x] T045 [P] [US6] Crear `src/components/dashboard.js` con indicadores y accesos rápidos para crear clientes, oportunidades e interacciones (FR-026, FR-028)
- [x] T047 [US6] Mostrar indicadores en cero sin errores y acceso rápido para empezar cuando no haya datos (FR-026, FR-031)

**Punto de control**: La aplicación abre en un dashboard funcional y coherente con los datos.

---

## Fase 9: Historia de Usuario 7 - Buscar y filtrar registros comerciales (Prioridad: P2)

**Objetivo**: Buscar clientes y filtrar oportunidades por etapa, responsable y rango de fecha, con buen rendimiento.

**Prueba Independiente**: El usuario busca clientes y aplica filtros de oportunidades, viendo solo los resultados coincidentes o un estado vacío.

### Pruebas para la Historia de Usuario 7

- [x] T048 [P] [US7] Añadir pruebas unitarias de búsqueda parcial de clientes (empresa/contacto/correo/estado) y filtros de oportunidad (etapa, empleado, rango de fecha) en `tests/unit/search.test.js` (FR-029, FR-030)
- [x] T049 [P] [US7] Añadir pruebas de integración de búsqueda, combinación de filtros y estado vacío en `tests/integration/search.test.js` (FR-029, FR-030, FR-031)

### Implementación de la Historia de Usuario 7

- [x] T050 [P] [US7] Crear `src/components/search.js` con búsqueda de clientes y filtros de oportunidades (FR-029, FR-030)

**Punto de control**: Búsqueda y filtros funcionales y responsivos a la escala objetivo.

---

## Fase 10: Historia de Usuario 8 - Validaciones e integridad referencial (Prioridad: P1)

**Objetivo**: Garantizar registros completos, referencias válidas y archivado lógico que preserve el historial.

**Prueba Independiente**: El usuario comprueba que los registros inválidos se rechazan con mensajes claros y que archivar preserva oportunidades e interacciones.

### Pruebas para la Historia de Usuario 8

- [x] T053 [P] [US8] Añadir pruebas unitarias de rechazo de referencias inexistentes/archivadas y de reporte de inconsistencias al cargar en `tests/unit/integrity.test.js` (FR-025, FR-043, FR-044)
- [x] T054 [P] [US8] Añadir pruebas de integración de archivado con preservación de historial, exclusión de selectores y mensajes claros en `tests/integration/archive-integrity.test.js` (FR-024, FR-025, FR-032, FR-043, FR-044)

### Implementación de la Historia de Usuario 8

> Las tareas de conexión histórica de esta fase se movieron a “Fuera de alcance / tareas históricas”; ver sección correspondiente.

**Punto de control**: La integridad referencial y el archivado lógico funcionan sin pérdida de historial.

---

## Fase 11: Historia de Usuario 9 - Configurar el módulo CRM (Prioridad: P2)

**Objetivo**: Adaptar terminología, campos personalizados, ciclo de vida de oportunidades y color de acento mediante configuración.

**Prueba Independiente**: Un desarrollador aplica una configuración y todas las pantallas usan los valores configurados sin tocar el código central.

### Pruebas para la Historia de Usuario 9

- [x] T059 [P] [US9] Añadir pruebas de integración de etiquetas, campos personalizados, ciclo de vida y color de acento, incluida la configuración inválida en `tests/integration/module-config.test.js` (FR-034, FR-035, FR-036, FR-037, XR-001, XR-002, XR-003, XR-004, XR-005, SC-009)

### Implementación de la Historia de Usuario 9

- [x] T060 [US9] Derivar todas las etiquetas visibles de la configuración en las pantallas y componentes (FR-035, XR-002) — Cubierto por DOM real (index.html + src/app.js); arquitectura src/components/* histórica.
- [x] T061 [US9] Aplicar los campos personalizados en formularios, listas, validación y búsqueda (FR-036, XR-001) — Cubierto por DOM real (index.html + src/app.js); arquitectura src/components/* histórica.
- T062: Movida a “Fuera de alcance / tareas históricas”.
- [x] T063 [US9] Aplicar `moduleName` y `theme.accentColor` como variables/propiedades CSS globales (XR-004) — Cubierto por DOM real (index.html + src/app.js); arquitectura src/components/* histórica.
- T064: Movida a “Fuera de alcance / tareas históricas”.

**Punto de control**: El módulo se adapta completamente mediante configuración.

---

## Fase 12: Historia de Usuario 10 - Espacio de trabajo CRM consistente (Prioridad: P2)

**Objetivo**: Envolver todas las pantallas en un marco persistente con barra superior, barra lateral y área activa resaltada.

**Prueba Independiente**: En cada pantalla se ven la barra superior y la barra lateral, el área activa está resaltada y la navegación es operable en ventanas estrechas.

### Pruebas para la Historia de Usuario 10

- [x] T065 [P] [US10] Añadir pruebas de integración del marco (logotipo, nombre del módulo, barra lateral, área activa) y del comportamiento responsivo en `tests/integration/workspace-shell.test.js` (FR-038, FR-039, FR-040)

### Implementación de la Historia de Usuario 10

- [x] T066 [P] [US10] Crear `src/components/shell.js` con logotipo SVG, barra superior y barra lateral de módulos (FR-038, FR-039)
- [x] T067 [US10] Envolver todas las vistas en el marco y resaltar visualmente el área activa (FR-038, FR-039) — Cubierto por DOM real (index.html + src/app.js); arquitectura src/components/* histórica.
- [x] T068 [US10] Contraer la barra lateral a una columna de iconos en ventanas gráficas estrechas (FR-040)

**Punto de control**: Todas las pantallas comparten un espacio de trabajo consistente y navegable.

---

## Fase 13: Pulido y Verificación Transversal

**Propósito**: Accesibilidad, UX, rendimiento y verificación final contra los criterios de éxito.

- [x] T069 [P] Añadir refinamientos de accesibilidad (etiquetas, foco de teclado, `aria-current`, estructura semántica)
- [x] T070 [P] Pulir estados vacíos, mensajes de validación y diseño responsivo en todas las vistas
- [x] T071 [P] Añadir pruebas de rendimiento con 500 clientes y sus oportunidades e interacciones asociadas, con aserciones de búsqueda ≤10 s y renderizado ≤2 s (FR-042, SC-002, SC-004) — Verificado en baseline final: 66/66 tests, lint PASS, build PASS
- [x] T072 Ejecutar la suite completa y verificar SC-005, SC-006, SC-007, SC-008, SC-010 y SC-011 — Verificado en baseline final: 66/66 tests, lint PASS, build PASS
- [x] T073 Actualizar `README.md` con los flujos CRM, el archivado lógico y la configuración del módulo — Verificado en baseline final: 66/66 tests, lint PASS, build PASS
- [x] T074 Ejecutar la compilación de producción y verificar que no hay regresiones — Verificado en baseline final: 66/66 tests, lint PASS, build PASS

---

## Fase 14: Configuración (Infraestructura Compartida)

**Propósito**: verificar el entorno existente y preparar el arnés de pruebas sobre el DOM real.

- [x] T075 Verificar toolchain y línea base ejecutando `npm run test:run`, `npm run lint` y `npm run build` según `specs/001-crm-module/quickstart.md`, sin añadir dependencias en `package.json`
- [x] T076 [P] Crear el helper de montaje JSDOM del HTML real en `tests/integration/live-dom.js`, con `vi.resetModules()` y simulación de recarga dentro de la misma sesión
- [x] T077 [P] Ampliar `tests/setup/test-setup.js` para limpiar `sessionStorage` y restablecer la URL entre pruebas

---

## Fase 15: Fundacional (Prerrequisitos Bloqueantes)

**Propósito**: infraestructura compartida que debe estar lista antes de cualquier historia.

**⚠️ CRÍTICO**: ninguna historia puede comenzar hasta completar esta fase.

- [x] T078 Añadir los tokens `--sidebar-width`, `--sidebar-width-collapsed` y las reglas base `.icon` con `stroke: currentColor` en `src/styles.css`
- [x] T079 [P] Crear la prueba estática del contrato SVG en `tests/unit/svg-icon-contract.test.js` sobre `index.html`
- [x] T080 Centralizar `AUTH_STORAGE_KEY` y `SIDEBAR_STORAGE_KEY` en la cabecera de `src/app.js` para US12 y US13

**Punto de control**: base lista; las historias pueden iniciarse en orden de prioridad.

---

## Fase 16: Historia de Usuario 11 - Iniciar sesión en pantalla dividida con contraseña visible (Prioridad: P1) 🎯 MVP de interfaz SaaS

**Objetivo**: acceso profesional con dos paneles y control fiable de mostrar/ocultar contraseña (FR-047 a FR-052).

**Prueba Independiente**: abrir `index.html` sin sesión, comprobar ambos paneles, alternar visibilidad dos veces conservando el valor, verificar credenciales inválidas y entrar con `Cliente1` / `1234`.

### Pruebas para la Historia de Usuario 11

> Escribir primero y confirmar que fallan antes de la implementación.

- [x] T081 [P] [US11] Añadir pruebas de acceso dividido, visibilidad y errores en `tests/integration/ui-contracts.test.js` (FR-048, FR-049, FR-050, FR-051)
- [x] T082 [P] [US11] Añadir prueba estática de la rejilla 45%/55% y el apilado a 820 px en `tests/unit/layout-contract.test.js` (FR-048)

### Implementación de la Historia de Usuario 11

- [x] T083 [US11] Normalizar los SVG `.icon-eye` y `.icon-eye-off` y sus atributos ARIA en `index.html`
- [x] T084 [US11] Ajustar `setPasswordVisibility()` y `bindPasswordToggle()` para conservar el valor y sincronizar `aria-pressed`/`aria-label` en `src/main.js`
- [x] T085 [US11] Garantizar la visibilidad de `.login-brand-panel` y `.login-form-panel` y su apilado responsive en `index.html` y `src/styles.css`
- [x] T086 [US11] Asegurar que `#login-error` muestra un mensaje en español sin incluir la contraseña en `src/main.js`

**Punto de control**: US11 es funcional y verificable de forma aislada.

---

## Fase 17: Historia de Usuario 12 - Navegar con un menú lateral colapsable (Prioridad: P2)

**Objetivo**: hamburguesa SVG accesible, franja de iconos en escritorio, overlay en móvil y persistencia de sesión (FR-053 a FR-056).

**Prueba Independiente**: contraer y expandir desde dos secciones, recargar conservando el estado, comprobar foco y `aria-expanded`, y cerrar sesión para verificar el reinicio.

### Pruebas para la Historia de Usuario 12

- [x] T087 [P] [US12] Añadir pruebas de colapso, persistencia, sección activa y accesibilidad en `tests/integration/sidebar-collapse.test.js`
- [x] T088 [P] [US12] Añadir prueba de regresión que prohíbe `.sidebar { display: none; }` en `tests/unit/layout-contract.test.js`

### Implementación de la Historia de Usuario 12

- [x] T089 [US12] Sustituir el SVG de `#menu-toggle` por el contrato de iconos y añadir `aria-hidden`, `focusable` y etiqueta dinámica en `index.html` (FR-054, FR-055)
- [x] T090 [US12] Implementar lectura/escritura de `sessionStorage['erp.sidebarCollapsed']`, sincronización de ARIA y cierre por Escape/clic fuera en `src/app.js`
- [x] T091 [US12] Reemplazar `display: none` por la franja de 64 px y el overlay para ≤ 900 px en `src/styles.css` (FR-054, FR-055)
- [x] T092 [US12] Eliminar la preferencia del menú al cerrar sesión en `src/main.js`

**Punto de control**: US12 funciona de forma aislada y no altera US11.

---

## Fase 18: Historia de Usuario 13 - Orientarse en el Dashboard con banner y tarjetas KPI (Prioridad: P2)

**Objetivo**: saludo con el usuario autenticado y cuatro KPI derivados del CRM con estados vacíos neutros (FR-057 a FR-060).

**Prueba Independiente**: entrar con `Cliente1`, verificar `#welcome-title` y las cuatro etiquetas/valores, sembrar datos con `addCustomer`/`addOpportunity` y comprobar la actualización y la conversión.

### Pruebas para la Historia de Usuario 13

- [x] T093 [P] [US13] Añadir pruebas unitarias de `computeConversionRate()` que cubran FR-058: `ganadas / (ganadas + perdidas)`, redondeo entero, `0 %` sin oportunidades cerradas, alias `etapa` y sin mutación en `tests/unit/conversion-rate.test.js` (FR-058)
- [x] T094 [P] [US13] Añadir pruebas de banner, cuatro KPI y estado vacío en `tests/integration/ui-contracts.test.js` (FR-059)

### Implementación de la Historia de Usuario 13

- [x] T095 [US13] Implementar `computeConversionRate(opportunities)` en `src/domain.js` según FR-058, con redondeo entero y `0` cuando no existan oportunidades cerradas (FR-058)
- [x] T096 [US13] Añadir `#welcome-title` y las tarjetas `#stat-clients`, `#stat-opportunities`, `#stat-revenue` y `#stat-conversion` con sus etiquetas en `index.html`
- [x] T097 [US13] Ampliar `updateDashboardStats()` para renderizar los cuatro KPI desde `getCRMOverview()` en `src/app.js` (FR-059)
- [x] T098 [US13] Añadir `renderWelcomeBanner()` leyendo `AUTH_STORAGE_KEY` en `src/app.js`
- [x] T099 [US13] Sincronizar el alta/edición de `#entity-form` con `addCustomer()`/`updateCustomer()` para FR-060 en `src/app.js`
- [x] T100 [US13] Ajustar `.stats-grid` y `.welcome-banner` para 1366 × 768 sin desplazamiento vertical en `src/styles.css` (FR-059)

**Punto de control**: US13 es verificable de forma aislada y refleja datos vigentes.

---

## Fase 19: Historia de Usuario 14 - Capturar datos con formularios estandarizados (Prioridad: P2)

**Objetivo**: dos bloques con encabezados literals en mayúsculas, estructura repetida y errores uniformes (FR-061 a FR-064).

**Prueba Independiente**: comprobar `textContent` exacto de ambos encabezados en alta y edición, enviar con campos vacíos y verificar errores junto al campo sin guardar.

### Pruebas para la Historia de Usuario 14

- [x] T101 [P] [US14] Añadir pruebas de encabezados exactos, agrupación y errores uniformes en `tests/integration/ui-contracts.test.js` (FR-062, FR-063)
- [x] T102 [P] [US14] Añadir prueba estática de los literales `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` en `tests/unit/form-headings.test.js`

### Implementación de la Historia de Usuario 14

- [x] T103 [US14] Reestructurar `#entity-form` en dos `.form-section` con encabezados literales en mayúsculas en `index.html`
- [x] T104 [US14] Migrar contacto al primer bloque y moneda/importe/plazos al segundo en `index.html` (FR-062, FR-063)
- [x] T105 [US14] Unificar redacción y ubicación de `.validation-error` en `src/app.js`
- [x] T106 [US14] Igualar jerarquía, alineación y espaciado de `.form-section-title`, `.form-grid` y `.field` en `src/styles.css`

**Punto de control**: US14 es consistente en alta y edición sin afectar a US13.

---

## Fase 20: Historia de Usuario 15 - Leer textos en español sin caracteres mal formados (Prioridad: P3)

**Objetivo**: UTF-8 limpio en encabezados, etiquetas, listados y datos introducidos (FR-065 a FR-067).

**Prueba Independiente**: verificar `<meta charset="UTF-8" />`, recorrer todas las vistas con acentos, «ñ» y símbolos monetarios y round-trip de `Ana García Ñuñez` sin U+FFFD.

### Pruebas para la Historia de Usuario 15

- [x] T107 [P] [US15] Añadir pruebas de round-trip y ausencia de U+FFFD/mojibake en `tests/integration/ui-contracts.test.js` (FR-066)
- [x] T108 [P] [US15] Añadir prueba estática de declaración UTF-8 en `tests/unit/utf8-contract.test.js` (FR-066)

### Implementación de la Historia de Usuario 15

- [x] T109 [US15] Auditar y mantener inserción exclusivamente con `textContent` en `src/app.js` y `src/main.js`
- [x] T110 [US15] Normalizar literales acentuados y símbolos monetarios de encabezados y etiquetas en `index.html`
- [x] T111 [US15] Regenerar el artefacto con `npm run build` y verificar la declaración UTF-8 en `dist/index.html`

**Punto de control**: las cinco historias de la interfaz son funcionales y verificables de forma independiente.

---

## Fase 21: Pulido y Consideraciones Transversales

**Propósito**: validación final, accesibilidad y documentación.

- [x] T112 [P] Actualizar los ejemplos de validación con el comportamiento implementado en `specs/001-crm-module/quickstart.md`
- [x] T113 Ejecutar la verificación completa `npm run test:run`, `npm run lint` y `npm run build` desde `package.json`
- [x] T114 [P] Revisar `:focus-visible` y contraste de estados expandido/contraído en `src/styles.css`
- [x] T115 Registrar las suites heredadas fallidas y la deuda de `src/components/*` en `specs/001-crm-module/research.md`
- [x] T116 Completar la validación manual de los cinco escenarios de `specs/001-crm-module/quickstart.md`

---

## Fase 22: Clarificaciones de 2026-11-21 (FR-068 a FR-073)

**Propósito**: incorporar al código las decisiones documentadas en `specs/001-crm-module/spec.md` y validarlas con el DOM real (`index.html`, `src/`).

### Pruebas de las clarificaciones

- [x] T117 [P] [US6] Escribir pruebas unitarias de `getCRMOverview()` —con `getDashboardMetrics()` solo como alias de compatibilidad— que comprueben que una oportunidad abierta de un cliente archivado cuenta en oportunidades, pipeline y próximos cierres (FR-068) en `tests/unit/dashboard-metrics.test.js` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T118 [P] [US8] Escribir pruebas unitarias de unicidad de correo que incluyan clientes archivados (FR-069) en `tests/unit/client-uniqueness.test.js` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T119 [P] [US14] Escribir la prueba de integración de la confirmación «Permanecer»/«Descartar» al salir de cualquier formulario CRM del DOM real con cambios —actualmente `#entity-form`, y cualquier otro formulario que se incorpore— (FR-070) en `tests/integration/unsaved-changes.test.js` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T120 [P] [US9] Escribir la prueba de integración de campos personalizados eliminados: valor conservado en `localStorage` y oculto en formularios, listas y búsqueda (FR-071) en `tests/integration/module-config.test.js` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T121 [P] [US8] Escribir la prueba de integración de arranque con datos corruptos según el criterio de forma de `contracts/crm-storage.md`: error visible, sin sobrescritura automática y reinicio explícito (FR-072) en `tests/integration/storage-recovery.test.js` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T122 [P] [US10] Escribir la prueba de integración que compruebe que el selector `Claro`/`Oscuro` existe, que la preferencia se conserva entre recargas y que el tema elegido está aplicado en el primer snapshot del DOM sin transición visible del tema (FR-073, SC-021) en `tests/integration/theme.test.js` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)

### Implementación de las clarificaciones

- [x] T123 [US6] Ajustar `getCRMOverview()` en `src/storage.js` para seleccionar oportunidades abiertas por etapa sin filtrar por el estado `archived` del cliente, manteniendo la exclusión de archivados en «Clientes activos» (FR-068) — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T124 [US8] Reforzar `isEmailAvailable()` y `addCustomer()`/`updateCustomer()` en `src/storage.js` para rechazar correos de clientes archivados (FR-069) — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T125 [US14] Centralizar la navegación en `src/app.js` y añadir en `index.html` un diálogo de cambios sin guardar, aplicable a cualquier formulario CRM del DOM real, con opciones «Permanecer» y «Descartar» (FR-070) — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T126 [US9] Derivar los campos visibles de la configuración activa en `src/module-config.js` y fusionar actualizaciones con el registro almacenado en `src/storage.js` para conservar valores huérfanos (FR-071) — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T127 [US8] Validar las claves del CRM al arrancar en `src/storage.js` usando el criterio de forma de `contracts/crm-storage.md`, y mostrar el error con acción de reinicio explícito en `src/app.js` (FR-072) — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T128 [US10] Añadir el selector `Claro`/`Oscuro` al espacio de trabajo en `index.html`; guardar y aplicar la preferencia desde `localStorage['crm.theme']` en el primer snapshot del DOM, sin transición visible del tema, en `src/main.js` e `index.html` (FR-073, SC-021), sin escribir en las claves `crm_module:*` ni en `erp_*` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)
- [x] T129 Ejecutar `npm run test:run`, `npm run lint` y `npm run build`, y validar los escenarios 1–6 de la sección «Clarificaciones de 2026-11-21» de `specs/001-crm-module/quickstart.md` — Verificado en baseline final: 66/66 tests, lint PASS, build PASS (commits a1aa3a7, c1243a8)

**Punto de control**: las clarificaciones están implementadas y son verificables de forma independiente.

## Fuera de alcance / tareas históricas

> Nota: Tarea histórica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante. Los IDs se conservan para trazabilidad.

- [ ] T025 [US2] Conectar el CRUD de empleados y exponer selectores de empleados activos en `src/app.js` (FR-008) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T030 [US3] Conectar alta/ediciÃ³n, transiciÃ³n de etapa y validaciones en `src/app.js` (FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-032) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T036 [US4] Conectar registro/ediciÃ³n de interacciones y refresco del historial en `src/app.js` (FR-018, FR-019, FR-020, FR-021, FR-022, FR-032) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T041 [US5] Conectar la navegaciÃ³n lista â†’ ficha â†’ lista preservando los datos en `src/app.js` (FR-023, FR-033) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T046 [US6] Recalcular los indicadores y la secciÃ³n Â«PrÃ³ximos cierresÂ» cada vez que se muestra el dashboard, sin recalcularlos automÃ¡ticamente mientras permanece abierto, y conectar los accesos rÃ¡pidos en `src/app.js` e `index.html` (FR-026, FR-027, FR-028, FR-046) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T051 [US7] Conectar bÃºsqueda/filtros y estado vacÃ­o, manteniendo sincronÃ­a con las acciones de crear/editar/archivar en `src/app.js` (FR-029, FR-030, FR-031) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T052 [US7] Optimizar bÃºsqueda, filtros y renderizado para 500 clientes y sus registros asociados, verificando bÃºsqueda â‰¤10 s y renderizado inicial â‰¤2 s (FR-042, SC-002, SC-004) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T055 [US8] Exponer las acciones de archivar cliente/empleado y consultar su historial (FR-024, FR-044) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T056 [US8] Excluir clientes y empleados archivados de las listas operativas y de los selectores de nuevos registros en `src/app.js` (FR-043) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T057 [US8] Mostrar un reporte visible de registros con referencias inexistentes al cargar los datos (FR-025) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T058 [US8] Centralizar mensajes de validaciÃ³n claros y consistentes en todos los formularios (FR-032) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T062 [US9] Aplicar `opportunityLifecycle` configurado a las transiciones de oportunidad (XR-003) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.
- [ ] T064 [US9] Cargar la configuraciÃ³n al arrancar con valores predeterminados y reporte de errores (FR-034, FR-037, XR-005) â€” Tarea histÃ³rica de Fase 13 para src/components/*; sustituida por el DOM real vigente o fuera del MVP actual. No bloqueante.

---

## Fase 23: Fundacional de Correcciones US16â€“US24 (Bloqueante)

**PropÃ³sito**: preparar helpers, contratos de prueba y puntos de integraciÃ³n compartidos para las correcciones incrementales sobre el DOM real.

**âš ï¸ CRÃTICO**: ninguna historia US16â€“US24 debe implementarse antes de completar esta fase.

> **Alcance activo**: Fases 23–33 (T130–T188) son el alcance ejecutable para US16–US24. Fases 1–22 permanecen como registro histórico/read-only, salvo referencias de regresión.
> **Cobertura fundacional**: T130–T135 cubren prerrequisitos transversales de FR-074–FR-088 (tema, storage/sesión, accesibilidad, búsqueda/listados, navegación y moneda) y habilitan la verificación SC-022–SC-030.

- [x] T130 Revisar alineaciÃ³n de alcance US16â€“US24 en `specs/001-crm-module/spec.md`, `specs/001-crm-module/plan.md`, `specs/001-crm-module/research.md`, `specs/001-crm-module/data-model.md` y `specs/001-crm-module/contracts/corrections-us16-us24.md` (FR-074, FR-075, FR-076, FR-077, FR-078, FR-079, FR-080, FR-081, FR-082, FR-083, FR-084, FR-085, FR-086, FR-087, FR-088)
- [x] T131 [P] AÃ±adir utilidades compartidas de prueba para sesiÃ³n, vista activa, foco y almacenamiento en `tests/integration/live-dom.js` (FR-078, FR-085, FR-086, FR-087, SC-024, SC-028, SC-029)
- [x] T132 [P] Crear esqueleto de pruebas de integraciÃ³n para correcciones en `tests/integration/corrections-us16-us24.test.js` (FR-074, FR-075, FR-076, FR-077, FR-078, FR-079, FR-080, FR-081, FR-082, FR-083, FR-084, FR-085, FR-086, FR-087, FR-088)
- [x] T133 Definir/normalizar selectores y atributos ARIA de confirmaciÃ³n, bÃºsqueda y listados en `index.html` segÃºn `specs/001-crm-module/contracts/ui-contracts.md` (FR-079, FR-080, FR-081, FR-083, FR-086, FR-087)
- [x] T134 Crear helper reutilizable de diÃ¡logo modal accesible (apertura, cierre, focus trap, Escape, restore focus) en `src/app.js` (FR-079, FR-080, FR-087, SC-025, SC-029)
- [x] T135 Crear helper de persistencia de sesiÃ³n/vista activa con whitelist y limpieza de storages en `src/main.js` y `src/app.js` (FR-078, FR-085, SC-024, SC-028)

**Punto de control**: base compartida lista; las historias US16â€“US24 pueden comenzar.

---

## Fase 24: Historia de Usuario 23 - Accesibilidad completa en formularios y diÃ¡logos (Prioridad: P1) ðŸŽ¯ MVP correcciones

**Objetivo**: Formularios y diÃ¡logos crÃ­ticos accesibles por teclado con errores asociados, focus trap y restauraciÃ³n de foco.

**Prueba Independiente**: Enviar formularios invÃ¡lidos solo con teclado; verificar `aria-invalid`, `aria-describedby`, foco en primer invÃ¡lido; abrir/cerrar `#unsaved-dialog` con Escape/Tab/Shift+Tab y restauraciÃ³n de foco.

### Pruebas para la Historia de Usuario 23

> **NOTA: Escribir estas pruebas PRIMERO, asegurar que FALLAN antes de la implementaciÃ³n**

- [x] T136 [P] [US23] AÃ±adir pruebas de integraciÃ³n para `aria-invalid`, `aria-describedby` y foco al primer campo invÃ¡lido en `tests/integration/corrections-us16-us24.test.js` (FR-086, SC-029)
- [x] T137 [P] [US23] AÃ±adir pruebas de integraciÃ³n para focus trap, Escape y restauraciÃ³n de foco en `#unsaved-dialog` en `tests/integration/unsaved-changes.test.js` (FR-087, SC-029)

### ImplementaciÃ³n de la Historia de Usuario 23

- [x] T138 [US23] Asociar errores de validaciÃ³n con campos mediante `aria-invalid` y `aria-describedby` en `src/app.js` (FR-086)
- [x] T139 [US23] Mover foco al primer campo invÃ¡lido en envÃ­os de `#entity-form` y `#document-form` en `src/app.js` (FR-086, SC-029)
- [x] T140 [US23] Implementar focus trap, foco inicial, Escape y restauraciÃ³n de foco para `#unsaved-dialog` en `src/app.js` e `index.html` (FR-087, SC-029)
- [x] T141 [US23] AÃ±adir estilos de foco visible y estado invÃ¡lido accesible coherentes en `src/styles.css` (FR-086, FR-087)

**Punto de control**: US23 funcional y verificable de forma independiente.

---

## Fase 25: Historia de Usuario 16 - Tema oscuro coherente en todo el espacio de trabajo (Prioridad: P1)

**Objetivo**: Aplicar tokens de tema de forma consistente en modo Claro/Oscuro, sin superficies claras fijas ni pÃ©rdida de contraste.

**Prueba Independiente**: Activar `Oscuro`, recorrer acceso, shell, dashboard, clientes, oportunidades, bÃºsqueda y diÃ¡logos; recargar y verificar tema desde primer render.

### Pruebas para la Historia de Usuario 16

- [x] T142 [P] [US16] AÃ±adir pruebas de integraciÃ³n para cobertura de tema oscuro en vistas y diÃ¡logos crÃ­ticos en `tests/integration/theme.test.js` (FR-074, FR-075, SC-022)
- [x] T143 [P] [US16] AÃ±adir prueba de contrato para ausencia de colores claros fijos en componentes crÃ­ticos en `tests/unit/theme-contract.test.js` (FR-074, SC-022)

### ImplementaciÃ³n de la Historia de Usuario 16

- [x] T144 [P] [US16] Reemplazar colores fijos por tokens/variables en superficies, formularios, badges y estados en `src/styles.css` (FR-074, FR-075)
- [x] T145 [US16] Ajustar marcado/clases de componentes con estilos heredados para soportar dark mode en `index.html` (FR-074, FR-075)
- [x] T146 [US16] Verificar que `applyTheme()` y el arranque temprano mantienen `crm.theme` sin parpadeo visible en `src/main.js` e `index.html` (FR-073, FR-074, SC-022)

**Punto de control**: US16 funcional y verificable de forma independiente.

---

## Fase 26: Historia de Usuario 17 - Dashboard coherente con las oportunidades gestionadas (Prioridad: P1)

**Objetivo**: Los KPI del dashboard reflejan la misma fuente de verdad que las altas/ediciones/eliminaciones de oportunidades en la UI.

**Prueba Independiente**: Crear/editar/eliminar una oportunidad desde la UI y comprobar que `#stat-opportunities`, `#stat-revenue` y `#stat-conversion` se actualizan al mostrar el dashboard.

### Pruebas para la Historia de Usuario 17

- [x] T147 [P] [US17] AÃ±adir pruebas unitarias para normalizaciÃ³n/canonicalizaciÃ³n de oportunidades usadas por `getCRMOverview()` en `tests/unit/dashboard-metrics.test.js` (FR-076, FR-077, SC-023)
- [x] T148 [P] [US17] AÃ±adir prueba de integraciÃ³n DOM real que crea oportunidad por UI y verifica KPI del dashboard en `tests/integration/dashboard.test.js` (FR-076, FR-077, SC-023)

### ImplementaciÃ³n de la Historia de Usuario 17

- [x] T149 [US17] Implementar adaptador canónico de oportunidades entre UI y overview en `src/storage.js`; definir `crm_module:opportunities` como fuente canónica de KPIs, normalizar lectura/escritura desde ahí y establecer precedencia determinista: si `crm_module:opportunities` y `erp_base_module:documents` difieren, gana el registro canónico de `crm_module:opportunities`; los documentos legacy solo rellenan registros canónicos faltantes, sin sobrescritura destructiva (FR-076, FR-077)
- [x] T150 [US17] Actualizar alta/ediciÃ³n/eliminaciÃ³n de oportunidades para persistir en la fuente canÃ³nica consumida por `getCRMOverview()` en `src/app.js` y `src/storage.js`; toda operación UI debe reflejarse en KPI en el siguiente render del dashboard (FR-076, FR-077, SC-023)
- [x] T151 [US17] Recalcular y renderizar KPI desde `getCRMOverview()` al entrar al dashboard en `src/app.js`, sin usar fuentes paralelas de métricas (FR-076, FR-077)
- [x] T152 [US17] Asegurar compatibilidad/migraciÃ³n de datos legacy `erp_base_module:documents` en `src/storage.js`: reconciliar en lectura/escritura hacia `crm_module:opportunities` con idempotencia (ejecuciones repetidas no duplican ni alteran resultados), precedencia determinista ante conflicto (gana `crm_module:opportunities`; legacy solo backfill de faltantes) y sin doble verdad/divergencia de KPI (FR-076, FR-077, SC-023)
**Punto de control**: US17 funcional y verificable de forma independiente.

---

## Fase 27: Historia de Usuario 19 - ConfirmaciÃ³n accesible para eliminaciones (Prioridad: P2)

**Objetivo**: Eliminar clientes y oportunidades mediante diÃ¡logo modal propio del CRM, accesible por teclado.

**Prueba Independiente**: Activar eliminar en cliente y oportunidad; cancelar con Escape/botÃ³n sin borrar; confirmar borrado; verificar focus trap y retorno de foco.

### Pruebas para la Historia de Usuario 19

- [x] T153 [P] [US19] AÃ±adir pruebas de integraciÃ³n para diÃ¡logo de confirmaciÃ³n, cancelaciÃ³n, Escape y confirmaciÃ³n destructiva en `tests/integration/corrections-us16-us24.test.js` (FR-079, FR-080, SC-025)
- [x] T154 [P] [US19] AÃ±adir prueba de regresiÃ³n que prohÃ­be `window.confirm` en flujos de eliminaciÃ³n en `tests/unit/ui-contracts.test.js` (FR-079, SC-025)
### ImplementaciÃ³n de la Historia de Usuario 19

- [x] T155 [US19] AÃ±adir marcado del diÃ¡logo de confirmaciÃ³n reutilizable con acciones cancelar/confirmar en `index.html` (FR-079, FR-080)
- [x] T156 [US19] Reemplazar `confirm()` por diÃ¡logo modal accesible en flujos de eliminaciÃ³n de clientes y oportunidades en `src/app.js` (FR-079, FR-080, SC-025)
- [x] T157 [US19] Aplicar estilos de diÃ¡logo destructivo coherentes con tokens de tema en `src/styles.css` (FR-074, FR-079)

**Punto de control**: US19 funcional y verificable de forma independiente.

---

## Fase 28: Historia de Usuario 18 - Preferencia â€œRecordar mi sesiÃ³nâ€ efectiva (Prioridad: P2)

**Objetivo**: El checkbox `#login-remember` controla si la sesiÃ³n persiste en `localStorage` o `sessionStorage`.

**Prueba Independiente**: Iniciar sesiÃ³n marcado/desmarcado; verificar restauraciÃ³n/no restauraciÃ³n segÃºn contexto; cerrar sesiÃ³n elimina ambas claves.

### Pruebas para la Historia de Usuario 18

- [x] T158 [P] [US18] AÃ±adir pruebas de integraciÃ³n para persistencia condicionada por `#login-remember` en `tests/integration/corrections-us16-us24.test.js`: marcado restaura en el mismo perfil/navegador; desmarcado usa `sessionStorage` y no se restaura en un nuevo contexto de navegador; logout limpia ambas ubicaciones (FR-078, SC-024)
- [x] T159 [P] [US18] AÃ±adir prueba de integraciÃ³n para logout limpiando `localStorage` y `sessionStorage` de auth en `tests/integration/ui-contracts.test.js` (FR-078, SC-024)

### ImplementaciÃ³n de la Historia de Usuario 18

- [x] T160 [US18] Implementar lectura/escritura de auth en `localStorage` o `sessionStorage` segÃºn `#login-remember` en `src/main.js`; desmarcado = persistencia limitada a la sesión de navegador/pestaña actual (sin restaurar en nuevo contexto de navegador), marcado = persistencia en el mismo navegador/perfil (FR-078, SC-024)
- [x] T161 [US18] Actualizar `isAuthenticated`, restauraciÃ³n de sesiÃ³n y logout para limpiar ambas ubicaciones en `src/main.js` (FR-078, SC-024)
- [x] T162 [US18] Conectar el estado del checkbox `#login-remember` en el flujo de login en `index.html` y `src/main.js` (FR-078)

**Punto de control**: US18 funcional y verificable de forma independiente.

---

## Fase 29: Historia de Usuario 20 - BÃºsqueda de clientes y oportunidades (Prioridad: P2)

**Objetivo**: BÃºsqueda unificada por texto relevante con resultados tipados de clientes y oportunidades y navegaciÃ³n al registro.

**Prueba Independiente**: Buscar tÃ©rminos de cliente y oportunidad; verificar tipo visible, vacÃ­o claro y navegaciÃ³n al registro seleccionado.

### Pruebas para la Historia de Usuario 20

- [x] T163 [P] [US20] AÃ±adir pruebas de integraciÃ³n para bÃºsqueda unificada de clientes y oportunidades en `tests/integration/search.test.js` (FR-081, SC-026)
- [x] T164 [P] [US20] AÃ±adir prueba de integraciÃ³n para navegaciÃ³n desde resultado a vista/registro en `tests/integration/corrections-us16-us24.test.js` (FR-082, SC-026)

### ImplementaciÃ³n de la Historia de Usuario 20

- [x] T165 [US20] Implementar consulta unificada tipada de clientes y oportunidades en `src/storage.js` (FR-081)
- [x] T166 [US20] Renderizar resultados con tipo, etiqueta y detalle en `#search-results-list` en `src/app.js` (FR-081, FR-082)
- [x] T167 [US20] Navegar al registro seleccionado y cargarlo en formulario/vista correspondiente en `src/app.js` (FR-082, SC-026)
- [x] T168 [US20] Ajustar estilos de resultados tipados y estado vacÃ­o en `src/styles.css` (FR-081, FR-075)

**Punto de control**: US20 funcional y verificable de forma independiente.

---

## Fase 30: Historia de Usuario 21 - Listas escalables para gestionar registros (Prioridad: P2)

**Objetivo**: Clientes y oportunidades se gestionan mediante listados con acciones por fila, sincronizados con formularios.

**Prueba Independiente**: Con mÃºltiples registros, editar y eliminar desde filas; verificar sincronizaciÃ³n de formulario, selecciÃ³n y actualizaciÃ³n tras cambios.

### Pruebas para la Historia de Usuario 21

- [x] T169 [P] [US21] AÃ±adir pruebas de integraciÃ³n para listados de clientes con acciones por fila en `tests/integration/entities.test.js` (FR-083, FR-084, SC-027)
- [x] T170 [P] [US21] AÃ±adir pruebas de integraciÃ³n para listados de oportunidades con acciones por fila en `tests/integration/documents.test.js` (FR-083, FR-084, SC-027)

### ImplementaciÃ³n de la Historia de Usuario 21

- [x] T171 [P] [US21] AÃ±adir contenedores de listado/tablas en `#view-entities` y `#view-documents` en `index.html` (FR-083)
- [x] T172 [US21] Renderizar filas de clientes con acciones Editar/Eliminar y sincronizaciÃ³n con formulario en `src/app.js` (FR-083, FR-084, SC-027)
- [x] T173 [US21] Renderizar filas de oportunidades con acciones Editar/Eliminar y sincronizaciÃ³n con formulario en `src/app.js` (FR-083, FR-084, SC-027)
- [x] T174 [US21] AÃ±adir estilos responsivos y accesibles para listados escalables en `src/styles.css` (FR-083, FR-075)

**Punto de control**: US21 funcional y verificable de forma independiente.

---

## Fase 31: Historia de Usuario 22 - Restaurar la vista activa tras recargar (Prioridad: P3)

**Objetivo**: Restaurar la Ãºltima vista interna vÃ¡lida tras recarga, con fallback seguro al dashboard.

**Prueba Independiente**: Navegar a vista vÃ¡lida, recargar y restaurar; usar valor invÃ¡lido y caer a dashboard; no restaurar antes de auth.

### Pruebas para la Historia de Usuario 22

- [x] T175 [P] [US22] AÃ±adir pruebas de integraciÃ³n para persistencia y restauraciÃ³n de vista activa vÃ¡lida en `tests/integration/corrections-us16-us24.test.js` (FR-085, SC-028)
- [x] T176 [P] [US22] AÃ±adir prueba de integraciÃ³n para fallback seguro ante vista invÃ¡lida y guardia de autenticaciÃ³n en `tests/integration/ui-contracts.test.js` (FR-085, SC-028)

### ImplementaciÃ³n de la Historia de Usuario 22

- [x] T177 [US22] Persistir vista activa vÃ¡lida en `localStorage` al navegar en `src/app.js` (FR-085)
- [x] T178 [US22] Restaurar vista activa con whitelist y fallback a dashboard al iniciar sesiÃ³n/app en `src/app.js` y `src/main.js` (FR-085, SC-028)
- [x] T179 [US22] Ignorar restauraciÃ³n de vista interna cuando no hay sesiÃ³n autenticada en `src/main.js` (FR-085)

**Punto de control**: US22 funcional y verificable de forma independiente.

---

## Fase 32: Historia de Usuario 24 - PresentaciÃ³n de moneda clara y consistente (Prioridad: P3)

**Objetivo**: Montos individuales y KPI agregados usan una regla de moneda clara y consistente, sin sÃ­mbolos contradictorios.

**Prueba Independiente**: Registrar/visualizar montos y KPI; verificar CLP base en agregados y moneda clara en montos individuales.

### Pruebas para la Historia de Usuario 24

- [x] T180 [P] [US24] AÃ±adir pruebas unitarias para helper de formato/normalizaciÃ³n de moneda en `tests/unit/currency-format.test.js` (FR-088, SC-030)
- [x] T181 [P] [US24] AÃ±adir prueba de integraciÃ³n para consistencia de moneda en dashboard, listados y formularios en `tests/integration/corrections-us16-us24.test.js` (FR-088, SC-030)

### ImplementaciÃ³n de la Historia de Usuario 24

- [x] T182 [US24] Implementar helper central de moneda/base CLP y normalizaciÃ³n MVP en `src/domain.js` o `src/app.js` (o helper dedicado consumido por `src/app.js`); centralizar formato/normalización para evitar lógica duplicada (FR-088, SC-030)
- [x] T183 [US24] Aplicar formato de moneda consistente en dashboard, listados y formularios en `src/app.js`; KPI agregados en CLP base con etiqueta clara, montos individuales con moneda del registro/normalizada, sin mezclar símbolos contradictorios (FR-088, SC-030)
- [x] T184 [US24] Actualizar etiquetas/ayudas de moneda en `index.html` y estilos asociados en `src/styles.css` para comunicar la regla de moneda base CLP y presentación consistente (FR-088, SC-030)

**Punto de control**: US24 funcional y verificable de forma independiente.

---

## Fase 33: Pulido y ValidaciÃ³n Transversal US16â€“US24

**PropÃ³sito**: VerificaciÃ³n final, regresiÃ³n, accesibilidad y documentaciÃ³n de correcciones.

- [x] T185 [P] Actualizar trazabilidad y notas de verificaciÃ³n en `specs/001-crm-module/quickstart.md` (SC-022, SC-023, SC-024, SC-025, SC-026, SC-027, SC-028, SC-029, SC-030)
- [x] T186 [P] Revisar consistencia final de contratos en `specs/001-crm-module/contracts/ui-contracts.md`, `specs/001-crm-module/contracts/crm-storage.md` y `specs/001-crm-module/contracts/dashboard-metrics.md` (FR-074, FR-075, FR-076, FR-077, FR-078, FR-079, FR-080, FR-081, FR-082, FR-083, FR-084, FR-085, FR-086, FR-087, FR-088)
- [x] T187 Ejecutar verificaciÃ³n automatizada `npm run test:run`, `npm run lint` y `npm run build` desde `package.json` (SC-022, SC-023, SC-024, SC-025, SC-026, SC-027, SC-028, SC-029, SC-030)
- [x] T188 Realizar validaciÃ³n manual de escenarios US16â€“US24 en `specs/001-crm-module/quickstart.md` (SC-022, SC-023, SC-024, SC-025, SC-026, SC-027, SC-028, SC-029, SC-030)

---

## Dependencias y Orden de EjecuciÃ³n

### Dependencias entre Fases

- **Fases 1â€“22**: histÃ³ricas/completadas; no se reabren salvo regresiÃ³n.
- **Fase 23 (Fundacional US16â€“US24)**: depende de la base existente; BLOQUEA US16â€“US24.
- **Fases 24â€“32 (US16â€“US24)**: dependen de Fase 23; seguir orden recomendado por plan/prioridad.
- **Fase 33 (Pulido)**: depende de completar las historias deseadas.
- **Fase 34 (Alineación integridad FR-058/070/072/073)**: depende de Fase 23 y de las historias base relacionadas (US6, US8, US14, US16); puede ejecutarse en paralelo a Fase 33 si se coordinan archivos compartidos.

### Dependencias entre Historias de Usuario (US16â€“US24)

- **US23 (P1)**: primero; habilita patrones de diÃ¡logo/foco para US19.
- **US16 (P1)**: puede avanzar tras Fase 23; coordinar `src/styles.css` con US19/US21.
- **US17 (P1)**: depende de Fase 23; coordinar con US21/US24 en render de montos/KPI.
- **US19 (P2)**: depende de patrÃ³n modal de US23.
- **US18 (P2)**: depende de Fase 23; mayormente en `src/main.js`.
- **US20 (P2)**: depende de Fase 23; coordina con US21/US22 en navegaciÃ³n/carga de registro.
- **US21 (P2)**: depende de Fase 23; coordina con US19 para acciones por fila.
- **US22 (P3)**: depende de Fase 23; coordina con navegaciÃ³n existente.
- **US24 (P3)**: depende de Fase 23; coordina con US17/US21 para presentaciÃ³n de montos.



### Dependencias Fase 34 (Integridad)

- **T189 (US14, FR-070)**: independiente; puede ejecutarse en paralelo con T190/T192/T194.
- **T190 → T191 (US8, FR-072)**: T190 primero (pruebas), T191 después (implementación) en `src/storage.js` y `src/app.js`.
- **T192 → T193 (US6, FR-058)**: T192 primero (pruebas), T193 después (implementación) en `src/domain.js` y `src/storage.js`.
- **T194 (US16, FR-073)**: independiente; puede ejecutarse en paralelo con T189/T190/T192.
- Archivos compartidos: coordinar T191 y T193 si tocan `src/storage.js`; coordinar T191 con otras tareas que editen `src/app.js`.
### Dentro de Cada Historia

- Pruebas (si se incluyen) â†’ asegurar que FALLAN antes de implementar.
- Modelos/helpers/storage antes de UI donde aplique.
- ImplementaciÃ³n UI + integraciÃ³n.
- VerificaciÃ³n de historia antes de pasar a la siguiente.

### Oportunidades Paralelas

- T131 y T132 pueden ejecutarse en paralelo.
- En cada historia, tareas de prueba marcadas [P] pueden ejecutarse en paralelo.
- US16 y US18 tienen solapamiento bajo (CSS vs auth); pueden paralelizarse con coordinaciÃ³n.
- US20 y US21 pueden paralelizarse parcialmente si se coordinan `src/app.js` e `index.html`.
- T185 y T186 pueden ejecutarse en paralelo durante pulido.

---

## Ejemplos de EjecuciÃ³n Paralela

### Historia de Usuario 23

```text
Tarea: "T136 [US23] AÃ±adir pruebas de integraciÃ³n para aria-invalid, aria-describedby y foco al primer campo invÃ¡lido en tests/integration/corrections-us16-us24.test.js"
Tarea: "T137 [US23] AÃ±adir pruebas de integraciÃ³n para focus trap, Escape y restauraciÃ³n de foco en #unsaved-dialog en tests/integration/unsaved-changes.test.js"
```

### Historia de Usuario 17

```text
Tarea: "T147 [US17] AÃ±adir pruebas unitarias para normalizaciÃ³n/canonicalizaciÃ³n de oportunidades usadas por getCRMOverview() en tests/unit/dashboard-metrics.test.js"
Tarea: "T148 [US17] AÃ±adir prueba de integraciÃ³n DOM real que crea oportunidad por UI y verifica KPI del dashboard en tests/integration/dashboard.test.js"
```

### Historia de Usuario 20

```text
Tarea: "T163 [US20] AÃ±adir pruebas de integraciÃ³n para bÃºsqueda unificada de clientes y oportunidades en tests/integration/search.test.js"
Tarea: "T164 [US20] AÃ±adir prueba de integraciÃ³n para navegaciÃ³n desde resultado a vista/registro en tests/integration/corrections-us16-us24.test.js"
```

---

## Estrategia de ImplementaciÃ³n

### MVP de Correcciones (Primero)

1. Completar Fase 23.
2. Completar Fase 24 (US23).
3. Completar Fase 25 (US16) y Fase 26 (US17).
4. **DETENER Y VALIDAR**: verificar accesibilidad base, tema oscuro y coherencia de dashboard.
5. Completar Fase 34 (T189–T194) para cerrar hallazgos de integridad FR-058/070/072/073 antes de pulido final.

### Entrega Incremental

1. Fundacional US16â€“US24 â†’ base lista.
2. US23 â†’ validar.
3. US16 â†’ validar.
4. US17 â†’ validar.
5. US19 â†’ validar.
6. US18 â†’ validar.
7. US20 â†’ validar.
8. US21 â†’ validar.
9. US22 â†’ validar.
10. US24 â†’ validar.
11. Fase 34 alineación integridad (T190→T191, T192→T193; T189/T194 independientes) → validar.
12. Pulido final â†’ test/lint/build + validaciÃ³n manual.

### Estrategia de Equipo Paralelo

Tras Fase 23: Dev A toma US23 (bloqueante para US19), Dev B toma US16, Dev C prepara US17 pruebas/almacenamiento. DespuÃ©s: US19 tras US23; US18 y US20/US21 en paralelo con coordinaciÃ³n de `src/app.js`; US22/US24 al final.

---

## Fase 34: Alineación de checklist de integridad (FR-058, FR-070, FR-072, FR-073)

**Objetivo**: Cubrir aclaraciones agregadas por checklist de integridad de datos (dirty-check, corrupción/categorías/reintento/fiabilidad, etapas inválidas en conversión, accesibilidad de tema).

- [x] T189 [P] [US14] Añadir/actualizar prueba de integración que verifique criterio dirty de FR-070 (línea base al cargar/limpiar/guardar/descartar; disabled/readonly no cuentan) en `tests/integration/unsaved-changes.test.js` (FR-070)
- [x] T190 [P] [US8] Añadir pruebas de integración para FR-072 en `tests/integration/storage-recovery.test.js`: estado de bloqueo visible con mensaje y categoría afectada; acción primaria "Reiniciar datos afectados"; acciones dependientes deshabilitadas/ocultas; cancelar/ignorar mantiene bloqueo; fallo de escritura muestra error y control "Reintentar", no altera claves no afectadas ni marca recuperado; reintento exitoso limpia error, deja claves afectadas en `[]` y habilita UI; preserva sesión/tema/vista/sidebar (FR-072)
- [x] T191 [US8] Implementar validación de shape por categoría de clave y flujo observable de FR-072 en `src/storage.js` y `src/app.js`: bloqueo con mensaje/categoría afectada, acción "Reiniciar datos afectados", acciones dependientes deshabilitadas/ocultas; cancelar/ignorar mantiene bloqueo; fallo de escritura muestra "Reintentar" sin alterar claves no afectadas ni marcar recuperado; éxito escribe `[]` solo en claves afectadas, preserva sesión/tema/vista/sidebar y habilita UI en estado vacío controlado (FR-072)
- [x] T192 [P] [US6] Añadir prueba unitaria/integración para FR-058 en `tests/unit/dashboard-metrics.test.js` (y dashboard integration si aplica): etapas ausentes/nulas/inválidas excluidas de conversión; aviso no bloqueante visible `#dashboard-data-warning` (o equivalente) con cantidad afectada al renderizar dashboard; KPIs válidos se muestran normales; aviso oculto cuando no hay inconsistencias (FR-058)
- [x] T193 [US6] Ajustar `computeConversionRate()`/overview y UI de dashboard para FR-058 en `src/domain.js`, `src/storage.js` y `src/app.js`: excluir etapas ausentes/nulas/inválidas de conversión; exponer cantidad afectada; mostrar aviso no bloqueante `#dashboard-data-warning` (o equivalente) al renderizar/cargar dashboard y ocultarlo sin inconsistencias; KPIs válidos normales, sin bloqueo de navegación (FR-058)
- [x] T194 [P] [US16] Añadir prueba de accesibilidad de teclado/etiqueta/valor actual para `#theme-select` en `tests/integration/theme.test.js` (FR-073)


### Cobertura de Criterios de Éxito

- **Métricas de resultado/QA (cobertura intencional fuera de tareas automatizadas/build)**: SC-001, SC-003, SC-012, SC-013, SC-014, SC-015, SC-016, SC-017, SC-018, SC-019, SC-020. Se validan por pruebas manuales/revisión/QA según quickstart/spec; no requieren tarea de implementación adicional salvo que se detecte brecha.
- El resto de SC con impacto build/verificable en código o tests están cubiertos por tareas explícitas o históricas.

## Notas

- `[P]` = archivos distintos, sin dependencia incompleta.
- `[USn]` mapea la tarea a la historia de usuario de `spec.md`.
- Cada historia de US16â€“US24 debe ser verificable de forma independiente.
- No editar `src/components/*` ni `dist/` a mano.
- Se preservan tareas histÃ³ricas T001â€“T129 para trazabilidad.
- Total nuevas tareas US16–US24: T130–T188 (59 tareas). Alineación integridad: T189–T194 (6 tareas). Convergencia base: T195–T197 (3 tareas). Total base: 197 tareas.
- Tras la fusión se añaden las Fases 37–45 con T198–T249 (52 tareas del cierre de brechas históricas). **Total general: 249 tareas (T001–T249)**.

---

## Phase 35: Convergence

**Purpose**: Close remaining gaps found by /speckit.converge between spec/plan/tasks and current code.

- [x] T195 [US19] Eliminar el fallback globalThis.confirm en openDeleteConfirmDialog() de src/app.js y usar solo el diálogo modal CRM accesible para confirmación de eliminación; si falta el markup requerido, fallar de forma segura sin ejecutar la eliminación ni invocar window.confirm/globalThis.confirm. Añadir prueba de regresión que verifique que ningún flujo de eliminación invoca window.confirm/globalThis.confirm, incluso ante ausencia del diálogo. (FR-079, SC-025, contradicts)


---

## Phase 36: Convergence

**Purpose**: Close remaining gaps found by /speckit.converge after US20/US21 implementation.

- [x] T196 [US14] Corregir 
avigateToSearchResult() en src/app.js para usar 
avigateTo() (o respetar el guard de cambios sin guardar de FR-070) antes de cambiar de vista/cargar registro; si el usuario elige Permanecer, no debe cambiar la vista ni perder el formulario activo. Añadir prueba de regresión en 	ests/integration/search.test.js o 	ests/integration/corrections-us16-us24.test.js. (FR-070, US20/FR-082, partial)
- [x] T197 [US21] Añadir filtro/búsqueda dentro de #view-entities y #view-documents para reducir resultados en listas largas sin perder contexto de sección, manteniendo sincronía con selección/formulario y acciones por fila. Añadir controles accesibles en index.html, lógica en src/app.js y prueba de integración. (US21/AC2, FR-083, FR-084, SC-027, partial)

---

# Tareas del cierre de brechas históricas (integradas de `002-tasks.md`)

**Entrada**: Documentos de diseño fusionados en `/specs/001-crm-module/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contracts.md`, `contracts/crm-storage.md`, `contracts/performance.md`, `quickstart.md`).

**Pruebas**: OBLIGATORIAS. Principio II de la constitución: comportamiento visible y lógica de negocio deben cubrirse con pruebas automatizadas antes o junto a la implementación. Cada historia incluye tareas de prueba que DEBEN escribirse y FALLAR antes de implementar.

**Organización**: Tareas agrupadas por historia de usuario (US25–US30) para implementación y prueba independiente. Los IDs T198–T249 son continuos con el plan base; entre paréntesis se conserva el ID original de 002 para trazabilidad.

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[USn]**: Historia de usuario de `spec.md` (US25–US30)
- Incluir rutas exactas en descripciones

## Ruta activa (obligatoria)

- Implementación: `index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`
- Pruebas: `tests/unit/*`, `tests/integration/*`
- `src/components/*` es **histórico/no conectado**: NO crear ni modificar tareas sobre esa ruta.

## Trazabilidad histórica del cierre de brechas

> Los IDs T### citados en las descripciones como históricos (p. ej. T025, T030, T062) son tareas históricas del plan base; los IDs de esta feature son T198–T249 (antes T001–T052 de 002).

| Tarea histórica | Cobertura en esta feature |
|---|---|
| T025 | US25 - empleados UI real |
| T030 | US27 - flujo completo oportunidades + lifecycle |
| T036 | US26 - interacciones UI real |
| T041 | US28 - ficha cliente 360° |
| T046 | US29 - próximos cierres dashboard |
| T052 | US30 - rendimiento DOM real 500 registros |
| T055 | US25/US30 - archivar/restaurar visible |
| T056 | US25/US30 - exclusión archivados en listas/selectores |
| T057 | US29 - reporte integridad referencial |
| T062 | US27 - `opportunityLifecycle` configurable aplicado |
| T064 | US27 - banner visible errores de configuración |

---

## Fase 37: Setup del cierre de brechas (Infraestructura compartida)

**Propósito**: Preparar fixtures/helpers de pruebas DOM real para las nuevas vistas, sin tocar `src/components/*`.

- [x] T198 (antes T001) Revisar y alinear helpers de montaje DOM real en `tests/integration/live-dom.js` para soportar nuevas vistas `#view-employees`, `#view-interactions`, `#view-client-360` según `specs/001-crm-module/contracts/ui-contracts.md`
- [x] T199 [P] (antes T002) Crear helper de seed determinista de 500 clientes/registros asociados para rendimiento en `tests/integration/helpers/seed-performance.js` (o archivo equivalente bajo `tests/integration/`), citando `specs/001-crm-module/contracts/performance.md`
- [x] T200 [P] (antes T003) Documentar en comentarios de prueba la convención de claves UI `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.*` según `specs/001-crm-module/contracts/crm-storage.md`

---

## Fase 38: Fundacional del cierre de brechas (Prerrequisitos bloqueantes)

**Propósito**: Base compartida de dominio/storage/UI que bloquea US25–US30. **CRÍTICO**: completar antes de historias.

- [x] T201 (antes T004) Crear pruebas unitarias de transición `opportunityLifecycle` (permitida, inválida, fallback) en `tests/unit/lifecycle-transitions.test.js` cubriendo FR-094, FR-095, FR-101, SC-032; incluir nota de que `opportunityLifecycle` proviene de `module-config.statusLifecycle` normalizado
- [x] T202 [P] (antes T005) Crear pruebas unitarias de reporte de integridad referencial en `tests/unit/referential-integrity.test.js` cubriendo FR-099, SC-034
- [x] T203 (antes T006) Implementar funciones puras de lifecycle en `src/domain.js`: validación de transición con `opportunityLifecycle` canónico (normalizado desde `module-config.statusLifecycle`), fallback seguro y mensajes; hacer pasar T201 (FR-094, FR-095, FR-101)
- [x] T204 [P] (antes T007) Implementar utilidades derivadas read-only en `src/storage.js`/`src/domain.js` para `getReferentialIntegrityReport()` y `getUpcomingClosures({windowDays:30})`, sin modificar `getCRMOverview()` canónico base; hacer pasar T202 (FR-098, FR-099)
- [x] T205 (antes T008) Añadir contratos de estado UI con defaults seguros en `src/app.js` o módulo pequeño dedicado bajo `src/` para claves `crm.gaps002.ui.employeesView`, `crm.gaps002.ui.clients360`, `crm.gaps002.ui.archivedFilter.entities`, `crm.gaps002.ui.archivedFilter.employees` según `specs/001-crm-module/contracts/crm-storage.md`
- [x] T206 (antes T009) Añadir en `src/main.js` exposición/propagación del resultado de `loadModuleConfig()` (config, errors/usedFallback) para que `src/app.js` pueda renderizar `#config-error-banner`; contrato `specs/001-crm-module/contracts/ui-contracts.md` (FR-101, histórica T064)
- [x] T207 [P] (antes T010) Añadir estilos base compartidos para nuevas vistas/banners/badges/estados vacíos en `src/styles.css` reutilizando tokens existentes (sin repetir tema T051/US16); cubrir `#config-error-banner`, `.badge-archived`, secciones 360/próximos cierres/integridad

**Checkpoint**: fundación lista; US25–US30 pueden iniciar.

---

## Fase 39: User Story 25 - Gestionar empleados desde la UI real (Prioridad: P1) 🎯 MVP

**Objetivo**: CRUD visible de empleados con archivar/restaurar y exclusión de archivados en selectores operativos.  
**Prueba independiente**: Crear/editar/archivar/restaurar empleado desde UI real y verificar selectores operativos.  
**FR/SC**: FR-089, FR-090, FR-091, FR-100 (parcial), SC-031. **Históricas**: T025, T055, T056.

### Pruebas para User Story 25 (escribir primero, FALLAR antes de implementar) ⚠️

- [x] T208 [P] [US25] (antes T011) Crear prueba de integración DOM real en `tests/integration/employees-ui.test.js` para alta/edición/listado/filtro de empleados usando `#nav-employees`, `#view-employees`, `#employee-form`, `#employee-name`, `#employee-role`, `#employee-list`, `#employee-list-filter`, `#employee-list-empty` (contrato `contracts/ui-contracts.md`, FR-089, SC-031, histórica T025)
- [x] T209 [P] [US25] (antes T012) Añadir prueba de integración DOM real en `tests/integration/archive-restore-ui.test.js` para archivar/restaurar empleado con `#employee-show-archived`, `[data-action="archive-employee"]`, `[data-action="restore-employee"]`, `.badge-archived`, y exclusión en selectores operativos (FR-090, FR-091, SC-031, históricas T055, T056)

### Implementación para User Story 25

- [x] T210 [US25] (antes T013) Añadir markup de vista Empleados en `index.html`: `#nav-employees`, `#view-employees`, `#employee-form`, `#employee-id`, `#employee-name`, `#employee-role`, `#employee-submit`, `#employee-reset`, `#employee-list-filter`, `#employee-show-archived`, `#employee-list`, `#employee-list-empty` según `specs/001-crm-module/contracts/ui-contracts.md`
- [x] T211 [US25] (antes T014) Implementar API aditiva/compatible de empleados en `src/storage.js`: `loadEmployees({includeArchived})`/filtro equivalente, `archiveEmployee(id)`, `restoreEmployee(id)`, preservando historial y compatibilidad con claves canónicas (FR-090, FR-091, históricas T025, T055)
- [x] T212 [US25] (antes T015) Implementar render/handlers de empleados en `src/app.js`: `renderEmployeeList()`, `fillEmployeeForm()`, `resetEmployeeForm()`, create/update, filtro, toggle archivados usando `crm.gaps002.ui.employeesView` (FR-089, FR-090, FR-091)
- [x] T213 [US25] (antes T016) Integrar acciones archivar/restaurar por fila y refrescar selectores de responsable en `src/app.js` para excluir empleados archivados por defecto (FR-091, FR-100, histórica T056)
- [x] T214 [US25] (antes T017) Añadir estilos específicos de vista empleados en `src/styles.css` (tabla responsive, acciones fila, badge archivado) manteniendo consistencia visual existente

**Checkpoint**: US25 funcional e independientemente testeable.

---

## Fase 40: User Story 26 - Registrar interacciones con historial visible (Prioridad: P1)

**Objetivo**: CRUD visible de interacciones con historial por cliente y confirmación de eliminación.  
**Prueba independiente**: Crear/editar/eliminar interacción desde UI real y ver historial.  
**FR/SC**: FR-092, FR-093, SC-031. **Histórica**: T036.

### Pruebas para User Story 26 (escribir primero, FALLAR antes de implementar) ⚠️

- [x] T215 [P] [US26] (antes T018) Crear prueba de integración DOM real en `tests/integration/interactions-ui.test.js` para crear interacción válida con `#interaction-form`, `#interaction-client-id`, `#interaction-employee-id`, `#interaction-date`, `#interaction-type`, `#interaction-notes`, y verla en `#interaction-list` (FR-092, FR-093, SC-031, histórica T036)
- [x] T216 [P] [US26] (antes T019) Extender `tests/integration/interactions-ui.test.js` para editar sin duplicar, eliminar con confirmación accesible existente, y estado vacío `#interaction-list-empty` (FR-092, FR-093, SC-031)

### Implementación para User Story 26

- [x] T217 [US26] (antes T020) Añadir markup de vista Interacciones en `index.html`: `#nav-interactions`, `#view-interactions`, `#interaction-form`, `#interaction-id`, `#interaction-client-id`, `#interaction-employee-id`, `#interaction-date`, `#interaction-type`, `#interaction-notes`, `#interaction-list-filter`, `#interaction-list`, `#interaction-list-empty` según `contracts/ui-contracts.md`
- [x] T218 [US26] (antes T021) Implementar/ajustar API de interacciones en `src/storage.js` para CRUD visible, `loadInteractionsByCustomer(customerId)`, validación de refs activas y orden determinista (FR-092, FR-093, histórica T036)
- [x] T219 [US26] (antes T022) Implementar render/handlers de interacciones en `src/app.js`: listado, filtro, fill/reset, create/update, delete con diálogo accesible existente, y refresco de historial relacionado (FR-092, FR-093)
- [x] T220 [US26] (antes T023) Poblar selectores de interacción con clientes/empleados activos no archivados en `src/app.js` y mantener exclusión tras archive/restore (FR-091, FR-092, histórica T056)
- [x] T221 [US26] (antes T024) Añadir estilos de vista/historial de interacciones en `src/styles.css` (lista/tabla, campos, empty state)

**Checkpoint**: US26 funcional e independientemente testeable.

---

## Fase 41: User Story 27 - Flujo completo de oportunidades con lifecycle configurable (Prioridad: P1)

**Objetivo**: Aplicar `opportunityLifecycle` canónico, bloquear transiciones inválidas con feedback claro y mostrar banner visible de errores de configuración.  
**Prueba independiente**: Transición permitida persiste; inválida no persiste y muestra feedback; config inválida muestra banner con fallback seguro.  
**FR/SC**: FR-094, FR-095, FR-101, SC-032. **Históricas**: T030, T062, T064.

### Pruebas para User Story 27 (escribir primero, FALLAR antes de implementar) ⚠️

- [x] T222 [P] [US27] (antes T025) Crear prueba de integración DOM real en `tests/integration/opportunities-lifecycle.test.js` para transición permitida persistida y transición inválida bloqueada con feedback en `#status`/`#error-status` o `#lifecycle-feedback` (FR-094, FR-095, SC-032, históricas T030, T062)
- [x] T223 [P] [US27] (antes T026) Añadir prueba de integración DOM real en `tests/integration/opportunities-lifecycle.test.js` para banner `#config-error-banner`/`#config-error-detail` cuando `loadModuleConfig()` devuelve error/fallback, manteniendo app utilizable (FR-101, SC-032, histórica T064)

### Implementación para User Story 27

- [x] T224 [US27] (antes T027) Actualizar `src/main.js` y/o `src/app.js` para recibir resultado de `loadModuleConfig()` y renderizar `#config-error-banner`/`#config-error-detail`/`#config-error-dismiss` según `contracts/ui-contracts.md` sin bloquear CRUD básico (FR-101, histórica T064)
- [x] T225 [US27] (antes T028) Integrar validación de transición en `src/storage.js` y `src/app.js` usando `opportunityLifecycle` canónico normalizado desde `module-config.statusLifecycle`; rechazar transición inválida sin persistir (FR-094, FR-095, históricas T030, T062)
- [x] T226 [US27] (antes T029) Actualizar UI de oportunidad en `index.html`/`src/app.js` para poblar `#status` desde lifecycle vigente y mostrar feedback accesible de transición inválida (FR-094, FR-095)
- [x] T227 [US27] (antes T030) Añadir estilos/estados de banner de configuración y feedback lifecycle en `src/styles.css` respetando tokens y accesibilidad

**Checkpoint**: US27 funcional; transiciones y config visible cumplen SC-032.

---

## Fase 42: User Story 28 - Ficha cliente 360° (Prioridad: P2)

**Objetivo**: Vista 360° de cliente con datos, oportunidades e interacciones; volver conserva contexto.  
**Prueba independiente**: Abrir ficha desde listado, ver secciones/estados vacíos, volver conservando filtro/selección.  
**FR/SC**: FR-096, FR-097, SC-033. **Histórica**: T041.

### Pruebas para User Story 28 (escribir primero, FALLAR antes de implementar) ⚠️

- [x] T228 [P] [US28] (antes T031) Crear prueba de integración DOM real en `tests/integration/client-360.test.js` para abrir `[data-action="view-client-360"]`, renderizar `#client-360-summary`, `#client-360-opportunities`, `#client-360-interactions` y estados vacíos (FR-096, SC-033, histórica T041)
- [x] T229 [P] [US28] (antes T032) Extender `tests/integration/client-360.test.js` para verificar que `#client-360-back` restaura contexto visible observable: `#entity-list-filter`, cliente/fila seleccionada (`#entity_id` o `data-selected`) y vista `#view-entities` activa; los datos se guardan en `crm.gaps002.ui.clients360` y, sin estado previo, se usa vacío (FR-097, SC-033)

### Implementación para User Story 28

- [x] T230 [US28] (antes T033) Añadir markup de ficha 360 en `index.html`: `#view-client-360` (selector público canónico único), `#client-360-back`, `#client-360-summary`, `#client-360-opportunities`, `#client-360-opportunities-empty`, `#client-360-interactions`, `#client-360-interactions-empty` según `contracts/ui-contracts.md`
- [x] T231 [US28] (antes T034) Implementar consultas de composición en `src/storage.js`/`src/domain.js` (`getCustomer360` o reutilización de `getCustomerActivity`) con oportunidades/interacciones relacionadas y flags de vacío (FR-096)
- [x] T232 [US28] (antes T035) Implementar navegación lista→ficha→lista en `src/app.js`, preservando filtro/selección visible y estado `crm.gaps002.ui.clients360` (FR-097)
- [x] T233 [US28] (antes T036) Añadir estilos de ficha 360 en `src/styles.css` (layout, secciones, empty states, responsive)

**Checkpoint**: US28 funcional e independientemente testeable.

---

## Fase 43: User Story 29 - Dashboard operativo y calidad de datos (Prioridad: P2)

**Objetivo**: Mostrar "Próximos cierres" e integridad referencial visible sin romper KPIs canónicos base.  
**Prueba independiente**: Sembrar oportunidades próximas y referencias inválidas; verificar secciones y estados vacíos.  
**FR/SC**: FR-098, FR-099, SC-034. **Históricas**: T046, T057.

### Pruebas para User Story 29 (escribir primero, FALLAR antes de implementar) ⚠️

- [x] T234 [P] [US29] (antes T037) Crear prueba de integración DOM real en `tests/integration/dashboard-upcoming-integrity.test.js` para renderizar `#upcoming-closures-section`, `#upcoming-closures-list`, `#upcoming-closures-empty` y navegación `[data-action="open-upcoming-opportunity"]` (FR-098, SC-034, histórica T046)
- [x] T235 [P] [US29] (antes T038) Extender `tests/integration/dashboard-upcoming-integrity.test.js` para reporte `#integrity-report`, `#integrity-report-list`, `#integrity-report-empty` con hallazgos de referencia inexistente y sin falsos positivos (FR-099, SC-034, histórica T057)

### Implementación para User Story 29

- [x] T236 [US29] (antes T039) Añadir markup de dashboard en `index.html` para próximos cierres e integridad referencial según `contracts/ui-contracts.md`, sin alterar tarjetas KPI canónicas base
- [x] T237 [US29] (antes T040) Implementar render derivado read-only en `src/app.js` usando `getUpcomingClosures()` y `getReferentialIntegrityReport()`; no recalcular ni duplicar `getCRMOverview()` (FR-098, FR-099, históricas T046, T057)
- [x] T238 [US29] (antes T041) Conectar navegación desde cierre próximo a oportunidad en `src/app.js` (`#view-documents` + selección/carga) preservando comportamiento existente (FR-098)
- [x] T239 [US29] (antes T042) Añadir estilos de secciones dashboard/próximos cierres/integridad en `src/styles.css` (tablas/listas, estados vacíos, severidad warning)

**Checkpoint**: US29 funcional; dashboard base conserva fuente canónica.

---

## Fase 44: User Story 30 - Archivado visible y rendimiento real (Prioridad: P3)

**Objetivo**: Archivar/restaurar clientes desde UI, excluir archivados consistentemente y cumplir SC-035 en DOM real con 500 registros.  
**Prueba independiente**: Archivar/restaurar cliente/empleado desde UI; prueba DOM 500 registros cumple umbrales.  
**FR/SC**: FR-100, FR-102, FR-091 (consistencia), SC-031, SC-035. **Históricas**: T052, T055, T056.

### Pruebas para User Story 30 (escribir primero, FALLAR antes de implementar) ⚠️

- [x] T240 [P] [US30] (antes T043) Extender `tests/integration/archive-restore-ui.test.js` para archivar/restaurar cliente con `#entity-show-archived`, `[data-action="restore-entity"]`/`restore-customer`, exclusión en `#entity_id` y `#interaction-client-id` (FR-100, FR-091, SC-031, históricas T055, T056)
- [x] T241 [P] [US30] (antes T044) Crear prueba de rendimiento DOM real en `tests/integration/performance-dom.test.js` que siembra 500 clientes con registros asociados y verifica SC-035: filtro/búsqueda completa <= 10 s y renderizado inicial de listado <= 2 s (`contracts/performance.md`, FR-102, histórica T052)

### Implementación para User Story 30

- [x] T242 [US30] (antes T045) Implementar/ajustar `archiveCustomer`/`restoreCustomer` y filtros `includeArchived` en `src/storage.js` manteniendo compatibilidad con `deleteCustomer` soft-archive (FR-100, histórica T055)
- [x] T243 [US30] (antes T046) Añadir controles y acciones de archivado/restauración de clientes en `index.html` y `src/app.js` (`#entity-show-archived`, acciones por fila, badges) según `contracts/ui-contracts.md` (FR-100)
- [x] T244 [US30] (antes T047) Aplicar exclusión consistente de archivados en listas/selectores operativos de clientes/empleados/oportunidades/interacciones en `src/app.js` (FR-091, FR-100, histórica T056)
- [x] T245 [US30] (antes T048) Optimizar render/filtro DOM real en `src/app.js` para dataset 500 (DocumentFragment, evitar recomputación innecesaria) sin cambiar comportamiento funcional; validar con T241 (FR-102, SC-035, histórica T052)

**Checkpoint**: US30 funcional; rendimiento SC-035 verificado.

---

## Fase 45: Pulido y Cross-Cutting Concerns del cierre de brechas

**Propósito**: Consolidación transversal, regresión y evidencia de quickstart.

- [x] T246 [P] (antes T049) Actualizar `specs/001-crm-module/quickstart.md` con resultados/ajustes reales de ejecución si cambian IDs o pasos, manteniendo trazabilidad FR/SC/T históricas
- [x] T247 (antes T050) Ejecutar regresión completa `npm run test:run`, `npm run lint`, `npm run build` en raíz del repo y corregir fallos en ruta activa (`index.html`, `src/*`, `tests/*`) sin tocar `src/components/*`
- [x] T248 [P] (antes T051) Revisar cobertura final FR-089–FR-102 y SC-031–SC-035 contra pruebas en `tests/unit/*` y `tests/integration/*`; añadir ajuste menor solo si falta evidencia automatizada
- [x] T249 (antes T052) Verificar manualmente escenarios de `specs/001-crm-module/quickstart.md` para US25–US30 y registrar cualquier brecha como tarea nueva en futura fase (no reescribir tareas existentes)

---

## Dependencias y orden de ejecución del cierre de brechas

### Dependencias de fase

- **Fase 37 (Setup)**: sin dependencias.
- **Fase 38 (Fundacional)**: depende de Fase 37; **bloquea US25–US30**.
- **Fases 39–44 (US25–US30)**: dependen de Fase 38; pueden avanzar por prioridad P1→P2→P3, o en paralelo donde no haya solapamiento de archivo.
- **Fase 45 (Polish)**: depende de historias deseadas completas.

### Dependencias de historias

- **US25 (P1)**: tras Fundacional; base para selectores de empleados.
- **US26 (P1)**: tras Fundacional; integra con US25 para selectores de empleado activo.
- **US27 (P1)**: tras Fundacional; usa lifecycle/config base (T201/T203/T206).
- **US28 (P2)**: tras Fundacional; se beneficia de datos US25/US26 pero es testeable con seed propio.
- **US29 (P2)**: tras Fundacional; usa derivadas T204; navega a oportunidades existentes.
- **US30 (P3)**: tras US25/US26/US28 parcialmente por consistencia de archivado, pero sus pruebas deben seedear estado propio; cierra rendimiento SC-035.

### Dentro de cada historia

- Pruebas primero (deben fallar antes de implementar).
- Storage/domain antes de app wiring cuando aplique.
- Markup/contrato DOM antes o junto a render handlers.
- Historia completa y verde antes de pasar a la siguiente prioridad.

## Oportunidades paralelas del cierre de brechas

- T199, T200 en paralelo.
- T201 y T202 en paralelo; T203 y T204 en paralelo tras sus pruebas.
- En US25: T208 y T209 en paralelo.
- En US26: T215 y T216 en paralelo.
- En US27: T222 y T223 en paralelo.
- En US28: T228 y T229 en paralelo.
- En US29: T234 y T235 en paralelo.
- En US30: T240 y T241 en paralelo.

## Estrategia de implementación del cierre de brechas

### MVP primero (US25)
1. Completar Fase 37 y 38.
2. Completar US25 (T208–T214).
3. Validar US25 independientemente; demo de empleados + archivado básico.

### Entrega incremental
1. Setup + Fundacional.
2. US25 → US26 → US27 (P1 núcleo operativo).
3. US28 → US29 (P2 visibilidad/operación).
4. US30 (P3 archivado completo + rendimiento SC-035).
5. Polish y regresión completa.

## Cobertura FR/SC del cierre de brechas

| Requisito | Tareas principales | Prueba/evidencia |
|---|---|---|
| FR-089 | T208,T210,T212 | `tests/integration/employees-ui.test.js` |
| FR-090 | T209,T211,T212,T213 | `tests/integration/archive-restore-ui.test.js` |
| FR-091 | T209,T213,T220,T244 | archive/restore + selectores activos |
| FR-092 | T215,T216,T217,T218,T219 | `tests/integration/interactions-ui.test.js` |
| FR-093 | T215,T218,T219 | historial visible por cliente |
| FR-094 | T201,T203,T222,T225,T226 | `tests/unit/lifecycle-transitions.test.js`, `tests/integration/opportunities-lifecycle.test.js` |
| FR-095 | T201,T203,T222,T225,T226 | feedback transición inválida, no persiste |
| FR-096 | T228,T230,T231 | `tests/integration/client-360.test.js` |
| FR-097 | T229,T232 | retorno conserva contexto |
| FR-098 | T204,T234,T236,T237,T238 | `tests/integration/dashboard-upcoming-integrity.test.js` |
| FR-099 | T202,T204,T235,T236,T237 | reporte integridad visible |
| FR-100 | T209,T240,T242,T243,T244 | archive/restore clientes UI |
| FR-101 | T201,T206,T223,T224,T227 | banner config visible + fallback |
| FR-102 | T199,T241,T245 | `tests/integration/performance-dom.test.js` |
| SC-031 | T208,T209,T215,T216,T240 | CRUD/archive/restore UI real (Clientes, Empleados e Interacciones) |
| SC-032 | T201,T222,T223,T225 | lifecycle + transiciones inválidas bloqueadas |
| SC-033 | T228,T229,T232 | 360° <=3 interacciones, contexto preservado |
| SC-034 | T234,T235,T237 | próximos cierres + integridad, vacíos claros |
| SC-035 | T199,T241,T245 | 500 registros, filtro <=10s, render <=2s |
