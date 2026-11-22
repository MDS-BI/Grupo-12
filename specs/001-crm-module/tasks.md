# Tareas: Módulo CRM (Customer Relationship Management)

**Entrada**: Documentos de diseño desde `/specs/001-crm-module/` (módulo CRM + interfaz SaaS profesional)
**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio), research.md, data-model.md, contracts/crm-storage.md

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[USn]**: Historia de usuario de `spec.md` (US1–US15)
- Toda tarea que cambia comportamiento de negocio se acompaña de sus pruebas (Constitución, Principio II)

> **Ruta ejecutable**: las Fases 3–13 conservan el registro histórico de la arquitectura basada en `src/components/*`; no son prerrequisitos bloqueantes. La implementación activa se realiza en el DOM real de Fases 14–22 (`index.html`, `src/`) y sus comportamientos se validan allí. Las tareas pendientes de Fases 3–13 se conservan solo como referencia histórica.

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
- [ ] T020 [US1] Conectar alta/edición de clientes, mensajes de validación y refresco de lista en `src/app.js` (FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-032)
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
- [ ] T025 [US2] Conectar el CRUD de empleados y exponer selectores de empleados activos en `src/app.js` (FR-008)

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
- [ ] T030 [US3] Conectar alta/edición, transición de etapa y validaciones en `src/app.js` (FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-032)
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
- [ ] T036 [US4] Conectar registro/edición de interacciones y refresco del historial en `src/app.js` (FR-018, FR-019, FR-020, FR-021, FR-022, FR-032)
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
- [ ] T041 [US5] Conectar la navegación lista → ficha → lista preservando los datos en `src/app.js` (FR-023, FR-033)
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
- [ ] T046 [US6] Recalcular los indicadores y la sección «Próximos cierres» cada vez que se muestra el dashboard, sin recalcularlos automáticamente mientras permanece abierto, y conectar los accesos rápidos en `src/app.js` e `index.html` (FR-026, FR-027, FR-028, FR-046)
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
- [ ] T051 [US7] Conectar búsqueda/filtros y estado vacío, manteniendo sincronía con las acciones de crear/editar/archivar en `src/app.js` (FR-029, FR-030, FR-031)
- [ ] T052 [US7] Optimizar búsqueda, filtros y renderizado para 500 clientes y sus registros asociados, verificando búsqueda ≤10 s y renderizado inicial ≤2 s (FR-042, SC-002, SC-004)

**Punto de control**: Búsqueda y filtros funcionales y responsivos a la escala objetivo.

---

## Fase 10: Historia de Usuario 8 - Validaciones e integridad referencial (Prioridad: P1)

**Objetivo**: Garantizar registros completos, referencias válidas y archivado lógico que preserve el historial.

**Prueba Independiente**: El usuario comprueba que los registros inválidos se rechazan con mensajes claros y que archivar preserva oportunidades e interacciones.

### Pruebas para la Historia de Usuario 8

- [x] T053 [P] [US8] Añadir pruebas unitarias de rechazo de referencias inexistentes/archivadas y de reporte de inconsistencias al cargar en `tests/unit/integrity.test.js` (FR-025, FR-043, FR-044)
- [x] T054 [P] [US8] Añadir pruebas de integración de archivado con preservación de historial, exclusión de selectores y mensajes claros en `tests/integration/archive-integrity.test.js` (FR-024, FR-025, FR-032, FR-043, FR-044)

### Implementación de la Historia de Usuario 8

- [ ] T055 [US8] Exponer las acciones de archivar cliente/empleado y consultar su historial (FR-024, FR-044)
- [ ] T056 [US8] Excluir clientes y empleados archivados de las listas operativas y de los selectores de nuevos registros en `src/app.js` (FR-043)
- [ ] T057 [US8] Mostrar un reporte visible de registros con referencias inexistentes al cargar los datos (FR-025)
- [ ] T058 [US8] Centralizar mensajes de validación claros y consistentes en todos los formularios (FR-032)

**Punto de control**: La integridad referencial y el archivado lógico funcionan sin pérdida de historial.

---

## Fase 11: Historia de Usuario 9 - Configurar el módulo CRM (Prioridad: P2)

**Objetivo**: Adaptar terminología, campos personalizados, ciclo de vida de oportunidades y color de acento mediante configuración.

