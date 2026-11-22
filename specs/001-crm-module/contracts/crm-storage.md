# Contrato de Almacenamiento del Módulo CRM

**Funcionalidad**: `001-crm-module` | **Modelo**: [data-model.md](../data-model.md)

## Propósito

La aplicación persiste clientes, empleados, oportunidades e interacciones en el `localStorage` del navegador. La capa de almacenamiento es la única responsable de la generación de identidad, las marcas de tiempo, la unicidad del correo, la integridad referencial y la eliminación lógica.

## Claves de almacenamiento

- `crm.clients`
- `crm.employees`
- `crm.opportunities`
- `crm.interactions`
- `crm.theme` (opcional; preferencia `Claro`/`Oscuro` del mismo navegador)

Cada clave de entidades contiene un arreglo JSON con los registros descritos en [data-model.md](../data-model.md). `crm.theme` contiene el valor de tema elegido; su ausencia significa que no hay preferencia guardada. Nota: la implementación actual usa además las claves normalizadas `crm_module:*` documentadas en [research.md](../research.md); este contrato describe la forma lógica esperada por las reglas de dominio.

## Forma de los datos

### Cliente
`id`, `nombreEmpresa`, `personaContacto`, `correo`, `telefono`, `estado`, `archived`, `createdAt`, `updatedAt`.

- `nombreEmpresa`, `personaContacto`, `correo` y `telefono` no vacíos.
- `correo` con formato válido y único sin distinguir mayúsculas (comparado entre todos los clientes, archivados o no).
- `estado` ∈ {`Posible`, `Activo`, `Inactivo`}; por defecto `Posible`.
- `archived` por defecto `false`.

### Empleado
`id`, `nombre`, `cargo`, `archived`, `createdAt`, `updatedAt`.

- `nombre` y `cargo` no vacíos.
- `archived` por defecto `false`.

### Oportunidad
`id`, `clienteId`, `empleadoId`, `descripcion`, `montoEstimado`, `etapa`, `fechaEstimadaCierre`, `createdAt`, `updatedAt`.

- `clienteId` y `empleadoId` deben referenciar clientes/empleados existentes y no archivados.
- `montoEstimado` numérico `>= 0`.
- `etapa` ∈ {`Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`}; por defecto `Evaluación`.
- `fechaEstimadaCierre` obligatoria y válida en `YYYY-MM-DD`.

### Interacción
`id`, `clienteId`, `empleadoId`, `fecha`, `tipo`, `descripcion`, `createdAt`, `updatedAt`.

- `clienteId` y `empleadoId` deben referenciar clientes/empleados existentes y no archivados.
- `fecha` obligatoria y válida en `YYYY-MM-DD`.
- `tipo` ∈ {`Llamada`, `Correo`, `Reunión`}.

## Operaciones

### Clientes
- `loadClients()`: devuelve todos los clientes, incluyendo archivados.
- `loadActiveClients()`: devuelve solo clientes con `archived === false`.
- `addClient(client)`: valida, genera `id`/`createdAt`/`updatedAt` y persiste. Rechaza correos duplicados.
- `updateClient(id, updates)`: valida y actualiza `updatedAt`. Rechaza un `correo` que duplique el de otro cliente.
- `archiveClient(id)`: marca `archived = true` y actualiza `updatedAt`. **No elimina** oportunidades ni interacciones.
- `unarchiveClient(id)`: opcional, restaura `archived = false` si el correo sigue siendo único.
- `isEmailAvailable(correo, excludeId?)`: compara normalizado (trim + minúsculas).

### Empleados
- `loadEmployees()`, `loadActiveEmployees()`, `addEmployee`, `updateEmployee`, `archiveEmployee(id)`.
- `archiveEmployee` marca `archived = true` y **no elimina** oportunidades ni interacciones.

### Oportunidades
- `loadOpportunities()`, `addOpportunity`, `updateOpportunity`, `deleteOpportunity`.
- `addOpportunity`/`updateOpportunity` rechazan referencias a clientes o empleados inexistentes o archivados, montos negativos y fechas inválidas.
- `updateOpportunity` rechaza transiciones de etapa no permitidas.

### Interacciones
- `loadInteractions()`, `addInteraction`, `updateInteraction`, `deleteInteraction`.
- `addInteraction`/`updateInteraction` rechazan referencias a clientes o empleados inexistentes o archivados, fechas/tipos inválidos.

### Consultas agregadas
- `getClientDetail(clientId)`: devuelve el cliente, sus oportunidades y sus interacciones (incluye asociaciones a registros archivados).
- `getDashboardMetrics(today)`: calcula clientes activos, oportunidades abiertas, monto total en pipeline y próximos cierres dentro de los 30 días siguientes (excluye vencidas). Las oportunidades se seleccionan únicamente por etapa: las de clientes archivados cuentan (FR-068); los clientes archivados sí se excluyen del recuento de clientes activos.

## Validación al arrancar y recuperación

- Cada lectura distingue tres resultados: clave ausente (`empty`), datos válidos (`ok`) y dato corrupto o con forma inesperada (`error`). Un JSON sintácticamente válido pero con estructura incorrecta también es `error`.
- El estado `empty` inicializa los datos por defecto sin mensaje; el estado `error` no sobrescribe nada y muestra un error claro con una acción explícita para reiniciar (FR-072).
- El reinicio elimina solo las claves propias del módulo, nunca todas las claves del mismo origen, y informa si la escritura falla (por ejemplo, por cuota agotada).

## Campos personalizados eliminados

- La capa de almacenamiento no purga valores cuando una definición de campo desaparece de la configuración.
- Las actualizaciones fusionan el registro existente con los cambios visibles (`{ ...registro, ...cambiosVisibles }`) para conservar los valores ocultos (FR-071).

## Reglas de eliminación

- **Clientes y empleados**: eliminación lógica (`archived = true`). Sus oportunidades e interacciones se conservan íntegras.
- **Oportunidades e interacciones**: eliminación física permitida; no se especifica archivado para ellas.
- Está **prohibido** implementar eliminación en cascada de oportunidades o interacciones al archivar un cliente o empleado.

## Integridad referencial

- Antes de persistir una oportunidad o interacción, la capa de almacenamiento verifica que `clienteId` y `empleadoId` existan y no estén archivados.
- Al cargar los datos, si un registro referencia un cliente o empleado inexistente, el sistema reporta la inconsistencia mediante un mensaje visible en lugar de fallar en silencio.
- Archivar un cliente o empleado nunca deja registros huérfanos ni los elimina.

## Expectativas de extensibilidad

- Los campos personalizados declarados en `ModuleConfig` se persisten junto a los campos base sin manejo especial en la capa de almacenamiento.
- Las operaciones base permanecen estables para que los módulos personalizados construyan sobre ellas sin modificación.
