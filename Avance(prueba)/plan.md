# Plan de trabajo — Módulo CRM

**Módulo:** CRM (Customer Relationship Management)
**Integrantes:**
- Emilia Catalina Yévenes Figueroa
- Benjamín Alonso Cruces Molina
- Vicente Tomás Corrales Lincoñir
- Vicente Joaquín Arias Cáceres
- Valentina Nicolet Villegas Quintana

---

## 1. Objetivo

Gestionar el ciclo de vida del cliente dentro del ERP: registrar y administrar sus fichas, llevar el seguimiento de las comunicaciones con cada contacto y visualizar y hacer avanzar las negociaciones en curso.

---

## 2. Alcance

El presente plan corresponde a la **entrega inicial** del CRM y abarca tres áreas: **fichas de clientes**, **seguimiento de comunicaciones (interacciones)** y **gestión del pipeline de negociaciones (oportunidades)**. Los módulos de leads, campañas, soporte, privacidad y scoring se abordan en fases posteriores.

| Área | Capacidades |
|---|---|
| **Fichas de clientes** | Registrar, editar y consultar clientes: identificador, nombre de empresa, persona de contacto, correo, teléfono y estado (Posible, Activo, Inactivo). |
| **Comunicaciones** | Registrar interacciones con su tipo (Llamada, Correo, Reunión), fecha, empleado responsable y notas adicionales. |
| **Negociaciones** | Visualizar y avanzar oportunidades con monto estimado, etapa de la venta (Evaluación, Propuesta, Negociación, Ganado, Perdido) y fecha estimada de cierre. |
| **Responsables** | Catálogo de empleados con su nombre y cargo. |

---

## 3. Historias de usuario

| ID | Historia | Criterios de aceptación |
|---|---|---|
| HU-01 | Como ejecutivo, quiero registrar la ficha de un cliente. | Empresa, contacto, correo y teléfono obligatorios; estado por defecto `Posible`. |
| HU-02 | Como ejecutivo, quiero consultar y editar clientes. | Listar, buscar y filtrar por estado. |
| HU-03 | Como ejecutivo, quiero cambiar el estado de un cliente. | Transiciones válidas entre Posible/Activo/Inactivo. |
| HU-04 | Como ejecutivo, quiero registrar una interacción. | Tipo, fecha y empleado obligatorios; notas opcionales. |
| HU-05 | Como ejecutivo, quiero ver el historial de comunicaciones de un cliente. | Interacciones por cliente ordenadas por fecha descendente. |
| HU-06 | Como ejecutivo, quiero crear una oportunidad. | Cliente, empleado, monto y fecha de cierre; etapa inicial `Evaluación`. |
| HU-07 | Como ejecutivo, quiero avanzar la etapa de una negociación. | Avance por etapas; Ganado/Perdido cierran la negociación. |
| HU-08 | Como supervisor, quiero visualizar el pipeline. | Tablero por etapa con monto acumulado y fecha de cierre. |

---

## 4. Fases y tareas

| Fase | Tareas | Entregable |
|---|---|---|
| **F1. Modelo de datos** | Definir MER, diccionario, dominios y reglas de transición. | `crm_simple.*` + diccionario. |
| **F2. Persistencia/API** | Crear tablas `Cliente`, `Empleado`, `Oportunidad`, `Interaccion`; CRUD y validaciones. | Capa de datos. |
| **F3. Fichas de clientes** | Alta, edición, listado y filtros por estado (HU-01…HU-03). | Pantalla Clientes. |
| **F4. Interacciones** | Registro de comunicaciones e historial por cliente (HU-04, HU-05). | Pantalla Interacciones. |
| **F5. Pipeline** | Tablero de etapas, avance de negociaciones, montos y fechas (HU-06…HU-08). | Pantalla Negociaciones. |
| **F6. Pruebas y cierre** | QA de reglas RD-01…RD-08, ajustes y documentación. | Entrega final. |

---

## 5. Criterios de finalización (Definition of Done)

- Las 4 entidades implementadas con sus PK/FK y dominios.
- HU-01…HU-08 con criterios de aceptación cumplidos.
- Reglas del dominio RD-01…RD-08 verificadas.
- Diagrama MER y diccionario sincronizados con la implementación.

---

## 6. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Reglas de transición de etapa mal delimitadas | Alto | Tabla de estados aprobada en F1. |
| Catálogo de empleados incompleto | Medio | Cargar `Empleado` antes de F2. |
| Falta de validación de correo/teléfono/monto | Medio | Validaciones en alta y edición. |
| Crecimiento de alcance (leads/campañas) | Medio | Congelar alcance tras la entrega inicial. |