**Prueba Independiente**: Un desarrollador aplica una configuración y todas las pantallas usan los valores configurados sin tocar el código central.

### Pruebas para la Historia de Usuario 9

- [x] T059 [P] [US9] Añadir pruebas de integración de etiquetas, campos personalizados, ciclo de vida y color de acento, incluida la configuración inválida en `tests/integration/module-config.test.js` (FR-034, FR-035, FR-036, FR-037, XR-001, XR-002, XR-003, XR-004, XR-005, SC-009)

### Implementación de la Historia de Usuario 9

- [ ] T060 [US9] Derivar todas las etiquetas visibles de la configuración en las pantallas y componentes (FR-035, XR-002)
- [ ] T061 [US9] Aplicar los campos personalizados en formularios, listas, validación y búsqueda (FR-036, XR-001)
- [ ] T062 [US9] Aplicar `opportunityLifecycle` configurado a las transiciones de oportunidad (XR-003)
- [ ] T063 [US9] Aplicar `moduleName` y `theme.accentColor` como variables/propiedades CSS globales (XR-004)
- [ ] T064 [US9] Cargar la configuración al arrancar con valores predeterminados y reporte de errores (FR-034, FR-037, XR-005)

**Punto de control**: El módulo se adapta completamente mediante configuración.

---

## Fase 12: Historia de Usuario 10 - Espacio de trabajo CRM consistente (Prioridad: P2)

**Objetivo**: Envolver todas las pantallas en un marco persistente con barra superior, barra lateral y área activa resaltada.

**Prueba Independiente**: En cada pantalla se ven la barra superior y la barra lateral, el área activa está resaltada y la navegación es operable en ventanas estrechas.

### Pruebas para la Historia de Usuario 10

- [x] T065 [P] [US10] Añadir pruebas de integración del marco (logotipo, nombre del módulo, barra lateral, área activa) y del comportamiento responsivo en `tests/integration/workspace-shell.test.js` (FR-038, FR-039, FR-040)

### Implementación de la Historia de Usuario 10

- [x] T066 [P] [US10] Crear `src/components/shell.js` con logotipo SVG, barra superior y barra lateral de módulos (FR-038, FR-039)
- [ ] T067 [US10] Envolver todas las vistas en el marco y resaltar visualmente el área activa (FR-038, FR-039)
- [x] T068 [US10] Contraer la barra lateral a una columna de iconos en ventanas gráficas estrechas (FR-040)

**Punto de control**: Todas las pantallas comparten un espacio de trabajo consistente y navegable.

---

## Fase 13: Pulido y Verificación Transversal

**Propósito**: Accesibilidad, UX, rendimiento y verificación final contra los criterios de éxito.

- [x] T069 [P] Añadir refinamientos de accesibilidad (etiquetas, foco de teclado, `aria-current`, estructura semántica)
- [x] T070 [P] Pulir estados vacíos, mensajes de validación y diseño responsivo en todas las vistas
- [ ] T071 [P] Añadir pruebas de rendimiento con 500 clientes y sus oportunidades e interacciones asociadas, con aserciones de búsqueda ≤10 s y renderizado ≤2 s (FR-042, SC-002, SC-004)
- [ ] T072 Ejecutar la suite completa y verificar SC-005, SC-006, SC-007, SC-008, SC-010 y SC-011
- [ ] T073 Actualizar `README.md` con los flujos CRM, el archivado lógico y la configuración del módulo
- [ ] T074 Ejecutar la compilación de producción y verificar que no hay regresiones

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

- [x] T081 [P] [US11] Añadir pruebas de acceso dividido, visibilidad y errores en `tests/integration/ui-contracts.test.js`
- [x] T082 [P] [US11] Añadir prueba estática de la rejilla 45%/55% y el apilado a 820 px en `tests/unit/layout-contract.test.js`

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

- [x] T089 [US12] Sustituir el SVG de `#menu-toggle` por el contrato de iconos y añadir `aria-hidden`, `focusable` y etiqueta dinámica en `index.html`
- [x] T090 [US12] Implementar lectura/escritura de `sessionStorage['erp.sidebarCollapsed']`, sincronización de ARIA y cierre por Escape/clic fuera en `src/app.js`
- [x] T091 [US12] Reemplazar `display: none` por la franja de 64 px y el overlay para ≤ 900 px en `src/styles.css`
- [x] T092 [US12] Eliminar la preferencia del menú al cerrar sesión en `src/main.js`

