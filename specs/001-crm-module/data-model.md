# Modelo de Datos: Módulo CRM (Customer Relationship Management)

**Funcionalidad**: `001-crm-module` | **Especificación**: [spec.md](spec.md)
**MER de referencia**: [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md)

## Visión General

El modelo se compone de cuatro entidades de dominio —**Cliente**, **Empleado**, **Oportunidad** e **Interacción**— más un objeto de configuración **ModuleConfig**. Todas las relaciones son 1:N: un cliente y un empleado acumulan muchas oportunidades e interacciones, y cada oportunidad o interacción referencia exactamente un cliente y un empleado.

El **estado del cliente** (`Posible`, `Activo`, `Inactivo`) describe la relación comercial; la **etapa de la oportunidad** (`Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`) describe el avance de una venta. Ambos ciclos son independientes.

La **eliminación de clientes y empleados es lógica** (`archived`): el registro conserva sus oportunidades e interacciones, deja de mostrarse en las listas operativas y no puede asignarse a nuevos registros. **No existe eliminación en cascada** de oportunidades ni interacciones.

## Entidad: Cliente

Ficha maestra de la relación comercial.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | string | Identificador único del cliente | Obligatorio, generado automáticamente |
| nombreEmpresa | string | Razón social o nombre comercial | Obligatorio, no vacío |
| personaContacto | string | Nombre del contacto principal | Obligatorio, no vacío |
| correo | string | Correo electrónico de contacto | Obligatorio, formato válido, **único sin distinguir mayúsculas** |
| telefono | string | Teléfono de contacto | Obligatorio, no vacío |
| estado | string | Estado en el ciclo de vida | `Posible` \| `Activo` \| `Inactivo`; por defecto `Posible` |
| archived | boolean | Marca de eliminación lógica | Por defecto `false` |
| createdAt | string | Marca de tiempo ISO de creación | Obligatorio |
| updatedAt | string | Marca de tiempo ISO de última actualización | Obligatorio |

**Reglas**
- La unicidad de `correo` se evalúa normalizando a minúsculas y recortando espacios; dos clientes activos o archivados no pueden compartir el mismo correo.
- Un cliente archivado conserva sus oportunidades e interacciones y permanece consultable, pero no aparece en listas operativas ni en selectores de nuevos registros.
- `nombreEmpresa` puede repetirse entre clientes.

## Entidad: Empleado

Catálogo de responsables comerciales.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | string | Identificador único del empleado | Obligatorio, generado automáticamente |
| nombre | string | Nombre completo del ejecutivo | Obligatorio, no vacío |
| cargo | string | Cargo o función | Obligatorio, no vacío |
| archived | boolean | Marca de eliminación lógica | Por defecto `false` |
| createdAt | string | Marca de tiempo ISO de creación | Obligatorio |
| updatedAt | string | Marca de tiempo ISO de última actualización | Obligatorio |

**Reglas**
- Un empleado archivado conserva sus oportunidades e interacciones, permanece consultable, pero no aparece en selectores de nuevas oportunidades o interacciones.

## Entidad: Oportunidad

Negociación en curso asociada a un cliente y a un empleado.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | string | Identificador único de la oportunidad | Obligatorio, generado automáticamente |
| clienteId | string | Cliente que origina la negociación | Obligatorio, debe referenciar un `Cliente.id` existente y **no archivado** |
| empleadoId | string | Ejecutivo responsable | Obligatorio, debe referenciar un `Empleado.id` existente y **no archivado** |
| descripcion | string | Detalle de la negociación | Opcional |
| montoEstimado | number | Monto estimado de la venta | Obligatorio, número `>= 0` |
| etapa | string | Etapa de la venta | `Evaluación` \| `Propuesta` \| `Negociación` \| `Ganado` \| `Perdido`; por defecto `Evaluación` |
| fechaEstimadaCierre | string | Fecha estimada de cierre (`YYYY-MM-DD`) | Obligatoria, fecha de calendario válida |
| createdAt | string | Marca de tiempo ISO de creación | Obligatorio |
| updatedAt | string | Marca de tiempo ISO de última actualización | Obligatorio |

**Reglas de transición de etapa**
- `Evaluación → Propuesta`
- `Propuesta → Negociación`
- `Perdido` puede marcarse desde `Evaluación`, `Propuesta` o `Negociación`.
- `Ganado` solo puede marcarse desde `Negociación`.
- `Ganado` y `Perdido` son terminales: no admiten ninguna transición posterior.
- Las transiciones pueden redefinirse mediante `ModuleConfig.opportunityLifecycle`; los valores por defecto son los anteriores.

## Entidad: Interacción

