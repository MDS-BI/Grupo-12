# Feature Specification: Calendario CRM

**Feature Branch**: `004-crm-calendar`  
**Created**: 2026-11-25  
**Status**: Draft  
**Input**: User description: "Agregar un sistema de calendario para el módulo CRM con calendario lateral de tareas y calendario general con vistas anual, mensual y semanal para reuniones, llamadas, seguimientos y actividades comerciales relacionadas con clientes, contactos y oportunidades."

## Clarifications

### Session 2026-11-25

- Q: ¿Las actividades registradas en el calendario (llamadas, reuniones, seguimientos) deben reflejarse también en el historial de interacciones existente del CRM, o deben gestionarse solo dentro del calendario? → A: Las actividades de calendario de tipos equivalentes a interacción (llamada, reunión) se reflejan en el historial de Interacciones CRM; los tipos solo de calendario (evento, seguimiento, actividad comercial) se gestionan en calendario y pueden vincularse al CRM.
- Q: ¿Los usuarios podrán crear y editar tareas desde el calendario lateral en esta funcionalidad, o el calendario lateral solo mostrará tareas que provienen de otro flujo ya existente? → A: Gestión básica: el usuario puede crear, editar y marcar estado de tareas desde el calendario lateral, además de consultar su detalle.
- Q: ¿El calendario lateral debe mostrar las tareas de todos los usuarios del CRM o solo las tareas asignadas al usuario que está usando el sistema? → A: Solo tareas asignadas al usuario actual; el lateral funciona como agenda personal dentro del CRM.
- Q: ¿Al registrar una llamada o reunión desde el calendario, el usuario debe poder completar también el resultado/notas de la interacción en ese mismo flujo, o solo se registra el evento programado y el detalle de interacción se completa después? → A: Planificación primero: el calendario registra la actividad programada; el resultado/notas de la interacción se completan posteriormente en el flujo de Interacciones CRM.
- Q: ¿El calendario general del CRM debe mostrar las actividades de todo el equipo o solo las actividades donde el usuario actual es responsable o participante? → A: Por defecto personales (responsable/participante), con filtro opcional para ver actividades del equipo/CRM.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar tareas en calendario lateral (Priority: P1)

Como usuario comercial, quiero ver y gestionar en un calendario lateral mis tareas asignadas, futuras y pendientes, para organizar mi jornada y priorizar trabajo sin salir del contexto del CRM.

**Why this priority**: Entrega visibilidad inmediata y gestión básica del trabajo pendiente, base de uso diario del módulo de calendario.

**Independent Test**: Abrir el espacio de trabajo CRM, crear una tarea con vencimiento futuro, editarla, marcar su estado, y verificar que el calendario lateral muestra tareas futuras/pendientes, distingue atrasadas y próximas a vencer, y permite consultar el detalle.

**Acceptance Scenarios**:

1. **Given** existen tareas pendientes con fechas futuras, **When** el usuario visualiza el calendario lateral, **Then** ve la lista de tareas futuras y pendientes ordenada por proximidad de vencimiento, mostrando al menos título, fecha/hora de vencimiento y estado.
2. **Given** existe una tarea pendiente cuya fecha de vencimiento ya pasó, **When** el usuario visualiza el calendario lateral, **Then** la tarea aparece identificada claramente como atrasada.
3. **Given** existe una tarea pendiente cuya fecha de vencimiento está dentro del umbral de proximidad definido, **When** el usuario visualiza el calendario lateral, **Then** la tarea aparece identificada claramente como próxima a vencer.
4. **Given** el usuario ve una tarea en el calendario lateral, **When** selecciona consultar sus detalles, **Then** el sistema muestra la información completa de la tarea sin perder el contexto de la pantalla actual.
5. **Given** el usuario está en el calendario lateral, **When** crea una tarea con información válida, **Then** la tarea queda registrada y visible en el lateral según su fecha y estado.
6. **Given** existe una tarea en el calendario lateral, **When** el usuario edita sus datos o cambia su estado, **Then** el sistema guarda los cambios y actualiza la visualización del lateral.

---

### User Story 2 - Visualizar calendario general CRM por períodos (Priority: P1)

Como usuario comercial, quiero consultar un calendario general del CRM en vistas anual, mensual y semanal para planificar reuniones y actividades comerciales con la anticipación adecuada.

**Why this priority**: Sin la visualización por períodos, el calendario general no cumple su propósito de planificación comercial.

**Independent Test**: Con actividades registradas en diferentes días, semanas y meses, algunas del usuario actual y otras de otros usuarios, abrir el calendario general y verificar vista por defecto personal, filtro de equipo y cambio entre vistas anual, mensual y semanal.

