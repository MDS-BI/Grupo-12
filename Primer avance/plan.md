# Plan de Trabajo - Módulo Customer Relationship Management (CRM)

## 1. Descripción del proyecto

El proyecto consiste en desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP, que permita administrar clientes, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta.

El objetivo es centralizar la información comercial de una empresa y facilitar su gestión mediante una interfaz sencilla y funcional.

---

## 2. Usuarios y funcionalidades

El sistema estará dirigido principalmente a empleados del área comercial y ejecutivos de ventas.

Las funcionalidades principales serán:

* **Clientes**: Registrar, consultar y actualizar información de clientes, clasificándolos como Posible, Activo o Inactivo.
* **Interacciones**: Registrar llamadas, correos y reuniones, asociándolas a clientes y empleados responsables.
* **Oportunidades**: Gestionar negociaciones comerciales, sus montos estimados y etapas de venta.
* **Empleados**: Mantener un catálogo de responsables asociados a las interacciones y oportunidades.

---

## 3. Modelo de datos y Estructura

El sistema utilizará cuatro entidades principales: `Cliente`, `Empleado`, `Interaccion` y `Oportunidad`.

### 3.1. Descripción de Entidades y Atributos

* **Cliente**: Almacena la información de contacto de los clientes.
  * `id_cliente` (int): Clave primaria (PK).
  * `nombre` (varchar), `correo` (varchar), `telefono` (varchar): Datos descriptivos de contacto.
* **Empleado**: Representa al personal interno encargado del seguimiento.
  * `id_empleado` (int): Clave primaria (PK).
  * `nombre` (varchar), `cargo` (varchar): Datos del trabajador.
* **Oportunidad**: Registra los potenciales negocios y ventas.
  * `id_oportunidad` (int): Clave primaria (PK).
  * `id_cliente` (int), `id_empleado` (int): Claves foráneas (FK) asociadas.
  * `descripcion` (varchar), `monto_estimado` (decimal), `estado` (varchar): Detalles y avance de la venta.
* **Interaccion**: Guarda el historial de comunicaciones realizadas.
  * `id_interaccion` (int): Clave primaria (PK).
  * `id_cliente` (int), `id_empleado` (int): Claves foráneas (FK) asociadas.
  * `fecha` (date), `tipo` (varchar), `descripcion` (varchar): Registro de la gestión.

### 3.2. Relaciones y Cardinalidad

* **Cliente — Oportunidad ($1 : N$)**: Un cliente puede tener múltiples oportunidades de negocio, pero cada oportunidad pertenece a un solo cliente.
* **Empleado — Oportunidad ($1 : N$)**: Un empleado puede ser responsable de múltiples oportunidades.
* **Cliente — Interacción ($1 : N$)**: Un cliente puede registrar múltiples interacciones.
* **Empleado — Interacción ($1 : N$)**: Un empleado puede registrar y realizar múltiples interacciones.

### 3.3. Compatibilidad con la Estructura Base del ERP

El modelo asegura compatibilidad con la estructura base mediante la conexión a través de las claves foráneas `id_cliente` e `id_empleado`. Esto permite vincular la información comercial con los módulos de usuarios y entidades globales del ERP sin duplicar datos ni romper la integridad referencial.

---

## 4. Plan de desarrollo

El desarrollo se organizará en las siguientes etapas:

1. **Diseño**: Definir las funcionalidades y elaborar el modelo entidad-relación.
2. **Especificaciones**: Establecer historias de usuario y tareas mediante *Spec Driven Development*.
3. **Implementación**: Desarrollar la interfaz del CRM utilizando el template proporcionado.
4. **Pruebas**: Comprobar las funcionalidades y corregir posibles errores.
5. **Entrega**: Presentar el MVP funcional y completar la documentación del repositorio.

---

## 5. Alcance del MVP

El **Producto Mínimo Viable (MVP)** permitirán registrar y administrar clientes, consultar interacciones comerciales y gestionar oportunidades de venta con sus respectivas etapas y empleados responsables.

El desarrollo estará enfocado en el *frontend* y podrá utilizar datos ficticios para demostrar su funcionamiento, evitando exponer información personal real.

---

## 6. Mejoras futuras

Posteriormente, el módulo podría incorporar:
* Reportes de ventas e indicadores comerciales.
* Recordatorios automáticos de seguimiento.
* Integración avanzada con otros módulos del ERP.

Estas funcionalidades se consideran mejoras futuras y no forman parte del alcance inicial.