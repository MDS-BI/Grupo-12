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

## 2. Plan de desarrollo

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