**Acceptance Scenarios**:

1. **Given** existen actividades comerciales en distintas fechas, **When** el usuario abre el calendario general, **Then** el sistema muestra por defecto las actividades del período actual donde el usuario es responsable o participante, con controles para cambiar de período y filtro de equipo/CRM.
2. **Given** el usuario está en el calendario general, **When** selecciona la vista anual, mensual o semanal, **Then** el calendario actualiza la visualización al período correspondiente conservando el punto de referencia temporal seleccionado.
3. **Given** el usuario navega entre períodos, **When** cambia de mes, semana o año, **Then** ve únicamente las actividades comprendidas en el período visible y un estado vacío claro cuando no hay actividades.
4. **Given** una actividad está relacionada con cliente, contacto u oportunidad, **When** el usuario la consulta desde cualquier vista, **Then** puede identificar la relación comercial asociada.
5. **Given** el usuario activa el filtro de equipo/CRM, **When** el calendario se actualiza, **Then** muestra también actividades de otros usuarios dentro del período visible, identificando el responsable o participantes.

---

### User Story 3 - Gestionar actividades comerciales en calendario general (Priority: P1)

Como usuario comercial, quiero crear, editar y eliminar reuniones, eventos, llamadas, seguimientos y actividades comerciales para mantener actualizado el plan de contacto con clientes.

**Why this priority**: La capacidad de gestionar actividades es el núcleo operativo del calendario general.

**Independent Test**: Crear una reunión, editarla, registrar una llamada/seguimiento/actividad comercial, relacionarla con registros CRM existentes y eliminarla, verificando que los cambios se reflejan en la vista correspondiente.

**Acceptance Scenarios**:

1. **Given** el usuario está en el calendario general, **When** crea una reunión o evento con información válida, **Then** la actividad queda registrada y visible en las vistas que incluyen su fecha.
2. **Given** existe una actividad comercial, **When** el usuario edita sus datos, **Then** el sistema guarda los cambios y actualiza la visualización en el calendario.
3. **Given** existe una actividad comercial, **When** el usuario solicita eliminarla y confirma la acción, **Then** la actividad deja de aparecer en el calendario y no se pierde información de otros registros.
4. **Given** el usuario registra una llamada, seguimiento o actividad comercial, **When** guarda la actividad, **Then** el sistema la clasifica con el tipo seleccionado y la muestra con esa identificación en el calendario.
5. **Given** el usuario crea o edita una actividad, **When** asocia cliente, contacto u oportunidad existente, **Then** la relación queda visible en el detalle de la actividad y puede consultarse posteriormente.

---

### User Story 4 - Consultar detalle y contexto de actividades (Priority: P2)

Como usuario comercial, quiero consultar el detalle de una actividad desde el calendario para conocer su propósito, horario, participantes y relación comercial antes de actuar.

**Why this priority**: Mejora la utilidad del calendario al convertirlo en una herramienta de contexto, no solo de visualización de fechas.

**Independent Test**: Seleccionar una actividad desde la vista semanal y desde la vista mensual, verificar que el detalle muestre la misma información y que las relaciones con CRM sean legibles.

**Acceptance Scenarios**:

1. **Given** existe una actividad en el calendario, **When** el usuario la selecciona, **Then** ve un detalle con tipo, título, fecha/hora, descripción, estado y relaciones comerciales disponibles.
2. **Given** una actividad tiene relaciones con registros CRM, **When** el usuario consulta el detalle, **Then** puede identificar qué cliente, contacto u oportunidad está vinculado sin ambigüedad.
3. **Given** una actividad no tiene relaciones comerciales, **When** el usuario consulta el detalle, **Then** el sistema muestra la actividad como válida e indica claramente que no tiene relaciones asociadas.

---

### Edge Cases

