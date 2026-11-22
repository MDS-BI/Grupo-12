# Especificación de la Funcionalidad: Módulo CRM (Customer Relationship Management)

**Rama de la funcionalidad**: 001-crm-module  
**Creada**: 2026-07-08  
**Actualizada**: 2026-11-21

**Estado**: Borrador  
**Entrada**: Descripción del usuario: "Construir un módulo CRM integrado a un ERP que permita administrar clientes, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta, con datos ficticios y un alcance inicial acotado." Además: "Agrega una nueva Historia de Usuario para la interfaz SaaS profesional del CRM ya implementada: inicio de sesión con diseño dividido (split screen) y mostrar/ocultar contraseña, menú lateral colapsable con botón hamburguesa SVG, banner de bienvenida en el Dashboard, tarjetas KPI, estandarización de formularios ('DATOS DEL CLIENTE' y 'CONDICIONES COMERCIALES') y codificación UTF-8 limpia"

## Propósito

Este proyecto desarrolla un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP. Su objetivo es centralizar la información comercial de la empresa para administrar clientes, mantener un catálogo de empleados responsables, registrar interacciones y dar seguimiento a oportunidades de venta mediante una interfaz sencilla, consistente y funcional.

El módulo se enfoca en el ciclo de vida de la relación con el cliente y en el avance de cada negociación. El estado del cliente (`Posible`, `Activo`, `Inactivo`) describe la relación comercial; la etapa de la oportunidad (`Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`) describe el avance de una venta particular.

### Interfaz SaaS profesional

Esta historia describe y valida la experiencia visual de la interfaz SaaS profesional del CRM ya implementada. El objetivo es que cada ejecutivo comercial reconozca la marca al ingresar, acceda con confianza, navegue por el espacio de trabajo sin fricción, entienda de un vistazo el estado del negocio y capture información de clientes de forma coherente y legible.

El alcance cubre únicamente la capa de experiencia de usuario: pantalla de acceso, navegación lateral, Dashboard, formularios de cliente y corrección de caracteres. No modifica las reglas de negocio ni los datos del módulo CRM existente.

## Clarifications

### Session 2026-10-26

- Q: ¿La especificación activa debe describir el módulo base ERP genérico o el módulo CRM concreto? → A: Módulo CRM concreto.
- Q: ¿Qué debe ocurrir al eliminar un cliente o un empleado que tiene oportunidades o interacciones asociadas? → A: Eliminación lógica para ambos: se marcan como archivados, conservan sus registros asociados y se excluyen de las listas operativas y de nuevas asignaciones.
- Q: ¿Desde qué etapas se puede marcar una oportunidad como Ganado o Perdido? → A: Perdido desde cualquier etapa no terminal; Ganado solo desde Negociación.
- Q: ¿Qué campos del cliente deben ser únicos para evitar duplicados en el CRM? → A: Correo único; el nombre de empresa puede repetirse.
- Q: ¿Qué horizonte debe considerar la sección de próximos cierres del dashboard? → A: Próximos 30 días.

### Session 2026-11-21

- Q: ¿Dónde debe guardarse la preferencia de tema (Claro/Oscuro) para conservarla entre recargas en el mismo entorno? → A: En el almacenamiento local del navegador de esa misma instancia (mismo entorno/navegador del MVP).
- Q: ¿Deben seguir contando las oportunidades abiertas de un cliente archivado en los indicadores de oportunidades abiertas y monto total en pipeline del dashboard? → A: Sí, se siguen contando; las oportunidades abiertas se definen únicamente por su etapa, sin excluir las de clientes archivados.
- Q: ¿Puede reutilizarse el correo de un cliente archivado al registrar uno nuevo? → A: No; el correo permanece reservado y la unicidad se aplica también a los clientes archivados.
- Q: ¿Qué ocurre al salir de cualquier formulario CRM con cambios sin guardar y qué salidas activan la confirmación? → A: Se muestra una confirmación con opciones «Permanecer» y «Descartar»; la navegación interna continúa solo si el usuario confirma que desea salir. La recarga de la página y el botón Atrás del navegador quedan fuera de alcance del MVP.
- Q: ¿Qué ocurre con los valores guardados de un campo personalizado que se elimina de la configuración? → A: Se conservan en el almacenamiento, pero dejan de mostrarse o editarse en formularios y listas.
- Q: ¿Qué se considera almacenamiento corrupto al iniciar y qué debe hacer el reinicio explícito? → A: JSON inválido o datos con forma incorrecta en las claves de entidad; se muestra un error claro con una acción explícita que escribe arreglos vacíos en esas claves `crm_module:*`, sin reiniciar silenciosamente y conservando las claves de sesión y tema.
- Q: ¿Cómo se calcula la tasa de conversión del Dashboard a partir de las oportunidades? → A: Ganadas ÷ (ganadas + perdidas), redondeado a un porcentaje entero; 0 % cuando no hay oportunidades cerradas.
- Q: ¿Los indicadores del Dashboard deben actualizarse de forma continua mientras la pantalla permanece abierta o solo cuando se muestra? → A: Solo cuando se muestra la pantalla; no se actualizan automáticamente mientras permanece abierta.
- Q: ¿El CRM debe exponer un selector de tema Claro/Oscuro o la persistencia solo aplica cuando ya exista un selector? → A: Debe exponer el selector; la elección se guarda y se aplica desde el primer render.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Gestionar clientes (Prioridad: P1)

Como ejecutivo comercial, quiero registrar, editar y consultar clientes con su información de contacto y estado, para mantener una ficha única y actualizada de cada relación comercial.

**Por qué esta prioridad**: Los clientes son el dato maestro central del CRM. Sin ellos no es posible registrar interacciones ni oportunidades, por lo que esta historia entrega el valor mínimo del producto.

**Prueba Independiente**: Un usuario puede abrir el módulo, crear un cliente con los campos obligatorios, verlo en la lista, editar sus datos y comprobar que los cambios se reflejan.

**Escenarios de Aceptación**:

1. **Dado** que el usuario está viendo la lista de clientes, **cuando** crea un cliente con nombre de empresa, persona de contacto, correo y teléfono, **entonces** el cliente se guarda y aparece en la lista.
2. **Dado** que el usuario está creando un cliente, **cuando** deja un campo obligatorio en blanco o introduce un correo con formato inválido, **entonces** el sistema impide guardar y explica qué debe corregir.
3. **Dado** un cliente existente, **cuando** el usuario edita sus datos, **entonces** la información actualizada se guarda y se muestra en la lista.
4. **Dado** un cliente recién creado, **cuando** el usuario consulta su estado, **entonces** el estado es `Posible` por defecto.
5. **Dado** un cliente existente, **cuando** el usuario cambia su estado a `Activo` o `Inactivo`, **entonces** el nuevo estado se guarda y se muestra de forma visible.
6. **Dado** un cliente ya registrado con un correo, **cuando** el usuario intenta crear otro cliente con el mismo correo, **entonces** el sistema impide guardar y explica que el correo ya está en uso.
7. **Dado** un cliente archivado, **cuando** el usuario intenta registrar otro cliente con el mismo correo, **entonces** el sistema rechaza el registro porque el correo permanece reservado (FR-069).

---

### Historia de Usuario 2 - Gestionar el catálogo de empleados (Prioridad: P1)

Como administrador comercial, quiero mantener un catálogo de empleados con su nombre y cargo, para asignar responsables válidos a las oportunidades e interacciones.

**Por qué esta prioridad**: Toda oportunidad e interacción debe tener un responsable trazable. El catálogo de empleados es una dependencia directa del resto de las funcionalidades comerciales.

**Prueba Independiente**: Un usuario puede crear un empleado con nombre y cargo, verlo en el catálogo y editarlo; luego puede seleccionarlo como responsable al crear una oportunidad o interacción.

**Escenarios de Aceptación**:

1. **Dado** que el usuario está viendo el catálogo de empleados, **cuando** crea un empleado con nombre y cargo, **entonces** el empleado se guarda y aparece en la lista.
2. **Dado** que el usuario está creando un empleado, **cuando** deja el nombre o el cargo en blanco, **entonces** el sistema impide guardar y explica qué falta.
3. **Dado** un empleado existente, **cuando** el usuario edita su nombre o cargo, **entonces** los cambios se guardan y se reflejan en la lista.
4. **Dado** que el usuario está creando una oportunidad o interacción, **cuando** abre el selector de responsable, **entonces** solo puede elegir empleados existentes en el catálogo.

---

### Historia de Usuario 3 - Gestionar oportunidades y su pipeline (Prioridad: P1)

Como ejecutivo comercial, quiero registrar oportunidades vinculadas a un cliente y a un empleado, con monto estimado, fecha de cierre y etapa de venta, para dar seguimiento a cada negociación.

