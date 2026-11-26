# Quickstart: Verificación de roles

## Requisitos

- Node.js y npm disponibles.
- Dependencias instaladas desde el `package-lock.json` del repositorio.

## Ejecución local

```bash
npm run dev
```

Abrir la URL local informada por Vite.

## Credenciales de prueba

- Jefe: usuario `Jefe`, contraseña `Jefe123`.
- Empleado: usuario `Empleado`, contraseña `Empleado123`.
- `Cliente1` / `1234` debe ser rechazado y no debe recuperar una sesión autenticada.

Estas credenciales son únicamente para la aplicación de prueba local.

## Recorrido manual de aceptación

1. Preparar registros existentes en clientes, oportunidades, empleados, interacciones y calendario.
2. Iniciar sesión como Jefe y comprobar que la navegación y las acciones existentes están disponibles, incluida la administración de empleados y eliminación con confirmación.
3. Cerrar sesión e iniciar como Empleado. Confirmar que ve Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda; Empleados y las funciones de administración/eliminación no están disponibles.
4. Como Empleado, consultar datos, registrar una interacción y cambiar un estado operativo permitido; confirmar que una acción bloqueada no cambia datos, incluso al intentar navegar directamente.
5. Cerrar sesión y volver a entrar con otro rol; confirmar que no quedan permisos del usuario anterior.
6. Comparar los registros y las claves de almacenamiento antes/después; confirmar que el login no los reinició ni migró.

## Verificaciones automatizadas

```bash
npm run test:run
npm run lint
npm run build
```

La suite de roles debe cubrir ambas credenciales, credenciales incorrectas y legadas, recordar sesión, logout, navegación/acciones por rol y persistencia de los registros existentes.
