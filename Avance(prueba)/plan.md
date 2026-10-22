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

## 3. Fases y tareas

| Fase | Tareas | Entregable |
|---|---|---|
| **F1. Modelo de datos** | Definir MER, diccionario, dominios y reglas de transición. | `crm_simple.*` + diccionario. |
| **F2. Persistencia/API** | Crear tablas `Cliente`, `Empleado`, `Oportunidad`, `Interaccion`; CRUD y validaciones. | Capa de datos. |
| **F3. Fichas de clientes** | Alta, edición, listado y filtros por estado. | Pantalla Clientes. |
| **F4. Interacciones** | Registro de comunicaciones e historial por cliente. | Pantalla Interacciones. |
| **F5. Pipeline** | Tablero de etapas, avance de negociaciones, montos y fechas. | Pantalla Negociaciones. |
| **F6. Pruebas y cierre** | QA de reglas RD-01…RD-08, ajustes y documentación. | Entrega final. |

---

## 4. Criterios de finalización (Definition of Done)

- Las 4 entidades implementadas con sus PK/FK y dominios.
- Reglas del dominio RD-01…RD-08 verificadas.
- Diagrama MER y diccionario sincronizados con la implementación.

---

## 5. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Reglas de transición de etapa mal delimitadas | Alto | Tabla de estados aprobada en F1. |
| Catálogo de empleados incompleto | Medio | Cargar `Empleado` antes de F2. |
| Falta de validación de correo/teléfono/monto | Medio | Validaciones en alta y edición. |
| Crecimiento de alcance (leads/campañas) | Medio | Congelar alcance tras la entrega inicial. |
