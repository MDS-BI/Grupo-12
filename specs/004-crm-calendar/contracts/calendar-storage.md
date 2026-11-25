# Contract: Calendar Storage (`crm_module`)

## Scope
Defines storage behavior for CRM Calendar feature: personal tasks sidebar and general CRM calendar activities. Extends existing CRM storage without modifying `specs/001-crm-module`.

## Keys

| Key | Kind | Shape | Default | Recovery |
|---|---|---|---|---|
| `crm_module:tasks` | Entity collection | `CRMTask[]` | `[]` | Affected entity key: validate on load/startup; if JSON invalid or shape not array of objects with required IDs, include in FR-072 corruption report and reset-to-`[]` only when user confirms "Reiniciar datos afectados". |
| `crm_module:calendarActivities` | Entity collection | `CalendarActivity[]` | `[]` | Same recovery rule as `crm_module:tasks`; non-affected keys (auth, theme, active view, existing CRM keys unless corrupt) preserved. |

## CRMTask record
Required: `id`, `ownerUserId`, `title`, `status`, `createdAt`, `updatedAt`.
Optional: `description`, `dueAt`, `priority`, `relatedRecords`, `archived`.
Status enum: `pending`, `in_progress`, `completed`.

## CalendarActivity record
Required: `id`, `type`, `title`, `startAt`, `endAt`, `status`, `ownerUserId`, `createdAt`, `updatedAt`.
Optional: `description`, `participantUserIds`, `relatedRecords`, `linkedInteractionId`.
Type enum: `meeting`, `event`, `call`, `follow_up`, `commercial_activity`.
Status enum: `scheduled`, `completed`, `cancelled`.

## CRMRelation shape

| Field | Type | Required | Rule |
|---|---|---:|---|
| `type` | enum | Yes | `customer` \| `contact` \| `opportunity` |
| `id` | string | Yes | `customer`: customer id; `opportunity`: opportunity id; `contact`: deterministic `contact:<customerId>` (or `contact:<customerId>:<contactIndex>` if multiple contacts exist). |
| `customerId` | string | Cond. | Required for `type=contact`; optional for others when useful. |
| `label` | string | Yes | Display label snapshot (e.g., "Contacto: Ana Pérez (Acme)"). |
| `available` | boolean | No | Computed on load; `false` when referenced record missing/archived. |

**Contact rule**: CRM currently has no separate Contact entity. Contact relations are represented through existing customer/contact-info data; no new Contact entity is created and `specs/001-crm-module` is unchanged.

## Invariants

- New calendar keys participate in existing CRM storage recovery/backup behavior: corruption is surfaced clearly, recovery is explicit, and only affected keys are reset.
- Task due classification:
  - overdue: pending/in_progress and `dueAt < now`
  - dueSoon: pending/in_progress and `now <= dueAt <= now+24h`
  - exact `now` is not overdue.
- Activity date range: `endAt >= startAt`.
- Personal sidebar: only tasks where `ownerUserId === currentUser`.
- General calendar default filter: activities where current user is owner or participant; team filter shows all CRM-visible activities.
- `call`/`meeting` activities synchronize with `crm_module:interactions` as planned interactions; result/notes execution remain in Interactions flow.
- `event`/`follow_up`/`commercial_activity` do not create interaction records.
- Delete activity requires explicit confirmation before persistence removal.
- Relations to archived/missing CRM records remain consultable; label marked unavailable.

## Expected Storage API (additive)

| Function | Contract |
|---|---|
| `loadTasks({ownerUserId, includeCompleted?})` | Returns tasks for owner, sorted by due proximity then createdAt. |
| `addTask(data, {ownerUserId})` | Validates required fields; persists task. |
| `updateTask(id, patch, {ownerUserId})` | Updates owned task; validates; updates `updatedAt`. |
| `loadCalendarActivities({from,to,userId,team?})` | Returns activities intersecting range; applies personal/team filter. |
| `addCalendarActivity(data)` | Validates; persists; syncs linked interaction for call/meeting. |
| `updateCalendarActivity(id, patch)` | Validates; persists; syncs linked interaction for call/meeting. |
| `deleteCalendarActivity(id)` | Removes activity after confirmation at UI; syncs linked interaction removal/consistency. |

## Compatibility

- No changes to `specs/001-crm-module/contracts/crm-storage.md`.
- Existing CRM entity keys and behaviors remain unchanged.
- New keys are additive; absence defaults to empty arrays.

