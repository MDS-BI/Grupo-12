# Inicio Rápido: Módulo CRM (Customer Relationship Management)

> **Nota de fusión (2026-11-23)**: este documento integra el contenido íntegro de `002-quickstart.md`. Sus historias se renombraron a US25–US30 y sus requisitos a FR-089–FR-102 / SC-031–SC-035 para mantener una numeración única con el módulo base.

## Configuración

1. Instale dependencias con `npm install`.
2. Inicie el servidor con `npm run dev`.
3. Abra la URL local de Vite.

## Verificación automatizada

```powershell
npm run test:run
npm run lint
npm run build
```

## Escenarios US16–US24

### US16 - Tema oscuro coherente

1. Inicie sesión y seleccione `Oscuro` en `#theme-select`.
2. Recorra Dashboard, Clientes, Oportunidades, Búsqueda, diálogos y login (cerrar sesión).
3. **Esperado**: no hay superficies claras fijas ilegibles; textos, bordes, badges, errores y estados vacíos mantienen contraste.
4. Recargue. **Esperado**: tema oscuro aplicado desde el primer render, sin parpadeo visible.

### US17 - Dashboard coherente con oportunidades

1. Cree una oportunidad desde la UI.
2. Vuelva al Dashboard.
3. **Esperado**: `#stat-opportunities`, `#stat-revenue`, `#stat-conversion` reflejan el cambio.
4. Edite monto/etapa y elimine una oportunidad. **Esperado**: KPIs se actualizan al volver al Dashboard.

### US18 - Recordar mi sesión

1. En login, marque `#login-remember`, ingrese credenciales válidas.
2. Cierre y reabra navegador/contexto. **Esperado**: sesión restaurada.
3. Cierre sesión, desmarque `#login-remember`, ingrese de nuevo.
4. Cierre y reabra navegador/contexto. **Esperado**: sesión no restaurada.
5. Cierre sesión explícita. **Esperado**: no restauración automática.

### US19 - Confirmación de eliminación accesible

1. En Clientes u Oportunidades, pulse Eliminar en un registro.
2. **Esperado**: diálogo modal del CRM, no `window.confirm`.
3. Pruebe Tab/Shift+Tab. **Esperado**: foco atrapado.
4. Pulse Escape o Cancelar. **Esperado**: sin eliminación, foco vuelve al disparador.
5. Confirme eliminación. **Esperado**: registro eliminado y UI actualizada.

### US20 - Búsqueda de clientes y oportunidades

1. Abra `#view-search`.
2. Busque por nombre/código/correo de cliente y por serie/folio/estado de oportunidad.
3. **Esperado**: resultados muestran tipo Cliente/Oportunidad.
4. Seleccione un resultado. **Esperado**: navega a la vista correcta con registro cargado.
5. Busque término inexistente. **Esperado**: estado vacío claro.

### US21 - Listados escalables

1. Cargue/cree varios clientes y oportunidades.
2. **Esperado**: cada vista muestra listado con acciones por fila Editar/Eliminar.
3. Pulse Editar en una fila. **Esperado**: formulario carga ese registro.
4. Pulse Eliminar en una fila y confirme. **Esperado**: fila desaparece y selección se sincroniza.
5. **Esperado**: gestión principal no depende solo de `<select>`.

### US22 - Restaurar vista activa

1. Autenticado, navegue a Clientes/Oportunidades/Búsqueda.
2. Recargue página. **Esperado**: restaura la última vista válida.
3. Inyecte valor inválido en `erp.activeView` y recargue. **Esperado**: fallback a Dashboard.
4. Sin autenticación, intente restaurar vista interna. **Esperado**: va a login.

### US23 - Accesibilidad completa en formularios y diálogos

1. Envíe formulario con campos vacíos usando solo teclado.
2. **Esperado**: campos inválidos tienen `aria-invalid="true"` y `aria-describedby`; foco en primer inválido.
3. Abra diálogo de cambios sin guardar. **Esperado**: foco atrapado, Escape cierra seguro, foco restaurado.
4. Abra diálogo de eliminación. **Esperado**: mismo comportamiento de foco/trap/restauración.

### US24 - Moneda clara y consistente

