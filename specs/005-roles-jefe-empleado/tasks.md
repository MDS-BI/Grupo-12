# Tasks: Roles Jefe y Empleado

**Input**: Design documents from `/specs/005-roles-jefe-empleado/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/role-permissions.md, quickstart.md

**Tests**: Incluidos. La constitución del proyecto requiere pruebas automatizadas para cambios de comportamiento y lógica.

**Organization**: Tareas agrupadas por historia de usuario, con autenticación como base compartida.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque trabaja en archivos distintos y no tiene dependencia pendiente.
- **[Story]**: Historia de usuario de `spec.md` a la que corresponde la tarea.
- Cada tarea especifica los archivos involucrados.

## Phase 1: Setup

**Purpose**: Preparar fixtures para probar ambos roles sin introducir infraestructura nueva.

- [x] T001 [P] Actualizar `seedAuth` para aceptar una identidad explícita y usar Jefe como sesión predeterminada en `tests/integration/live-dom.js`.

---

## Phase 2: User Story 1 - Iniciar sesión con un rol asignado (Priority: P1)

**Goal**: Reemplazar Cliente1 por las credenciales diferenciadas de Jefe y Empleado, conservando el flujo de sesión existente.

**Independent Test**: Iniciar sesión con ambas credenciales, verificar la identidad mostrada, recordar/no recordar la sesión, cerrar sesión e intentar ingresar con Cliente1 y credenciales incorrectas.

### Tests for User Story 1

- [x] T002 [P] [US1] Añadir pruebas unitarias de aceptación de credenciales, resolución de identidad/rol y rechazo de Cliente1 en `tests/unit/authorization.test.js`.
- [x] T003 [US1] Añadir pruebas de integración de inicio/cierre de sesión, sesión recordada/no recordada y credenciales inválidas en `tests/integration/auth-roles.test.js`.

### Implementation for User Story 1

- [x] T004 [US1] Implementar validación de credenciales, resolución de identidad y rol, y acceso a la sesión existente en `src/authorization.js`; no persistir contraseñas ni un campo de rol separado.
- [x] T005 [US1] Integrar la autenticación de Jefe/Empleado en `src/main.js`, rechazar y limpiar únicamente identidades inválidas de `erp.authenticatedUser`, y pasar el usuario autenticado a `initApp` sin alterar el comportamiento de “recordarme” ni logout.

**Checkpoint**: Las dos cuentas válidas pueden iniciar sesión con el rol correcto; Cliente1 y credenciales inválidas no abren el workspace.

---

## Phase 3: User Story 2 - Operar el CRM con permisos de Empleado (Priority: P1)

**Goal**: Mostrar a Empleado los módulos operativos y permitir únicamente consulta y acciones operativas básicas definidas en la matriz.

**Independent Test**: Iniciar sesión como Empleado, consultar los módulos permitidos, registrar una interacción y actualizar un estado operativo; confirmar que módulos administrativos y acciones no autorizadas se ocultan y rechazan sin modificar datos.

### Tests for User Story 2

- [x] T006 [P] [US2] Añadir pruebas unitarias de la matriz de acceso a módulos y acciones permitidas/denegadas para Empleado en `tests/unit/authorization.test.js`.
- [x] T007 [P] [US2] Añadir pruebas de integración para navegación permitida, ocultamiento de Empleados, acciones operativas y rechazo de navegación/acciones restringidas en `tests/integration/auth-roles.test.js`.

### Implementation for User Story 2

- [x] T008 [US2] Definir en `src/authorization.js` los módulos de lectura permitidos para Empleado y sus capacidades de registrar interacciones y actualizar estados operativos, denegando administración general y eliminación.
- [x] T009 [US2] Filtrar la navegación y proteger `navigateTo`/`showView` frente a módulos no permitidos según el rol en `src/app.js`, manteniendo visibles Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda para Empleado.
- [x] T010 [US2] Ocultar acciones mutadoras no autorizadas y proteger sus manejadores antes de escribir datos en `src/app.js`; mantener disponibles el registro de interacciones y los cambios de estado permitidos.

**Checkpoint**: Empleado puede completar su recorrido operativo sin abrir módulos administrativos ni ejecutar acciones bloqueadas, incluso mediante navegación directa.

---

## Phase 4: User Story 3 - Administrar el CRM con permisos de Jefe (Priority: P1)

**Goal**: Mantener para Jefe el acceso completo a todos los módulos y acciones que ofrece actualmente la aplicación.

**Independent Test**: Iniciar sesión como Jefe, abrir cada módulo existente y verificar creación, edición, archivado/restauración y eliminación con las confirmaciones existentes.

### Tests for User Story 3

- [x] T011 [P] [US3] Añadir pruebas de integración de acceso de Jefe a todos los módulos y acciones CRUD existentes, incluido Empleados y el flujo de confirmación de eliminación, en `tests/integration/auth-roles.test.js`.

### Implementation for User Story 3

- [x] T012 [US3] Completar la matriz para que Jefe conserve todas las capacidades y módulos actuales en `src/authorization.js`; asegurar que las guardas de `src/app.js` no alteren sus formularios, archivado/restauración ni diálogos de eliminación.

**Checkpoint**: Jefe conserva el comportamiento completo previo en todos los módulos.

---

## Phase 5: User Story 4 - Mantener la información existente (Priority: P1)

**Goal**: Cambiar identidad y permisos sin modificar datos, claves CRM ni comportamiento no relacionado con roles.

**Independent Test**: Capturar claves/registros existentes, iniciar sesión y operar con ambos roles, cerrar/cambiar sesión y verificar que los valores de negocio se conservan.

### Tests for User Story 4

- [x] T013 [P] [US4] Añadir pruebas de integración que comparen claves y registros CRM antes/después de login, logout y cambio de rol, y que validen la reautenticación de una sesión legada en `tests/integration/auth-storage-preservation.test.js`.

### Compatibility and implementation

- [x] T014 [US4] Actualizar las pruebas de login exitoso y sus expectativas de identidad de Cliente1 a Jefe/Empleado, manteniendo un caso explícito de rechazo de Cliente1 en `tests/integration/ui-contracts.test.js` y `tests/integration/corrections-us16-us24.test.js`.
- [x] T015 [US4] Actualizar fixtures que guardan Cliente1 como usuario válido y sus propietarios de calendario para usar la identidad correspondiente en `tests/integration/calendar-general.test.js`, `tests/integration/calendar-interactions-sync.test.js`, `tests/integration/calendar-sidebar.test.js`, `tests/integration/contact-box.test.js`, `tests/integration/dashboard.test.js`, `tests/integration/sidebar-collapse.test.js` y `tests/integration/storage-recovery.test.js`.
- [x] T016 [US4] Confirmar que la implementación no modifica `src/storage.js`, claves `crm_module:*`/`erp_base_module:*` ni registros; corregir cualquier limpieza de sesión que afecte datos de negocio en `src/main.js` o `src/authorization.js`.

**Checkpoint**: El rol cambia la interfaz y las acciones disponibles, pero los registros y la persistencia CRM permanecen intactos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validación final de regresiones, lint y build.

- [x] T017 [P] Ejecutar y completar los recorridos de aceptación en `specs/005-roles-jefe-empleado/quickstart.md`.
- [x] T018 Ejecutar `npm run test:run`, `npm run lint` y `npm run build`; corregir regresiones únicamente en archivos de la feature y pruebas directamente relacionadas.

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sin dependencias; prepara el fixture compartido.
- **Phase 2 (US1)**: Depende de Setup; crea la identidad autenticada que consumen las demás historias.
- **Phase 3 (US2)**: Depende de US1 para obtener usuario/rol al iniciar la aplicación.
- **Phase 4 (US3)**: Depende de US1 y de las guardas introducidas en US2; valida el camino de permisos completos.
- **Phase 5 (US4)**: Depende de US1 y de la integración de roles; verifica que no se altere el almacenamiento ni los fixtures existentes.
- **Phase 6 (Polish)**: Depende de todas las historias seleccionadas.

### User Story Dependencies

- **US1 (P1)**: Base de autenticación; independiente de otras historias de producto.
- **US2 (P1)**: Requiere que US1 entregue una identidad autenticada y un rol.
- **US3 (P1)**: Requiere que las guardas de US2 existan para comprobar que Jefe no pierde capacidades.
- **US4 (P1)**: Requiere los flujos de sesión y permisos para comparar comportamiento y datos.

### Parallel Opportunities

- T001 y T002 pueden ejecutarse en paralelo porque modifican archivos distintos.
- T006 y T007 pueden prepararse en paralelo después del contrato de permisos.
- T013 puede prepararse en paralelo con T014/T015 porque cubren archivos de prueba distintos; integrar después de fijar la identidad válida.
- Las tareas de implementación T004/T005, T008/T009/T010 y T012 deben ejecutarse secuencialmente donde comparten contratos o archivos.

## Implementation Strategy

### MVP

1. Completar Setup y US1 para iniciar sesión como Jefe o Empleado y rechazar la identidad legada.
2. Completar US2 para limitar módulos y acciones de Empleado.
3. Validar US1/US2 antes de habilitar la administración completa de US3.

### Incremental Delivery

1. US1 → sesión y rol correctos.
2. US2 → restricciones de Empleado visibles y aplicadas a las acciones.
3. US3 → confirmar acceso completo de Jefe sin regresiones.
4. US4 → verificar integridad de datos y actualizar fixtures preexistentes.
5. Polish → quickstart, suite de tests, lint y build.

## Notes

- `[P]` indica tareas independientes en archivos diferentes; no implica que deban ejecutarse en paralelo.
- Las pruebas preceden a la implementación de cada política de permisos.
- No crear almacenamiento de roles ni migrar datos; el rol se deriva de la identidad autenticada.
- Las credenciales indicadas son de prueba y la autorización del frontend no protege frente a manipulación deliberada del navegador.
