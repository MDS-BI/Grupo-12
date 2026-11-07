# Especificación de la Funcionalidad: Módulo CRM (Customer Relationship Management)

**Rama de la funcionalidad**: 001-erp-base-module  
**Creada**: 2026-07-08  
**Estado**: Borrador  
**Entrada**: Descripción del usuario: "Construir un módulo CRM integrado a un ERP que permita administrar clientes, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta, con datos ficticios y un alcance inicial acotado."

## Propósito

Este proyecto desarrolla un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP. Su objetivo es centralizar la información comercial de la empresa para administrar clientes, mantener un catálogo de empleados responsables, registrar interacciones y dar seguimiento a oportunidades de venta mediante una interfaz sencilla, consistente y funcional.

El módulo se enfoca en el ciclo de vida de la relación con el cliente y en el avance de cada negociación. El estado del cliente (`Posible`, `Activo`, `Inactivo`) describe la relación comercial; la etapa de la oportunidad (`Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`) describe el avance de una venta particular.

## Clarifications

### Session 2026-10-26

- Q: ¿La especificación activa debe describir el módulo base ERP genérico o el módulo CRM concreto? → A: Módulo CRM concreto.
- Q: ¿Qué debe ocurrir al eliminar un cliente o un empleado que tiene oportunidades o interacciones asociadas? → A: Eliminación lógica para ambos: se marcan como archivados, conservan sus registros asociados y se excluyen de las listas operativas y de nuevas asignaciones.
- Q: ¿Desde qué etapas se puede marcar una oportunidad como Ganado o Perdido? → A: Perdido desde cualquier etapa no terminal; Ganado solo desde Negociación.
- Q: ¿Qué campos del cliente deben ser únicos para evitar duplicados en el CRM? → A: Correo único; el nombre de empresa puede repetirse.
- Q: ¿Qué horizonte debe considerar el indicador de próximos cierres del dashboard? → A: Próximos 30 días.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Ver el detalle del cliente con vista 360° (Prioridad: P1)

Como usuario, quiero ver el detalle de un cliente con sus oportunidades e interacciones, para tener una vista 360° de la relación.

**Por qué esta prioridad**: La vista 360° reúne en un solo lugar los datos del cliente, sus oportunidades y sus interacciones, lo que permite entender el estado completo de la relación y tomar decisiones sin navegar entre pantallas. Es el principal punto de consulta del CRM.

**Prueba Independiente**: Un usuario puede seleccionar un cliente y ver su información, sus oportunidades y sus interacciones asociadas; si no tiene registros, ve un estado vacío claro.

**Escenarios de Aceptación**:

1. **Dado** un cliente con oportunidades e interacciones, **cuando** el usuario abre su detalle, **entonces** ve los datos del cliente y ambos listados asociados.
2. **Dado** un cliente sin oportunidades ni interacciones, **cuando** el usuario abre su detalle, **entonces** ve estados vacíos claros que explican que aún no hay registros.
3. **Dado** que el usuario está en el detalle de un cliente, **cuando** vuelve a la lista, **entonces** los datos del cliente y sus registros asociados permanecen intactos.
4. **Dado** un cliente con oportunidades e interacciones, **cuando** el usuario consulta el detalle, **entonces** puede identificar la etapa y el monto de cada oportunidad, y la fecha, el tipo y el responsable de cada interacción.
5. **Dado** un cliente archivado, **cuando** el usuario consulta su detalle, **entonces** puede ver su historial sin que aparezca como opción para nuevos registros.

---

### Historia de Usuario 2 - Gestionar clientes (Prioridad: P1)

Como empleado, quiero registrar y gestionar clientes para mantener la información ordenada.

**Por qué esta prioridad**: Los clientes son la bace del CRM, ya que permiten registrar interacciones y asociar oportunidades comerciales.

**Prueba Independiente**: Un usuario puede registrar un cliente con sus datos, visualizarlo en el catalogo y editar su información.

**Escenarios de Aceptación**:

1. **Dado** que el usuario está en el catálogo de clientes, cuando registra un cliente con sus datos, entonces este se guarda y aparece en la lista.
2. **Dado** que el usuario está registrando un cliente, cuando deja campos obligatorios vacíos, entonces el sistema impide guardar el registro.
3. **Dado** un cliente existente, cuando el usuario modifica sus datos, entonces los cambios se guardan y se reflejan en el catálogo.
4. **Dado** que un cliente ha sido registrado, cuando el usuario consulta su información, entonces puede visualizar sus datos y estado actual.
---