1. Registre oportunidades con moneda soportada por MVP.
2. **Esperado**: montos individuales muestran moneda clara; KPI agregados usan regla base CLP sin símbolos contradictorios.
3. Revise Dashboard, listados y formularios. **Esperado**: regla consistente en todas las vistas.

## Notas

- `src/components/*` es histórico y no conectado al arranque.
- No editar `dist/` a mano; regenerar con `npm run build`.
- Ante fallos de storage corrupto, usar la acción explícita de reinicio; no se borra automáticamente.

## Verificación de Clarificaciones de 2026-11-21 (actualizado)

1. **FR-068**: archiva un cliente con oportunidad abierta. Verifica que oportunidades abiertas, pipeline y próximos cierres la siguen contando.
2. **FR-069**: intenta crear cliente con correo de cliente archivado. Verifica rechazo.
3. **FR-070**: edita un formulario CRM y navega a otra sección. Verifica diálogo Permanecer/Descartar; dirty = diferencia entre valor serializado actual y línea base al cargar/limpiar/guardar/descartar; campos disabled/readonly no cuentan. Recarga/Atrás fuera de alcance.
4. **FR-071**: guarda un valor en campo custom, elimina el campo de config, recarga. Verifica que no se muestra pero persiste en storage.
5. **FR-072**: inyecta JSON inválido o shape incorrecto en clave de entidad. Recarga. Verifica validación en arranque antes de render operativo: estado de bloqueo visible con mensaje/categoría afectada y acción "Reiniciar datos afectados"; acciones dependientes deshabilitadas/ocultas. Cancelar/ignorar mantiene bloqueo y mensaje. Si falla la escritura, muestra error comprensible y control "Reintentar", sin alterar claves no afectadas ni marcar recuperado. Reintento exitoso escribe `[]` solo en claves afectadas, limpia error, habilita UI en estado vacío controlado y preserva sesión/tema/vista/sidebar.
6. **FR-073**: cambia Claro/Oscuro, recarga. Verifica persistencia y aplicación en primer render. Verifica accesibilidad por teclado/etiqueta/valor actual del selector.
7. **FR-058**: crea/inyecta oportunidad con etapa ausente/nula/inválida. En dashboard, verifica aviso no bloqueante visible (`#dashboard-data-warning` o equivalente) con texto claro y cantidad afectada al renderizar; KPIs válidos se muestran normales y navegación no se bloquea. Corrige/elimina la inconsistencia y verifica que el aviso se oculta.


## Trazabilidad US16-US24

| US | FR/SC | Pruebas principales |
|---|---|---|
| US16 | FR-072, SC-022 | `tests/integration/ui-contracts.test.js`, `tests/integration/corrections-us16-us24.test.js`, `tests/integration/theme-boot.test.js` |
| US17 | FR-073, FR-076, FR-077, SC-023 | `tests/integration/corrections-us16-us24.test.js`, `tests/integration/dashboard-metrics.test.js` |
| US18 | FR-078, SC-024 | `tests/integration/ui-contracts.test.js`, `tests/integration/corrections-us16-us24.test.js` |
| US19 | FR-079, SC-025 | `tests/integration/ui-contracts.test.js`, `tests/integration/corrections-us16-us24.test.js` |
| US20 | FR-081, FR-082, SC-026 | `tests/integration/search.test.js`, `tests/integration/corrections-us16-us24.test.js` |
| US21 | FR-083, FR-084, SC-027 | `tests/integration/entities.test.js`, `tests/integration/documents.test.js` |
| US22 | FR-085, SC-028 | `tests/integration/corrections-us16-us24.test.js`, `tests/integration/ui-contracts.test.js` |
| US23 | FR-075, FR-080, SC-029 | `tests/integration/corrections-us16-us24.test.js`, `tests/integration/ui-contracts.test.js` |
| US24 | FR-088, SC-030 | `tests/unit/currency-format.test.js`, `tests/integration/corrections-us16-us24.test.js` |

## Escenarios del cierre de brechas históricas (US25–US30)

**Feature original**: `002-crm-historical-gaps` | **Ruta activa**: `index.html` + `src/*` (no `src/components/*`)

### Preparación

```bash
npm install
npm run test:run
npm run lint
npm run build
npm run dev
```

### US25 - Empleados (FR-089–FR-091, T025/T055/T056)