**Punto de control**: US12 funciona de forma aislada y no altera US11.

---

## Fase 18: Historia de Usuario 13 - Orientarse en el Dashboard con banner y tarjetas KPI (Prioridad: P2)

**Objetivo**: saludo con el usuario autenticado y cuatro KPI derivados del CRM con estados vacíos neutros (FR-057 a FR-060).

**Prueba Independiente**: entrar con `Cliente1`, verificar `#welcome-title` y las cuatro etiquetas/valores, sembrar datos con `addCustomer`/`addOpportunity` y comprobar la actualización y la conversión.

### Pruebas para la Historia de Usuario 13

- [x] T093 [P] [US13] Añadir pruebas unitarias de `computeConversionRate()` que cubran FR-058: `ganadas / (ganadas + perdidas)`, redondeo entero, `0 %` sin oportunidades cerradas, alias `etapa` y sin mutación en `tests/unit/conversion-rate.test.js` (FR-058)
- [x] T094 [P] [US13] Añadir pruebas de banner, cuatro KPI y estado vacío en `tests/integration/ui-contracts.test.js`

### Implementación de la Historia de Usuario 13

- [x] T095 [US13] Implementar `computeConversionRate(opportunities)` en `src/domain.js` según FR-058, con redondeo entero y `0` cuando no existan oportunidades cerradas (FR-058)
- [x] T096 [US13] Añadir `#welcome-title` y las tarjetas `#stat-clients`, `#stat-opportunities`, `#stat-revenue` y `#stat-conversion` con sus etiquetas en `index.html`
- [x] T097 [US13] Ampliar `updateDashboardStats()` para renderizar los cuatro KPI desde `getCRMOverview()` en `src/app.js`
- [x] T098 [US13] Añadir `renderWelcomeBanner()` leyendo `AUTH_STORAGE_KEY` en `src/app.js`
- [x] T099 [US13] Sincronizar el alta/edición de `#entity-form` con `addCustomer()`/`updateCustomer()` para FR-060 en `src/app.js`
- [x] T100 [US13] Ajustar `.stats-grid` y `.welcome-banner` para 1366 × 768 sin desplazamiento vertical en `src/styles.css`

**Punto de control**: US13 es verificable de forma aislada y refleja datos vigentes.

---

## Fase 19: Historia de Usuario 14 - Capturar datos con formularios estandarizados (Prioridad: P2)

**Objetivo**: dos bloques con encabezados literals en mayúsculas, estructura repetida y errores uniformes (FR-061 a FR-064).

**Prueba Independiente**: comprobar `textContent` exacto de ambos encabezados en alta y edición, enviar con campos vacíos y verificar errores junto al campo sin guardar.

### Pruebas para la Historia de Usuario 14

- [x] T101 [P] [US14] Añadir pruebas de encabezados exactos, agrupación y errores uniformes en `tests/integration/ui-contracts.test.js`
- [x] T102 [P] [US14] Añadir prueba estática de los literales `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` en `tests/unit/form-headings.test.js`

### Implementación de la Historia de Usuario 14

- [x] T103 [US14] Reestructurar `#entity-form` en dos `.form-section` con encabezados literales en mayúsculas en `index.html`
- [x] T104 [US14] Migrar contacto al primer bloque y moneda/importe/plazos al segundo en `index.html`
- [x] T105 [US14] Unificar redacción y ubicación de `.validation-error` en `src/app.js`
- [x] T106 [US14] Igualar jerarquía, alineación y espaciado de `.form-section-title`, `.form-grid` y `.field` en `src/styles.css`

**Punto de control**: US14 es consistente en alta y edición sin afectar a US13.

---

## Fase 20: Historia de Usuario 15 - Leer textos en español sin caracteres mal formados (Prioridad: P3)

**Objetivo**: UTF-8 limpio en encabezados, etiquetas, listados y datos introducidos (FR-065 a FR-067).

