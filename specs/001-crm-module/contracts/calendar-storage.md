# Contrato: Almacenamiento del Calendario CRM (`crm_module`)

> **Nota de fusión (2026-11-25)**: este archivo incorpora íntegramente `specs/004-crm-calendar/contracts/calendar-storage.md` dentro de `specs/001-crm-module/contracts/` sin modificar ni eliminar ningún contrato existente; la carpeta original `004-crm-calendar/` se conserva. Las referencias a FR/US/SC usan la numeración fusionada de [../spec.md](../spec.md): FR-104–FR-121, US32–US35 y SC-037–SC-042. El contrato base [crm-storage.md](crm-storage.md) permanece intacto.

## Alcance

Define el comportamiento de almacenamiento de la funcionalidad Calendario CRM: calendario lateral de tareas personales y calendario general de actividades. Extiende el almacenamiento CRM existente sin modificar los contratos previos.

## Claves

| Clave | Tipo | Forma | Default | Recuperación |
|---|---|---|---|---|
| `crm_module:tasks` | Colección de entidades | `CRMTask[]` | `[]` | Clave de entidad afectada: validar al cargar/arrancar; si el JSON no es válido o no es un array de objetos con IDs requeridos, incluir en el reporte de corrupción de FR-072 y resetear a `[]` solo cuando el usuario confirme "Reiniciar datos afectados". |
| `crm_module:calendarActivities` | Colección de entidades | `CalendarActivity[]` | `[]` | Misma regla que `crm_module:tasks`; las claves no afectadas (auth, tema, vista activa y claves CRM existentes no corruptas) se conservan. |

## Registro CRMTask

Requeridos: `id`, `ownerUserId`, `title`, `status`, `createdAt`, `updatedAt`.  
Opcionales: `description`, `dueAt`, `priority`, `relatedRecords`, `archived`.  
Estados: `pending`, `in_progress`, `completed`.

## Registro CalendarActivity

Requeridos: `id`, `type`, `title`, `startAt`, `endAt`, `status`, `ownerUserId`, `createdAt`, `updatedAt`.  
Opcionales: `description`, `participantUserIds`, `relatedRecords`, `linkedInteractionId`.  
Tipos: `meeting`, `event`, `call`, `follow_up`, `commercial_activity`.  
Estados: `scheduled`, `completed`, `cancelled`.

## Forma de CRMRelation

| Campo | Tipo | Requerido | Regla |
|---|---|---:|---|
| `type` | enum | Sí | `customer` \| `contact` \| `opportunity` |
| `id` | string | Sí | `customer`: id de cliente; `opportunity`: id de oportunidad; `contact`: `contact:<customerId>` determinista (o `contact:<customerId>:<contactIndex>` si hay varios contactos). |
| `customerId` | string | Cond. | Requerido para `type=contact`; opcional en los demás cuando sea útil. |
| `label` | string | Sí | Etiqueta legible capturada, p. ej. "Contacto: Ana Pérez (Acme)". |
| `available` | boolean | No | Calculada al cargar; `false` si el registro referenciado falta o está archivado. |

**Regla de contacto**: el CRM no tiene entidad Contacto separada. Las relaciones de contacto se representan con los datos existentes de cliente/información de contacto; no se crea una entidad nueva. La declaración original de 004 de que `specs/001-crm-module` permanecía sin cambios se conserva como contexto histórico; tras la fusión los documentos de destino son estos mismos archivos.

## Invariantes

- Las nuevas claves participan en el comportamiento de recuperación/backup de almacenamiento CRM existente: la corrupción se muestra con claridad, la recuperación es explícita y solo se resetean las claves afectadas.
- Clasificación de vencimiento de tareas:
  - atrasada: `pending`/`in_progress` y `dueAt < now`
  - próxima a vencer: `pending`/`in_progress` y `now <= dueAt <= now+24h`
  - exactamente en `now` no es atrasada.
- Rango de actividad: `endAt >= startAt`.
- Lateral personal: solo tareas donde `ownerUserId === currentUser`.
- Filtro por defecto del calendario general: actividades donde el usuario actual es responsable o participante; el filtro de equipo muestra todas las actividades visibles en CRM.
- Actividades `call`/`meeting` se sincronizan con `crm_module:interactions` como interacciones planificadas; el resultado/notas de ejecución permanecen en el flujo de Interacciones.
- Actividades `event`/`follow_up`/`commercial_activity` no crean registros de interacción.
- Eliminar actividad requiere confirmación explícita en la UI antes de persistir la eliminación.
- Las relaciones con registros archivados/ausentes siguen siendo consultables; la etiqueta se marca como no disponible.

## API de almacenamiento esperada (aditiva)

| Función | Contrato |
|---|---|
| `loadTasks({ownerUserId, includeCompleted?})` | Devuelve tareas del propietario, ordenadas por proximidad de vencimiento y luego por `createdAt`. |
| `addTask(data, {ownerUserId})` | Valida campos requeridos y persiste la tarea. |
| `updateTask(id, patch, {ownerUserId})` | Actualiza tarea del propietario, valida y actualiza `updatedAt`. |
| `loadCalendarActivities({from,to,userId,team?})` | Devuelve actividades que intersectan el rango y aplica filtro personal/equipo. |
| `addCalendarActivity(data)` | Valida, persiste y sincroniza la interacción vinculada para `call`/`meeting`. |
| `updateCalendarActivity(id, patch)` | Valida, persiste y sincroniza la interacción vinculada para `call`/`meeting`. |
| `deleteCalendarActivity(id)` | Elimina tras confirmación en la UI y sincroniza la eliminación/coherencia de la interacción vinculada. |

## Compatibilidad

- El contrato base [crm-storage.md](crm-storage.md) no se modifica.
- Las claves y comportamientos de entidades CRM existentes permanecen sin cambios.
- Las claves nuevas son aditivas; su ausencia equivale a arrays vacíos.