**Por qué esta prioridad**: Las oportunidades representan el valor comercial que el CRM debe gestionar. Sin ellas, el módulo no cumple su objetivo de seguimiento de ventas.

**Prueba Independiente**: Un usuario puede crear una oportunidad válida para un cliente existente, verla en la lista con su etapa y monto, y avanzarla por las etapas permitidas.

**Escenarios de Aceptación**:

1. **Dado** un cliente y un empleado existentes, **cuando** el usuario crea una oportunidad con monto estimado y fecha de cierre, **entonces** la oportunidad se guarda y aparece asociada al cliente.
2. **Dado** que el usuario está creando una oportunidad, **cuando** no selecciona cliente o empleado, **entonces** el sistema impide guardar y explica que ambos responsables son obligatorios.
3. **Dado** que el usuario introduce un monto estimado negativo, **cuando** intenta guardar, **entonces** el sistema rechaza el valor e indica que debe ser mayor o igual a cero.
4. **Dado** que el usuario deja la fecha estimada de cierre vacía o introduce una fecha inválida, **cuando** intenta guardar, **entonces** el sistema impide guardar y explica el problema.
5. **Dada** una oportunidad en etapa `Evaluación`, **cuando** el usuario la avanza, **entonces** puede pasarla a `Propuesta` o marcarla como `Perdido`, pero no puede marcarla como `Ganado`.
6. **Dada** una oportunidad en etapa `Propuesta`, **cuando** el usuario la avanza, **entonces** puede pasarla a `Negociación` o marcarla como `Perdido`, pero no puede marcarla como `Ganado`.
7. **Dada** una oportunidad en etapa `Negociación`, **cuando** el usuario la cierra, **entonces** puede marcarla como `Ganado` o `Perdido`.
8. **Dada** una oportunidad en etapa `Ganado` o `Perdido`, **cuando** el usuario intenta cambiarla de etapa, **entonces** el sistema rechaza la transición por ser un estado terminal.
9. **Dada** una oportunidad en etapa `Evaluación` o `Propuesta`, **cuando** el usuario intenta marcarla como `Ganado`, **entonces** el sistema rechaza la transición y explica que solo puede ganarse desde `Negociación`.
10. **Dada** una lista de oportunidades, **cuando** el usuario la consulta, **entonces** puede identificar de un vistazo la etapa, el monto y la fecha estimada de cierre de cada una.

---

### Historia de Usuario 4 - Registrar interacciones con clientes (Prioridad: P1)

Como ejecutivo comercial, quiero registrar llamadas, correos y reuniones asociadas a un cliente y a un empleado, para dejar trazabilidad de cada comunicación.

**Por qué esta prioridad**: El historial de interacciones es el segundo pilar del CRM y permite justificar el avance de las oportunidades y el estado de la relación con el cliente.

**Prueba Independiente**: Un usuario puede registrar una interacción válida para un cliente existente, verla en el historial del cliente y editarla.

**Escenarios de Aceptación**:

1. **Dado** un cliente y un empleado existentes, **cuando** el usuario registra una interacción con fecha y tipo, **entonces** la interacción se guarda y queda asociada al cliente.
2. **Dado** que el usuario está registrando una interacción, **cuando** deja la fecha o el tipo en blanco, **entonces** el sistema impide guardar y explica qué falta.
3. **Dado** que el usuario selecciona el tipo de interacción, **cuando** abre las opciones, **entonces** solo puede elegir `Llamada`, `Correo` o `Reunión`.
4. **Dado** un cliente con interacciones registradas, **cuando** el usuario consulta su ficha, **entonces** ve el historial ordenado y puede identificar fecha, tipo y responsable.
5. **Dado** que el usuario está registrando una interacción, **cuando** deja la descripción vacía, **entonces** la interacción se guarda igualmente porque la descripción es opcional.

---

### Historia de Usuario 5 - Ver la ficha 360° del cliente (Prioridad: P1)

Como ejecutivo comercial, quiero ver en un solo lugar los datos de un cliente junto con sus oportunidades e interacciones, para entender el estado completo de la relación sin navegar entre pantallas.

**Por qué esta prioridad**: La vista consolidada convierte datos dispersos en información útil para la toma de decisiones y es el principal punto de consulta del CRM.

**Prueba Independiente**: Un usuario puede seleccionar un cliente y ver su información, sus oportunidades y sus interacciones asociadas; si no tiene registros, ve un estado vacío claro.

**Escenarios de Aceptación**:

1. **Dado** un cliente con oportunidades e interacciones, **cuando** el usuario abre su ficha, **entonces** ve los datos del cliente y ambos listados asociados.
2. **Dado** un cliente sin oportunidades ni interacciones, **cuando** el usuario abre su ficha, **entonces** ve estados vacíos claros que explican que aún no hay registros.
3. **Dado** que el usuario está en la ficha de un cliente, **cuando** vuelve a la lista, **entonces** los datos del cliente y sus registros asociados permanecen intactos.

---

### Historia de Usuario 6 - Dashboard comercial (Prioridad: P1)

Como usuario de negocio, quiero un panel de inicio con indicadores comerciales y accesos rápidos, para priorizar mi trabajo al abrir la aplicación.

**Por qué esta prioridad**: El dashboard es el punto de entrada del CRM y permite detectar de inmediato el volumen de clientes, oportunidades abiertas y monto en pipeline.

**Prueba Independiente**: Un usuario abre la aplicación y ve un dashboard con indicadores calculados desde los datos almacenados y accesos rápidos para crear clientes, oportunidades e interacciones.

**Escenarios de Aceptación**:

1. **Dado** que el usuario abre la aplicación, **cuando** carga el dashboard, **entonces** ve indicadores de clientes activos, oportunidades abiertas, monto total en pipeline y tasa de conversión, además de una sección «Próximos cierres» con el horizonte de 30 días definido en FR-046.
2. **Dado** que el usuario crea o modifica registros, **cuando** vuelve al dashboard, **entonces** los indicadores reflejan los datos actualizados.
3. **Dado** que no existen clientes ni oportunidades, **cuando** el usuario abre el dashboard, **entonces** los indicadores muestran cero sin errores y se ofrece un acceso rápido para empezar.
4. **Dado** que el usuario está en el dashboard, **cuando** activa un acceso rápido, **entonces** llega al formulario correspondiente listo para introducir datos.
5. **Dada** una oportunidad abierta con fecha de cierre dentro de los próximos 30 días, **cuando** el usuario consulta el dashboard, **entonces** esa oportunidad se cuenta en la sección de próximos cierres.
6. **Dada** una oportunidad abierta con fecha de cierre posterior a 30 días o ya vencida, **cuando** el usuario consulta el dashboard, **entonces** no se cuenta en próximos cierres, aunque sí permanece en oportunidades abiertas y en el monto del pipeline.
7. **Dada** una oportunidad abierta de un cliente archivado, **cuando** el usuario consulta el dashboard, **entonces** esa oportunidad se cuenta en oportunidades abiertas, en el monto del pipeline y en próximos cierres si su fecha está en el horizonte de 30 días (FR-068).

---

### Historia de Usuario 7 - Buscar y filtrar registros comerciales (Prioridad: P2)

Como ejecutivo comercial, quiero buscar clientes y filtrar oportunidades por etapa, responsable o fecha, para encontrar rápidamente la información que necesito.

**Por qué esta prioridad**: La búsqueda y los filtros mejoran la productividad cuando el volumen de datos crece, pero no son necesarios para el funcionamiento básico del CRM.

**Prueba Independiente**: Un usuario puede introducir un término de búsqueda y ver solo los clientes coincidentes, o aplicar filtros y ver solo las oportunidades que cumplen los criterios.

**Escenarios de Aceptación**:

1. **Dados** varios clientes almacenados, **cuando** el usuario busca por nombre de empresa, persona de contacto o correo, **entonces** solo se muestran los clientes coincidentes.
2. **Dada** una búsqueda sin coincidencias, **cuando** el usuario la ejecuta, **entonces** el sistema muestra un estado vacío claro y permite volver a intentarlo.
3. **Dadas** varias oportunidades, **cuando** el usuario filtra por etapa, **entonces** solo se muestran las oportunidades de esa etapa.
4. **Dadas** varias oportunidades, **cuando** el usuario filtra por empleado responsable o por rango de fecha de cierre, **entonces** solo se muestran las que cumplen el filtro.
5. **Dados** varios filtros activos, **cuando** el usuario los combina, **entonces** los resultados respetan todos los criterios seleccionados.
6. **Dadas** al menos 500 clientes u oportunidades asociadas, **cuando** el usuario busca o filtra, **entonces** la búsqueda devuelve resultados en <= 10 s y el renderizado inicial de listas en <= 2 s, conforme FR-042 y SC-004.