**Prueba Independiente**: verificar `<meta charset="UTF-8" />`, recorrer todas las vistas con acentos, «ñ» y símbolos monetarios y round-trip de `Ana García Ñuñez` sin U+FFFD.

### Pruebas para la Historia de Usuario 15

- [x] T107 [P] [US15] Añadir pruebas de round-trip y ausencia de U+FFFD/mojibake en `tests/integration/ui-contracts.test.js`
- [x] T108 [P] [US15] Añadir prueba estática de declaración UTF-8 en `tests/unit/utf8-contract.test.js`

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

- [ ] T117 [P] [US6] Escribir pruebas unitarias de `getCRMOverview()` —con `getDashboardMetrics()` solo como alias de compatibilidad— que comprueben que una oportunidad abierta de un cliente archivado cuenta en oportunidades, pipeline y próximos cierres (FR-068) en `tests/unit/dashboard-metrics.test.js`
- [ ] T118 [P] [US8] Escribir pruebas unitarias de unicidad de correo que incluyan clientes archivados (FR-069) en `tests/unit/client-uniqueness.test.js`
- [ ] T119 [P] [US14] Escribir la prueba de integración de la confirmación «Permanecer»/«Descartar» al salir de cualquier formulario CRM del DOM real con cambios —actualmente `#entity-form`, y cualquier otro formulario que se incorpore— (FR-070) en `tests/integration/unsaved-changes.test.js`
- [ ] T120 [P] [US9] Escribir la prueba de integración de campos personalizados eliminados: valor conservado en `localStorage` y oculto en formularios, listas y búsqueda (FR-071) en `tests/integration/module-config.test.js`
- [ ] T121 [P] [US8] Escribir la prueba de integración de arranque con datos corruptos según el criterio de forma de `contracts/crm-storage.md`: error visible, sin sobrescritura automática y reinicio explícito (FR-072) en `tests/integration/storage-recovery.test.js`
- [ ] T122 [P] [US10] Escribir la prueba de integración que compruebe que el selector `Claro`/`Oscuro` existe, que la preferencia se conserva entre recargas y que el tema elegido está aplicado en el primer snapshot del DOM sin transición visible del tema (FR-073, SC-021) en `tests/integration/theme.test.js`

### Implementación de las clarificaciones

- [ ] T123 [US6] Ajustar `getCRMOverview()` en `src/storage.js` para seleccionar oportunidades abiertas por etapa sin filtrar por el estado `archived` del cliente, manteniendo la exclusión de archivados en «Clientes activos» (FR-068)
- [ ] T124 [US8] Reforzar `isEmailAvailable()` y `addCustomer()`/`updateCustomer()` en `src/storage.js` para rechazar correos de clientes archivados (FR-069)
- [ ] T125 [US14] Centralizar la navegación en `src/app.js` y añadir en `index.html` un diálogo de cambios sin guardar, aplicable a cualquier formulario CRM del DOM real, con opciones «Permanecer» y «Descartar» (FR-070)
- [ ] T126 [US9] Derivar los campos visibles de la configuración activa en `src/module-config.js` y fusionar actualizaciones con el registro almacenado en `src/storage.js` para conservar valores huérfanos (FR-071)
- [ ] T127 [US8] Validar las claves del CRM al arrancar en `src/storage.js` usando el criterio de forma de `contracts/crm-storage.md`, y mostrar el error con acción de reinicio explícito en `src/app.js` (FR-072)
- [ ] T128 [US10] Añadir el selector `Claro`/`Oscuro` al espacio de trabajo en `index.html`; guardar y aplicar la preferencia desde `localStorage['crm.theme']` en el primer snapshot del DOM, sin transición visible del tema, en `src/main.js` e `index.html` (FR-073, SC-021), sin escribir en las claves `crm_module:*` ni en `erp_*`
- [ ] T129 Ejecutar `npm run test:run`, `npm run lint` y `npm run build`, y validar los escenarios 1–6 de la sección «Clarificaciones de 2026-11-21» de `specs/001-crm-module/quickstart.md`

**Punto de control**: las clarificaciones están implementadas y son verificables de forma independiente.

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

> Las dependencias de Fases 1–13 describen el registro histórico de `src/components/*` y no bloquean la ruta ejecutable. La cadena activa es Fase 14 → Fase 15 → Fases 16–20 → Fase 21 → Fase 22.

