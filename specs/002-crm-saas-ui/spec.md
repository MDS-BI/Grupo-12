# Especificación de la Funcionalidad: Interfaz SaaS Profesional del CRM

**Rama de la funcionalidad**: `002-crm-saas-ui`

**Creada**: 2026-11-17

**Estado**: Borrador

**Input**: Descripción del usuario: "Agrega una nueva Historia de Usuario para la interfaz SaaS profesional del CRM ya implementada: inicio de sesión con diseño dividido (split screen) y mostrar/ocultar contraseña, menú lateral colapsable con botón hamburguesa SVG, banner de bienvenida en el Dashboard, tarjetas KPI, estandarización de formularios ('DATOS DEL CLIENTE' y 'CONDICIONES COMERCIALES') y codificación UTF-8 limpia"

## Propósito

Esta historia describe y valida la experiencia visual de la interfaz SaaS profesional del CRM ya implementada. El objetivo es que cada ejecutivo comercial reconozca la marca al ingresar, acceda con confianza, navegue por el espacio de trabajo sin fricción, entienda de un vistazo el estado del negocio y capture información de clientes de forma coherente y legible.

El alcance cubre únicamente la capa de experiencia de usuario: pantalla de acceso, navegación lateral, Dashboard, formularios de cliente y corrección de caracteres. No modifica las reglas de negocio ni los datos del módulo CRM existente.

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Iniciar sesión en una pantalla dividida con contraseña visible (Prioridad: P1)

Como ejecutivo comercial, quiero acceder al CRM desde una pantalla de ingreso con un diseño dividido y poder revisar la contraseña que escribí, para entrar con confianza sin equivocaciones.

**Por qué esta prioridad**: Es la puerta de entrada obligatoria a todas las demás funciones. Si el acceso no es claro o la contraseña no se puede verificar, ninguna otra historia puede entregar valor.

**Independent Test**: Se abre la pantalla de acceso, se comprueba que los dos paneles son visibles, se escribe una contraseña, se alterna su visibilidad dos veces y se confirma que el texto se conserva; después se accede con credenciales válidas.

**Acceptance Scenarios**:

1. **Dado** un usuario en la pantalla de acceso, **cuando** abre la página en una pantalla de escritorio, **entonces** ve simultáneamente un panel informativo/de marca y un panel con el formulario de acceso, sin necesidad de desplazarse.
2. **Dado** el campo de contraseña vacío, **cuando** el usuario comienza a escribir, **entonces** los caracteres aparecen enmascarados por defecto.
3. **Dado** el campo de contraseña con texto, **cuando** el usuario activa el control "mostrar", **entonces** los caracteres se revelan y el control pasa a indicar "ocultar".
4. **Dado** el control en estado "mostrar", **cuando** el usuario lo activa nuevamente, **entonces** la contraseña vuelve a enmascararse y el texto introducido permanece intacto.
5. **Dado** un usuario con credenciales válidas, **cuando** confirma el acceso, **entonces** ingresa al Dashboard y ve el banner de bienvenida.
6. **Dado** un usuario con credenciales inválidas, **cuando** intenta acceder, **entonces** permanece en la pantalla de acceso, recibe un mensaje comprensible y la contraseña nunca se muestra en el mensaje.

---

### Historia de Usuario 2 - Navegar con un menú lateral colapsable (Prioridad: P2)

Como usuario del CRM, quiero contraer y expandir el menú lateral con un botón de hamburguesa reconocible, para disponer de más espacio de trabajo sin perder el contexto de la sección en la que estoy.

**Por qué esta prioridad**: La navegación se usa en cada pantalla. Un control consistente y predecible reduce la fatiga visual y evita que el usuario se pierda entre secciones.

**Independent Test**: Se autentica un usuario, se localiza el botón de menú, se contrae y expande el panel desde dos secciones distintas y se verifica que la sección activa no cambia y que el área de contenido se ajusta.

**Acceptance Scenarios**:

1. **Dado** un usuario autenticado, **cuando** observa la barra lateral, **entonces** identifica un botón de menú con icono de hamburguesa en formato vectorial (SVG), claramente diferenciado del resto de los controles.
2. **Dado** el menú expandido, **cuando** el usuario activa el botón, **entonces** la barra se contrae a una franja estrecha de iconos, la sección activa permanece seleccionada y el contenido útil gana espacio.
3. **Dado** el menú contraído, **cuando** el usuario activa el botón, **entonces** la barra se expande y muestra nuevamente las etiquetas completas de navegación.
4. **Dado** un usuario que contrajo el menú, **cuando** navega a otra sección o recarga la página dentro de la misma sesión, **entonces** el menú conserva el estado elegido.
5. **Dado** el menú contraído, **cuando** el usuario usa sus enlaces, **entonces** cada destino sigue siendo identificable y alcanzable mediante teclado, sin depender de una etiqueta visible.

---

### Historia de Usuario 3 - Orientarse en el Dashboard con banner y tarjetas KPI (Prioridad: P2)

Como ejecutivo comercial, quiero que el Dashboard me reciba con un mensaje de bienvenida y muestre los indicadores clave en tarjetas, para entender el estado del negocio en los primeros segundos después de ingresar.

**Por qué esta prioridad**: El Dashboard es la primera pantalla después del acceso. Un resumen claro y personalizado reduce el tiempo de orientación y hace que la interfaz se perciba como profesional.

**Independent Test**: Se ingresa al CRM con un usuario identificado, se verifica el banner con su nombre, se comprueban las cuatro tarjetas KPI y se confirma que los valores coinciden con los datos ficticios vigentes.

**Acceptance Scenarios**:

1. **Dado** un usuario autenticado, **cuando** se carga el Dashboard, **entonces** ve un banner de bienvenida en español que incluye el nombre del usuario.
2. **Dado** el Dashboard cargado, **cuando** el usuario observa la sección principal, **entonces** encuentra tarjetas KPI para clientes, oportunidades activas, ingresos y tasa de conversión, cada una con etiqueta y valor legibles.
3. **Dado** un escenario sin registros en el CRM, **cuando** se carga el Dashboard, **entonces** las tarjetas muestran un valor neutro y no aparecen mensajes de error.
4. **Dado** un cambio en los datos del CRM, **cuando** el usuario vuelve al Dashboard, **entonces** los valores de las tarjetas reflejan la información vigente.
5. **Dado** un nombre de usuario extenso, **cuando** se muestra en el banner, **entonces** el texto se ajusta sin romper el diseño del encabezado.

---

### Historia de Usuario 4 - Capturar datos con formularios estandarizados (Prioridad: P2)

Como usuario que registra clientes, quiero encontrar los datos de identificación y las condiciones comerciales agrupadas bajo encabezados claros y con el mismo estilo en todos los formularios, para completar el alta sin dudas ni errores.

**Por qué esta prioridad**: La consistencia de los formularios disminuye errores de captura y acelera el trabajo diario, especialmente cuando se alterna entre alta y edición de clientes.

**Independent Test**: Se abre un formulario de cliente en alta y en edición, se comprueba la presencia exacta de ambos encabezados, se provoca un error de validación en cada bloque y se verifica que la presentación y la redacción sean iguales.

**Acceptance Scenarios**:

1. **Dado** un formulario de cliente, **cuando** se abre, **entonces** los campos de identificación y contacto aparecen agrupados bajo el encabezado exacto "DATOS DEL CLIENTE".
2. **Dado** un formulario de cliente, **cuando** se abre, **entonces** los campos de moneda, importe, forma y plazo de pago aparecen agrupados bajo el encabezado exacto "CONDICIONES COMERCIALES".
3. **Dado** dos formularios estandarizados distintos, **cuando** se comparan visualmente, **entonces** comparten jerarquía de encabezados, alineación de etiquetas, espaciado y estilo de mensajes de error.
4. **Dado** un campo obligatorio vacío en cualquiera de los dos bloques, **cuando** el usuario intenta guardar, **entonces** el sistema impide el guardado y muestra el mensaje junto al campo con la misma redacción y ubicación en ambos bloques.
5. **Dado** un formulario largo, **cuando** el usuario se desplaza por él, **entonces** los encabezados de sección siguen siendo claramente distinguibles del resto del contenido.