- ¿Qué ocurre cuando una tarea no tiene fecha de vencimiento? No se clasifica como atrasada ni próxima a vencer; se muestra como pendiente sin indicador de vencimiento.
- ¿Qué ocurre cuando la fecha/hora de vencimiento de una tarea es exactamente el momento actual? Se considera vencida/atrasada solo cuando supera el momento de referencia actual; el comportamiento debe ser consistente y determinista.
- ¿Qué ocurre cuando existen muchas tareas en el calendario lateral? El lateral mantiene legibilidad mediante agrupación/scroll interno sin desplazar el contenido principal del CRM.
- ¿Qué ocurre cuando una actividad dura más de un día o cruza semana/mes/año? La actividad es visible en todos los períodos que intersecta su rango de fechas.
- ¿Qué ocurre cuando el usuario elimina una actividad? El sistema solicita confirmación antes de eliminar y, tras confirmar, la remueve de todas las vistas.
- ¿Qué ocurre cuando un cliente, contacto u oportunidad relacionado fue archivado o ya no está disponible? La actividad conserva la referencia histórica visible como no disponible, sin impedir consultar, editar o eliminar la actividad.
- ¿Qué ocurre cuando una llamada o reunión programada se realiza? El calendario conserva el evento programado y su estado; el resultado/notas de la interacción se registran en el flujo de Interacciones CRM, manteniendo la trazabilidad entre ambos.
- ¿Qué ocurre cuando el usuario intenta guardar una actividad sin título, tipo o fecha/hora requerida? El sistema bloquea el guardado, muestra mensajes claros junto a los campos afectados y conserva los datos ingresados.
- ¿Qué ocurre cuando la fecha/hora de fin es anterior a la de inicio? El sistema rechaza el guardado con un mensaje de validación claro.
- ¿Qué ocurre cuando no hay tareas ni actividades en el período? Se muestra un estado vacío claro con orientación para crear la primera actividad o revisar otro período.
- ¿Qué ocurre cuando el usuario navega con teclado o usa lector de pantalla? Los controles de vista, navegación de período, listado lateral y detalle son accesibles por teclado y tienen etiquetas comprensibles.
- ¿Qué ocurre en pantallas estrechas? El calendario lateral y el calendario general se adaptan sin desplazamiento horizontal ni pérdida de acciones principales.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE incorporar un calendario lateral dentro del espacio de trabajo CRM, visible en las pantallas principales del módulo CRM sin impedir el uso de las funciones existentes.
- **FR-002**: El calendario lateral DEBE mostrar tareas futuras y tareas pendientes asignadas al usuario actual en el contexto del CRM, funcionando como agenda personal; DEBE permitir crear tareas, editar sus datos y cambiar su estado desde el propio lateral.
- **FR-003**: El sistema DEBE identificar visualmente las tareas atrasadas como aquellas pendientes cuya fecha/hora de vencimiento es anterior al momento actual.
- **FR-004**: El sistema DEBE identificar visualmente las tareas próximas a vencer como aquellas pendientes cuya fecha/hora de vencimiento ocurre dentro de las próximas 24 horas, salvo que ya estén atrasadas.
- **FR-005**: El calendario lateral DEBE permitir consultar el detalle de una tarea, incluyendo como mínimo título, descripción, fecha/hora de vencimiento, estado, prioridad cuando exista y relaciones comerciales asociadas. La creación y edición de tareas desde el lateral DEBE aplicar las mismas validaciones de datos obligatorios.
- **FR-006**: El sistema DEBE ofrecer un calendario general del CRM con vistas anual, mensual y semanal. Por defecto DEBE mostrar actividades donde el usuario actual es responsable o participante, e incluir un filtro opcional para ver actividades del equipo/CRM.
- **FR-007**: El usuario DEBE poder cambiar entre vistas anual, mensual y semanal y navegar a períodos anteriores y siguientes sin perder la selección de vista.
- **FR-008**: El calendario general DEBE permitir crear actividades comerciales con tipo, título, fecha/hora de inicio, fecha/hora de fin o duración equivalente, estado y descripción opcional.
- **FR-009**: El calendario general DEBE permitir editar actividades comerciales existentes y reflejar los cambios en todas las vistas afectadas.
- **FR-010**: El calendario general DEBE permitir eliminar actividades comerciales solo tras confirmación explícita del usuario.
- **FR-011**: El sistema DEBE soportar los tipos de actividad: reunión, evento, llamada, seguimiento y actividad comercial. Las actividades de tipo llamada y reunión DEBEN reflejarse en el historial de Interacciones CRM existente como actividades programadas; el resultado y las notas de ejecución se completan posteriormente en el flujo de Interacciones CRM. Los tipos evento, seguimiento y actividad comercial se gestionan en el calendario y pueden vincularse a registros CRM.
- **FR-012**: El sistema DEBE permitir asociar una actividad a cero, uno o varios registros CRM existentes de tipo cliente, contacto y oportunidad, según corresponda; y definir responsable/participantes para determinar su visibilidad en la vista personal y en el filtro de equipo.
- **FR-013**: El sistema DEBE mostrar las relaciones comerciales de la actividad en su detalle y permitir identificarlas desde la visualización del calendario.
- **FR-014**: El sistema DEBE validar los datos obligatorios de tareas y actividades antes de guardar, incluyendo título, tipo cuando aplique, fecha/hora requerida y coherencia del rango temporal.
- **FR-015**: El sistema DEBE conservar la consistencia con el comportamiento CRM existente: no modificar especificaciones previas, reutilizar entidades CRM ya existentes para relaciones y mantener navegación, estados vacíos, validación y confirmaciones coherentes. Las actividades de calendario equivalentes a interacciones deben mantener consistencia con el historial de Interacciones del CRM, sin duplicar la captura de resultado/notas en el flujo de creación del calendario.
- **FR-016**: El sistema DEBE mantener la legibilidad y usabilidad del calendario en escritorio y pantallas estrechas, sin desplazamiento horizontal para las acciones principales.
- **FR-017**: El sistema DEBE preservar la integridad de los datos ante relaciones con registros archivados o no disponibles, mostrando la referencia como no disponible sin bloquear la consulta de la actividad.
- **FR-018**: El sistema DEBE actualizar las vistas de calendario afectadas tras crear, editar o eliminar una tarea/actividad, sin requerir recarga manual de la página.