1. Iniciar sesión y abrir vista `Empleados`.
2. Crear empleado válido (nombre + cargo). **Esperado**: aparece en listado y en selectores de responsable activos.
3. Editar cargo. **Esperado**: cambio visible en listado y selectores.
4. Archivar empleado. **Esperado**: desaparece de selectores operativos; visible al activar "Mostrar archivados".
5. Restaurar. **Esperado**: vuelve a selectores/lista operativa.

### US26 - Interacciones (FR-092–FR-093, T036)

1. Abrir `Interacciones`.
2. Crear interacción con cliente activo, empleado activo, fecha, tipo y nota. **Esperado**: aparece en historial.
3. Editar nota/tipo. **Esperado**: se actualiza sin duplicar.
4. Eliminar con confirmación. **Esperado**: desaparece; cancelar no elimina.

### US27 - Oportunidades lifecycle/config (FR-094–FR-095, FR-101, T030/T062/T064)

1. Crear oportunidad en etapa inicial.
2. Cambiar a transición permitida por lifecycle. **Esperado**: persiste.
3. Intentar transición no permitida. **Esperado**: mensaje claro, no persiste.
4. Cargar config inválida (fixture de prueba). **Esperado**: banner visible de error/fallback, app sigue utilizable.

### US28 - Ficha cliente 360° (FR-096–FR-097, T041)

1. Desde listado Clientes, abrir "Ver ficha" de cliente con datos.
2. **Esperado**: resumen, oportunidades e interacciones relacionadas.
3. Volver al listado. **Esperado**: conserva filtro/selección visible.
4. Abrir cliente sin historial. **Esperado**: estados vacíos claros por sección.

### US29 - Próximos cierres e integridad (FR-098–FR-099, T046/T057)

1. Cargar oportunidades abiertas con `closeDate` en próximos 30 días. **Esperado**: sección "Próximos cierres" visible con acceso al registro.
2. Inyectar referencia inexistente (fixture). **Esperado**: reporte de integridad visible con tipo/registro/referencia faltante.
3. Sin datos/problemas. **Esperado**: estados vacíos/no-error, sin falsos positivos.

### US30 - Archivado visible y rendimiento 500 (FR-100, FR-102, T052/T055/T056)

1. Archivar cliente desde UI. **Esperado**: fuera de lista operativa y selectores por defecto; visible en archivados.
2. Restaurar cliente. **Esperado**: vuelve a operativos.
3. Ejecutar prueba DOM 500 registros. **Esperado**: filtro <=10 s, render inicial <=2 s (SC-035).

### Validación automatizada esperada

```bash
npm run test:run
npm run lint
npm run build
```

Nuevas pruebas esperadas (plan): `tests/unit/lifecycle-transitions.test.js`, `tests/unit/referential-integrity.test.js`, `tests/integration/employees-ui.test.js`, `tests/integration/interactions-ui.test.js`, `tests/integration/opportunities-lifecycle.test.js`, `tests/integration/client-360.test.js`, `tests/integration/dashboard-upcoming-integrity.test.js`, `tests/integration/archive-restore-ui.test.js`, `tests/integration/performance-dom.test.js`.

### Trazabilidad US25–US30

| US | FR/SC original | FR/SC fusionados | Pruebas principales |
|---|---|---|---|
| US25 (antes 002-US1) | FR-001..003, SC-001 | FR-089–FR-091, SC-031 | `tests/integration/employees-ui.test.js`, `tests/integration/archive-restore-ui.test.js` |
| US26 (antes 002-US2) | FR-004..005, SC-001 | FR-092–FR-093, SC-031 | `tests/integration/interactions-ui.test.js` |
| US27 (antes 002-US3) | FR-006..007, FR-013, SC-002 | FR-094–FR-095, FR-101, SC-032 | `tests/integration/opportunities-lifecycle.test.js` |
| US28 (antes 002-US4) | FR-008..009, SC-003 | FR-096–FR-097, SC-033 | `tests/integration/client-360.test.js` |
| US29 (antes 002-US5) | FR-010..011, SC-004 | FR-098–FR-099, SC-034 | `tests/integration/dashboard-upcoming-integrity.test.js` |
| US30 (antes 002-US6) | FR-012, FR-014, SC-001/SC-005 | FR-100, FR-102, SC-031/SC-035 | `tests/integration/archive-restore-ui.test.js`, `tests/integration/performance-dom.test.js` |
