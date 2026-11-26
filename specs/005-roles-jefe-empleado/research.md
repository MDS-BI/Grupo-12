# Research: Roles Jefe y Empleado

**Date**: 2026-11-26  
**Feature**: [spec.md](./spec.md)

## Decisiones de diseño

### Autenticación y compatibilidad de sesión

- **Hallazgo**: `src/main.js` contiene actualmente las credenciales de prueba, valida la ruta `/inicio`, y guarda la identidad bajo `erp.authenticatedUser` en `localStorage` o `sessionStorage` según “recordarme”.
- **Decisión**: Reemplazar la validación Cliente1 por una tabla explícita con las dos credenciales indicadas. Mantener el formato del valor almacenado como nombre de usuario, derivar el rol de esa identidad y no añadir una clave de rol.
- **Sesión anterior**: Cliente1 y cualquier nombre desconocido se tratan como no autenticados. Limpiar solo la clave de autenticación inválida para forzar el login; preservar todas las claves de negocio, tema y preferencias.
- **Alternativa descartada**: Conservar Cliente1 asignándole un rol por defecto; contradice el requisito de reemplazar el usuario de prueba y podría conceder acceso sin credenciales actuales.

### Interfaz y límites de permisos

- **Hallazgo**: `src/app.js` gestiona la navegación, el renderizado y los manejadores de las acciones de clientes, oportunidades, empleados, interacciones y calendario. `index.html` contiene los botones de módulo y las vistas.
- **Decisión**: Definir una política única compartida y aplicarla tanto al render de controles como a los puntos de navegación y mutación. Mantener la lista de módulos y las vistas existentes en el HTML.
- **Alternativa descartada**: Solo ocultar botones. Un manejador aún alcanzable o una navegación directa podría ejecutar una operación restringida.
- **Límite**: La app no tiene servidor de autorización. Las restricciones del navegador organizan el acceso de la aplicación de prueba, pero no protegen contra manipulación deliberada del código/estado local.

### Módulos operativos y administrativos

- **Hallazgo**: El menú actual incluye Panel, Clientes, Oportunidades, Empleados, Interacciones, Calendario y Búsqueda.
- **Decisión**: Empleado puede consultar los módulos operativos, incluido Calendario, y usar las operaciones básicas descritas en la especificación. Empleados y las acciones generales de administración o eliminación quedan reservados a Jefe.
- **Alternativa descartada**: Remover o rediseñar módulos completos para introducir roles; el alcance exige preservar los módulos existentes.

### Persistencia de negocio

- **Hallazgo**: Los registros del CRM viven en claves `crm_module:*` y `erp_base_module:*`, gestionadas por `src/storage.js`.
- **Decisión**: No modificar `src/storage.js`, claves, estructuras ni rutinas de recuperación. La autorización se evalúa antes de llamar a las operaciones existentes.
- **Alternativa descartada**: Migrar los registros o añadir una copia segmentada por usuario; innecesario para la matriz de permisos y contrario a conservar el almacenamiento.

### Pruebas y fixtures

- **Hallazgo**: Los helpers y numerosas pruebas de integración usan `Cliente1` como identidad de sesión; el calendario también utiliza esa identidad para propiedad/filtrado de tareas.
- **Decisión**: Actualizar fixtures de autenticación a Jefe o Empleado según el escenario. Conservar casos explícitos de `Cliente1` únicamente para comprobar rechazo y reautenticación; alinear los datos de propiedad de calendario con la identidad sembrada.
- **Alternativa descartada**: Permitir Cliente1 solo en modo test de la aplicación; produciría dos políticas de autenticación y ocultaría regresiones del requisito.
