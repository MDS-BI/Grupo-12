# Diccionario de datos — CRM (entrega inicial)

**Módulo:**
- CRM

**Alcance:**
- entrega inicial (20 de octubre). Clientes, interacciones y pipeline de oportunidades.

**Fuera de alcance:**
- leads, campañas, soporte, privacidad y scoring (fases siguientes).

**Diagrama:**
- [`crm_simple.mermaid`](crm_simple.mermaid) · [`crm_simple.png`](crm_simple.png)

---

## Convenciones

- **PK:** clave primaria, entero autoincremental.
- **FK:** clave foránea hacia la entidad indicada.
- Los dominios cerrados se listan como *Posible | Activo | Inactivo*, etc.
- Nomenclatura en español, coherente con el resumen de la entrega inicial.

---

## 1. Cliente

Registra las fichas de clientes y su estado dentro del ciclo de vida comercial.

| Campo | Tipo | Clave | Descripción | Reglas |
|---|---|---|---|---|
| `id_cliente` | int | PK | Identificador único del cliente. | Autoincremental. |
| `nombre_empresa` | varchar | | Razón social o nombre comercial de la empresa. | Obligatorio. |
| `persona_contacto` | varchar | | Nombre del contacto principal del cliente. | Obligatorio. |
| `correo` | varchar | | Correo electrónico de contacto. | Obligatorio; formato de correo válido. |
| `telefono` | varchar | | Teléfono de contacto. | Obligatorio. |
| `estado_cliente` | varchar | | Estado del cliente en su ciclo de vida. | Dominio: `Posible \| Activo \| Inactivo`. Por defecto `Posible`. |

---

## 2. Empleado

Catálogo de ejecutivos responsables de las oportunidades e interacciones.

| Campo | Tipo | Clave | Descripción | Reglas |
|---|---|---|---|---|
| `id_empleado` | int | PK | Identificador único del empleado. | Autoincremental. |
| `nombre` | varchar | | Nombre completo del ejecutivo. | Obligatorio. |
| `cargo` | varchar | | Cargo o función dentro de la organización. | Obligatorio. |

---

## 3. Oportunidad

Representa las negociaciones en curso asociadas a un cliente y a un ejecutivo.

| Campo | Tipo | Clave | Descripción | Reglas |
|---|---|---|---|---|
| `id_oportunidad` | int | PK | Identificador único de la oportunidad. | Autoincremental. |
| `id_cliente` | int | FK | Cliente que origina la negociación. | Referencia `Cliente.id_cliente`. Obligatorio. |
| `id_empleado` | int | FK | Ejecutivo responsable de la negociación. | Referencia `Empleado.id_empleado`. Obligatorio. |
| `descripcion` | varchar | | Detalle de la negociación. | Opcional. |
| `monto_estimado` | decimal | | Monto estimado de la venta. | Obligatorio; mayor o igual a 0. |
| `etapa` | varchar | | Etapa de la venta en el pipeline. | Dominio: `Evaluación \| Propuesta \| Negociación \| Ganado \| Perdido`. Por defecto `Evaluación`. |
| `fecha_estimada_cierre` | date | | Fecha estimada de cierre de la negociación. | Obligatorio. |

**Reglas de transición de etapa:** `Evaluación → Propuesta → Negociación → Ganado | Perdido`. Las etapas `Ganado` y `Perdido` son terminales.

---

## 4. Interaccion

Registra el seguimiento de las comunicaciones realizadas con cada contacto.

| Campo | Tipo | Clave | Descripción | Reglas |
|---|---|---|---|---|
| `id_interaccion` | int | PK | Identificador único de la interacción. | Autoincremental. |
| `id_cliente` | int | FK | Cliente con quien se realiza la comunicación. | Referencia `Cliente.id_cliente`. Obligatorio. |
| `id_empleado` | int | FK | Empleado que realiza la gestión. | Referencia `Empleado.id_empleado`. Obligatorio. |
| `fecha` | date | | Fecha en que ocurrió la comunicación. | Obligatorio. |
| `tipo_interaccion` | varchar | | Tipo de comunicación. | Dominio: `Llamada \| Correo \| Reunión`. Obligatorio. |
| `descripcion` | varchar | | Notas adicionales de la comunicación. | Opcional. |

---

## 5. Relaciones

| Relación | Cardinalidad | Descripción |
|---|---|---|
| `Cliente → Oportunidad` | 1 : N (0..*) | Un cliente puede originar cero o muchas oportunidades. |
| `Empleado → Oportunidad` | 1 : N (0..*) | Un empleado puede gestionar cero o muchas oportunidades. |
| `Cliente → Interaccion` | 1 : N (0..*) | Un cliente puede registrar cero o muchas interacciones. |
| `Empleado → Interaccion` | 1 : N (0..*) | Un empleado puede realizar cero o muchas interacciones. |

---

## 6. Dominios (enumeraciones)

| Dominio | Valores | Usado en |
|---|---|---|
| Estado del cliente | `Posible`, `Activo`, `Inactivo` | `Cliente.estado_cliente` |
| Etapa de la venta | `Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido` | `Oportunidad.etapa` |
| Tipo de interacción | `Llamada`, `Correo`, `Reunión` | `Interaccion.tipo_interaccion` |
