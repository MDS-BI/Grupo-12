# Inicio Rápido: Módulo CRM (Customer Relationship Management)

> **Nota de fusión (2026-11-23)**: este documento integra el contenido íntegro de `002-quickstart.md`. Sus historias se renombraron a US25–US30 y sus requisitos a FR-089–FR-102 / SC-031–SC-035 para mantener una numeración única con el módulo base.

> **Actualización (2026-11-24)**: se añade verificación para US31 (recuadro «Contáctanos»). La spec asigna `FR-103`/`SC-036` a esta historia; se conserva `US31/CA-31.1–CA-31.3` como criterio original.

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

## Escenario US31 - Recuadro «Contáctanos» (CA-31.1–CA-31.3)

**Prerrequisito**: ejecutar `npm run dev` con `index.html` de la ruta activa; no usar `src/components/*` ni `dist/`.

### Visitante (login)

1. Sin sesión, abra la aplicación.
2. **Esperado**: `#login-view` visible y `#login-contact-info` visible dentro de `.login-form-panel`, con título exacto «Contáctanos».
3. **Esperado**: `[data-contact-field="email"]`, `[data-contact-field="phone"]`, `[data-contact-field="address"]` y `[data-contact-field="hours"]` muestran los cuatro datos definidos en [data-model.md](data-model.md), con acentos y símbolos correctos.
4. **Esperado**: cada dato tiene un `.contact-icon svg` decorativo (`aria-hidden="true"`, `focusable="false"`) y el recuadro no añade controles al orden de foco.

### Usuario autenticado (dashboard)

1. Inicie sesión con credenciales válidas y abra Dashboard.
2. **Esperado**: `#dashboard-contact-info` visible entre `.welcome-banner` y `.quick-actions`, con los mismos cuatro valores que en login.
3. Navegue a Clientes y vuelva a Dashboard. **Esperado**: el recuadro sigue visible y no modifica KPIs, filtros ni datos.
4. Inyecte corrupción en una clave `crm_module:*` y recargue. **Esperado**: el bloqueo FR-072 oculta también el recuadro del dashboard; tras reiniciar los datos afectados, vuelve a mostrarse.

### Responsive y tema

1. Reduzca el viewport a ≤900 px y luego a ≤640 px. **Esperado**: el recuadro se apila, permanece legible y no genera desplazamiento horizontal en login ni dashboard.
2. Seleccione `Oscuro` en `#theme-select`, cierre sesión y revise login. **Esperado**: `.contact-info` mantiene contraste, sin fondos claros fijos; al volver a `Claro` no quedan residuos.
3. Compruebe `localStorage`/`sessionStorage`. **Esperado**: no aparece ninguna clave nueva asociada a US31.

### Trazabilidad US31

| US | Criterios | Pruebas principales |
|---|---|---|
| US31 | CA-31.1, CA-31.2, CA-31.3 (FR-103, SC-036) | `tests/unit/contact-box-contract.test.js`, `tests/integration/contact-box.test.js`, `tests/unit/svg-icon-contract.test.js` |

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

Nuevas pruebas esperadas (plan): `tests/unit/lifecycle-transitions.test.js`, `tests/unit/referential-integrity.test.js`, `tests/integration/employees-ui.test.js`, `tests/integration/interactions-ui.test.js`, `tests/integration/opportunities-lifecycle.test.js`, `tests/integration/client-360.test.js`, `tests/integration/dashboard-upcoming-integrity.test.js`, `tests/integration/archive-restore-ui.test.js`, `tests/integration/performance-dom.test.js`, `tests/unit/contact-box-contract.test.js`, `tests/integration/contact-box.test.js`.

### Trazabilidad US25–US30

| US | FR/SC original | FR/SC fusionados | Pruebas principales |
|---|---|---|---|
| US25 (antes 002-US1) | FR-001..003, SC-001 | FR-089–FR-091, SC-031 | `tests/integration/employees-ui.test.js`, `tests/integration/archive-restore-ui.test.js` |
| US26 (antes 002-US2) | FR-004..005, SC-001 | FR-092–FR-093, SC-031 | `tests/integration/interactions-ui.test.js` |
| US27 (antes 002-US3) | FR-006..007, FR-013, SC-002 | FR-094–FR-095, FR-101, SC-032 | `tests/integration/opportunities-lifecycle.test.js` |
| US28 (antes 002-US4) | FR-008..009, SC-003 | FR-096–FR-097, SC-033 | `tests/integration/client-360.test.js` |
| US29 (antes 002-US5) | FR-010..011, SC-004 | FR-098–FR-099, SC-034 | `tests/integration/dashboard-upcoming-integrity.test.js` |
| US30 (antes 002-US6) | FR-012, FR-014, SC-001/SC-005 | FR-100, FR-102, SC-031/SC-035 | `tests/integration/archive-restore-ui.test.js`, `tests/integration/performance-dom.test.js` |

---