### Key Entities *(include if feature involves data)*

- **Tarea CRM**: Unidad de trabajo pendiente o planificada. Atributos clave: título, descripción, fecha/hora de vencimiento, estado, prioridad opcional, responsable/propietario, fecha de creación y relaciones comerciales opcionales.
- **Actividad de calendario**: Registro temporal planificado en el calendario general. Atributos clave: tipo, título, descripción, fecha/hora inicio, fecha/hora fin, estado, responsable/propietario y relaciones comerciales. Cuando el tipo es llamada o reunión, la actividad se refleja en el historial de Interacciones CRM; evento, seguimiento y actividad comercial son exclusivos del calendario.
- **Tipo de actividad**: Clasificación de la actividad; valores soportados: reunión, evento, llamada, seguimiento, actividad comercial.
- **Relación CRM**: Vínculo entre una tarea/actividad y registros existentes del CRM. Tipos soportados: cliente, contacto y oportunidad. Debe conservar identificador, tipo y etiqueta visible.
- **Vista de calendario**: Representación temporal del calendario general; soporta alcance anual, mensual y semanal con período de referencia navegable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 95% de los usuarios de prueba identifica al menos una tarea atrasada y una próxima a vencer en el calendario lateral en menos de 10 segundos.
- **SC-002**: Los usuarios pueden crear una actividad comercial válida en el calendario general en menos de 60 segundos.
- **SC-003**: El 100% de las actividades creadas, editadas o eliminadas se refleja en las vistas afectadas en la misma sesión de uso sin recarga manual.
- **SC-004**: El 100% de las actividades con relaciones CRM existentes muestra al menos la etiqueta identificable del cliente, contacto u oportunidad asociado en su detalle.
- **SC-005**: El 90% de los usuarios de prueba completa sin asistencia las tareas de consultar una tarea pendiente, cambiar la vista del calendario y registrar una actividad comercial.
- **SC-006**: En pruebas de usabilidad en escritorio y pantalla estrecha, el 100% de las acciones principales del calendario (ver detalle, cambiar vista, crear, editar, eliminar) puede completarse sin desplazamiento horizontal.

## Assumptions

- La funcionalidad se implementará como una especificación independiente y no modifica `specs/001-crm-module/spec.md` ni funcionalidades existentes.
- El calendario lateral muestra solo tareas asignadas al usuario actual (agenda personal); la visibilidad de tareas de equipo se considera evolución futura.
- El calendario general muestra por defecto actividades donde el usuario actual es responsable o participante, con filtro opcional para ver actividades del equipo/CRM.
- El calendario lateral prioriza tareas pendientes/futuras; las tareas completadas pueden quedar fuera de la vista principal salvo que se consulte historial en una evolución futura.
- El umbral "próxima a vencer" se fija en 24 horas por ser un valor operativo común y verificable; no requiere configuración en esta versión.
- Las tareas y actividades reutilizan entidades CRM existentes (clientes, contactos, oportunidades) cuando están disponibles; si el CRM no tiene entidad de contacto separada, la relación de contacto se podrá representar con la información de contacto disponible del cliente sin cambiar la especificación base. Las actividades de tipo llamada y reunión se integran con el historial de Interacciones CRM existente; evento, seguimiento y actividad comercial permanecen como registros de calendario.
- La confirmación de eliminación aplica a actividades del calendario general; la eliminación de tareas desde el calendario lateral queda fuera de esta versión (gestión básica: crear, editar, cambiar estado, consultar).
- La persistencia y disponibilidad de datos siguen el modelo actual del ERP/CRM en el mismo entorno de uso.
- Permisos/roles diferenciados no forman parte de esta especificación salvo los ya existentes en el CRM.






