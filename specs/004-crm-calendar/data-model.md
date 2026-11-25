# Data Model: Calendario CRM

## Entities

### CRMTask
| Field | Type | Required | Description / Rules |
|---|---|---:|---|
| `id` | string | Yes | Unique task ID (`task_*`). |
| `ownerUserId` | string | Yes | Current user owner; lateral shows only tasks where owner is current user. |
| `title` | string | Yes | Non-empty, trimmed. |
| `description` | string | No | Optional details. |
| `dueAt` | ISO datetime string | No | If present, valid datetime. Used for overdue/upcoming classification. |
| `status` | enum | Yes | `pending` \| `in_progress` \| `completed`. Default `pending`. |
| `priority` | enum | No | `low` \| `medium` \| `high` when present. |
| `relatedRecords` | `CRMRelation[]` | No | Optional links to customer/contact/opportunity. |
| `createdAt` | ISO datetime string | Yes | Creation timestamp. |
| `updatedAt` | ISO datetime string | Yes | Last update timestamp. |
| `archived` | boolean | No | Default `false`; future-safe, not required by UI. |

**Validation rules**:
- `title` required.
- `dueAt`, if provided, must parse to valid datetime.
- `status` must be supported.
- `ownerUserId` required for personal agenda scope.

**Derived states**:
- `overdue`: `status != completed` and `dueAt < now`.
- `dueSoon`: `status != completed` and `dueAt >= now` and `dueAt <= now + 24h`.
- `pendingFuture`: `status != completed` and (`dueAt` missing or `dueAt > now`), shown in lateral pending/future list per rules.

### CalendarActivity
| Field | Type | Required | Description / Rules |
|---|---|---:|---|
| `id` | string | Yes | Unique activity ID (`cal_*`). |
| `type` | enum | Yes | `meeting` \| `event` \| `call` \| `follow_up` \| `commercial_activity`. |
| `title` | string | Yes | Non-empty. |
| `description` | string | No | Optional. |
| `startAt` | ISO datetime string | Yes | Valid datetime. |
| `endAt` | ISO datetime string | Yes | Valid datetime; must be >= `startAt`. |
| `status` | enum | Yes | `scheduled` \| `completed` \| `cancelled` (minimum). |
| `ownerUserId` | string | Yes | Responsible user. |
| `participantUserIds` | string[] | No | Participants; used for personal/team visibility filter. |
| `relatedRecords` | `CRMRelation[]` | No | Zero or more CRM relations. |
| `linkedInteractionId` | string | No | For `call`/`meeting`, linked `crm_module:interactions` record id. |
| `createdAt` | ISO datetime string | Yes | Creation timestamp. |
| `updatedAt` | ISO datetime string | Yes | Last update timestamp. |

**Validation rules**:
- `title`, `type`, `startAt`, `endAt`, `status` required.
- `endAt >= startAt`.
- `type` in supported set.
- `call`/`meeting` must create/sync linked interaction; `event`/`follow_up`/`commercial_activity` must not create interaction.

### CRMRelation
| Field | Type | Required | Description / Rules |
|---|---|---:|---|
| `type` | enum | Yes | `customer` \| `contact` \| `opportunity`. |
| `id` | string | Yes | Referenced record ID. For `contact`, use deterministic `contact:<customerId>` (or `contact:<customerId>:<contactIndex>` if multiple contacts exist). |
| `customerId` | string | Cond. | Required when `type=contact`. |
| `label` | string | Yes | Human-readable label snapshot, e.g., `Contacto: <nombre> (<cliente>)`. |
| `available` | boolean | No | Computed/display hint; unavailable if referenced record archived/missing. |

**Contact rule**: CRM has no separate Contact entity. Contact relations are represented through existing customer contact info; no new Contact entity and no changes to `specs/001-crm-module`.

### CalendarViewState (UI state, non-canonical)
| Field | Type | Required | Description / Rules |
|---|---|---:|---|
| `activeView` | enum | Yes | `year` \| `month` \| `week`. |
| `referenceDate` | ISO date/datetime | Yes | Anchor date for period navigation. |
| `rangeStart` | ISO datetime | Yes | Computed visible period start. |
| `rangeEnd` | ISO datetime | Yes | Computed visible period end. |
| `teamFilter` | boolean | Yes | Default `false` (personal: responsible/participant). |

## Relationships

- `CRMTask.ownerUserId` -> current/authenticated CRM user identity.
- `CRMTask.relatedRecords[*]` -> `Customer` (`crm_customers`/entities), `Opportunity` (`crm_opportunities`/documents), or contact info represented from customer.
- `CalendarActivity.ownerUserId` / `participantUserIds` -> CRM users/employees identity used by app context.
- `CalendarActivity.relatedRecords[*]` -> same CRM records as tasks.
- `CalendarActivity.linkedInteractionId` -> `Interaction.id` in `crm_module:interactions` for call/meeting planning records.

## State Transitions

### Task status
```text
pending -> in_progress -> completed
pending -> completed
in_progress -> pending (edit/correction)
completed -> pending/in_progress (reopen by edit)
```
- Deletion from lateral is out of scope in this version.

### Calendar activity status
```text
scheduled -> completed
scheduled -> cancelled
completed/cancelled -> scheduled (edit/reopen, if allowed by UI)
```
- Delete requires explicit confirmation and removes from all calendar views.

### Call/Meeting sync with Interactions
```text
Calendar create (call/meeting) -> create linked Interaction (planned)
Calendar edit (call/meeting) -> update linked Interaction fields (date/type/client/owner/notes-planning)
Calendar delete (call/meeting) -> remove or mark linked Interaction consistently per CRM pattern
Interaction execution result/notes -> completed in Interactions flow, not required in calendar create/edit
```

## Storage Keys (new)

| Key | Type | Default | Notes |
|---|---|---|---|
| `crm_module:tasks` | JSON array | `[]` | CRMTask records. |
| `crm_module:calendarActivities` | JSON array | `[]` | CalendarActivity records. |

Existing keys reused: `crm_module:customers`, `crm_module:opportunities`, `crm_module:interactions`, `crm_module:employees`, `erp.authenticatedUser`.

