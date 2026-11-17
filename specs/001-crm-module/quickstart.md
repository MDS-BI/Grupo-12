# Inicio Rápido: Módulo CRM (Customer Relationship Management)

## Configuración

1. Instale las dependencias con `npm install`.
2. Inicie el servidor de desarrollo con `npm run dev`.
3. Abra la URL local de Vite en un navegador.

## Flujo de Usuario Principal

1. Aterrice en el dashboard CRM y use un acceso rápido para crear un cliente, una oportunidad o una interacción.
2. Cree un empleado en el catálogo (nombre y cargo) antes de registrar oportunidades o interacciones.
3. Cree un cliente con nombre de empresa, persona de contacto, correo y teléfono; verifique que su estado inicial es `Posible`.
4. Cree una oportunidad asociada a un cliente y a un empleado, con monto estimado y fecha de cierre; aváncela por las etapas permitidas.
5. Registre una interacción (`Llamada`, `Correo` o `Reunión`) y consulte el historial en la ficha 360° del cliente.
6. Busque clientes y filtre oportunidades por etapa, responsable y rango de fecha de cierre.
7. Archive un cliente o empleado y confirme que sus oportunidades e interacciones se conservan y que deja de ofrecerse para nuevos registros.
8. Cambie entre módulos usando la barra lateral y actualice la página para confirmar que los datos persisten y que el marco con marca permanece consistente.

## Validación

- Verifique que los campos obligatorios de cliente, empleado, oportunidad e interacción muestran errores claros.
- Verifique que un correo de cliente con formato inválido o duplicado (sin distinguir mayúsculas) se rechaza.
- Verifique que un monto negativo o una fecha de cierre vacía/inválida se rechazan.
- Verifique que solo se permiten las transiciones de etapa definidas y que `Ganado`/`Perdido` son terminales.
- Verifique que el dashboard muestra clientes activos, oportunidades abiertas, monto en pipeline y próximos cierres (30 días) coherentes con los datos.
- Verifique que una búsqueda o filtro sin resultados muestra un estado vacío claro.
- Verifique que archivar un cliente o empleado no elimina sus oportunidades ni interacciones.
- Verifique que la lista y los filtros siguen siendo responsivos con 500 clientes y sus registros asociados.

## Extender el Módulo

Los módulos ERP personalizados adaptan el CRM mediante un único archivo de configuración (`src/module-config.js`) en lugar de editar el código central:

1. Establezca el nombre del módulo y los mapeos de términos (p. ej., Cliente → Cuenta, Oportunidad → Venta); cada pantalla se reetiqueta, incluida la barra lateral y el logotipo.
2. Declare campos personalizados por tipo de registro (texto, número, fecha, selección) — aparecen automáticamente en formularios, listas, validación y búsqueda.
3. Redefina el ciclo de vida de las oportunidades y sus transiciones permitidas si el dominio lo requiere.
4. Opcionalmente establezca `theme.accentColor` para remarcar los resaltados y controles principales del espacio de trabajo.
5. Añada reglas de validación específicas del módulo junto a las reglas base donde sea necesario.

La generación de identidad, marcas de tiempo, unicidad de correo, integridad referencial, eliminación lógica, navegación y búsqueda siguen siendo gestionadas por el módulo base. Sin archivo de configuración, la aplicación se ejecuta con el comportamiento predeterminado del CRM. Consulte `specs/001-crm-module/` para la especificación completa.

---

## Propósito de la validación de la interfaz SaaS

Guía de validación de extremo a extremo para comprobar que la interfaz cumple los contratos de [contracts/ui-contracts.md](contracts/ui-contracts.md) y [contracts/dashboard-metrics.md](contracts/dashboard-metrics.md). No contiene código de implementación: ese trabajo corresponde a `tasks.md` y a la fase de implementación.

## Requisitos previos

- Node.js y npm instalados; dependencias ya presentes en `node_modules/`.
- Rama `001-crm-module` activa (`git branch --show-current`).
- Navegador moderno con almacenamiento local y de sesión habilitado.
- Datos de acceso de prueba definidos en `src/main.js`: usuario `Cliente1`, contraseña `1234`.

## Preparación

```powershell
npm install
npm run dev
```

La aplicación se sirve en la URL que indique Vite. Para comprobar el artefacto de producción:

```powershell
npm run build
npm run preview
```

`dist/` se regenera con `npm run build`; nunca se edita manualmente.

## Comandos de verificación

```powershell
npm run test:run
npm run lint
npm run build
```

`npm test` queda en modo observación. No existe script de typecheck en `package.json`.

## Escenarios de validación de la interfaz SaaS

### 1. Acceso con diseño dividido