- Configuración (Fase 1): sin dependencias
- Fundacional (Fase 2): depende de la Fase 1
- Historia de Usuario 1 (Fase 3): depende de la Fase 2
- Historia de Usuario 2 (Fase 4): depende de la Fase 2; puede proceder tras la US1
- Historia de Usuario 3 (Fase 5): depende de la Fase 2 y de la US2 (selector de empleado)
- Historia de Usuario 4 (Fase 6): depende de la Fase 2 y de la US2; independiente de la US3
- Historia de Usuario 5 (Fase 7): depende de la US1, US3 y US4 (consolida sus datos)
- Historia de Usuario 6 (Fase 8): depende de la US1 y US3 (indicadores sobre clientes y oportunidades)
- Historia de Usuario 7 (Fase 9): depende de la US1 y US3
- Historia de Usuario 8 (Fase 10): depende de la Fase 2 y de la US1, US2, US3 y US4
- Historia de Usuario 9 (Fase 11): depende de la Fase 2; puede avanzar en paralelo con las historias de datos una vez existan las vistas
- Historia de Usuario 10 (Fase 12): depende de la Fase 2; envuelve las vistas existentes
- Pulido (Fase 13): depende de que las historias deseadas estén completas

### Oportunidades Paralelas

- T003 y T004 pueden ejecutarse en paralelo con las tareas de configuración
- T006, T011, T012 y T013 pueden ejecutarse en paralelo una vez creados sus módulos
- T015 puede ejecutarse junto al trabajo de almacenamiento y esqueleto
- Las pruebas de cada historia pueden crearse en paralelo con las tareas de implementación de la misma historia
- US2 (Fase 4) y US10 (Fase 12) son independientes y pueden avanzar en paralelo
- US3 (Fase 5) y US4 (Fase 6) pueden avanzar en paralelo tras la US2
- US6 (Fase 8) y US7 (Fase 9) pueden avanzar en paralelo tras la US3
- US9 (Fase 11) puede avanzar en paralelo con las historias de datos
- En la Fase 13, T069, T070 y T071 pueden ejecutarse en paralelo antes de T072–T074

- Interfaz SaaS profesional (Fases 14–21): no depende de las Fases 3–13 y actúa sobre el DOM real (`index.html`, `src/`); no revive `src/components/*`

### Dependencias entre Fases (Interfaz SaaS)

- **Configuración (Fase 14)**: sin dependencias; T076/T077 son bloqueantes para las pruebas de todas las historias
- **Fundacional (Fase 15)**: depende de Configuración; T078 y T080 bloquean la implementación visual y de sesión de US11–US13
- **Historias de Usuario (Fase 16–20)**: dependen de Fundacional; se ejecutan en orden P1 → P2 → P2 → P2 → P3
- **Pulido (Fase 21)**: depende de que las cinco historias de la interfaz estén completas
- **Clarificaciones (Fase 22)**: depende de la Fase 21 y de los módulos reales (`src/app.js`, `src/storage.js`, `src/main.js`, `index.html`); T129 se ejecuta al final

### Dependencias entre Historias de Usuario

- **US11 (P1)**: sin dependencias entre historias; entregable MVP de interfaz SaaS
- **US12 (P2)**: independiente de US11; comparte `index.html` y `src/styles.css`, por lo que sus ediciones se integran después de US11
- **US13 (P2)**: depende de T080 y de `getCRMOverview()` en `src/storage.js`; T099 garantiza que US14 tendrá datos coherentes
- **US14 (P2)**: depende de T096/T097 para que los cambios de `#entity-form` se reflejen en los KPI
- **US15 (P3)**: transversal; sus pruebas se ejecutan al final porque recorren todas las vistas
- **Clarificaciones (FR-068 a FR-073)**: se asignan a US6, US8, US9, US10 y US14; T117–T122 pueden ejecutarse en paralelo, T123–T128 se secuencian por archivo compartido y T129 cierra la fase

### Dentro de Cada Historia de Usuario

1. Pruebas marcadas como [P] primero; deben fallar antes de tocar producción
2. Cambios de marcado y estilos
3. Lógica en los módulos conectados (`main.js`, `app.js`, `domain.js`)
4. Integración y punto de control de la historia