---

### Historia de Usuario 5 - Leer textos en español sin caracteres mal formados (Prioridad: P3)

Como usuario hispanohablante, quiero que todos los textos de la interfaz y los datos que registro se vean correctamente, para confiar en la información que leo y evito interpretaciones erróneas.

**Por qué esta prioridad**: Un carácter dañado en un nombre, un encabezado o un importe afecta directamente la credibilidad de la información comercial, aunque el resto de la interfaz funcione.

**Independent Test**: Se recorren las pantallas de acceso, navegación, Dashboard y formularios con nombres que contienen acentos, "ñ" y símbolos monetarios; se guarda un registro y se vuelve a consultar para comparar el texto.

**Acceptance Scenarios**:

1. **Dada** cualquier pantalla del CRM, **cuando** se muestran acentos, la letra "ñ" o símbolos monetarios, **entonces** los caracteres se visualizan completos y sin signos de reemplazo ni caracteres extraños.
2. **Dado** un registro con un nombre que contiene acentos o "ñ", **cuando** se guarda y se consulta nuevamente, **entonces** el texto se muestra exactamente como se introdujo.
3. **Dado** un texto pegado o importado con caracteres propios del español, **cuando** aparece en un listado o formulario, **entonces** conserva su forma original.
4. **Dado** un encabezado en mayúsculas como "DATOS DEL CLIENTE" o "CONDICIONES COMERCIALES", **cuando** se visualiza, **entonces** se lee completo, sin cortes ni caracteres deformados.

---

### Casos Límite

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

- **FR-001**: La pantalla de acceso MUST presentar dos áreas visualmente diferenciadas —un panel informativo/de marca y un panel con el formulario de ingreso— visibles simultáneamente en pantallas de escritorio.
- **FR-002**: La contraseña MUST permanecer enmascarada por defecto en el campo de acceso.
- **FR-003**: El formulario de acceso MUST permitir alternar la visibilidad de la contraseña mediante un control explícito, conservando el texto introducido.
- **FR-004**: El control de visibilidad MUST comunicar su estado mediante una indicación de "mostrar" u "ocultar" comprensible.
- **FR-005**: El sistema MUST dirigir al usuario al Dashboard después de un acceso válido.
- **FR-006**: Ante credenciales inválidas, el sistema MUST permanecer en la pantalla de acceso y mostrar un mensaje de error comprensible que no revele la contraseña.
- **FR-007**: La navegación principal MUST incluir un botón de menú con icono de hamburguesa en formato vectorial (SVG), identificable y utilizable mediante teclado.
- **FR-008**: El menú lateral MUST alternar entre un estado expandido con etiquetas y un estado contraído con iconos sin cambiar la sección activa.
- **FR-009**: El cambio de estado del menú MUST ajustar el área de contenido sin superponerlo ni ocultar información.
- **FR-010**: El estado del menú MUST conservarse durante la sesión del usuario.
- **FR-011**: El Dashboard MUST mostrar un banner de bienvenida en español que incluya el nombre del usuario autenticado.
- **FR-012**: El Dashboard MUST mostrar tarjetas KPI para clientes, oportunidades activas, ingresos y tasa de conversión, con etiqueta y valor legibles.
- **FR-013**: Las tarjetas KPI MUST mostrar un valor neutro cuando no existan datos, sin generar mensajes de error.
- **FR-014**: Los valores de las tarjetas KPI MUST corresponder a los datos vigentes del CRM al ingresar al Dashboard.
- **FR-015**: Los formularios de cliente MUST agrupar la identificación y el contacto bajo el encabezado exacto "DATOS DEL CLIENTE".
- **FR-016**: Los formularios de cliente MUST agrupar moneda, importe, forma y plazo de pago bajo el encabezado exacto "CONDICIONES COMERCIALES".
- **FR-017**: Todos los bloques de formulario estandarizados MUST compartir la misma jerarquía visual, alineación de etiquetas, espaciado y presentación de errores.
- **FR-018**: Los mensajes de validación MUST aparecer junto al campo correspondiente y usar la misma redacción y ubicación en ambos bloques.
- **FR-019**: La interfaz MUST representar correctamente acentos, la letra "ñ" y símbolos monetarios en encabezados, etiquetas, listados y datos introducidos.
- **FR-020**: La interfaz MUST conservar la integridad de los caracteres al guardar y volver a mostrar nombres y condiciones comerciales.
- **FR-021**: Los encabezados en mayúsculas MUST permanecer completos y legibles, sin cortes ni caracteres deformados.

