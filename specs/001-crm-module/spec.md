# Especificación de la Funcionalidad: Módulo CRM (Customer Relationship Management)

**Rama de la funcionalidad**: 001-crm-module  
**Creada**: 2026-07-08  
**Actualizada**: 2026-11-17

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
- Q: ¿Qué horizonte debe considerar el indicador de próximos cierres del dashboard? → A: Próximos 30 días.

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

1. **Dado** que el usuario abre la aplicación, **cuando** carga el dashboard, **entonces** ve al menos indicadores de clientes activos, oportunidades abiertas, monto total en pipeline y próximos cierres en los siguientes 30 días.
2. **Dado** que el usuario crea o modifica registros, **cuando** vuelve al dashboard, **entonces** los indicadores reflejan los datos actualizados.
3. **Dado** que no existen clientes ni oportunidades, **cuando** el usuario abre el dashboard, **entonces** los indicadores muestran cero sin errores y se ofrece un acceso rápido para empezar.
4. **Dado** que el usuario está en el dashboard, **cuando** activa un acceso rápido, **entonces** llega al formulario correspondiente listo para introducir datos.
5. **Dada** una oportunidad abierta con fecha de cierre dentro de los próximos 30 días, **cuando** el usuario consulta el dashboard, **entonces** esa oportunidad se cuenta en el indicador de próximos cierres.
6. **Dada** una oportunidad abierta con fecha de cierre posterior a 30 días o ya vencida, **cuando** el usuario consulta el dashboard, **entonces** no se cuenta en próximos cierres, aunque sí permanece en oportunidades abiertas y en el monto del pipeline.

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
6. **Dadas** cientos de clientes u oportunidades, **cuando** el usuario busca o filtra, **entonces** los resultados aparecen con prontitud sin retraso perceptible.

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
2. **Dado** el Dashboard cargado, **cuando** el usuario observa la sección principal, **entonces** encuentra tarjetas KPI para clientes, oportunidades activas, ingresos y tasa de conversión, cada una con etiqueta y valor legibles.
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
- ¿Qué ocurre cuando los registros almacenados contienen valores de campos personalizados que ya no están declarados?
- ¿Qué ocurre cuando el usuario navega fuera de un formulario con cambios sin guardar?
- ¿Qué ocurre cuando el almacenamiento local está vacío o contiene datos corruptos?
- Contraseñas muy largas o con caracteres especiales al alternar repetidamente la visibilidad: el texto no se trunca ni se pierde.
- Pantalla de acceso en un viewport estrecho: los dos paneles se apilan y el formulario sigue siendo utilizable sin desplazamiento horizontal.
- Menú contraído en pantallas estrechas: el botón permanece visible y, si no hay espacio para la franja de iconos, la navegación se presenta como capa superpuesta sin ocultar el contenido activo.
- Usuario con sesión iniciada que recarga la página directamente en una sección distinta del Dashboard: el menú conserva su estado y el contenido no se desplaza de forma inesperada.
- Dashboard sin datos, con valores negativos o con importes muy grandes: las tarjetas muestran el valor sin desbordar su contenedor y sin mensajes engañosos.
- Textos con acentos, "ñ", diéresis o símbolos de monedas distintas en nombres, etiquetas y condiciones comerciales.
- Campos obligatorios vacíos en ambos bloques de formulario: se identifican todos los errores a la vez con el mismo formato.
- Nombres de usuario extensos o con caracteres especiales en el banner de bienvenida.

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
- **FR-058**: El Dashboard DEBE mostrar tarjetas KPI para clientes, oportunidades activas, ingresos y tasa de conversión, con etiqueta y valor legibles.
- **FR-059**: Las tarjetas KPI DEBEN mostrar un valor neutro cuando no existan datos, sin generar mensajes de error.
- **FR-060**: Los valores de las tarjetas KPI DEBEN corresponder a los datos vigentes del CRM al ingresar al Dashboard.
- **FR-061**: Los formularios de cliente DEBEN agrupar la identificación y el contacto bajo el encabezado exacto "DATOS DEL CLIENTE".
- **FR-062**: Los formularios de cliente DEBEN agrupar moneda, importe, forma y plazo de pago bajo el encabezado exacto "CONDICIONES COMERCIALES".
- **FR-063**: Todos los bloques de formulario estandarizados DEBEN compartir la misma jerarquía visual, alineación de etiquetas, espaciado y presentación de errores.
- **FR-064**: Los mensajes de validación DEBEN aparecer junto al campo correspondiente y usar la misma redacción y ubicación en ambos bloques.
- **FR-065**: La interfaz DEBE representar correctamente acentos, la letra "ñ" y símbolos monetarios en encabezados, etiquetas, listados y datos introducidos.
- **FR-066**: La interfaz DEBE conservar la integridad de los caracteres al guardar y volver a mostrar nombres y condiciones comerciales.
- **FR-067**: Los encabezados en mayúsculas DEBEN permanecer completos y legibles, sin cortes ni caracteres deformados.

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
- **Cliente (vista SaaS)**: titular de la ficha capturada; aporta la identificación y los datos de contacto presentados en "DATOS DEL CLIENTE".
- **Condiciones comerciales**: información de moneda, importe, forma y plazo de pago asociada a un cliente u oportunidad, presentada en "CONDICIONES COMERCIALES".
- **Métrica del Dashboard**: indicador mostrado en una tarjeta KPI, con etiqueta, valor y representación neutra cuando no hay datos.

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
- **SC-012**: El 100 % de los usuarios puede revelar y ocultar la contraseña sin perder el texto introducido en una sola acción.
- **SC-013**: Al menos el 95 % de los usuarios completa el acceso en su primer intento en menos de un minuto.
- **SC-014**: El 100 % de los usuarios contrae y expande el menú lateral en menos de dos segundos desde cualquier sección.
- **SC-015**: En pantallas de escritorio estándar, el banner y las cuatro tarjetas KPI son visibles sin desplazamiento vertical en el 100 % de las cargas del Dashboard.
- **SC-016**: El 100 % de los formularios de cliente presentan los encabezados "DATOS DEL CLIENTE" y "CONDICIONES COMERCIALES" con la misma jerarquía visual en alta y edición.
- **SC-017**: El 100 % de los mensajes de error aparece junto al campo correspondiente con la misma redacción en ambos bloques de formulario.
- **SC-018**: En una revisión completa de todas las pantallas y estados, se encuentran cero caracteres mal formados en textos en español o símbolos monetarios.
- **SC-019**: Al menos el 90 % de los usuarios identifica el propósito de cada tarjeta KPI sin ayuda externa en una prueba de comprensión.
- **SC-020**: Las solicitudes de soporte relacionadas con confusión de navegación o captura de clientes disminuyen un 30 % después del despliegue de la interfaz.

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
- La interfaz SaaS ya está implementada; esta historia documenta y valida el estado esperado sin ampliar el alcance funcional del módulo CRM.
- El idioma de la interfaz es español, coherente con la descripción del usuario y con el módulo CRM existente.
- Se reutiliza el mecanismo de autenticación ya existente; no se incorporan nuevos métodos de acceso ni recuperación de contraseña.
- La preferencia del menú se conserva durante la sesión, no entre sesiones distintas.
- Los indicadores del Dashboard son los ya definidos para el CRM: clientes, oportunidades activas, ingresos y tasa de conversión.
- Los datos ficticios del módulo CRM siguen siendo la fuente de prueba para las tarjetas KPI y los formularios.
- En pantallas estrechas, los paneles de acceso se apilan y el menú se presenta como capa superpuesta, conservando todas las funciones.
- El formato vectorial (SVG) del icono de hamburguesa es un requisito visual explícito del usuario, no una decisión de arquitectura.
- Las entidades Cliente, Oportunidad y los datos ficticios son los documentados en esta misma especificación.