Comunicación registrada con un cliente.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| id | string | Identificador único de la interacción | Obligatorio, generado automáticamente |
| clienteId | string | Cliente con quien se comunica | Obligatorio, debe referenciar un `Cliente.id` existente y **no archivado** |
| empleadoId | string | Empleado que realiza la gestión | Obligatorio, debe referenciar un `Empleado.id` existente y **no archivado** |
| fecha | string | Fecha de la comunicación (`YYYY-MM-DD`) | Obligatoria, fecha de calendario válida |
| tipo | string | Tipo de comunicación | `Llamada` \| `Correo` \| `Reunión`; obligatorio |
| descripcion | string | Notas adicionales | Opcional |
| createdAt | string | Marca de tiempo ISO de creación | Obligatorio |
| updatedAt | string | Marca de tiempo ISO de última actualización | Obligatorio |

## Entidad: ModuleConfig

Objeto de configuración cargado al arrancar que adapta la terminología, los campos y el tema del módulo.

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| moduleName | string | Nombre visible del módulo | Obligatorio, no vacío; por defecto `Módulo CRM` |
| labels | object | Reetiquetado de términos, p. ej. `{ cliente: "Cuenta", clientes: "Cuentas", oportunidad: "Venta", ... }` | Opcional; retrocede a los términos CRM |
| customFields | array | `{ target: "cliente"\|"empleado"\|"oportunidad"\|"interaccion", key, label, type: "text"\|"number"\|"date"\|"select", required: boolean, options?: string[] }` | Opcional; las claves NO DEBEN chocar con campos base |
| opportunityLifecycle | object | Etapas ordenadas y transiciones permitidas, p. ej. `{ stages: ["Evaluación","Propuesta","Negociación","Ganado","Perdido"], transitions: { ... } }` | Opcional; retrocede a las transiciones por defecto |
| theme | object | `{ accentColor: "#0f62fe" }` aplicado como propiedad personalizada de CSS | Opcional; `accentColor` debe ser un color CSS válido |

**Reglas**
- La configuración se carga una vez al arrancar y se aplica en todas las pantallas.
- Sin configuración se usan los valores predeterminados del CRM.
- Los valores inválidos o conflictivos se informan con claridad; nunca fallan en silencio.
- Las claves de campos personalizados no deben chocar con los campos base (`id`, `nombreEmpresa`, `personaContacto`, `correo`, `telefono`, `estado`, `archived`, `nombre`, `cargo`, `clienteId`, `empleadoId`, `descripcion`, `montoEstimado`, `etapa`, `fechaEstimadaCierre`, `fecha`, `tipo`, `createdAt`, `updatedAt`).
- Los valores de campos personalizados se persisten junto a los campos base sin cambios de esquema.

## Relaciones

| Relación | Cardinalidad | Descripción |
|---|---|---|
| `Cliente` → `Oportunidad` | 1 : N | Un cliente puede originar cero o muchas oportunidades. |
| `Empleado` → `Oportunidad` | 1 : N | Un empleado puede gestionar cero o muchas oportunidades. |
| `Cliente` → `Interacción` | 1 : N | Un cliente puede registrar cero o muchas interacciones. |
| `Empleado` → `Interacción` | 1 : N | Un empleado puede realizar cero o muchas interacciones. |

## Reglas de Integridad Referencial

- Toda oportunidad debe referenciar un `clienteId` y un `empleadoId` existentes y no archivados.
- Toda interacción debe referenciar un `clienteId` y un `empleadoId` existentes y no archivados.
- Archivar un cliente o un empleado **no elimina** sus oportunidades ni interacciones.
- Si al cargar los datos se detecta una referencia a un cliente o empleado inexistente, el sistema informa la inconsistencia en lugar de fallar en silencio.
- Los clientes y empleados archivados se excluyen de las listas operativas y de los selectores de nuevos registros, pero siguen siendo consultables desde su historial.

## Reglas de Validación (resumen)

### Cliente
- `nombreEmpresa`, `personaContacto`, `correo` y `telefono` son obligatorios.
- `correo` debe tener formato válido y ser único sin distinguir mayúsculas.
- `estado` pertenece a `Posible | Activo | Inactivo`; por defecto `Posible`.

### Empleado
- `nombre` y `cargo` son obligatorios.

### Oportunidad
- `clienteId` y `empleadoId` son obligatorios y deben ser referencias válidas y no archivadas.
- `montoEstimado` es obligatorio y `>= 0`.
- `fechaEstimadaCierre` es obligatoria y debe ser una fecha de calendario válida.
- `etapa` por defecto `Evaluación`; solo se permiten las transiciones definidas.

### Interacción
- `clienteId` y `empleadoId` son obligatorios y deben ser referencias válidas y no archivadas.
- `fecha` y `tipo` son obligatorios; `tipo` pertenece a `Llamada | Correo | Reunión`.
- `descripcion` es opcional.

## Notas de Extensibilidad

- Los módulos personalizados pueden añadir campos específicos del dominio a cualquiera de las cuatro entidades sin cambiar la estructura base de almacenamiento.
- Los nombres y la semántica de los campos base deben permanecer estables para conservar la validación, la integridad referencial y la lógica de archivado.
- El reetiquetado y el ciclo de vida configurable permiten reutilizar el módulo sin editar el código central.