---

### Historia de Usuario 8 - Validaciones e integridad referencial (Prioridad: P1)

Como usuario de negocio, quiero que el sistema impida registros incompletos o inconsistentes, para mantener la confiabilidad de la información comercial.

**Por qué esta prioridad**: La integridad de los datos es esencial para que los indicadores, el historial y las relaciones entre clientes, empleados, oportunidades e interacciones sean confiables.

**Prueba Independiente**: Un usuario intenta crear registros inválidos y el sistema los rechaza con mensajes claros; también comprueba que no existan oportunidades o interacciones sin cliente o empleado válido.

**Escenarios de Aceptación**:

1. **Dado** que el usuario intenta guardar un cliente sin un campo obligatorio, **cuando** envía el formulario, **entonces** el sistema impide guardar y señala el campo faltante.
2. **Dado** que el usuario introduce un correo con formato inválido, **cuando** intenta guardar el cliente, **entonces** el sistema rechaza el valor y explica el formato esperado.
3. **Dado** un cliente existente con un correo registrado, **cuando** el usuario intenta guardar otro cliente con el mismo correo, **entonces** el sistema rechaza el registro e indica que el correo ya está en uso.
4. **Dado** que el usuario intenta guardar una oportunidad sin cliente o sin empleado, **cuando** envía el formulario, **entonces** el sistema impide guardar y explica que ambas referencias son obligatorias.
5. **Dado** que el usuario intenta guardar una interacción sin cliente o sin empleado, **cuando** envía el formulario, **entonces** el sistema impide guardar y explica que ambas referencias son obligatorias.
6. **Dado** un registro almacenado que referencia un cliente o empleado inexistente, **cuando** el sistema carga los datos, **entonces** informa la inconsistencia en lugar de fallar silenciosamente.
7. **Dado** que el usuario elimina un cliente, **cuando** confirma la acción, **entonces** el cliente se marca como archivado, conserva sus oportunidades e interacciones y deja de aparecer en las listas operativas.
8. **Dado** que el usuario elimina un empleado con oportunidades o interacciones asociadas, **cuando** confirma la acción, **entonces** el empleado se marca como archivado, conserva sus registros y deja de estar disponible para nuevas asignaciones.
9. **Dado** un cliente o empleado archivado, **cuando** el usuario consulta su historial, **entonces** puede ver sus datos y registros asociados sin que aparezcan como opciones para nuevos registros.
10. **Dado** un almacenamiento local con JSON inválido o datos con forma incorrecta en las claves de entidad, **cuando** se inicia la aplicación, **entonces** se muestra un error claro y una acción explícita para reiniciar esas claves con arreglos vacíos, sin descartar automáticamente la información ni modificar sesión o tema (FR-072).

---

### Historia de Usuario 9 - Configurar el módulo CRM (Prioridad: P2)

Como desarrollador de módulos, quiero adaptar la terminología, los campos personalizados, el ciclo de vida y el color de acento mediante configuración, para reutilizar el módulo sin modificar su código central.

**Por qué esta prioridad**: La configuración mantiene el módulo extensible y permite que otros módulos ERP reutilicen la misma base; no es necesaria para demostrar el flujo principal del CRM.

**Prueba Independiente**: Un desarrollador aplica una configuración que cambia el nombre del módulo, las etiquetas y un campo personalizado, y la aplicación se presenta con esos valores sin modificar el código central.

**Escenarios de Aceptación**:

1. **Dada** una configuración con nombre, etiquetas y campos personalizados, **cuando** la aplicación carga, **entonces** todas las pantallas usan los valores configurados.
2. **Dado** que no se proporciona configuración, **cuando** la aplicación carga, **entonces** se usan los valores predeterminados del CRM sin errores.
3. **Dada** una configuración inválida o conflictiva, **cuando** la aplicación carga, **entonces** el sistema informa el problema con claridad en lugar de fallar silenciosamente.
4. **Dado** un campo personalizado declarado, **cuando** el usuario crea o edita un registro, **entonces** el campo aparece en el formulario, se valida y se incluye en la búsqueda.
5. **Dado** un campo personalizado eliminado de la configuración, **cuando** se abre un formulario, una lista o una búsqueda, **entonces** el valor guardado se conserva en el almacenamiento pero deja de mostrarse y editarse (FR-071).

---

### Historia de Usuario 10 - Espacio de trabajo CRM consistente (Prioridad: P2)

Como usuario de negocio, quiero una navegación persistente y un espacio de trabajo con marca, para acceder a las áreas del CRM de forma clara en cualquier pantalla.

**Por qué esta prioridad**: La navegación consistente mejora la usabilidad y da identidad al módulo, pero el valor principal se entrega con las historias de gestión de datos.

**Prueba Independiente**: En cada pantalla, el usuario ve una barra superior con el nombre del módulo y una barra lateral con accesos a Dashboard, Clientes, Empleados, Oportunidades, Interacciones y Búsqueda, con el área activa resaltada.

**Escenarios de Aceptación**:

1. **Dada** cualquier pantalla, **cuando** el usuario la consulta, **entonces** ve una barra superior con el nombre del módulo y una barra lateral de navegación.
2. **Dada** cualquier pantalla, **cuando** el usuario mira la barra lateral, **entonces** el área activa está resaltada visualmente.
3. **Dado** que el usuario navega entre áreas, **cuando** vuelve a un listado, **entonces** los datos permanecen intactos y consistentes.
4. **Dada** una ventana gráfica estrecha, **cuando** el usuario usa la aplicación en un dispositivo pequeño, **entonces** la navegación sigue siendo operable y accesible.
5. **Dado** el selector de tema del espacio de trabajo, **cuando** el usuario elige `Claro` u `Oscuro` y recarga la aplicación en el mismo navegador, **entonces** se conserva la elección y se aplica desde el primer render (FR-073).

---

### Historia de Usuario 11 - Iniciar sesión en una pantalla dividida con contraseña visible (Prioridad: P1)

Como ejecutivo comercial, quiero acceder al CRM desde una pantalla de ingreso con un diseño dividido y poder revisar la contraseña que escribí, para entrar con confianza sin equivocaciones.

**Por qué esta prioridad**: Es la puerta de entrada obligatoria a todas las demás funciones. Si el acceso no es claro o la contraseña no se puede verificar, ninguna otra historia puede entregar valor.

**Prueba Independiente**: Se abre la pantalla de acceso, se comprueba que los dos paneles son visibles, se escribe una contraseña, se alterna su visibilidad dos veces y se confirma que el texto se conserva; después se accede con credenciales válidas.

**Escenarios de Aceptación**:

1. **Dado** un usuario en la pantalla de acceso, **cuando** abre la página en una pantalla de escritorio, **entonces** ve simultáneamente un panel informativo/de marca y un panel con el formulario de acceso, sin necesidad de desplazarse.
2. **Dado** el campo de contraseña vacío, **cuando** el usuario comienza a escribir, **entonces** los caracteres aparecen enmascarados por defecto.
3. **Dado** el campo de contraseña con texto, **cuando** el usuario activa el control "mostrar", **entonces** los caracteres se revelan y el control pasa a indicar "ocultar".
4. **Dado** el control en estado "mostrar", **cuando** el usuario lo activa nuevamente, **entonces** la contraseña vuelve a enmascararse y el texto introducido permanece intacto.
5. **Dado** un usuario con credenciales válidas, **cuando** confirma el acceso, **entonces** ingresa al Dashboard y ve el banner de bienvenida.
6. **Dado** un usuario con credenciales inválidas, **cuando** intenta acceder, **entonces** permanece en la pantalla de acceso, recibe un mensaje comprensible y la contraseña nunca se muestra en el mensaje.

---

### Historia de Usuario 12 - Navegar con un menú lateral colapsable (Prioridad: P2)

Como usuario del CRM, quiero contraer y expandir el menú lateral con un botón de hamburguesa reconocible, para disponer de más espacio de trabajo sin perder el contexto de la sección en la que estoy.

**Por qué esta prioridad**: La navegación se usa en cada pantalla. Un control consistente y predecible reduce la fatiga visual y evita que el usuario se pierda entre secciones.

**Prueba Independiente**: Se autentica un usuario, se localiza el botón de menú, se contrae y expande el panel desde dos secciones distintas y se verifica que la sección activa no cambia y que el área de contenido se ajusta.

**Escenarios de Aceptación**:

1. **Dado** un usuario autenticado, **cuando** observa la barra lateral, **entonces** identifica un botón de menú con icono de hamburguesa en formato vectorial (SVG), claramente diferenciado del resto de los controles.
2. **Dado** el menú expandido, **cuando** el usuario activa el botón, **entonces** la barra se contrae a una franja estrecha de iconos, la sección activa permanece seleccionada y el contenido útil gana espacio.
3. **Dado** el menú contraído, **cuando** el usuario activa el botón, **entonces** la barra se expande y muestra nuevamente las etiquetas completas de navegación.
4. **Dado** un usuario que contrajo el menú, **cuando** navega a otra sección o recarga la página dentro de la misma sesión, **entonces** el menú conserva el estado elegido.
5. **Dado** el menú contraído, **cuando** el usuario usa sus enlaces, **entonces** cada destino sigue siendo identificable y alcanzable mediante teclado, sin depender de una etiqueta visible.

---

### Historia de Usuario 13 - Orientarse en el Dashboard con banner y tarjetas KPI (Prioridad: P2)

Como ejecutivo comercial, quiero que el Dashboard me reciba con un mensaje de bienvenida y muestre los indicadores clave en tarjetas, para entender el estado del negocio en los primeros segundos después de ingresar.

**Por qué esta prioridad**: El Dashboard es la primera pantalla después del acceso. Un resumen claro y personalizado reduce el tiempo de orientación y hace que la interfaz se perciba como profesional.

**Prueba Independiente**: Se ingresa al CRM con un usuario identificado, se verifica el banner con su nombre, se comprueban las cuatro tarjetas KPI y se confirma que los valores coinciden con los datos ficticios vigentes.

**Escenarios de Aceptación**:

1. **Dado** un usuario autenticado, **cuando** se carga el Dashboard, **entonces** ve un banner de bienvenida en español que incluye el nombre del usuario.
2. **Dado** el Dashboard cargado, **cuando** el usuario observa la sección principal, **entonces** encuentra tarjetas KPI para clientes, oportunidades activas, ingresos y tasa de conversión —calculada según FR-058—, cada una con etiqueta y valor legibles.
3. **Dado** un escenario sin registros en el CRM, **cuando** se carga el Dashboard, **entonces** las tarjetas muestran un valor neutro y no aparecen mensajes de error.
4. **Dado** un cambio en los datos del CRM, **cuando** el usuario vuelve al Dashboard, **entonces** los valores de las tarjetas reflejan la información vigente.
5. **Dado** un nombre de usuario extenso, **cuando** se muestra en el banner, **entonces** el texto se ajusta sin romper el diseño del encabezado.

---

### Historia de Usuario 14 - Capturar datos con formularios estandarizados (Prioridad: P2)

Como usuario que registra clientes, quiero encontrar los datos de identificación y las condiciones comerciales agrupadas bajo encabezados claros y con el mismo estilo en todos los formularios, para completar el alta sin dudas ni errores.

**Por qué esta prioridad**: La consistencia de los formularios disminuye errores de captura y acelera el trabajo diario, especialmente cuando se alterna entre alta y edición de clientes.

**Prueba Independiente**: Se abre un formulario de cliente en alta y en edición, se comprueba la presencia exacta de ambos encabezados, se provoca un error de validación en cada bloque y se verifica que la presentación y la redacción sean iguales.

**Escenarios de Aceptación**:

1. **Dado** un formulario de cliente, **cuando** se abre, **entonces** los campos de identificación y contacto aparecen agrupados bajo el encabezado exacto "DATOS DEL CLIENTE".
2. **Dado** un formulario de cliente, **cuando** se abre, **entonces** los campos de moneda, importe, forma y plazo de pago aparecen agrupados bajo el encabezado exacto "CONDICIONES COMERCIALES".
3. **Dado** dos formularios estandarizados distintos, **cuando** se comparan visualmente, **entonces** comparten jerarquía de encabezados, alineación de etiquetas, espaciado y estilo de mensajes de error.
4. **Dado** un campo obligatorio vacío en cualquiera de los dos bloques, **cuando** el usuario intenta guardar, **entonces** el sistema impide el guardado y muestra el mensaje junto al campo con la misma redacción y ubicación en ambos bloques.
5. **Dado** un formulario largo, **cuando** el usuario se desplaza por él, **entonces** los encabezados de sección siguen siendo claramente distinguibles del resto del contenido.
6. **Dado** cualquier formulario CRM con cambios sin guardar, **cuando** el usuario intenta navegar a otra sección de la aplicación, **entonces** se le ofrece permanecer o descartar los cambios y solo se navega si confirma la salida (FR-070).

---

### Historia de Usuario 15 - Leer textos en español sin caracteres mal formados (Prioridad: P3)

Como usuario hispanohablante, quiero que todos los textos de la interfaz y los datos que registro se vean correctamente, para confiar en la información que leo y evito interpretaciones erróneas.

**Por qué esta prioridad**: Un carácter dañado en un nombre, un encabezado o un importe afecta directamente la credibilidad de la información comercial, aunque el resto de la interfaz funcione.

**Prueba Independiente**: Se recorren las pantallas de acceso, navegación, Dashboard y formularios con nombres que contienen acentos, "ñ" y símbolos monetarios; se guarda un registro y se vuelve a consultar para comparar el texto.

**Escenarios de Aceptación**:

1. **Dada** cualquier pantalla del CRM, **cuando** se muestran acentos, la letra "ñ" o símbolos monetarios, **entonces** los caracteres se visualizan completos y sin signos de reemplazo ni caracteres extraños.
2. **Dado** un registro con un nombre que contiene acentos o "ñ", **cuando** se guarda y se consulta nuevamente, **entonces** el texto se muestra exactamente como se introdujo.
3. **Dado** un texto pegado o importado con caracteres propios del español, **cuando** aparece en un listado o formulario, **entonces** conserva su forma original.
4. **Dado** un encabezado en mayúsculas como "DATOS DEL CLIENTE" o "CONDICIONES COMERCIALES", **cuando** se visualiza, **entonces** se lee completo, sin cortes ni caracteres deformados.

---

### Historia de Usuario 16 - Tema oscuro coherente en todo el espacio de trabajo (Prioridad: P1)

Como usuario del CRM, quiero que el tema oscuro se aplique de forma consistente en todas las pantallas, para poder trabajar con comodidad y sin problemas de contraste.

**Por qué esta prioridad**: El selector Claro/Oscuro ya existe, pero si algunas áreas quedan claras se rompe la legibilidad y la confianza en la configuración.

**Prueba Independiente**: Activar `Oscuro`, recorrer acceso, shell, dashboard, clientes, oportunidades, búsqueda, estados vacíos y diálogos; verificar legibilidad, ausencia de superficies claras fijas y persistencia al recargar.

**Escenarios de Aceptación**:

1. **Dado** el tema `Oscuro` activo, **cuando** el usuario navega por acceso, dashboard, clientes, oportunidades, búsqueda y diálogos, **entonces** contenedores, textos, bordes, iconos y estados usan la paleta oscura sin perder legibilidad.
2. **Dado** un mensaje de validación, badge de estado, estado vacío o panel de error, **cuando** se muestra en tema oscuro, **entonces** mantiene contraste suficiente y no usa fondos claros fijos.
3. **Dado** el tema `Claro`, **cuando** el usuario lo selecciona, **entonces** la interfaz vuelve completamente a la paleta clara sin residuos del tema oscuro.
4. **Dada** una recarga en el mismo navegador, **cuando** se aplica el tema guardado, **entonces** la apariencia es coherente desde el primer render, sin parpadeo visible entre temas.

---

### Historia de Usuario 17 - Dashboard coherente con las oportunidades gestionadas (Prioridad: P1)

Como usuario comercial, quiero que los indicadores del dashboard incluyan las oportunidades que creo o edito desde los formularios, para tomar decisiones con métricas confiables.

**Por qué esta prioridad**: Un KPI que no refleja la operación real invalida el dashboard como punto de control.

**Prueba Independiente**: Crear un cliente y una oportunidad desde la UI, volver al dashboard y verificar que “Oportunidades activas”, “Ingresos estimados”, “Tasa de conversión” y próximos cierres cambian según los datos guardados.

**Escenarios de Aceptación**:

1. **Dado** un usuario en el formulario de oportunidades, **cuando** crea una oportunidad válida, **entonces** al volver al dashboard los KPI reflejan el nuevo registro.
2. **Dada** una oportunidad existente, **cuando** el usuario cambia su monto, etapa o fecha de cierre, **entonces** los KPI se recalculan con los valores vigentes al mostrar el dashboard.
3. **Dada** una oportunidad eliminada, **cuando** el usuario regresa al dashboard, **entonces** deja de contarse en los indicadores correspondientes.
4. **Dado** el modelo de almacenamiento del MVP, **cuando** se guarda una oportunidad desde la UI, **entonces** no existe divergencia entre los datos mostrados en formularios/listas y los datos usados por el dashboard.

