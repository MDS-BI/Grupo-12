# Feature Specification: Roles Jefe y Empleado

**Feature Branch**: `005-roles-jefe-empleado`
**Created**: 2026-11-26
**Status**: Draft
**Input**: User description: "Implementar sistema de roles (Jefe y Empleado) para separar la interfaz y restringir funcionalidades según el usuario logueado. Reemplazar el usuario de prueba Cliente1 por credenciales específicas para Jefe (acceso total a módulos, edición y eliminación) y Empleado (acceso restringido solo a vistas y acciones operativas básicas, ocultando módulos administrativos y acciones críticas como eliminar), manteniendo intacto el resto de la aplicación y el almacenamiento existente."

## Clarifications

### Session 2026-11-26

- Q: ¿Qué credenciales de prueba deben utilizar Jefe y Empleado? → A: Jefe / Jefe123 y Empleado / Empleado123, respectivamente.

## User Scenarios & Testing

### User Story 1 - Iniciar sesión con un rol asignado (Priority: P1)

Como usuario del sistema, quiero ingresar con las credenciales de Jefe o Empleado para recibir la interfaz y los permisos correspondientes a mi función.

**Why this priority**: La identificación correcta del usuario es la base para aplicar cualquier separación de permisos.

**Independent Test**: Iniciar sesión por separado con cada conjunto de credenciales, verificar que Cliente1 ya no autentica y confirmar que cerrar sesión devuelve al formulario de acceso.

**Acceptance Scenarios**:

1. **Given** el usuario tiene credenciales válidas de Jefe, **When** inicia sesión, **Then** se identifica como Jefe y recibe la interfaz y permisos completos.
2. **Given** el usuario tiene credenciales válidas de Empleado, **When** inicia sesión, **Then** se identifica como Empleado y recibe la interfaz y permisos restringidos.
3. **Given** se ingresan credenciales incorrectas o las credenciales anteriores de Cliente1, **When** se intenta iniciar sesión, **Then** se rechaza el acceso y se muestra un error sin abrir la aplicación.
4. **Given** hay una sesión iniciada, **When** el usuario cierra sesión, **Then** la sesión y sus permisos dejan de estar activos y se solicita autenticación antes de volver a la aplicación.

---

### User Story 2 - Operar el CRM con permisos de Empleado (Priority: P1)

Como Empleado, quiero consultar la información comercial y realizar tareas operativas básicas sin acceder a funciones administrativas ni acciones críticas.

**Why this priority**: Permite el trabajo diario sin exponer operaciones que deben quedar reservadas a Jefe.

**Independent Test**: Iniciar sesión como Empleado, navegar por los módulos operativos, registrar una interacción y actualizar un estado operativo; confirmar que los módulos administrativos y las acciones de edición general y eliminación no están disponibles ni se pueden ejecutar.

**Acceptance Scenarios**:

1. **Given** inició sesión como Empleado, **When** consulta la navegación, **Then** puede acceder al Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda, y no ve el módulo Empleados ni otros módulos o controles administrativos.
2. **Given** inició sesión como Empleado, **When** consulta registros de clientes u oportunidades, **Then** puede ver sus datos sin poder crear, editar o eliminar esos registros.
3. **Given** inició sesión como Empleado, **When** registra una interacción o actualiza un estado operativo permitido, **Then** el cambio se guarda y queda visible según el comportamiento existente de la aplicación.
4. **Given** inició sesión como Empleado, **When** intenta abrir directamente un módulo restringido o ejecutar una acción no permitida, **Then** la acción se rechaza y los datos permanecen sin cambios.
5. **Given** inició sesión como Empleado, **When** consulta un registro con una acción crítica como eliminar, **Then** esa acción no se muestra ni está disponible.

---

### User Story 3 - Administrar el CRM con permisos de Jefe (Priority: P1)

Como Jefe, quiero acceder a todos los módulos y administrar registros para mantener y supervisar la información de la aplicación.