## Guía rápida del Calendario CRM (integrada de `004-crm-calendar/quickstart.md`)

> **Nota de fusión (2026-11-25)**: se incorpora íntegramente la guía rápida de 004 sin modificar ni eliminar el texto previo de este documento; la carpeta original se conserva. Los criterios de éxito se leen con la numeración fusionada SC-037–SC-042 (antes SC-001–SC-006 de 004).

### Propósito

Validar la funcionalidad planificada del calendario CRM: calendario lateral de tareas personales y calendario general con vistas anual/mensual/semanal y gestión de actividades comerciales.

### Prerrequisitos

- Node/npm instalado
- Dependencias del repositorio instaladas: `npm install`
- Rama original del contenido: `004-crm-calendar`

### Áreas de implementación planificadas

- `index.html`: calendario lateral, vistas/controles del calendario general y diálogos
- `src/domain.js`: enums de tareas/actividades, reglas de vencimiento y validación de fechas
- `src/storage.js`: `crm_module:tasks`, `crm_module:calendarActivities` y sincronización con interacciones
- `src/app.js`: render, filtros, handlers CRUD y navegación de vistas
- `src/styles.css`: layout del calendario, estados atrasada/próxima a vencer y responsive
- `tests/unit/calendar-domain.test.js`
- `tests/unit/calendar-storage.test.js`
- `tests/integration/calendar-sidebar.test.js`
- `tests/integration/calendar-general.test.js`
- `tests/integration/calendar-interactions-sync.test.js`

### Escenarios de validación manual

1. **Tareas laterales (personales)**
   - Crear tareas con vencimiento pasado, dentro de las próximas 24 h, futuro y sin fecha.
   - Verificar que solo aparecen las tareas del usuario actual.
   - Verificar indicadores visuales de atrasada y próxima a vencer.
   - Editar tarea y cambiar estado; confirmar actualización inmediata.

2. **Vistas del calendario general**
   - Crear actividades en distintos días/semanas/meses.
   - Cambiar entre vistas anual, mensual y semanal; confirmar conservación del período de referencia.
   - Navegar a períodos anterior/siguiente; confirmar estado vacío cuando corresponda.

3. **CRUD de actividades**
   - Crear reunión, evento, llamada, seguimiento y actividad comercial.
   - Editar y confirmar que todas las vistas afectadas se actualizan en la misma sesión.
   - Eliminar con confirmación; confirmar desaparición de todas las vistas.

4. **Relaciones CRM y sincronización**
   - Vincular actividad a cliente/contacto/oportunidad existente.
   - Crear llamada/reunión: verificar la interacción planificada en el historial de Interacciones CRM.
   - Completar resultado/notas en el flujo de Interacciones; el calendario conserva la actividad planificada.
   - Evento/seguimiento/actividad comercial: no debe crear registro de interacción.

5. **Casos límite**
   - Fin anterior al inicio: error de validación, sin guardado.
   - Campos obligatorios ausentes: errores inline y datos conservados.
   - Registro relacionado archivado/ausente: actividad visible y relación marcada como no disponible.
   - Navegación por teclado y pantalla estrecha: sin desplazamiento horizontal en acciones principales.

### Comprobaciones automatizadas

```powershell
npm run lint
npm run test:run
```

### Trazabilidad del calendario (US32–US35)

| US | SC fusionado | Pruebas / verificación |
|---|---|---|
| US32 (antes 004-US1) | SC-037 | `tests/unit/calendar-domain.test.js`, `tests/integration/calendar-sidebar.test.js` |
| US33 (antes 004-US2) | SC-037, SC-039 | `tests/unit/calendar-domain.test.js`, `tests/integration/calendar-general.test.js` |
| US34 (antes 004-US3) | SC-038, SC-039, SC-040 | `tests/unit/calendar-storage.test.js`, `tests/integration/calendar-interactions-sync.test.js` |
| US35 (antes 004-US4) | SC-040, SC-041 | `tests/integration/calendar-general.test.js`, `tests/unit/calendar-domain.test.js` |

SC-042 (sin desplazamiento horizontal) se verifica en las pruebas de layout/responsive en escritorio y pantalla estrecha.

### Resultado de la implementación (2026-11-25)

- Calendario CRM integrado en la ERP final y navegable desde `#nav-calendar`.
- Pruebas específicas del calendario: 19/19 en verde con `npx vitest run tests/unit/calendar-domain.test.js tests/unit/calendar-storage.test.js tests/integration/calendar-sidebar.test.js tests/integration/calendar-general.test.js tests/integration/calendar-interactions-sync.test.js`.
- `npm run lint`: sin errores tras instalar dependencias locales.
- `npm run build`: compilación de producción correcta.
- `npm run test:run`: 132/133 en verde; queda una falla preexistente no relacionada (`storage-recovery.test.js` por la simulación de `setItem` con spy). `performance-dom.test.js` quedó en verde al diferir el render del calendario hasta que la vista está activa.