---

### Historia de Usuario 18 - Preferencia “Recordar mi sesión” efectiva (Prioridad: P2)

Como usuario, quiero que la opción “Recordar mi sesión” controle si mi acceso se conserva al cerrar el navegador, para elegir el nivel de persistencia adecuado en mi equipo.

**Por qué esta prioridad**: El control existe en la UI; si no hace nada, genera desconfianza y un posible problema de privacidad.

**Prueba Independiente**: Iniciar sesión con la opción marcada y sin marcar; cerrar y reabrir el navegador/contexto; verificar el comportamiento esperado.

**Escenarios de Aceptación**:

1. **Dado** el checkbox “Recordar mi sesión” marcado, **cuando** el usuario inicia sesión correctamente, **entonces** la sesión se conserva en el mismo navegador tras cerrar y reabrir el navegador.
2. **Dado** el checkbox “Recordar mi sesión” desmarcado, **cuando** el usuario inicia sesión correctamente, **entonces** la sesión solo se conserva mientras dure la sesión de pestaña/navegador actual y no se restaura al abrir un nuevo contexto de navegador.
3. **Dado** un usuario que cierra sesión explícitamente, **cuando** vuelve a la pantalla de acceso, **entonces** no se restaura automáticamente la sesión previa, independientemente de la preferencia anterior.
4. **Dado** un intento de acceso, **cuando** el usuario marca o desmarca la preferencia, **entonces** el valor no altera la validación de credenciales ni expone información sensible.

---

### Historia de Usuario 19 - Confirmación accesible para eliminaciones (Prioridad: P2)

Como usuario, quiero confirmar la eliminación de clientes u oportunidades en un diálogo consistente con la interfaz, para evitar borrados accidentales y entender claramente la acción.

**Por qué esta prioridad**: Las eliminaciones son destructivas; un diálogo nativo rompe consistencia, accesibilidad y control visual.

**Prueba Independiente**: Intentar eliminar un cliente y una oportunidad; verificar diálogo, foco, teclado, cancelación y confirmación.

**Escenarios de Aceptación**:

1. **Dado** un registro seleccionado, **cuando** el usuario pulsa eliminar, **entonces** aparece un diálogo modal del CRM con mensaje claro, acción de cancelar y acción destructiva de confirmar.
2. **Dado** el diálogo abierto, **cuando** el usuario cancela o cierra con Escape, **entonces** no se elimina ningún dato y el foco vuelve al control que originó la acción.
3. **Dado** el diálogo abierto, **cuando** el usuario navega con Tab/Shift+Tab, **entonces** el foco queda atrapado dentro del diálogo hasta cerrarlo.
4. **Dada** una confirmación de eliminación, **cuando** el usuario confirma, **entonces** el registro se elimina según la regla de negocio vigente y la UI se actualiza sin errores.

---

### Historia de Usuario 20 - Búsqueda de clientes y oportunidades (Prioridad: P2)

Como usuario comercial, quiero buscar clientes y oportunidades por texto relevante, para encontrar registros rápidamente sin recorrer formularios o selectores.

**Por qué esta prioridad**: La vista actual se presenta como búsqueda de registros, pero su alcance debe ser claro y útil para el trabajo diario.

**Prueba Independiente**: Crear clientes y oportunidades con términos conocidos; buscar por nombre, código, correo, serie, folio o estado; verificar resultados, tipo de registro y estados vacíos.

**Escenarios de Aceptación**:

1. **Dados** clientes y oportunidades existentes, **cuando** el usuario busca por un término, **entonces** ve resultados de ambos tipos claramente identificados.
2. **Dado** un término sin coincidencias, **cuando** se ejecuta la búsqueda, **entonces** se muestra un estado vacío claro indicando que no hay registros coincidentes.
3. **Dado** un resultado de búsqueda, **cuando** el usuario lo selecciona, **entonces** navega al área correspondiente con el registro listo para consultar o editar.
4. **Dados** campos personalizados eliminados de la configuración, **cuando** se realiza la búsqueda, **entonces** no se consideran para el filtrado ni se muestran, en línea con FR-071.

---

### Historia de Usuario 21 - Listas escalables para gestionar registros (Prioridad: P2)

Como usuario, quiero ver clientes y oportunidades en listas con acciones claras, para gestionarlos eficientemente cuando el volumen de datos crece.

**Por qué esta prioridad**: Los selectores para editar/eliminar no escalan y dificultan la revisión de muchos registros.

**Prueba Independiente**: Cargar 30+ registros de prueba; localizar, editar y eliminar desde la lista; verificar que la selección y el formulario se sincronizan.

**Escenarios de Aceptación**:

1. **Dados** varios clientes u oportunidades, **cuando** el usuario abre la vista, **entonces** ve un listado con columnas/campos clave, estado visible y acciones por fila.
2. **Dada** una lista larga, **cuando** el usuario filtra o busca dentro de la vista, **entonces** puede reducir resultados sin perder el contexto de la sección.
3. **Dado** que el usuario selecciona “Editar” en una fila, **cuando** se carga el formulario, **entonces** el registro queda seleccionado y sus datos se muestran correctamente.
4. **Dado** un volumen alto de registros, **cuando** se renderiza la vista, **entonces** la interacción sigue siendo usable sin depender solo de un selector desplegable.

---

### Historia de Usuario 22 - Restaurar la vista activa tras recargar (Prioridad: P3)

Como usuario, quiero volver a la última sección activa después de recargar, para continuar mi trabajo sin repetir la navegación.

**Por qué esta prioridad**: Mejora la continuidad, especialmente al trabajar con formularios, búsqueda o dashboard.

**Prueba Independiente**: Navegar a Clientes, Oportunidades y Búsqueda; recargar; verificar que la app restaura la vista válida o cae al dashboard si no es segura.

**Escenarios de Aceptación**:

1. **Dado** un usuario autenticado en una vista interna, **cuando** recarga la página, **entonces** la aplicación restaura esa vista si sigue siendo válida.
2. **Dada** una vista guardada inválida o no disponible, **cuando** la aplicación inicia, **entonces** muestra el dashboard sin error.
3. **Dado** un usuario no autenticado, **cuando** intenta acceder a una ruta o vista interna, **entonces** se aplica la regla de autenticación existente antes de restaurar contenido.

---

### Historia de Usuario 23 - Accesibilidad completa en formularios y diálogos (Prioridad: P1)

Como usuario que navega con teclado o tecnologías de asistencia, quiero que los formularios y diálogos comuniquen errores y gestionen el foco correctamente, para completar tareas sin barreras.

**Por qué esta prioridad**: Los errores de validación y diálogos modales son puntos críticos de interacción; sin accesibilidad, el flujo falla para muchos usuarios.

**Prueba Independiente**: Enviar formularios inválidos solo con teclado, activar diálogo de cambios sin guardar y confirmación de eliminación; verificar foco, Escape, asociaciones de error y ausencia de fuga de foco.

**Escenarios de Aceptación**:

1. **Dado** un campo con error de validación, **cuando** se muestra el mensaje, **entonces** el campo tiene estado inválido accesible y está asociado al texto de error mediante `aria-describedby` o mecanismo equivalente.
2. **Dado** un envío con errores, **cuando** el sistema bloquea el guardado, **entonces** el foco se mueve al primer campo inválido o el error se anuncia de forma clara.
3. **Dado** el diálogo de cambios sin guardar abierto, **cuando** el usuario pulsa Escape o cancela, **entonces** se mantiene en la vista actual, no se navega y el foco regresa al control que inició la acción.
4. **Dado** cualquier diálogo modal del CRM, **cuando** el usuario usa Tab/Shift+Tab, **entonces** el foco permanece dentro del diálogo hasta cerrarlo.

---

### Historia de Usuario 24 - Presentación de moneda clara y consistente (Prioridad: P3)

Como usuario, quiero que los montos y KPIs muestren la moneda de forma clara y consistente, para evitar interpretaciones erróneas en el pipeline.

**Por qué esta prioridad**: Hoy el formato puede verse fijo mientras el formulario permite capturar moneda, lo que genera ambigüedad.

**Prueba Independiente**: Registrar oportunidades con la moneda soportada por el MVP; verificar dashboard, listas y formularios; confirmar la regla definida para totales agregados.

**Escenarios de Aceptación**:

1. **Dado** un monto mostrado en la UI, **cuando** el usuario lo consulta, **entonces** ve la moneda con la que fue registrado o una etiqueta clara de la moneda base del módulo.
2. **Dado** el KPI de ingresos/pipeline, **cuando** existen oportunidades en la moneda soportada, **entonces** el total se presenta con la regla definida por el MVP y sin mezclar símbolos ambiguos.
3. **Dado** que el MVP solo soporta una moneda base, **cuando** el usuario captura un monto, **entonces** la UI lo indica claramente y valida o normaliza el valor según la regla definida.

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
- ¿Qué ocurre con una oportunidad abierta cuya fecha estimada de cierre ya pasó?
- ¿Qué ocurre con una oportunidad abierta cuya fecha de cierre está a más de 30 días?
- ¿Qué ocurre cuando la configuración declara un campo personalizado con una clave que choca con un campo base?
- ¿Qué ocurre cuando la configuración referencia un tipo de campo o una transición de ciclo de vida inválida?
- Cuando un registro contiene valores de campos personalizados que ya no están declarados, esos valores se conservan en el almacenamiento pero no se muestran ni se editan.
- Al navegar fuera de cualquier formulario CRM con cambios sin guardar hacia otra sección de la aplicación, el sistema pide confirmación y solo descarta los cambios si el usuario confirma que desea salir; recargar la página o usar Atrás del navegador queda fuera de alcance del MVP.
- Cuando el almacenamiento local está vacío, los indicadores se muestran en cero; cuando contiene JSON inválido o datos con forma incorrecta en las claves de entidad, el sistema muestra un error claro y ofrece reiniciar solo esas claves con arreglos vacíos, conservando sesión y tema.
- Si el usuario cancela o ignora la acción de reinicio ante corrupción, la app no debe continuar con operaciones normales sobre datos afectados; el error y la acción de reinicio permanecen disponibles.
- Si el reinicio explícito falla al escribir en almacenamiento, se muestra error de recuperación con opción de reintentar, no se alteran claves no afectadas y el estado no se marca como recuperado.
- Cuando una oportunidad tiene etapa ausente, nula o inválida, se excluye del cálculo de conversión y se reporta como inconsistencia recuperable sin impedir el cálculo del resto de KPIs.
- Contraseñas muy largas o con caracteres especiales al alternar repetidamente la visibilidad: el texto no se trunca ni se pierde.
- Pantalla de acceso en un viewport estrecho: los dos paneles se apilan y el formulario sigue siendo utilizable sin desplazamiento horizontal.
- Menú contraído en pantallas estrechas: el botón permanece visible y, si no hay espacio para la franja de iconos, la navegación se presenta como capa superpuesta sin ocultar el contenido activo.
- Usuario con sesión iniciada que recarga la página directamente en una sección distinta del Dashboard: el menú conserva su estado y el contenido no se desplaza de forma inesperada.
- Dashboard sin datos, con valores negativos o con importes muy grandes: las tarjetas muestran el valor sin desbordar su contenedor y sin mensajes engañosos.
- Textos con acentos, "ñ", diéresis o símbolos de monedas distintas en nombres, etiquetas y condiciones comerciales.
- Campos obligatorios vacíos en ambos bloques de formulario: se identifican todos los errores a la vez con el mismo formato.
- Nombres de usuario extensos o con caracteres especiales en el banner de bienvenida.
- ¿Qué ocurre cuando el usuario activa el tema oscuro y existen superficies con colores fijos heredados?
- ¿Qué ocurre cuando se crea o edita una oportunidad desde el formulario y el dashboard usa una fuente de datos distinta?
- ¿Qué ocurre cuando el usuario desmarca “Recordar mi sesión”, cierra el navegador y vuelve a abrir la aplicación?
- ¿Qué ocurre cuando el usuario intenta eliminar un registro y cancela el diálogo con Escape o con el botón cancelar?
- ¿Qué ocurre cuando la búsqueda no distingue entre clientes y oportunidades o no indica el tipo de resultado?
- ¿Qué ocurre cuando existen decenas de clientes u oportunidades y la edición depende solo de un selector?
- ¿Qué ocurre cuando se recarga la página en una vista interna o con una vista guardada inválida?
- ¿Qué ocurre cuando un usuario navega solo con teclado por formularios inválidos o diálogos modales?
- ¿Qué ocurre cuando se registran montos con monedas distintas o cuando el KPI agrega montos con una moneda fija?

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
- **FR-026**: El sistema DEBE mostrar un dashboard de inicio con indicadores de clientes activos, oportunidades abiertas, monto total en pipeline y tasa de conversión, y DEBE ofrecer una sección de «Próximos cierres» con las oportunidades abiertas calculadas según FR-046. La sección no añade una quinta tarjeta KPI.
- **FR-027**: El sistema DEBE actualizar los indicadores del dashboard cada vez que se muestra la pantalla y NO DEBE actualizarlos automáticamente mientras la pantalla permanece abierta.
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
- **FR-042**: El sistema DEBE mantener la búsqueda, los filtros y el renderizado de listas ágiles para al menos 500 clientes y sus registros asociados, con búsquedas que devuelvan resultados en 10 segundos o menos (SC-002) y renderizado inicial de listas en 2 segundos o menos en el navegador de referencia.
- **FR-043**: El sistema DEBE impedir que clientes o empleados archivados se asignen a nuevas oportunidades o interacciones.
- **FR-044**: El sistema DEBE permitir consultar el historial de clientes y empleados archivados sin ofrecerlos como opciones para nuevos registros.
- **FR-045**: El sistema DEBE impedir registrar dos clientes con el mismo correo electrónico, comparando el valor sin distinguir mayúsculas de minúsculas.
- **FR-046**: El sistema DEBE calcular la sección «Próximos cierres» con las oportunidades abiertas cuya fecha estimada de cierre esté entre la fecha actual y los 30 días siguientes, excluyendo las vencidas, y DEBE mostrarla desde el dashboard sin sustituir ninguna de las cuatro tarjetas KPI.
- **FR-047**: La pantalla de acceso DEBE presentar dos áreas visualmente diferenciadas —un panel informativo/de marca y un panel con el formulario de ingreso— visibles simultáneamente en pantallas de escritorio.
- **FR-048**: La contraseña DEBE permanecer enmascarada por defecto en el campo de acceso.
- **FR-049**: El formulario de acceso DEBE permitir alternar la visibilidad de la contraseña mediante un control explícito, conservando el texto introducido.
- **FR-050**: El control de visibilidad DEBE comunicar su estado mediante una indicación de "mostrar" u "ocultar" comprensible.
- **FR-051**: El sistema DEBE dirigir al usuario al Dashboard después de un acceso válido.
- **FR-052**: Ante credenciales inválidas, el sistema DEBE permanecer en la pantalla de acceso y mostrar un mensaje de error comprensible que no revele la contraseña.
- **FR-053**: La navegación principal DEBE incluir un botón de menú con icono de hamburguesa en formato vectorial (SVG), identificable y utilizable mediante teclado.
- **FR-054**: El menú lateral DEBE alternar entre un estado expandido con etiquetas y un estado contraído con iconos sin cambiar la sección activa.
- **FR-055**: El cambio de estado del menú DEBE ajustar el área de contenido sin superponerlo ni ocultar información.
- **FR-056**: El estado del menú DEBE conservarse durante la sesión del usuario.
- **FR-057**: El Dashboard DEBE mostrar un banner de bienvenida en español que incluya el nombre del usuario autenticado.
- **FR-058**: El Dashboard DEBE mostrar tarjetas KPI para clientes, oportunidades activas, ingresos y tasa de conversión, con etiqueta y valor legibles. La tasa de conversión DEBE calcularse como `ganadas / (ganadas + perdidas)`, redondeada a un porcentaje entero, y DEBE ser `0 %` cuando no existan oportunidades cerradas. Las etapas ausentes, nulas o inválidas no se consideran cerradas para la conversión; se excluyen del denominador y no bloquean el cálculo/render del resto de KPIs.
  - **Reporte observable (inconsistencia recuperable)**: cuando se detectan una o más oportunidades con etapa ausente/nula/inválida, el dashboard muestra un aviso no bloqueante visible (por ejemplo, `#dashboard-data-warning` o banner equivalente) con texto claro indicando que hay registros con etapa inválida excluidos del cálculo de conversión y la cantidad afectada. El aviso aparece al renderizar/cargar el dashboard y desaparece cuando ya no existen inconsistencias. Los KPIs válidos se muestran normalmente; no se usa modal bloqueante ni se impide la navegación.