**Why this priority**: Conserva el acceso integral requerido para las tareas administrativas y de gestión.

**Independent Test**: Iniciar sesión como Jefe, recorrer todos los módulos existentes, crear y editar un registro, y eliminar un registro mediante el flujo de confirmación existente.

**Acceptance Scenarios**:

1. **Given** inició sesión como Jefe, **When** consulta la navegación, **Then** ve y puede abrir todos los módulos disponibles, incluido Empleados.
2. **Given** inició sesión como Jefe, **When** gestiona registros de los módulos existentes, **Then** puede realizar las acciones de consulta, creación, edición y eliminación que ofrece la aplicación.
3. **Given** inició sesión como Jefe, **When** elimina un registro, **Then** se conserva el flujo existente de confirmación y el registro se elimina solo después de confirmar.

---

### User Story 4 - Mantener la información existente (Priority: P1)

Como usuario del sistema, quiero que la incorporación de roles no altere los datos ni el funcionamiento existente para continuar el trabajo sin pérdida ni cambios inesperados.

**Why this priority**: Los permisos deben cambiar el acceso, no el contenido ni la continuidad de la aplicación.

**Independent Test**: Preparar datos existentes en los módulos, iniciar sesión con cada rol, verificar que la información original continúa disponible según los permisos y que no se ha reiniciado, migrado ni duplicado.

**Acceptance Scenarios**:

1. **Given** existen registros guardados antes de introducir los roles, **When** se inicia sesión como Jefe o Empleado, **Then** esos registros permanecen intactos y se muestran de acuerdo con los permisos del rol.
2. **Given** un usuario cambia de rol al cerrar sesión e iniciar otra sesión, **When** vuelve a consultar los módulos, **Then** se aplican los permisos del usuario autenticado actualmente y no se conserva el acceso del usuario anterior.
3. **Given** la autenticación se recuerda entre sesiones según la opción existente, **When** se restaura una sesión válida, **Then** se restaura únicamente la identidad y los permisos correspondientes a ese usuario.

### Edge Cases

- ¿Qué ocurre si se intenta restaurar una sesión antigua de Cliente1? Se solicita iniciar sesión con una de las credenciales válidas actuales y no se le asigna un rol por defecto.
- ¿Qué ocurre cuando el usuario intenta acceder a una función restringida mediante una ruta, control o acción directa? El acceso se rechaza además de ocultar el control en la interfaz.
- ¿Qué ocurre si un usuario cierra sesión y otro rol inicia sesión en el mismo navegador? La nueva sesión reemplaza la anterior y no conserva permisos ni datos de identidad visual del usuario previo.
- ¿Qué ocurre cuando Empleado intenta eliminar o editar datos administrativos desde una pantalla ya abierta antes de cambiar de usuario? La acción vuelve a validar el rol vigente y no modifica los datos.
- ¿Qué ocurre si se ingresa un nombre de usuario válido con contraseña incorrecta? Se deniega el acceso sin revelar qué parte de las credenciales fue incorrecta.
- ¿Qué ocurre con los registros ya guardados para los que Empleado no tiene permiso de escritura? Siguen almacenados y disponibles para los usuarios autorizados; no se borran ni se alteran.