### Historia de Usuario 3 - Seguimiento de oportunidades comerciales (Prioridad: P1)

Como ejecutivo comercial, quiero registrar y hacer seguimiento a las oportunidades comerciales asociadas a clientes y empleados responsables, incluyendo monto estimado, fecha de cierre y actualización de etapas del pipeline, para monitorear el avance de cada negociación y enfocar los esfuerzos en las ventas con mayor probabilidad de cierre.

**Por qué esta prioridad**: Las oportunidades comerciales representan el núcleo financiero y operativo del CRM. Sin el seguimiento de oportunidades y sus etapas de venta, la empresa no puede gestionar su pipeline ni proyectar sus ingresos futuros.

**Prueba Independiente**: Se puede probar registrando una nueva oportunidad comercial para un cliente existente con un empleado asignado, visualizándola en el listado con sus atributos clave (monto, fecha de cierre y etapa) y actualizando su etapa a lo largo del flujo comercial permitido.

**Escenarios de Aceptación**:

1. **Dado** un cliente activo y un empleado registrados en el sistema, **cuando** el ejecutivo comercial crea una oportunidad indicando cliente, empleado, monto estimado válido, fecha estimada de cierre y etapa inicial (`Evaluación`), **entonces** la oportunidad se guarda exitosamente y se muestra en la lista de seguimiento vinculada al cliente.
2. **Dado** que el usuario intenta crear una oportunidad comercial, **cuando** omite la selección del cliente o del empleado responsable, **entonces** el sistema bloquea el registro y muestra un mensaje indicando que ambos campos son obligatorios.
3. **Dado** que el usuario ingresa un monto estimado negativo, **cuando** intenta guardar la oportunidad, **entonces** el sistema valida el campo, rechaza la operación y notifica que el monto debe ser mayor o igual a cero.
4. **Dado** que el usuario no especifica la fecha estimada de cierre o ingresa una fecha inválida, **cuando** intenta guardar la oportunidad, **entonces** el sistema bloquea el guardado e informa que la fecha estimada de cierre es obligatoria y debe ser válida.
5. **Dada** una oportunidad comercial en etapa `Evaluación`, **cuando** el ejecutivo actualiza su estado, **entonces** el sistema le permite avanzar a `Propuesta` o marcarla como `Perdido`, pero impide cambiarla directamente a `Ganado`.
6. **Dada** una oportunidad comercial en etapa `Propuesta`, **cuando** el ejecutivo actualiza su estado, **entonces** el sistema le permite avanzar a `Negociación` o marcarla como `Perdido`, pero impide cambiarla directamente a `Ganado`.
7. **Dada** una oportunidad comercial en etapa `Negociación`, **cuando** el ejecutivo concluye la negociación, **entonces** el sistema permite cambiar su etapa a `Ganado` o a `Perdido`.
8. **Dada** una oportunidad comercial que ha alcanzado un estado final (`Ganado` o `Perdido`), **cuando** el usuario intenta modificar su etapa, **entonces** el sistema rechaza el cambio por tratarse de un estado terminal e inmutable.
9. **Dada** una oportunidad en etapa `Evaluación` o `Propuesta`, **cuando** el usuario intenta marcarla como `Ganado`, **entonces** el sistema rechaza la regla de negocio y notifica que una oportunidad solo puede ser ganada desde la etapa de `Negociación`.
10. **Dada** la vista principal de seguimiento de oportunidades, **cuando** el usuario consulta el listado, **entonces** puede visualizar de forma clara y resumida el cliente, responsable, monto estimado, etapa actual y fecha estimada de cierre de cada negociación.

---

### Historia de Usuario 4 - Calificar y clasificar leads (Prioridad: P1)
Como representante de ventas, quiero clasificar un lead registrado como caliente, tibio o frío, para priorizar el seguimiento de los prospectos con mayor probabilidad de compra.

**Por qué esta prioridad**: Sin saber qué leads merecen atención inmediata, los vendedores pierden tiempo en prospectos que no van a comprar y el proceso de ventas pierde valor.

**Prueba Independiente**: Un usuario puede abrir un lead de la lista, asignarle una temperatura (caliente, tibio o frío) y verla reflejada en el detalle del lead.

**Escenarios de Aceptación**:

1. Dado que un representante de ventas está viendo el detalle de un lead, cuando le asigna una temperatura (caliente, tibio o frío), entonces la clasificación se guarda y se muestra tanto en el detalle como en la lista de leads.
2. Dado que el lead no ha sido clasificado aún, cuando el representante intenta convertirlo en oportunidad de venta, entonces el sistema impide la conversión y le indica que primero debe calificarlo.
Dado que un representante filtra la lista de leads por temperatura, cuando selecciona "calientes", entonces solo se muestran los leads con esa clasificación.

---

### Historia de Usuario 5 - Detectar oportunidades vencidas y priorizar el seguimiento (Prioridad: P2)

Como ejecutivo comercial, quiero ver de forma destacada las oportunidades abiertas cuya fecha estimada de cierre ya pasó, para retomarlas o actualizarlas antes de que se pierdan.

**Por qué esta prioridad**: El pipeline solo es útil si refleja la realidad. Hoy el sistema calcula "próximos cierres" (30 días) y excluye las vencidas, pero no ofrece ninguna forma de verlas ni de corregirlas: quedan invisibles en el dashboard y siguen contando como oportunidades abiertas, inflando el monto del pipeline. Detectarlas permite limpiar la proyección comercial sin necesidad de campos ni entidades nuevas.

**Prueba Independiente**: Se crea una oportunidad en etapa `Propuesta` con fecha de cierre de ayer; el usuario la encuentra en el listado de vencidas, actualiza su fecha o la marca como `Perdido`, y comprueba que deja de aparecer.

**Escenarios de Aceptación**:

1. **Dado** el dashboard, **cuando** el usuario lo abre, **entonces** ve un indicador de "oportunidades vencidas" con su cantidad y monto acumulado.
2. **Dada** una oportunidad abierta (`Evaluación`, `Propuesta` o `Negociación`) con `fecha_estimada_cierre` anterior a la fecha actual, **cuando** el usuario consulta el indicador, **entonces** esa oportunidad se cuenta como vencida.
3. **Dada** una oportunidad en etapa terminal `Ganado` o `Perdido`, **cuando** el usuario consulta el indicador, **entonces** no se cuenta como vencida, aunque su fecha ya haya pasado.
4. **Dada** una oportunidad vencida, **cuando** el usuario abre su detalle, **entonces** puede actualizar la fecha estimada de cierre o marcarla como `Perdido` respetando las transiciones permitidas.
5. **Dada** una oportunidad vencida cuya fecha se actualiza a una fecha futura, **cuando** el usuario vuelve al indicador, **entonces** deja de contarse como vencida.
6. **Dado** que no existen oportunidades vencidas, **cuando** el usuario consulta el dashboard, **entonces** el indicador muestra cero con un estado claro, sin errores.
7. **Dada** la lista de oportunidades, **cuando** el usuario activa el filtro "vencidas", **entonces** solo ve las que cumplen la condición, y puede combinarlo con el filtro por etapa.

---

### Casos Límite

- ¿Qué ocurre cuando un usuario intenta guardar un cliente sin nombre de empresa, contacto, correo o teléfono?
- ¿Qué ocurre cuando el correo del cliente tiene un formato inválido?
- ¿Qué ocurre cuando se intenta registrar un cliente con un correo ya existente?
- ¿Qué ocurre cuando un usuario intenta crear una oportunidad con monto negativo?
- ¿Qué ocurre cuando la fecha estimada de cierre está vacía o no es una fecha válida?
- ¿Qué ocurre cuando un usuario intenta una transición de etapa no permitida?
- ¿Qué ocurre cuando un usuario intenta marcar como `Ganado` una oportunidad en `Evaluación` o `Propuesta`?
- ¿Qué ocurre cuando una oportunidad está en estado terminal `Ganado` o `Perdido` y se intenta cambiar de etapa?
- ¿Qué ocurre al archivar un cliente con oportunidades e interacciones asociadas?
- ¿Qué ocurre al archivar un empleado que es responsable de oportunidades o interacciones?
- ¿Qué ocurre cuando un usuario intenta asignar un cliente o empleado archivado a un nuevo registro?
- ¿Qué ocurre cuando un registro referencia un cliente o empleado que ya no existe?
- ¿Qué ocurre cuando la búsqueda no devuelve coincidencias?
- ¿Qué ocurre cuando el dashboard se abre sin clientes ni oportunidades?
- ¿Qué ocurre con una oportunidad abierta cuya fecha estimada de cierre ya pasó? Se cuenta como **vencida** en el indicador del dashboard y puede filtrarse como tal; no se incluye en próximos cierres.
- ¿Qué ocurre con una oportunidad abierta cuya fecha de cierre está a más de 30 días? No se cuenta como vencida ni en próximos cierres, pero permanece en oportunidades abiertas y en el monto del pipeline.
- ¿Qué ocurre cuando la configuración declara un campo personalizado con una clave que choca con un campo base?
- ¿Qué ocurre cuando la configuración referencia un tipo de campo o una transición de ciclo de vida inválida?
- ¿Qué ocurre cuando los registros almacenados contienen valores de campos personalizados que ya no están declarados?
- ¿Qué ocurre cuando el usuario navega fuera de un formulario con cambios sin guardar?
- ¿Qué ocurre cuando el almacenamiento local está vacío o contiene datos corruptos?

## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **FR-001**: El sistema DEBE permitir a los usuarios crear clientes con nombre de empresa, persona de contacto, correo y teléfono.
- **FR-002**: El sistema DEBE permitir a los usuarios editar los datos de un cliente existente.
- **FR-003**: El sistema DEBE permitir a los usuarios consultar la lista de clientes con su información clave y estado.
- **FR-004**: El sistema DEBE validar que el correo del cliente tenga un formato válido antes de guardar.
- **FR-005**: El sistema DEBE asignar el estado `Posible` a todo cliente nuevo de forma predeterminada.
- **FR-006**: El sistema DEBE permitir cambiar el estado de un cliente únicamente entre los valores `Posible`, `Activo` e `Inactivo`.
- **FR-007**: El sistema DEBE permitir a los usuarios crear empleados con nombre y cargo.
- **FR-008**: El sistema DEBE permitir a los usuarios editar y consultar el catálogo de empleados.
- **FR-009**: El sistema DEBE impedir guardar un empleado sin nombre o sin cargo.
- **FR-010**: El sistema DEBE permitir crear oportunidades asociadas a un cliente y a un empleado existentes.
- **FR-011**: El sistema DEBE registrar en cada oportunidad una descripción opcional, un monto estimado, una etapa y una fecha estimada de cierre.
- **FR-012**: El sistema DEBE validar que el monto estimado de una oportunidad sea mayor o igual a cero.
- **FR-013**: El sistema DEBE validar que la fecha estimada de cierre de una oportunidad sea una fecha válida y obligatoria.
- **FR-014**: El sistema DEBE asignar la etapa `Evaluación` a toda oportunidad nueva de forma predeterminada.
- **FR-015**: El sistema DEBE permitir el avance secuencial `Evaluación → Propuesta → Negociación`, permitir marcar `Perdido` desde cualquier etapa no terminal y permitir marcar `Ganado` únicamente desde `Negociación`.
- **FR-016**: El sistema DEBE impedir cualquier transición desde las etapas terminales `Ganado` y `Perdido`.
- **FR-017**: El sistema DEBE mostrar la etapa, el monto y la fecha estimada de cierre de cada oportunidad en los listados.
- **FR-018**: El sistema DEBE permitir registrar interacciones asociadas a un cliente y a un empleado existentes.
- **FR-019**: El sistema DEBE registrar en cada interacción una fecha, un tipo y una descripción opcional.
- **FR-020**: El sistema DEBE permitir únicamente los tipos de interacción `Llamada`, `Correo` y `Reunión`.
- **FR-021**: El sistema DEBE validar que la fecha y el tipo de una interacción estén presentes antes de guardar.
- **FR-022**: El sistema DEBE mostrar el historial de interacciones de cada cliente con fecha, tipo y responsable.
- **FR-023**: El sistema DEBE mostrar en la ficha de un cliente sus oportunidades e interacciones asociadas.
- **FR-024**: El sistema DEBE aplicar eliminación lógica a clientes y empleados, conservando sus oportunidades e interacciones asociadas y excluyéndolos de las listas operativas.
- **FR-025**: El sistema DEBE impedir la creación de oportunidades o interacciones que referencien clientes o empleados inexistentes o archivados.
- **FR-026**: El sistema DEBE mostrar un dashboard de inicio con indicadores de clientes activos, oportunidades abiertas, monto total en pipeline y próximos cierres en los siguientes 30 días.
- **FR-027**: El sistema DEBE actualizar los indicadores del dashboard cada vez que se muestra la pantalla.
- **FR-028**: El sistema DEBE ofrecer accesos rápidos desde el dashboard para crear clientes, oportunidades e interacciones.
- **FR-029**: El sistema DEBE permitir buscar clientes por nombre de empresa, persona de contacto, correo o estado.
- **FR-030**: El sistema DEBE permitir filtrar oportunidades por etapa, empleado responsable y rango de fecha de cierre.
- **FR-031**: El sistema DEBE mostrar un estado vacío claro cuando una búsqueda o filtro no devuelva resultados.
- **FR-032**: El sistema DEBE mostrar mensajes de validación claros cuando falta información obligatoria o un valor es inválido.
- **FR-033**: El sistema DEBE mantener los datos de clientes, empleados, oportunidades e interacciones intactos durante la navegación entre pantallas.
- **FR-034**: El sistema DEBE cargar la configuración del módulo al arrancar y aplicarla en todas las pantallas.
- **FR-035**: El sistema DEBE derivar las etiquetas visibles para el usuario de la configuración del módulo.
- **FR-036**: El sistema DEBE aplicar los campos personalizados declarados en formularios, listas, validación y búsqueda.
- **FR-037**: El sistema DEBE informar claramente de una configuración inválida o conflictiva en lugar de fallar silenciosamente.
- **FR-038**: El sistema DEBE presentar una barra superior con el nombre del módulo y una barra lateral de navegación persistente.
- **FR-039**: El sistema DEBE resaltar visualmente el área activa en la barra lateral.
- **FR-040**: El sistema DEBE mantener la navegación operable en ventanas gráficas estrechas.
- **FR-041**: El sistema DEBE sanitizar el contenido introducido por el usuario antes de renderizarlo para prevenir inyección de scripts.
- **FR-042**: El sistema DEBE mantener la búsqueda, los filtros y el renderizado de listas ágiles para al menos 500 clientes y sus registros asociados.
- **FR-043**: El sistema DEBE impedir que clientes o empleados archivados se asignen a nuevas oportunidades o interacciones.
- **FR-044**: El sistema DEBE permitir consultar el historial de clientes y empleados archivados sin ofrecerlos como opciones para nuevos registros.
- **FR-045**: El sistema DEBE impedir registrar dos clientes con el mismo correo electrónico, comparando el valor sin distinguir mayúsculas de minúsculas.
- **FR-046**: El sistema DEBE calcular el indicador de próximos cierres con las oportunidades abiertas cuya fecha estimada de cierre esté entre la fecha actual y los 30 días siguientes, excluyendo las vencidas.
- **FR-047**: El sistema DEBE identificar como vencidas las oportunidades abiertas (`Evaluación`, `Propuesta`, `Negociación`) cuya fecha estimada de cierre sea anterior a la fecha actual, excluyendo las etapas terminales `Ganado` y `Perdido`.
- **FR-048**: El sistema DEBE mostrar en el dashboard un indicador de oportunidades vencidas con su cantidad y su monto acumulado, actualizado cada vez que se muestra la pantalla.
- **FR-049**: El sistema DEBE permitir filtrar el listado de oportunidades por condición "vencidas", combinable con el resto de filtros disponibles.