1. Abrir la aplicación sin sesión.
2. Comprobar que `#login-view` muestra el panel de marca y el formulario uno al lado del otro en escritorio, y apilados a ≤ 820 px.
3. Escribir una contraseña con acentos o caracteres especiales; debe aparecer enmascarada.
4. Activar `#login-password-toggle`: se revela, `aria-pressed="true"` y la etiqueta pasa a «Ocultar contraseña».
5. Volver a activarlo: se enmascara, el valor no cambia y la etiqueta vuelve a «Mostrar contraseña».
6. Probar credenciales inválidas: permanece en la pantalla de acceso, el error es comprensible y no contiene la contraseña.
7. Probar `Cliente1` / `1234`: se abre `#app-shell` en `#view-dashboard`.

### 2. Navegación colapsable

1. Verificar que `#menu-toggle` contiene un SVG con `stroke="currentColor"`, `aria-hidden="true"` y `aria-controls="sidebar"`.
2. Activar el botón: `#app-shell` gana `sidebar-collapsed`, `aria-expanded="false"` y la barra se reduce a una franja de iconos; el contenido se ensancha sin superposición.
3. Navegar a otra sección: `aria-current="page"` cambia al destino, pero el menú sigue contraído.
4. Recargar la página: el estado contraído se conserva; se expande de nuevo y se recarga: sigue expandido.
5. Repetir a ≤ 900 px: la navegación se muestra como capa, se cierra con Escape y el foco vuelve al botón.
6. Cerrar sesión y volver a entrar: el menú empieza expandido.

### 3. Banner y KPI del Dashboard

1. Con sesión iniciada, comprobar que `#welcome-title` incluye «Cliente1».
2. Verificar que `.stats-grid` tiene exactamente cuatro tarjetas con las etiquetas definidas en [dashboard-metrics.md](dashboard-metrics.md).
3. Con almacenamiento CRM vacío, comprobar los valores neutros `0`, `0`, `$0` y `0 %`, sin errores.
4. Sembrar datos mediante las funciones exportadas de `src/storage.js` (`addCustomer`, `addOpportunity`) y volver al Dashboard: los cuatro valores se actualizan.
5. Marcar una oportunidad como `Ganado` y reentrar: la tasa de conversión cambia según la fórmula del contrato.
6. En 1366 × 768, comprobar que el banner y las cuatro tarjetas se ven sin desplazamiento vertical.

### 4. Formularios estandarizados

1. Abrir el alta de cliente y comprobar que los encabezados del DOM son exactamente `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` (no solo visualmente).
2. Comprobar que contacto queda en el primer bloque y moneda/importe/plazos en el segundo, con la misma estructura `.form-section > .form-grid > .field`.
3. Enviar con campos obligatorios vacíos: no se guarda y aparece un error junto a cada campo con igual redacción.
4. Repetir en edición y comparar jerarquía, alineación y espaciado.
5. Guardar un cliente con nombre `Ana García Ñuñez` y condición con `€`; volver a consultarlo y verificar el texto exacto.

### 5. Codificación UTF-8

1. Confirmar en el HTML servido `<html lang="es">` y `<meta charset="UTF-8" />`.
2. Recorrer acceso, shell, Dashboard y formularios buscando acentos, «ñ», diéresis y símbolos monetarios: no deben aparecer `Ã`, `â€` ni caracteres de reemplazo.
3. Comprobar que los encabezados en mayúsculas no se cortan en ninguno de los breakpoints.

## Resultado esperado

Todas las comprobaciones pasan con `npm run test:run`, `npm run lint` y `npm run build` sin errores. Cualquier desviación se registra contra el requisito FR correspondiente de [spec.md](spec.md) antes de pasar a la fase de implementación.

## Resultado de la implementación

### Comandos ejecutados

- [x] `npm run test:run`: 11 archivos y 40 pruebas aprobadas. Las 17 suites heredadas documentadas en [research.md](research.md) quedan excluidas por deuda conocida.
- [x] `npm run lint`: 0 errores.
- [x] `npm run build`: `dist/index.html` generado con `<meta charset="UTF-8" />`, cuatro `.stat-card` y sin U+FFFD.

### Validación manual completada

- [x] **Acceso dividido**: paneles 45%/55%, apilado a 820 px, el control de visibilidad alterna dos veces sin perder el valor, error en español sin contraseña y acceso con `Cliente1` / `1234`.
- [x] **Navegación colapsable**: hamburguesa SVG, franja de 64 px en escritorio, overlay a ≤ 900 px con Escape/clic fuera/foco de vuelta, persistencia en `sessionStorage` y reinicio al cerrar sesión.
- [x] **Banner y KPI**: `#welcome-title` incluye `Cliente1`, cuatro tarjetas con etiquetas del contrato, neutros `$0`/`0 %` y recálculo desde `getCRMOverview()` tras sembrar datos y cerrar oportunidades.
- [x] **Formularios estandarizados**: dos bloques con literales exactos, contacto en el primero, moneda/importe/plazos en el segundo y errores junto al campo sin crear registros.
- [x] **Codificación UTF-8**: round-trip de `Ana García Ñuñez` y `€` sin caracteres de reemplazo en `index.html`, `src/` ni `dist/`.
