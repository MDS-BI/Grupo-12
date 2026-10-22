# Plan de trabajo — Módulo CRM

**Módulo:**
- CRM (Customer Relationship Management)

**Integrantes:**
- Emilia Catalina Yévenes Figueroa
- Benjamín Alonso Cruces Molina
- Vicente Tomás Corrales Lincoñir
- Vicente Joaquín Arias Cáceres
- Valentina Nicolet Villegas Quintana

---

## 1. Descripción del proyecto

El proyecto consiste en desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP, que permita administrar clientes, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta. El objetivo es centralizar la información comercial de la empresa y facilitar su gestión mediante una interfaz sencilla y funcional.

---

## 2. Usuarios y funcionalidades

El sistema está dirigido principalmente a **ejecutivos de ventas** y **empleados del área comercial**, quienes son los responsables de mantener actualizada la información de clientes y negociaciones.

| Área | Funcionalidades |
|---|---|
| **Clientes** | Registrar, consultar y actualizar la ficha de cada cliente, clasificándolos según su estado: Posible, Activo o Inactivo. |
| **Interacciones** | Registrar llamadas, correos y reuniones, asociándolas a un cliente y a un empleado responsable. |
| **Oportunidades** | Gestionar negociaciones comerciales con su monto estimado, etapa de venta y fecha estimada de cierre. |
| **Empleados** | Mantener un catálogo de responsables asociados a las interacciones y oportunidades. |

---

## 3. Modelo de datos

El sistema utiliza cuatro entidades principales: **Cliente**, **Empleado**, **Oportunidad** e **Interacción**, cuyos atributos se detallan a continuación.

### 3.1 Descripción de entidades y atributos

**Cliente:** almacena la información de contacto del cliente.
- `id_cliente` (int): clave primaria (PK).
- `nombre_empresa` (varchar): razón social o nombre comercial.
- `persona_contacto` (varchar): nombre del contacto principal.
- `correo` (varchar): correo electrónico de contacto.
- `telefono` (varchar): teléfono de contacto.
- `estado_cliente` (varchar): **Posible | Activo | Inactivo** (por defecto, Posible).

**Empleado:** representa al personal encargado del seguimiento.
- `id_empleado` (int): clave primaria (PK).
- `nombre` (varchar): nombre completo del ejecutivo.
- `cargo` (varchar): cargo o función dentro de la organización.

**Oportunidad:** registra los potenciales negocios y ventas.
- `id_oportunidad` (int): clave primaria (PK).
- `id_cliente` (int): clave foránea (FK) hacia `Cliente`.
- `id_empleado` (int): clave foránea (FK) hacia `Empleado`.
- `descripcion` (varchar): detalle de la negociación.
- `monto_estimado` (decimal): monto estimado de la venta.
- `etapa` (varchar): **Evaluación | Propuesta | Negociación | Ganado | Perdido** (por defecto, Evaluación).
- `fecha_estimada_cierre` (date): fecha estimada de cierre.

**Interacción:** guarda el historial de comunicaciones realizadas.
- `id_interaccion` (int): clave primaria (PK).
- `id_cliente` (int): clave foránea (FK) hacia `Cliente`.
- `id_empleado` (int): clave foránea (FK) hacia `Empleado`.
- `fecha` (date): fecha de la comunicación.
- `tipo_interaccion` (varchar): **Llamada | Correo | Reunión**.
- `descripcion` (varchar): notas adicionales.

### 3.2 Relaciones y cardinalidad

Todas las relaciones son de cardinalidad **1 : N**:

- **Cliente — Oportunidad:** un cliente puede tener múltiples oportunidades; cada oportunidad pertenece a un solo cliente.
- **Empleado — Oportunidad:** un empleado puede ser responsable de múltiples oportunidades.
- **Cliente — Interacción:** un cliente puede registrar múltiples interacciones.
- **Empleado — Interacción:** un empleado puede registrar y realizar múltiples interacciones.

### 3.3 Compatibilidad con la estructura base del ERP

El modelo asegura compatibilidad con la estructura base mediante las claves foráneas `id_cliente` e `id_empleado`, que permiten vincular la información comercial con los módulos y entidades globales del ERP **sin duplicar datos ni romper la integridad referencial**. Las entidades propias del módulo se agregan como extensiones, sin modificar las tablas base del sistema.

---

## 4. Reglas del dominio

- **RD-01** El estado del cliente admite únicamente los valores **Posible, Activo o Inactivo** (por defecto, Posible).
- **RD-02** La etapa de una oportunidad avanza de forma secuencial **Evaluación → Propuesta → Negociación** y termina en **Ganado** o **Perdido** (etapas terminales que no admiten retroceso).
- **RD-03** El tipo de interacción admite únicamente los valores **Llamada, Correo o Reunión**.
- **RD-04** Toda oportunidad e interacción debe estar asociada a un **cliente** y a un **empleado** existentes.
- **RD-05** El monto estimado debe ser mayor o igual a 0 y la fecha estimada de cierre es obligatoria.

---

## 5. Plan de desarrollo

El desarrollo se organiza en las siguientes etapas:

1. **Diseño:** Definir las funcionalidades y elaborar el modelo entidad-relación.
2. **Especificaciones:** Establecer las tareas y los artefactos mediante *Spec Driven Development*.
3. **Implementación:** Desarrollar la interfaz del CRM utilizando el template proporcionado.
4. **Pruebas:** Comprobar las funcionalidades y corregir los posibles errores.
5. **Entrega:** Presentar el MVP funcional y completar la documentación del repositorio.

---

## 3. Documentación del Modelo de Datos

La descripción completa del módulo, los usuarios, el Modelo Entidad-Relación (diagrama, entidades, atributos, cardinalidad, compatibilidad con la estructura base del ERP) y las reglas del dominio se encuentran documentadas en el siguiente archivo:

📄 **[Ver Modelo Entidad-Relación y Estructura de Datos](modelo_er.md)**

---

## 4. Alcance del MVP

El **Producto Mínimo Viable (MVP)** permitirá registrar y administrar clientes, consultar interacciones comerciales y gestionar oportunidades de venta con sus etapas, montos y empleados responsables. 

El desarrollo estará enfocado en el **frontend** y utilizará **datos ficticios** para demostrar su funcionamiento, evitando exponer información personal real.

---

## 5. Riesgos y Mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Reglas de transición de etapa mal delimitadas | Alto | Definir la tabla de estados en la etapa de diseño. |
| Catálogo de empleados incompleto | Medio | Cargar los responsables antes de la implementación. |
| Falta de validación de correo, teléfono o monto | Medio | Incorporar validaciones en alta y edición. |
| Crecimiento de alcance | Medio | Congelar el alcance tras el MVP. |

---

## 6. Mejoras futuras

Posteriormente, el módulo podría incorporar:

- Reportes de ventas e indicadores comerciales.
- Recordatorios automáticos de seguimiento.
- Integración avanzada con otros módulos del ERP.

Estas funcionalidades se consideran mejoras futuras y no forman parte del alcance inicial.