### Requisitos de Extensibilidad

- **XR-001**: El módulo DEBE permitir añadir campos personalizados a clientes, empleados, oportunidades e interacciones sin cambiar la estructura base de almacenamiento.
- **XR-002**: El módulo DEBE permitir reetiquetar pantallas, formularios, listas y mensajes mediante configuración.
- **XR-003**: El módulo DEBE permitir definir y aplicar transiciones de estado de oportunidades mediante configuración.
- **XR-004**: El módulo DEBE permitir aplicar un color de acento y el nombre del módulo mediante configuración.
- **XR-005**: El módulo DEBE retroceder a los valores predeterminados del CRM cuando no se proporcione configuración.

### Entidades Clave *(incluir si la funcionalidad implica datos)*

- **Cliente**: Registro maestro de la relación comercial. Incluye identificador único, nombre de empresa, persona de contacto, correo electrónico único, teléfono, estado (`Posible`, `Activo`, `Inactivo`) e indicador de archivado. Es el origen de oportunidades e interacciones.
- **Empleado**: Catálogo de responsables comerciales. Incluye identificador único, nombre, cargo e indicador de archivado. Es referenciado por oportunidades e interacciones.
- **Oportunidad**: Negociación en curso asociada a un cliente y a un empleado. Incluye identificador único, descripción opcional, monto estimado, etapa (`Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`) y fecha estimada de cierre.
- **Interacción**: Comunicación registrada con un cliente. Incluye identificador único, cliente, empleado responsable, fecha, tipo (`Llamada`, `Correo`, `Reunión`) y descripción opcional.
- **ModuleConfig**: Configuración opcional que define nombre del módulo, etiquetas, campos personalizados, ciclo de vida de oportunidades y color de acento.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Los usuarios pueden crear un cliente y verlo en la lista en menos de 2 minutos.
- **SC-002**: Los usuarios pueden encontrar un cliente existente mediante la búsqueda en menos de 10 segundos tras introducir un término relevante.
- **SC-003**: Al menos el 90% de los usuarios de prueba pueden completar las tareas de crear, editar y buscar clientes, registrar oportunidades e interacciones sin ayuda.
- **SC-004**: El sistema sigue siendo utilizable con al menos 500 clientes y sus oportunidades e interacciones asociadas sin pérdida de funcionalidad central.
- **SC-005**: Los indicadores del dashboard coinciden con los datos almacenados en todo momento.
- **SC-006**: El 100% de las oportunidades e interacciones creadas quedan asociadas a un cliente y a un empleado existentes.
- **SC-007**: El sistema rechaza el 100% de las transiciones de etapa no permitidas y de los valores inválidos definidos en esta especificación.
- **SC-008**: Los usuarios pueden navegar entre dashboard, clientes, empleados, oportunidades, interacciones y búsqueda sin perder datos.
- **SC-009**: Un desarrollador puede adaptar el módulo mediante configuración sin modificar el código central.
- **SC-010**: Cada pantalla presenta el mismo espacio de trabajo con marca y el usuario puede identificar el área activa de un vistazo.
- **SC-011**: El sistema rechaza el 100% de los intentos de registrar un cliente con un correo ya existente.
- **SC-012**: El indicador de oportunidades vencidas coincide exactamente con las oportunidades abiertas cuya fecha estimada de cierre es anterior a la fecha actual, y se actualiza al modificar la fecha de cierre o la etapa.