- **FR-059**: Las tarjetas KPI DEBEN mostrar un valor neutro cuando no existan datos, sin generar mensajes de error.
- **FR-060**: Los valores de las tarjetas KPI DEBEN corresponder a los datos vigentes del CRM al ingresar al Dashboard.
- **FR-061**: Los formularios de cliente DEBEN agrupar la identificación y el contacto bajo el encabezado exacto "DATOS DEL CLIENTE".
- **FR-062**: Los formularios de cliente DEBEN agrupar moneda, importe, forma y plazo de pago bajo el encabezado exacto "CONDICIONES COMERCIALES".
- **FR-063**: Todos los bloques de formulario estandarizados DEBEN compartir la misma jerarquía visual, alineación de etiquetas, espaciado y presentación de errores.
- **FR-064**: Los mensajes de validación DEBEN aparecer junto al campo correspondiente y usar la misma redacción y ubicación en ambos bloques.
- **FR-065**: La interfaz DEBE representar correctamente acentos, la letra "ñ" y símbolos monetarios en encabezados, etiquetas, listados y datos introducidos.
- **FR-066**: La interfaz DEBE conservar la integridad de los caracteres al guardar y volver a mostrar nombres y condiciones comerciales.
- **FR-067**: Los encabezados en mayúsculas DEBEN permanecer completos y legibles, sin cortes ni caracteres deformados.
- **FR-068**: El sistema DEBE incluir en los indicadores de oportunidades abiertas, monto total en pipeline y próximos cierres las oportunidades de clientes archivados, siempre que su etapa no sea terminal.
- **FR-069**: El sistema DEBE mantener reservado el correo de un cliente archivado, impidiendo que se reutilice al registrar otro cliente.
- **FR-070**: El sistema DEBE pedir confirmación antes de abandonar cualquier formulario CRM con cambios sin guardar mediante navegación interna, permitiendo al usuario permanecer en él o descartar los cambios. **Criterio de cambios sin guardar**: un formulario se considera “dirty” cuando el valor actual serializado de cualquier campo editable (`input`, `select`, `textarea`) difiere de la línea base capturada al cargar, limpiar, guardar con éxito o descartar; los campos deshabilitados/solo lectura no cuentan. Tras guardar con éxito o descartar, la línea base se restablece y el formulario vuelve a estado limpio. La recarga de la página y el botón Atrás del navegador quedan fuera de alcance del MVP.
- **FR-071**: El sistema DEBE conservar en el almacenamiento los valores de campos personalizados que ya no estén declarados en la configuración, omitiéndolos de formularios, listas y búsquedas.
- **FR-072**: El sistema DEBE validar las claves de almacenamiento CRM en cada arranque, antes de renderizar el estado operativo, y mostrar un error claro con una acción explícita de reinicio cuando detecte corrupción, en lugar de reiniciar silenciosamente o fallar sin explicación.
  - **Criterio de corrupción**: se considera corrupta una clave cuando el JSON es inválido, o cuando el valor parseado no cumple la forma esperada: claves de entidad CRM (`crm_module:customers`, `crm_module:employees`, `crm_module:opportunities`, `crm_module:interactions`) deben ser arreglos; cada registro debe ser objeto con `id` string no vacío; registros de oportunidades deben tener `stage`/estado reconocible o ser reportados como inconsistencia recuperable; claves de compatibilidad `erp_base_module:entities` y `erp_base_module:documents`, si existen y son leídas por la ruta activa, deben ser arreglos de objetos.
  - **Categorías y alcance del reinicio**: el reinicio explícito escribe arreglos vacíos solo en las claves de entidad CRM afectadas (`crm_module:*` de entidad) y, si se usó compatibilidad afectada, en las claves `erp_base_module:*` afectadas. NO DEBE modificar `erp.authenticatedUser`, `erp.sidebarCollapsed`, `erp.activeView`, `crm.theme` ni otras preferencias no pertenecientes a datos de entidad.
  - **Comportamiento observable de bloqueo**: mientras exista corrupción no resuelta, la UI muestra un estado de error visible (banner/panel de recuperación) con mensaje claro, nombre/categoría de datos afectados y acción primaria "Reiniciar datos afectados". Las acciones de crear/editar/eliminar/cargar listados que dependan de las claves afectadas quedan deshabilitadas u ocultas; navegación no destructiva (p. ej. cerrar sesión, cambiar tema si es independiente) puede permanecer disponible si no escribe datos afectados. Si el usuario cancela/no confirma el reinicio, el bloqueo y el mensaje permanecen visibles.
  - **Reintento ante fallo de reinicio**: si el reinicio falla al escribir almacenamiento, el sistema mantiene el estado de bloqueo, muestra un mensaje de error de recuperación con detalle comprensible y expone un control "Reintentar" (misma acción explícita). No borra claves no afectadas y no marca la recuperación como completada. Tras un reintento exitoso, el error de recuperación desaparece, las claves afectadas quedan en `[]`, la UI se habilita y el usuario continúa en estado vacío controlado.
  - **Fiabilidad**: la detección se ejecuta en el 100% de los arranques; un reinicio exitoso deja las claves afectadas en `[]` y permite continuar en estado vacío controlado.