### Oportunidades Paralelas

- T076 y T077 en paralelo; T078, T079 y T080 en paralelo (archivos distintos)
- US11: T081 + T082 en paralelo
- US12: T087 + T088 en paralelo
- US13: T093 + T094 en paralelo; T095 y T096 pueden prepararse en paralelo tras T094
- US14: T101 + T102 en paralelo
- US15: T107 + T108 en paralelo
- T112 y T114 en paralelo durante el pulido

---

## Ejemplo Paralelo: Historia de Usuario 11

```text
Tarea: "Añadir pruebas de acceso dividido, visibilidad y errores en tests/integration/ui-contracts.test.js" (T081)
Tarea: "Añadir prueba estática de la rejilla 45%/55% y el apilado a 820 px en tests/unit/layout-contract.test.js" (T082)
```

## Ejemplo Paralelo: Historia de Usuario 12

```text
Tarea: "Añadir pruebas de colapso, persistencia, sección activa y accesibilidad en tests/integration/sidebar-collapse.test.js" (T087)
Tarea: "Añadir prueba de regresión que prohíbe .sidebar { display: none; } en tests/unit/layout-contract.test.js" (T088)
```

## Ejemplo Paralelo: Historia de Usuario 13

```text
Tarea: "Añadir pruebas unitarias de computeConversionRate() en tests/unit/conversion-rate.test.js" (T093)
Tarea: "Añadir pruebas de banner, cuatro KPI y estado vacío en tests/integration/ui-contracts.test.js" (T094)
```

## Ejemplo Paralelo: Historia de Usuario 14

```text
Tarea: "Añadir pruebas de encabezados exactos, agrupación y errores uniformes en tests/integration/ui-contracts.test.js" (T101)
Tarea: "Añadir prueba estática de los literales en tests/unit/form-headings.test.js" (T102)
```

## Ejemplo Paralelo: Historia de Usuario 15

```text
Tarea: "Añadir pruebas de round-trip y ausencia de U+FFFD/mojibake en tests/integration/ui-contracts.test.js" (T107)
Tarea: "Añadir prueba estática de declaración UTF-8 en tests/unit/utf8-contract.test.js" (T108)
```

---

## Estrategia de Implementación

> El MVP de datos CRM (US1) y el MVP de interfaz SaaS (US11) son entregables distintos. Cuando el texto diga solo «MVP» sin calificador, se refiere al MVP de interfaz SaaS.

### MVP de interfaz SaaS primero (Historia de Usuario 11)

1. Completar Fase 14 y Fase 15
2. Completar Fase 16 (US11)
3. **DETENER Y VALIDAR**: ejecutar la Prueba Independiente de US11; demostrar acceso dividido y contraseña visible
4. Desplegar o mostrar el MVP de interfaz SaaS si está listo

### Entrega Incremental

1. Configuración + Fundacional → base lista
2. US11 → validar → MVP de interfaz SaaS
3. US12 → validar → navegación colapsable
4. US13 → validar → banner y KPI
5. US14 → validar → formularios estandarizados
6. US15 → validar → UTF-8 limpio
7. Pulido → verificación completa

### Estrategia de Equipo Paralelo

Con varios desarrolladores, tras la Fase 15: Dev A en US11, Dev B en US12, Dev C en US13; US14 y US15 se asignan al liberarse, coordinando las ediciones de `index.html`, `src/styles.css` y `src/app.js` para evitar conflictos.

---

## Notas

- `[P]` implica archivos distintos y ninguna dependencia pendiente; las ediciones sobre `index.html` o `src/app.js` se secuencian aunque pertenezcan a historias distintas
- `[USn]` garantiza trazabilidad con los FR de `spec.md`
- **Tareas históricas**: T018, T019, T024, T028, T029, T034, T035, T040, T045, T050 y T066 crean `src/components/*` y no se ejecutan; la fuente de verdad es el DOM real de Fases 14–21 y Fase 22
- Numeración correlativa T001–T129: 129 tareas totales, sin duplicados ni huecos
- Las tareas de implementación y prueba incluyen ruta de archivo; las de verificación ejecutan comandos o validan escenarios sin contexto adicional
- No se editan `src/components/*` ni `dist/index.html` a mano, según `research.md`