## Suposiciones

- El módulo gestiona un único espacio de trabajo compartido, sin autenticación ni roles diferenciados en el MVP.
- La versión inicial es una demostración autónoma con datos ficticios, sin integraciones externas.
- El catálogo de empleados se carga antes de registrar oportunidades e interacciones.
- El correo electrónico identifica de forma única a cada cliente; varias empresas pueden compartir un nombre similar o idéntico.
- Cada oportunidad pertenece a un único cliente y a un único empleado responsable.
- Cada interacción pertenece a un único cliente y a un único empleado responsable.
- El monto estimado de una oportunidad se expresa en una única moneda del módulo; no se gestionan conversiones de moneda.
- La etapa de una oportunidad se actualiza sin conservar un historial detallado de transiciones en el MVP.
- Una oportunidad puede marcarse como `Perdido` desde `Evaluación`, `Propuesta` o `Negociación`; solo puede marcarse como `Ganado` desde `Negociación`.
- Las etapas `Ganado` y `Perdido` son terminales y no admiten cambios posteriores.
- La eliminación de clientes y empleados es lógica: se archivan, conservan su historial y se excluyen de las listas operativas y de nuevas asignaciones.
- La búsqueda de clientes es parcial y no distingue mayúsculas de minúsculas.
- Los filtros de oportunidades se pueden combinar y se aplican sobre los registros almacenados.
- El dashboard muestra indicadores calculados en el momento de abrir la pantalla, sin caché persistente.
- Los clientes activos son aquellos con estado `Activo` y no archivados.
- Las oportunidades abiertas son aquellas cuya etapa no es `Ganado` ni `Perdido`.
- El monto total en pipeline es la suma de los montos estimados de las oportunidades abiertas.
- Los próximos cierres son las oportunidades abiertas con fecha estimada de cierre entre la fecha actual y los 30 días siguientes; las oportunidades vencidas no se incluyen en este indicador.
- El módulo no incluye flujos de aprobación, contabilidad, facturación, reportes avanzados ni recordatorios automáticos en el MVP.
- Los datos se conservan entre sesiones en el mismo entorno de uso.
- El contenido introducido por el usuario se sanitiza antes de mostrarse en la interfaz.
- El diseño debe ser utilizable en dispositivos de escritorio y móviles.