- **FR-073**: El espacio de trabajo DEBE ofrecer un selector de tema `Claro`/`Oscuro`, guardar la elección en el almacenamiento local del mismo navegador y aplicarla desde el primer render tras recargar. El selector DEBE ser accesible por teclado, tener etiqueta accesible visible o programática, exponer su valor actual y no depender solo del color para comunicar el estado.
- **FR-074**: El sistema DEBE aplicar los tokens de tema a todas las superficies, componentes, estados y diálogos visibles en los modos `Claro` y `Oscuro`.
- **FR-075**: El sistema DEBE mantener contraste y legibilidad suficientes para texto, iconos, bordes, mensajes y controles en ambos temas.
- **FR-076**: Los indicadores del dashboard DEBEN calcularse desde la misma fuente de verdad usada por las altas, ediciones y eliminaciones de oportunidades en la UI.
- **FR-077**: El sistema DEBE evitar divergencias entre los registros de oportunidades visibles en formularios/listas y las métricas del dashboard al mostrar la pantalla.
- **FR-078**: El sistema DEBE aplicar la preferencia “Recordar mi sesión”: si está marcada, conserva la sesión en el mismo perfil/navegador; si no está marcada, usa `sessionStorage` y no se restaura en un nuevo contexto de navegador/pestaña; el cierre de sesión limpia ambas ubicaciones.
- **FR-079**: Las eliminaciones de clientes y oportunidades DEBEN solicitar confirmación mediante un diálogo modal propio del CRM, no mediante `window.confirm`.
- **FR-080**: Los diálogos modales de confirmación DEBEN ser accesibles por teclado, atrapar el foco, permitir cierre seguro y restaurar el foco al control de origen.
- **FR-081**: La vista de búsqueda DEBE permitir localizar clientes y oportunidades por texto relevante e identificar claramente el tipo de cada resultado.
- **FR-082**: El sistema DEBE permitir navegar desde un resultado de búsqueda al área correspondiente con el registro seleccionado para consulta o edición.
- **FR-083**: Las vistas de clientes y oportunidades DEBEN presentar listados escalables con información clave y acciones por fila para editar y eliminar.
- **FR-084**: Los listados DEBEN mantenerse sincronizados con el formulario activo, la selección actual y los cambios guardados o eliminados.
- **FR-085**: El sistema DEBE restaurar la última vista interna válida tras recargar y hacer fallback seguro al dashboard cuando la vista guardada no sea válida, respetando la autenticación.
- **FR-086**: Los campos con error de validación DEBEN exponer estado inválido accesible y asociar el mensaje mediante `aria-describedby` o mecanismo equivalente.
- **FR-087**: Los diálogos modales del CRM DEBEN gestionar foco inicial, focus trap, cierre por Escape y restauración de foco al disparador. Esto aplica a `#unsaved-dialog`, al diálogo de confirmación de eliminación y a cualquier diálogo modal CRM futuro; controles no modales como el selector de tema deben cumplir accesibilidad por teclado/etiquetado equivalente según FR-073.
- **FR-088**: El sistema DEBE definir y mostrar una regla consistente de moneda para montos individuales y KPI agregados; en el MVP, los montos agregados se expresan en la moneda base del módulo y la UI evita símbolos o etiquetas contradictorias.

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
- **Usuario autenticado**: persona que ingresa al CRM; su nombre se muestra en el banner de bienvenida y su sesión determina la preferencia de navegación.
- **Preferencia de navegación**: estado expandido o contraído del menú lateral durante la sesión del usuario.
- **Preferencia de tema**: valor `Claro` u `Oscuro` elegido en el selector del espacio de trabajo y conservado en el almacenamiento local del mismo navegador.
- **Cliente (vista SaaS)**: titular de la ficha capturada; aporta la identificación y los datos de contacto presentados en "DATOS DEL CLIENTE".
- **Condiciones comerciales**: información de moneda, importe, forma y plazo de pago asociada a un cliente u oportunidad, presentada en "CONDICIONES COMERCIALES".
- **Métrica del Dashboard**: indicador mostrado en una tarjeta KPI, con etiqueta, valor y representación neutra cuando no hay datos.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: Los usuarios pueden crear un cliente y verlo en la lista en menos de 2 minutos.
- **SC-002**: Los usuarios pueden encontrar un cliente existente mediante la búsqueda en menos de 10 segundos tras introducir un término relevante.
- **SC-003**: Al menos el 90% de los usuarios de prueba pueden completar las tareas de crear, editar y buscar clientes, registrar oportunidades e interacciones sin ayuda.
- **SC-004**: Con al menos 500 clientes y sus oportunidades e interacciones asociadas, el sistema conserva toda la funcionalidad central, cumple el umbral de búsqueda de SC-002 y renderiza listas en 2 segundos o menos.
- **SC-005**: Cada vez que se muestra el dashboard, sus indicadores coinciden con los datos almacenados, incluidas las oportunidades abiertas de clientes archivados; la tasa de conversión sigue la fórmula de FR-058.
- **SC-006**: El 100% de las oportunidades e interacciones creadas quedan asociadas a un cliente y a un empleado existentes.
- **SC-007**: El sistema rechaza el 100% de las transiciones de etapa no permitidas y de los valores inválidos definidos en esta especificación.
- **SC-008**: Los usuarios pueden navegar entre dashboard, clientes, empleados, oportunidades, interacciones y búsqueda sin perder datos.
- **SC-009**: Un desarrollador puede adaptar el módulo mediante configuración sin modificar el código central.
- **SC-010**: Cada pantalla presenta el mismo espacio de trabajo con marca y el usuario puede identificar el área activa de un vistazo.
- **SC-011**: El sistema rechaza el 100% de los intentos de registrar un cliente con un correo ya existente, incluidos los archivados.
- **SC-012**: El 100 % de los usuarios puede revelar y ocultar la contraseña sin perder el texto introducido en una sola acción.
- **SC-013**: Al menos el 95 % de los usuarios completa el acceso en su primer intento en menos de un minuto.
- **SC-014**: El 100 % de los usuarios contrae y expande el menú lateral en menos de dos segundos desde cualquier sección.
- **SC-015**: En pantallas de escritorio estándar, el banner y las cuatro tarjetas KPI son visibles sin desplazamiento vertical en el 100 % de las cargas del Dashboard.
- **SC-016**: El 100 % de los formularios de cliente presentan los encabezados "DATOS DEL CLIENTE" y "CONDICIONES COMERCIALES" con la misma jerarquía visual en alta y edición.
- **SC-017**: El 100 % de los mensajes de error aparece junto al campo correspondiente con la misma redacción en ambos bloques de formulario.
- **SC-018**: En una revisión completa de todas las pantallas y estados, se encuentran cero caracteres mal formados en textos en español o símbolos monetarios.
- **SC-019**: Al menos el 90 % de los usuarios identifica el propósito de cada tarjeta KPI sin ayuda externa en una prueba de comprensión.
- **SC-020**: Las solicitudes de soporte relacionadas con confusión de navegación o captura de clientes disminuyen un 30 % después del despliegue de la interfaz.
- **SC-021**: El 100 % de las recargas en el mismo navegador conserva el tema elegido y lo aplica antes de que el contenido sea visible.
- **SC-022**: En una revisión visual de acceso, shell, dashboard, formularios, búsqueda y diálogos en tema oscuro, se encuentran 0 superficies críticas con fondo claro fijo o texto ilegible.
- **SC-023**: El 100 % de las altas, ediciones y eliminaciones de oportunidades realizadas desde la UI se reflejan en los KPI del dashboard al siguiente ingreso a la pantalla.
- **SC-024**: El 100 % de los inicios de sesión respetan la preferencia “Recordar mi sesión”, incluyendo la ausencia de restauración tras cierre explícito.
- **SC-025**: El 100 % de las eliminaciones de clientes y oportunidades usan el diálogo modal del CRM y pueden cancelarse o confirmarse solo con teclado.
- **SC-026**: Los usuarios de prueba pueden localizar un cliente u oportunidad existente mediante búsqueda en menos de 10 segundos cuando el término es relevante.
- **SC-027**: Con 50 registros por entidad, un usuario puede identificar y abrir un registro para edición en menos de 15 segundos desde la lista.
- **SC-028**: El 100 % de las recargas en vistas internas válidas restauran la sección esperada, y las vistas inválidas hacen fallback seguro al dashboard.
- **SC-029**: El 100 % de los formularios y diálogos críticos pueden completarse o cancelarse solo con teclado, con mensajes de error asociados y sin pérdida de foco.
- **SC-030**: El 100 % de los montos individuales y KPI agregados muestran una moneda/regla consistente, sin símbolos o etiquetas contradictorias.

## Suposiciones

- El módulo gestiona un único espacio de trabajo compartido, sin backend de autenticación ni roles diferenciados en el MVP; se reutiliza el mecanismo de acceso frontend ya implementado (FR-047 a FR-052). Las salvaguardas transversales FR-070–FR-073 prevalecen sobre comportamientos legacy o supuestos históricos del MVP cuando exista conflicto: confirmación de salida con cambios sin guardar, conservación de valores personalizados huérfanos, recuperación explícita ante corrupción y persistencia/aplicación temprana del tema.
- La versión inicial es una demostración autónoma con datos ficticios, sin integraciones externas. Si el usuario ejecuta el reinicio explícito de almacenamiento corrupto (FR-072), las claves de entidad afectadas quedan en arreglos vacíos y los datos ficticios/previos no se re-sembran automáticamente; el estado vacío resultante es el comportamiento esperado hasta nueva carga de datos.
- El catálogo de empleados se carga antes de registrar oportunidades e interacciones.
- El correo electrónico identifica de forma única a cada cliente; varias empresas pueden compartir un nombre similar o idéntico. La unicidad se aplica también a los clientes archivados, cuyo correo permanece reservado.
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
- Las oportunidades abiertas son aquellas cuya etapa no es `Ganado` ni `Perdido`, incluidas las de clientes archivados.
- El monto total en pipeline es la suma de los montos estimados de las oportunidades abiertas.
- Los próximos cierres son la sección del dashboard con las oportunidades abiertas con fecha estimada de cierre entre la fecha actual y los 30 días siguientes; las oportunidades vencidas no se incluyen en esta sección.
- El módulo no incluye flujos de aprobación, contabilidad, facturación, reportes avanzados ni recordatorios automáticos en el MVP.
- Los datos se conservan entre sesiones en el mismo entorno de uso.
- El contenido introducido por el usuario se sanitiza antes de mostrarse en la interfaz.
- El diseño debe ser utilizable en dispositivos de escritorio y móviles.
- La interfaz SaaS ya está implementada; esta historia documenta y valida el estado esperado sin incorporar backend ni cambiar las reglas de negocio del módulo CRM.
- El idioma de la interfaz es español, coherente con la descripción del usuario y con el módulo CRM existente.
- Se reutiliza el mecanismo de autenticación ya existente; no se incorporan nuevos métodos de acceso ni recuperación de contraseña.
- La preferencia del menú se conserva durante la sesión, no entre sesiones distintas.
- La preferencia “Recordar mi sesión” controla la persistencia de autenticación en el mismo navegador: marcada persiste tras cerrar y reabrir el navegador; desmarcada se limita a la sesión de navegador/pestaña actual. El cierre de sesión explícito siempre elimina la sesión.
- La última vista interna válida se restaura tras recarga; si el valor guardado es inválido o la ruta no es segura, la aplicación cae al dashboard.
- La búsqueda unificada cubre clientes y oportunidades y debe identificar el tipo de resultado antes de navegar al registro.
- Las vistas de clientes y oportunidades pueden conservar selectores auxiliares, pero la gestión principal de editar/eliminar no depende exclusivamente de un `<select>` cuando existe listado.
- Los indicadores del Dashboard son los ya definidos para el CRM: clientes, oportunidades activas, ingresos y tasa de conversión; los próximos cierres se muestran en una sección separada, no como quinta tarjeta KPI.
- Los datos ficticios del módulo CRM siguen siendo la fuente de prueba para las tarjetas KPI y los formularios.
- Los montos agregados del dashboard usan la moneda base del MVP (CLP por defecto) para evitar mezclar monedas; los montos individuales muestran su moneda o la regla de normalización definida por el módulo.
- En pantallas estrechas, los paneles de acceso se apilan y el menú se presenta como capa superpuesta, conservando todas las funciones.
- El formato vectorial (SVG) del icono de hamburguesa es un requisito visual explícito del usuario, no una decisión de arquitectura.
- Las entidades Cliente, Oportunidad y los datos ficticios son los documentados en esta misma especificación.
