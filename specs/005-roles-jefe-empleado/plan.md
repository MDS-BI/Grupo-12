# Implementation Plan: Roles Jefe y Empleado

**Branch**: `005-roles-jefe-empleado` | **Date**: 2026-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-roles-jefe-empleado/spec.md`

## Summary

Reemplazar la autenticación de prueba Cliente1 por las credenciales de prueba de Jefe y Empleado, y aplicar permisos distintos en la interfaz y en sus acciones. La solución reutiliza la SPA actual en JavaScript vanilla y HTML, conserva el valor de identidad en `erp.authenticatedUser` y la selección existente entre `localStorage` y `sessionStorage`, y no modifica las claves ni los registros de datos CRM. La autorización se centraliza en una política de roles, se aplica a la navegación, las vistas y los manejadores de acciones, y se verifica con pruebas unitarias y de integración.

## Technical Context

**Language/Version**: JavaScript ES modules (ES2022) en navegador; Node/npm para herramientas de desarrollo  
**Primary Dependencies**: Vite 8.x, Vitest 4.x, jsdom y ESLint 9.x existentes; sin nuevas dependencias  
**Storage**: `localStorage`/`sessionStorage` existentes. Se conserva `erp.authenticatedUser`; no se agregan ni migran claves de almacenamiento CRM  
**Testing**: Vitest con jsdom; pruebas unitarias de autorización y pruebas de integración DOM para inicio/cierre de sesión, navegación, permisos y regresión  
**Target Platform**: Aplicación web estática ejecutada en navegadores modernos  
**Project Type**: SPA frontend-only, HTML/CSS/JavaScript vanilla  
**Performance Goals**: Comprobaciones de permisos síncronas y locales; sin solicitudes de red ni recargas adicionales  
**Constraints**: Mantener los módulos actuales, preservar datos existentes, recordar sesión según comportamiento actual y no introducir servidor ni framework  
**Scale/Scope**: Dos identidades de prueba, dos roles y los módulos y acciones disponibles actualmente en la SPA

## Constitution Check

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Code Quality & Maintainability | Cambios acotados, legibles y coherentes con la arquitectura | PASS | Reutilizar ES modules y centralizar la matriz de permisos en un módulo pequeño. |
| II. Test-First & Verification | Cubrir autenticación, permisos y regresión con pruebas automatizadas | PASS | Añadir pruebas focalizadas y adaptar fixtures que autentican como Cliente1. |
| III. User Experience Consistency | Mantener patrones existentes de interfaz, navegación y errores | PASS | Ocultar módulos/acciones no autorizados y conservar el error genérico de login y el flujo de logout. |
| IV. Performance & Reliability | No afectar las rutas críticas ni los datos persistidos | PASS | Evaluaciones de permisos deterministas en memoria; no se cambia `src/storage.js`. |

**Post-Phase 1 re-check**: PASS. La solución no introduce backend, dependencias, migraciones ni cambios a la forma de los registros.

## Design

### Identidad y autenticación

- Extraer la tabla pequeña de credenciales de prueba y la lógica de identidad/rol a `src/authorization.js`, consumida por `src/main.js` y `src/app.js`.
- Credenciales de prueba: `Jefe` / `Jefe123` y `Empleado` / `Empleado123`. Son credenciales visibles en una aplicación cliente y no proporcionan seguridad adecuada para producción.
- La identidad válida persistida sigue siendo el nombre de usuario en `erp.authenticatedUser`, guardado en el almacenamiento elegido por “recordarme”. El rol se deriva de esa identidad y no se persiste por separado.
- Una identidad ausente, desconocida o legada como `Cliente1` no abre la SPA autenticada. Se limpian solo las entradas inválidas de la clave de autenticación en `localStorage` y `sessionStorage`; no se borran preferencias, configuración ni datos de negocio.
- Logout elimina las entradas existentes de sesión y conserva los datos y preferencias no relacionados.

### Autorización de la aplicación

- Definir en `src/authorization.js` una matriz de módulos y capacidades por rol, con consultas para comprobar acceso a módulo y permiso para una acción.
- Pasar el usuario autenticado a `initApp` sin cambiar la configuración de módulo existente.
- En `src/app.js`, filtrar la navegación y acciones visibles según rol; además, validar módulo/acción al navegar, cargar vistas y ejecutar manejadores mutadores.
- Jefe conserva todos los módulos y capacidades existentes. Empleado consulta Panel, Clientes, Oportunidades, Interacciones, Calendario y Búsqueda; puede registrar interacciones y actualizar estados operativos permitidos, pero no administra registros ni ejecuta eliminaciones. El módulo Empleados y otras funciones administrativas quedan ocultos y bloqueados.
- Mantener intactas las operaciones de almacenamiento. Las reglas de autorización son de interfaz cliente y sirven para separar el uso de esta aplicación de prueba; no equivalen a controles de seguridad de servidor frente a usuarios que manipulen el navegador.

### Compatibilidad y cobertura

- Actualizar `index.html` únicamente si el formulario necesita mostrar nombres de acceso o información accesible; conservar su estructura y comportamiento visual.
- Adaptar las pruebas compartidas que usan `Cliente1` como sesión de prueba para que usen Jefe; reservar `Cliente1` para verificar el rechazo de sesiones legadas.
- Mantener independientes las pruebas de módulos existentes y asegurar que la vista Calendario continúa disponible para ambos roles según la matriz de permisos.

## Project Structure

### Documentation (this feature)

```text
specs/005-roles-jefe-empleado/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── role-permissions.md
```

### Source Code (repository root)

```text
index.html                         # Formulario de login existente; solo ajustes de presentación si hacen falta
src/
├── authorization.js               # Credenciales de prueba, identidad, roles y consultas de permisos
├── main.js                        # Login, restauración de sesión, logout y paso del usuario a la SPA
└── app.js                         # Navegación, presentación de capacidades y guardas para acciones
tests/
├── unit/
│   └── authorization.test.js      # Credenciales, rol y matriz de permisos
└── integration/
    └── auth-roles.test.js         # Sesión, navegación, acciones permitidas y bloqueadas
```

**Structure Decision**: Mantener el proyecto SPA existente y añadir un módulo pequeño de autorización compartido. No crear servicios, almacenamiento de roles, backend ni subproyectos. La estructura real de pruebas sigue `tests/unit` y `tests/integration`.

## Validation

1. Ejecutar las pruebas unitarias de `authorization.js`.
2. Ejecutar las pruebas de integración de autenticación y permisos, incluida la sesión recordada/no recordada, el rechazo de Cliente1 y el cambio de rol al cerrar sesión.
3. Ejecutar pruebas de regresión de navegación, interacciones, calendario, clientes, oportunidades y empleados.
4. Ejecutar `npm run test:run`, `npm run lint` y `npm run build`.
5. Verificar que claves y registros CRM existentes conservan los mismos valores antes y después de ambos inicios de sesión.

## Complexity Tracking

No hay violaciones de la constitución ni dependencias nuevas que requieran justificación.
