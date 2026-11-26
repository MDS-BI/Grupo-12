# Data Model: Roles Jefe y Empleado

**Feature**: [spec.md](./spec.md)

## Entidades conceptuales

### Identidad autenticada

| Campo | Tipo conceptual | Regla |
|-------|-----------------|-------|
| `username` | Texto | `Jefe` o `Empleado`; único identificador persistido en la sesión actual |
| `role` | Enumeración | `Jefe` o `Empleado`; derivado del usuario autenticado, no duplicado en almacenamiento |

Las contraseñas de prueba (`Jefe123`, `Empleado123`) se usan para validar el formulario de acceso y no se guardan en localStorage ni sessionStorage.

### Rol y permisos

| Rol | Módulos | Capacidades |
|-----|---------|-------------|
| Jefe | Todos los módulos actuales | Consultar, crear, editar, archivar/restaurar y eliminar conforme a las acciones existentes |
| Empleado | Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda | Consultar; registrar interacciones y actualizar estados operativos permitidos; no gestionar registros ni eliminar |

La matriz completa de módulos y acciones está en [role-permissions.md](./contracts/role-permissions.md).

## Persistencia y compatibilidad

- Se reutiliza la clave existente `erp.authenticatedUser`; su valor sigue siendo el nombre de usuario.
- El rol se calcula en memoria a partir de la identidad válida.
- Se mantiene la preferencia actual de persistencia en `localStorage` o `sessionStorage`.
- `Cliente1`, valores desconocidos y valores inválidos no representan identidades autenticadas válidas.
- No se cambia ninguna clave ni estructura de datos de `crm_module:*`, `erp_base_module:*`, `crm.theme` u otras preferencias.
- No se crean, eliminan, migran ni duplican registros de clientes, empleados, oportunidades, interacciones o calendario al iniciar sesión.
