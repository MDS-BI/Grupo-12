# Research: Cierre de brechas históricas del CRM

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Date**: 2026-11-22

## Decisiones

### D-001 Ruta ejecutable real
- **Decision**: Implementar solo en `index.html`, `src/app.js`, `src/main.js`, `src/storage.js`, `src/domain.js`, `src/module-config.js`, `src/styles.css`.
- **Rationale**: Es la ruta conectada al arranque y validada por tests DOM real. `src/components/*` es histórico/no conectado.
- **Alternatives considered**: Migrar/usar `src/components/*`. Rechazado por duplicación y desconexión del runtime real.

### D-002 Fuente canónica de KPIs
- **Decision**: `getCRMOverview()`/`getCrmDashboardMetrics()` en `src/storage.js` siguen siendo la única fuente canónica para KPIs del dashboard 001.
- **Rationale**: Evita doble verdad (FR-076/077/001). Próximos cierres e integridad son derivados read-only con contratos propios.
- **Alternatives considered**: Calcular KPIs en `app.js` o nuevo servicio. Rechazado por divergencia.

### D-003 Claves propias de feature
- **Decision**: Estado UI no canónico de esta feature usa prefijo `crm.gaps002.ui.*`.
- **Rationale**: Evita colisiones con claves 001 (`erp.activeView`, `crm_module:*`, etc.) y facilita limpieza/diagnóstico.
- **Alternatives considered**: Reusar claves existentes o sin prefijo. Rechazado por riesgo de regresión.

### D-004 Modelo de archivado
- **Decision**: Usar soft-archive con `archived: true/false` en clientes y empleados; UI expone Archivar/Restaurar. Historial asociado permanece.
- **Rationale**: Alineado con comportamiento actual de storage (`deleteCustomer/deleteEmployee` ya marcan archived) y FR-002/003/012.
- **Alternatives considered**: Borrado físico. Rechazado por pérdida de historial y riesgo referencial.

### D-005 Lifecycle de oportunidades
- **Decision**: Validar transiciones con `opportunityLifecycle` normalizado (nombre canónico; proviene de `module-config.statusLifecycle` en `module-config.js`) usando función pura de dominio para `canTransition`. En config inválida, fallback seguro + banner visible.
- **Rationale**: Cumple FR-006/007/013 y mantiene reglas testeables.
- **Alternatives considered**: Validar solo en UI; hardcodear etapas. Rechazado por fragilidad y desacople de configuración.

### D-006 Integridad referencial
- **Decision**: Generar reporte read-only en carga/render con hallazgos por registro/referencia faltante; no auto-reparar.
- **Rationale**: FR-011 pide visibilidad; auto-reparación puede borrar datos válidos en casos ambiguos.
- **Alternatives considered**: Reparación automática/silenciosa. Rechazado por riesgo de pérdida.

### D-007 Próximos cierres
- **Decision**: Derivar de oportunidades abiertas con `closeDate` válida dentro de ventana 30 días (`domain/storage`), renderizar sección en dashboard con navegación a oportunidad.
- **Rationale**: Reusa regla existente de overview; añade visibilidad FR-010 sin cambiar KPI canónico.
- **Alternatives considered**: Nueva KPI card o nueva fuente. Rechazado por duplicidad.

### D-008 Rendimiento DOM real 500 registros
- **Decision**: Prueba de integración DOM real que siembra 500 clientes + registros asociados, mide búsqueda/filtro y render inicial con `performance.now()`; umbrales SC-005.
- **Rationale**: Cierra brecha de T052; la prueba existente es en memoria.
- **Alternatives considered**: Solo unit test. Rechazado: no observa DOM.

### D-009 Accesibilidad
- **Decision**: Reusar patrón US23 existente (`aria-invalid`, `aria-describedby`, foco primer error, diálogos accesibles) para nuevas vistas.
- **Rationale**: Consistencia y cumplimiento constitución III; no repetir T058, extenderlo a nuevas pantallas.
- **Alternatives considered**: Validación ad-hoc por vista. Rechazado por inconsistencia.

## Clarificaciones resueltas

No quedan NEEDS CLARIFICATION. Supuestos documentados en spec: ventana 30 días, reporte informativo no destructivo, `src/components/*` histórico.
