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
- Al eliminar una definición de campo personalizado, sus valores ya guardados se conservan, pero dejan de mostrarse o editarse en formularios, listas y búsquedas (FR-071). Al actualizar un registro se fusiona con la copia almacenada para no borrar esos valores ocultos.

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
- El correo de un cliente archivado permanece reservado: la unicidad se evalúa sobre todos los clientes, incluidos los archivados (FR-069).

### Reglas derivadas de las clarificaciones de 2026-11-21

- **Oportunidades de archivados**: una oportunidad se considera abierta únicamente por su etapa; el estado `archived` del cliente no la excluye de oportunidades abiertas, pipeline ni próximos cierres (FR-068).
- **Campos huérfanos**: los valores de campos personalizados eliminados de la configuración sobreviven en el registro; las vistas derivan de la configuración activa qué campos son visibles (FR-071).
- **Salida de formularios**: los cambios sin guardar bloquean la navegación hasta que el usuario elige quedarse o descartar (FR-070).
- **Preferencia de tema**: el espacio de trabajo expone el selector `Claro`/`Oscuro` (FR-073); la elección se guarda en el almacenamiento local del mismo navegador y se aplica antes del primer render.
- **Datos corruptos**: al arrancar se validan las claves; se considera corrupto el JSON no analizable o un valor con forma inválida según `contracts/crm-storage.md`. Se informa y se ofrece un reinicio explícito que escribe arreglos vacíos solo en las claves de entidad, sin reemplazar la información automáticamente ni modificar sesión o tema (FR-072).

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

## Interfaz SaaS Profesional: entidades y estados adicionales

La capa visual reutiliza los repositorios descritos arriba y añade únicamente el estado de sesión, la preferencia de navegación, la métrica de conversión y el contrato de iconos. No se crean esquemas nuevos; los campos `companyName`, `email`, `stage`, `amount` y `closeDate` son la representación normalizada usada por el DOM real.

### Entidad: Usuario de sesión

| Campo | Origen | Uso en esta funcionalidad |
|---|---|---|
| `nombre` | `localStorage['erp.authenticatedUser']` (`src/main.js:5,16`) | se muestra en `#welcome-title` del banner con saludo en español |
| `credenciales` | `VALID_USER` / `VALID_PASSWORD` en `src/main.js:6-7` | solo validación de acceso; nunca se renderizan ni se incluyen en mensajes |
| `estadoSesion` | presencia/ausencia de la clave de autenticación | determina la vista de acceso o el shell de la aplicación |

**Reglas**: el nombre se inserta con `textContent`; no se añaden métodos de autenticación; al cerrar sesión se elimina también la preferencia del menú.

### Entidad: Preferencia de navegación

| Campo | Tipo | Valores | Regla |
|---|---|---|---|
| `collapsed` | booleano persistido como `'true'`/`'false'` | `true`, `false` | `sessionStorage['erp.sidebarCollapsed']`; ausente = expandido |
| `seccionActiva` | derivada del DOM | `dashboard`, `entities`, `documents`, `search` | no cambia al contraer; se refleja en `aria-current="page"` |

**Transiciones de estado**:

| Estado actual | Acción | Estado siguiente | Efectos |
|---|---|---|---|
| Expandido | activar `#menu-toggle` | Contraído | clase `sidebar-collapsed`, `aria-expanded="false"`, etiqueta «Expandir menú lateral», escritura en sesión |
| Contraído | activar `#menu-toggle` | Expandido | sin clase, `aria-expanded="true"`, etiqueta «Contraer menú lateral», escritura en sesión |
| Cualquiera | recargar dentro de la sesión | estado almacenado | se restaura antes de enlazar el botón |
| Cualquiera | cerrar sesión | Expandido | se elimina la clave de sesión |

### Entidad: Cliente (adaptador de interfaz SaaS)

Fuente: `crm_module:customers` a través de `addCustomer()`/`updateCustomer()` (`src/storage.js:645-689`). El formulario estático mantiene además el registro `erp_base_module:entities` por compatibilidad.

