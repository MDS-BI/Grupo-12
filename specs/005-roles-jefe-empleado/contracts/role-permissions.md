# Contract: Permisos por rol

**Feature**: [spec.md](../spec.md)

## Identidades

| Usuario | Contraseña de prueba | Rol |
|---------|----------------------|-----|
| `Jefe` | `Jefe123` | Jefe |
| `Empleado` | `Empleado123` | Empleado |

La autenticación acepta únicamente esos pares exactos. El error de login permanece genérico. `Cliente1` y los usuarios desconocidos no reciben sesión válida.

## Matriz de módulos y acciones

| Módulo/acción | Jefe | Empleado |
|---------------|------|----------|
| Panel | Acceso total | Consulta |
| Clientes | Acceso total | Consulta |
| Oportunidades | Acceso total | Consulta y actualización de estados operativos permitidos |
| Empleados | Acceso total | Sin acceso |
| Interacciones | Acceso total | Consulta y registro de interacciones |
| Calendario | Acceso total | Consulta y actualización de estados operativos existentes; sin eliminación |
| Búsqueda | Acceso total | Consulta |
| Edición o administración general de registros | Permitida | Denegada |
| Eliminación de registros y acciones destructivas | Permitida, con confirmación existente | Denegada |

“Acceso total” significa las capacidades existentes en los módulos, no nuevas operaciones fuera del alcance.

## Reglas de sesión

- La identidad válida se mantiene bajo `erp.authenticatedUser`, en el almacenamiento que haya seleccionado el usuario.
- El rol se deriva de esa identidad al iniciar y restaurar la sesión.
- Al cerrar sesión se eliminan únicamente las entradas existentes de autenticación; los datos CRM y preferencias permanecen.
- Si la identidad persistida no es válida, el usuario debe volver al formulario de login y la app no abre el workspace.

## Reglas de autorización

- Los módulos restringidos no aparecen en la navegación del Empleado.
- Solicitudes de navegación a módulos no permitidos se rechazan.
- Los botones de acciones no autorizadas no se muestran; los manejadores también comprueban permisos antes de modificar datos.
- Una acción denegada no realiza escritura en storage.
- Los flujos y diálogos autorizados conservan el comportamiento actual.