## Requirements

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer autenticación para dos usuarios/roles diferenciados con estas credenciales de prueba: usuario `Jefe`, contraseña `Jefe123`; usuario `Empleado`, contraseña `Empleado123`.
- **FR-002**: El sistema DEBE dejar de aceptar Cliente1 como usuario de prueba y no DEBE asignar permisos por defecto a sesiones antiguas o identidades desconocidas.
- **FR-003**: El sistema DEBE identificar el rol correspondiente a la sesión autenticada y aplicar la interfaz y permisos de ese rol en toda la aplicación.
- **FR-004**: El rol Jefe DEBE poder acceder a todos los módulos existentes, incluido Empleados, y a las funciones de consulta, creación, edición y eliminación disponibles en esos módulos.
- **FR-005**: El rol Empleado DEBE poder consultar el Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda, y DEBE tener ocultos los módulos administrativos, incluido Empleados.
- **FR-006**: El rol Empleado DEBE poder realizar las acciones operativas básicas de registrar interacciones y actualizar estados operativos existentes, sin adquirir permisos generales de edición.
- **FR-007**: El rol Empleado NO DEBE poder crear, editar ni eliminar registros de Clientes, Oportunidades o Empleados, ni ejecutar otras acciones administrativas o críticas.
- **FR-008**: Las restricciones de acceso DEBEN aplicarse tanto a los controles visibles de la interfaz como a la ejecución de navegación y acciones; ocultar un control no constituye por sí solo autorización.
- **FR-009**: El sistema DEBE permitir cerrar sesión y retirar la identidad y permisos activos antes de mostrar o restaurar otra sesión.
- **FR-010**: La opción existente para recordar la sesión DEBE conservar su comportamiento para los usuarios válidos, restaurando únicamente el usuario autenticado y su rol.
- **FR-011**: La incorporación de roles DEBE preservar los registros, claves y comportamiento de almacenamiento existentes; NO DEBE reiniciar, migrar, reestructurar, duplicar ni borrar datos preexistentes.
- **FR-012**: El sistema DEBE conservar el resto de la aplicación y sus flujos existentes, salvo los cambios necesarios para sustituir Cliente1 y aplicar la separación de permisos descrita.
- **FR-013**: Los errores de autenticación o de autorización DEBEN comunicarse claramente sin revelar información sensible de las credenciales ni modificar datos.

### Key Entities

- **Usuario autenticado**: Identidad que inicia sesión, con credenciales propias y un rol asignado de Jefe o Empleado.
- **Rol**: Conjunto de permisos que determina qué módulos se pueden consultar y qué acciones se pueden ejecutar. Los roles de esta versión son Jefe y Empleado.
- **Permiso**: Autorización para consultar un módulo o ejecutar una acción; incluye acceso a módulos y acciones operativas, administrativas y críticas.
- **Datos existentes**: Registros de la aplicación almacenados antes de esta funcionalidad; conservan su estructura y contenido independientemente del rol.

## Success Criteria

### Measurable Outcomes

- **SC-001**: El 100% de los intentos con credenciales válidas de Jefe o Empleado inicia sesión con el rol esperado, y el 100% de intentos con credenciales inválidas o Cliente1 es rechazado.
- **SC-002**: En pruebas de permisos, Jefe puede acceder al 100% de los módulos y acciones existentes, mientras Empleado no puede ejecutar ninguna acción administrativa o crítica no permitida, incluso mediante acceso directo.
- **SC-003**: Empleado puede completar las tareas de consultar un cliente, consultar una oportunidad, registrar una interacción y actualizar un estado operativo sin acceder al módulo Empleados ni a acciones de eliminación.
- **SC-004**: El 100% de los registros y valores almacenados antes del cambio mantiene su contenido después de iniciar sesión y operar con ambos roles.
- **SC-005**: Después de cerrar sesión y cambiar de usuario, el 100% de las pantallas y acciones disponibles corresponde al rol de la nueva sesión.

## Assumptions

- Las credenciales indicadas son únicamente para el entorno de prueba de esta aplicación.
- El acceso operativo básico de Empleado comprende consulta de Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda, registro de interacciones y actualización de estados operativos existentes; no comprende administración general de registros.
- Se consideran administrativos el módulo Empleados y cualquier otro módulo o control destinado a configuración o gestión administrativa.
- Los datos existentes continúan compartidos y almacenados conforme al comportamiento actual; esta funcionalidad no introduce segregación de datos por usuario ni cambia su persistencia.
- El cambio afecta únicamente autenticación, permisos y presentación asociada al rol; los flujos funcionales no mencionados explícitamente permanecen sin cambios.