| Campo | Tipo | Origen en el formulario | Regla |
|---|---|---|---|
| `companyName` | texto | `#name` | obligatorio; `sanitizeCRMText` |
| `contactName` | texto | opcional / alias `contactName` | sanitizado |
| `email` | texto | `#email` | obligatorio y único entre clientes no archivados (`src/storage.js:635-640`) |
| `phone` | texto | `#phone` | opcional |
| `status` | enumeración | valor por defecto | `Posible`, `Activo`, `Inactivo`; por defecto `Posible` |
| `archived` | booleano | eliminación lógica | excluye al cliente de listados y del recuento de clientes activos; no excluye sus oportunidades abiertas de los KPI (FR-068) |
| `creditLimit`, `paymentTerms` | texto/numérico | `#creditLimit`, `#paymentTerms` | se conservan en el registro ERP y se trasladan al adaptador CRM |

**Relación**: un cliente puede tener varias oportunidades (`clientId`). El KPI de clientes activos usa solo clientes no archivados; los KPI de oportunidades, pipeline y cierres se calculan por etapa sin filtrar por el estado `archived` del cliente, de modo que una oportunidad abierta de un cliente archivado sigue contando (FR-068).

### Entidad: Oportunidad (normalizada en la interfaz SaaS)

Fuente: `crm_module:opportunities`. Campos normalizados: `clientId`, `employeeId`, `stage`, `amount`, `closeDate`, `archived`.

| Campo | Regla |
|---|---|
| `stage` | `Evaluación`, `Propuesta`, `Negociación`, `Ganado`, `Perdido`; las dos últimas son terminales (`src/domain.js:20`) |
| `amount` | numérico ≥ 0; `Number(amount) || 0` para agregados |
| `archived` | excluye la oportunidad de `getCRMOverview()` |

**Transición relevante**: al pasar a `Ganado` o `Perdido` deja de contar como oportunidad abierta y pasa a formar parte del denominador de conversión.

### Entidad: Métrica del Dashboard

| KPI | Expresión | Neutro | Presentación |
|---|---|---|---|
| Clientes activos | `getCRMOverview().activeCustomers` | `0` | entero |
| Oportunidades activas | `getCRMOverview().openOpportunities` | `0` | entero |
| Ingresos estimados | `getCRMOverview().totalPipeline` | `$0` | moneda con separadores |
| Tasa de conversión | `computeConversionRate(overview.opportunities)` | `0 %` | entero seguido de «%» |

`computeConversionRate()` cuenta `stage === 'Ganado'` y `stage === 'Perdido'` (con fallback a `etapa`), calcula `Math.round(won / (won + lost) * 100)` y devuelve `0` cuando `won + lost === 0`. No modifica registros. Detalles en [dashboard-metrics.md](contracts/dashboard-metrics.md).

### Entidad: Icono SVG de control

| Atributo | Valor obligatorio |
|---|---|
| `viewBox` | `0 0 24 24` |
| `fill` / `stroke` | `none` / `currentColor` |
| `stroke-width` | `2` |
| `stroke-linecap` / `stroke-linejoin` | `round` / `round` |
| `aria-hidden` / `focusable` | `true` / `false` |
| Estado | `aria-pressed` (ojo) u `aria-expanded` + `aria-controls="sidebar"` (hamburguesa) |

Aplica al ojo, al ojo tachado y a la hamburguesa; el nombre accesible permanece en el botón que contiene el icono.

### Relaciones de la interfaz SaaS

```text
Usuario de sesión ──lee──> nombre ──> Banner de bienvenida
Usuario de sesión ──posee──> Preferencia de navegación (sessionStorage)
Cliente ──1:N──> Oportunidad ──> Métricas del Dashboard
Formulario de cliente ──escribe──> erp_base_module:entities
Formulario de cliente ──adaptador──> crm_module:customers ──> KPI
Control ──contiene──> Icono SVG ──> estado ARIA del control
```

### Validación de la interfaz SaaS

- `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` deben aparecer literalmente en el DOM, no solo visualmente.
- Ningún bloque de formulario puede guardar con campos obligatorios vacíos; el error se sitúa junto al campo.
- La contraseña se enmascara por defecto y se conserva al alternar su visibilidad.
- El texto mostrado no puede contener U+FFFD ni secuencias de reemplazo para caracteres del español.
- `dist/index.html` no se edita: se regenera desde las fuentes.