### Entidades Clave *(incluir si la funcionalidad implica datos)*

- **Usuario autenticado**: persona que ingresa al CRM; su nombre se muestra en el banner de bienvenida y su sesión determina la preferencia de navegación.
- **Preferencia de navegación**: estado expandido o contraído del menú lateral durante la sesión del usuario.
- **Cliente**: titular de la ficha capturada; aporta la identificación y los datos de contacto presentados en "DATOS DEL CLIENTE".
- **Condiciones comerciales**: información de moneda, importe, forma y plazo de pago asociada a un cliente u oportunidad, presentada en "CONDICIONES COMERCIALES".
- **Métrica del Dashboard**: indicador mostrado en una tarjeta KPI, con etiqueta, valor y representación neutra cuando no hay datos.

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **SC-001**: El 100 % de los usuarios puede revelar y ocultar la contraseña sin perder el texto introducido en una sola acción.
- **SC-002**: Al menos el 95 % de los usuarios completa el acceso en su primer intento en menos de un minuto.
- **SC-003**: El 100 % de los usuarios contrae y expande el menú lateral en menos de dos segundos desde cualquier sección.
- **SC-004**: En pantallas de escritorio estándar, el banner y las cuatro tarjetas KPI son visibles sin desplazamiento vertical en el 100 % de las cargas del Dashboard.
- **SC-005**: El 100 % de los formularios de cliente presentan los encabezados "DATOS DEL CLIENTE" y "CONDICIONES COMERCIALES" con la misma jerarquía visual en alta y edición.
- **SC-006**: El 100 % de los mensajes de error aparece junto al campo correspondiente con la misma redacción en ambos bloques de formulario.
- **SC-007**: En una revisión completa de todas las pantallas y estados, se encuentran cero caracteres mal formados en textos en español o símbolos monetarios.
- **SC-008**: Al menos el 90 % de los usuarios identifica el propósito de cada tarjeta KPI sin ayuda externa en una prueba de comprensión.
- **SC-009**: Las solicitudes de soporte relacionadas con confusión de navegación o captura de clientes disminuyen un 30 % después del despliegue de la interfaz.

## Suposiciones

- La interfaz SaaS ya está implementada; esta historia documenta y valida el estado esperado sin ampliar el alcance funcional del módulo CRM.
- El idioma de la interfaz es español, coherente con la descripción del usuario y con el módulo CRM existente.
- Se reutiliza el mecanismo de autenticación ya existente; no se incorporan nuevos métodos de acceso ni recuperación de contraseña.
- La preferencia del menú se conserva durante la sesión, no entre sesiones distintas.
- Los indicadores del Dashboard son los ya definidos para el CRM: clientes, oportunidades activas, ingresos y tasa de conversión.
- Los datos ficticios del módulo CRM siguen siendo la fuente de prueba para las tarjetas KPI y los formularios.
- En pantallas estrechas, los paneles de acceso se apilan y el menú se presenta como capa superpuesta, conservando todas las funciones.
- El formato vectorial (SVG) del icono de hamburguesa es un requisito visual explícito del usuario, no una decisión de arquitectura.
- Se depende del módulo CRM documentado en `specs/001-crm-module` para las entidades Cliente, Oportunidad y datos ficticios.
