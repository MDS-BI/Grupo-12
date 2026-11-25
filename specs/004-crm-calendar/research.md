# Phase 0 Research: Calendario CRM

## Decision 1: Modelo de datos separado para tareas y actividades
- **Decision**: Crear entidades nuevas `crm_tasks` (agenda personal lateral) y `crm_calendar_activities` (calendario general), en lugar de sobrecargar `crm_interactions`.
- **Rationale**: Las tareas tienen semántica de vencimiento/estado personal (FR-002..FR-005); las actividades de calendario incluyen tipos no-interacción (evento, seguimiento, actividad comercial) y rango inicio/fin. Reutilizar interacciones para todo forzaría campos ambiguos y rompería historial CRM.
- **Alternatives considered**:
  - Extender `crm_interactions`: rechazado por mezclar planificación, ejecución e historial; complica tipos y estados.
  - Solo actividades con flag "tarea": rechazado por UX lateral personal y reglas de vencimiento distintas.

## Decision 2: Integración con Interacciones CRM para llamada/reunión
- **Decision**: Al crear/editar una actividad tipo `Llamada` o `Reunión`, crear/actualizar un registro vinculado en `crm_module:interactions` con estado/fecha programada; no capturar resultado/notas de ejecución en calendario. Eliminar/actualizar en calendario sincroniza el registro vinculado.
- **Rationale**: Cumple clarificación de sesión (planificación primero) y FR-011/FR-015; evita duplicar captura de resultado.
- **Alternatives considered**:
  - Duplicar resultado/notas en calendario: rechazado por doble captura.
  - No sincronizar con interacciones: rechazado por inconsistencia con historial CRM.

## Decision 3: Visibilidad personal vs equipo
- **Decision**: Tareas laterales: solo `ownerUserId === currentUser`. Calendario general: por defecto responsable/participante incluye usuario actual; filtro opcional "Equipo/CRM" muestra todas las actividades visibles en CRM.
- **Rationale**: Clarificaciones Q3/Q5; balance entre enfoque personal y coordinación.
- **Alternatives considered**:
  - Todo equipo por defecto: rechazado por ruido.
  - Solo personal sin filtro: rechazado por necesidad de coordinación comercial.

## Decision 4: Representación de vistas anual/mensual/semanal sin librería externa
- **Decision**: Implementar vistas con renderizado propio en `app.js`/HTML/CSS: mensual (grid 7 columnas), semanal (grid días con franjas de actividades), anual (12 mini-meses con conteo/indicadores y drill-down a mes). 
- **Rationale**: Proyecto no usa framework/calendar lib; evita dependencia nueva y mantiene control de accesibilidad/estilos.
- **Alternatives considered**:
  - Librería de calendario externa: rechazada por dependencia/peso y posible desalineación visual.
  - Solo vista mensual: rechazada por FR-006.

## Decision 5: Regla de vencimiento y estados
- **Decision**: Tarea `atrasada` si pendiente y `dueAt < now`; `próxima a vencer` si pendiente y `now <= dueAt <= now+24h`; exactamente en `now` no es atrasada. Estados de tarea mínimos: `Pendiente`, `En progreso`, `Completada` (extensible), con gestión básica desde lateral.
- **Rationale**: FR-003/FR-004 y edge case determinista.
- **Alternatives considered**:
  - "Próxima a vencer" configurable: fuera de alcance.
  - Incluir completadas por defecto: rechazado por assumption.

## Decision 6: Relaciones CRM y contactos
- **Decision**: Relaciones por referencia tipada `{type: 'customer'|'contact'|'opportunity', id, labelSnapshot?}`. `customer` y `opportunity` usan IDs existentes. `contact` se resuelve a información de contacto de cliente (contacto embebido) cuando no exista entidad contacto separada, almacenando `customerId` y etiqueta.
- **Rationale**: FR-012/FR-017 y assumption de contacto no separado; preserva etiqueta visible ante archivado/no disponible.
- **Alternatives considered**:
  - Crear entidad Contacto nueva: rechazada por ampliar alcance y tocar spec 001.
  - Solo customer/opportunity: rechazada por requerimiento explícito de contacto.

## Decision 7: Persistencia y claves
- **Decision**: Usar `crm_module:tasks` y `crm_module:calendarActivities`. Incluirlas en validación/recuperación de storage afectado solo si se tratan como claves de entidad CRM; mantener compatibilidad/migración segura con arrays vacíos por defecto.
- **Rationale**: Alineado con patrón `crm_module:*` y FR-072/contrato storage existente.
- **Alternatives considered**:
  - Claves `erp_base_module:*`: rechazadas por naming CRM actual.
  - `localStorage` separado fuera de contrato: rechazado por recuperabilidad inconsistente.

## Decision 8: Accesibilidad y responsive
- **Decision**: Vistas de calendario con controles botón/tab, `aria-label` en navegación período/vista, grid semántico/roles adecuados, foco gestionado en diálogos de detalle/formulario, y layout CSS que colapsa lateral/general en pantallas estrechas.
- **Rationale**: Constitution III, FR-016, edge cases de teclado/lector.
- **Alternatives considered**:
  - Grid solo visual sin semántica: rechazado por accesibilidad.
