# Tareas: Módulo CRM (Customer Relationship Management)

**Entrada**: Documentos de diseño desde `/specs/001-crm-module/`
**Prerrequisitos**: plan.md (obligatorio), spec.md (obligatorio), research.md, data-model.md, contracts/crm-storage.md

## Formato: `[ID] [P?] [Historia] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos distintos, sin dependencias pendientes)
- **[USn]**: Historia de usuario de `spec.md` (US1–US10)
- Toda tarea que cambia comportamiento de negocio se acompaña de sus pruebas (Constitución, Principio II)

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

## Fase 3: Historia de Usuario 1 - Gestionar clientes (Prioridad: P1) 🎯 MVP

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
- [x] T044 [P] [US6] Añadir pruebas de integración del dashboard con datos, sin datos y tras cambios en registros en `tests/integration/dashboard.test.js` (FR-026, FR-027, FR-028, FR-046)

### Implementación de la Historia de Usuario 6

- [x] T045 [P] [US6] Crear `src/components/dashboard.js` con indicadores y accesos rápidos para crear clientes, oportunidades e interacciones (FR-026, FR-028)
- [ ] T046 [US6] Recalcular los indicadores cada vez que se muestra el dashboard y conectar los accesos rápidos en `src/app.js` (FR-027, FR-028)
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
- [ ] T052 [US7] Optimizar búsqueda, filtros y renderizado para 500 clientes y sus registros asociados (FR-042, SC-004)

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
- [ ] T071 [P] Añadir pruebas de rendimiento con 500 clientes y sus oportunidades e interacciones asociadas (FR-042, SC-004)
- [ ] T072 Ejecutar la suite completa y verificar SC-005, SC-006, SC-007, SC-008, SC-010 y SC-011
- [ ] T073 Actualizar `README.md` con los flujos CRM, el archivado lógico y la configuración del módulo
- [ ] T074 Ejecutar la compilación de producción y verificar que no hay regresiones

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

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
