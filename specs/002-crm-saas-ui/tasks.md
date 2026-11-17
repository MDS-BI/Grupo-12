---
description: "Task list for the professional SaaS UI refresh of the CRM"
---

# Tasks: Interfaz SaaS Profesional del CRM

**Input**: Design documents from `/specs/002-crm-saas-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Tests**: incluidas porque la constitución del proyecto (principio II) y el plan exigen cobertura automatizada antes o junto a cada comportamiento visible.
**Organization**: tareas agrupadas por historia de usuario; numeración correlativa T001–T042 sin huecos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1…US5 según las historias de `spec.md`
- Todas las descripciones incluyen la ruta exacta del archivo

## Path Conventions

- Proyecto único: `src/`, `tests/` en la raíz del repositorio
- `dist/` es generado; se regenera con `npm run build`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: verificar el entorno existente y preparar el arnés de pruebas sobre el DOM real.

- [x] T001 Verificar toolchain y línea base ejecutando `npm run test:run`, `npm run lint` y `npm run build` según `specs/002-crm-saas-ui/quickstart.md`, sin añadir dependencias en `package.json`
- [x] T002 [P] Crear el helper de montaje JSDOM del HTML real en `tests/integration/live-dom.js`, con `vi.resetModules()` y simulación de recarga dentro de la misma sesión
- [x] T003 [P] Ampliar `tests/setup/test-setup.js` para limpiar `sessionStorage` y restablecer la URL entre pruebas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: infraestructura compartida que debe estar lista antes de cualquier historia.

**⚠️ CRITICAL**: ninguna historia puede comenzar hasta completar esta fase.

- [x] T004 Añadir los tokens `--sidebar-width`, `--sidebar-width-collapsed` y las reglas base `.icon` con `stroke: currentColor` en `src/styles.css`
- [x] T005 [P] Crear la prueba estática del contrato SVG en `tests/unit/svg-icon-contract.test.js` sobre `index.html`
- [x] T006 Centralizar `AUTH_STORAGE_KEY` y `SIDEBAR_STORAGE_KEY` en la cabecera de `src/app.js` para US2 y US3

**Checkpoint**: base lista; las historias pueden iniciarse en orden de prioridad.

---

## Phase 3: User Story 1 - Iniciar sesión en pantalla dividida con contraseña visible (Priority: P1) 🎯 MVP

**Goal**: acceso profesional con dos paneles y control fiable de mostrar/ocultar contraseña (FR-001 a FR-006).

**Independent Test**: abrir `index.html` sin sesión, comprobar ambos paneles, alternar visibilidad dos veces conservando el valor, verificar credenciales inválidas y entrar con `Cliente1` / `1234`.

### Tests for User Story 1

> Escribir primero y confirmar que fallan antes de la implementación.

- [x] T007 [P] [US1] Añadir pruebas de acceso dividido, visibilidad y errores en `tests/integration/ui-contracts.test.js`
- [x] T008 [P] [US1] Añadir prueba estática de la rejilla 45%/55% y el apilado a 820 px en `tests/unit/layout-contract.test.js`

### Implementation for User Story 1

- [x] T009 [US1] Normalizar los SVG `.icon-eye` y `.icon-eye-off` y sus atributos ARIA en `index.html`
- [x] T010 [US1] Ajustar `setPasswordVisibility()` y `bindPasswordToggle()` para conservar el valor y sincronizar `aria-pressed`/`aria-label` en `src/main.js`
- [x] T011 [US1] Garantizar la visibilidad de `.login-brand-panel` y `.login-form-panel` y su apilado responsive en `index.html` y `src/styles.css`
- [x] T012 [US1] Asegurar que `#login-error` muestra un mensaje en español sin incluir la contraseña en `src/main.js`

**Checkpoint**: US1 es funcional y verificable de forma aislada.

---

## Phase 4: User Story 2 - Navegar con un menú lateral colapsable (Priority: P2)

**Goal**: hamburguesa SVG accesible, franja de iconos en escritorio, overlay en móvil y persistencia de sesión (FR-007 a FR-010).

**Independent Test**: contraer y expandir desde dos secciones, recargar conservando el estado, comprobar foco y `aria-expanded`, y cerrar sesión para verificar el reinicio.

### Tests for User Story 2

- [x] T013 [P] [US2] Añadir pruebas de colapso, persistencia, sección activa y accesibilidad en `tests/integration/sidebar-collapse.test.js`
- [x] T014 [P] [US2] Añadir prueba de regresión que prohíbe `.sidebar { display: none; }` en `tests/unit/layout-contract.test.js`

### Implementation for User Story 2

- [x] T015 [US2] Sustituir el SVG de `#menu-toggle` por el contrato de iconos y añadir `aria-hidden`, `focusable` y etiqueta dinámica en `index.html`
- [x] T016 [US2] Implementar lectura/escritura de `sessionStorage['erp.sidebarCollapsed']`, sincronización de ARIA y cierre por Escape/clic fuera en `src/app.js`
- [x] T017 [US2] Reemplazar `display: none` por la franja de 64 px y el overlay para ≤ 900 px en `src/styles.css`
- [x] T018 [US2] Eliminar la preferencia del menú al cerrar sesión en `src/main.js`

**Checkpoint**: US2 funciona de forma aislada y no altera US1.

---

## Phase 5: User Story 3 - Orientarse en el Dashboard con banner y tarjetas KPI (Priority: P2)

**Goal**: saludo con el usuario autenticado y cuatro KPI derivados del CRM con estados vacíos neutros (FR-011 a FR-014).

**Independent Test**: entrar con `Cliente1`, verificar `#welcome-title` y las cuatro etiquetas/valores, sembrar datos con `addCustomer`/`addOpportunity` y comprobar la actualización y la conversión.

### Tests for User Story 3

- [x] T019 [P] [US3] Añadir pruebas unitarias de `computeConversionRate()` con alias `etapa`, denominador cero y sin mutación en `tests/unit/conversion-rate.test.js`
- [x] T020 [P] [US3] Añadir pruebas de banner, cuatro KPI y estado vacío en `tests/integration/ui-contracts.test.js`

### Implementation for User Story 3

- [x] T021 [US3] Implementar `computeConversionRate(opportunities)` en `src/domain.js`
- [x] T022 [US3] Añadir `#welcome-title` y las tarjetas `#stat-clients`, `#stat-opportunities`, `#stat-revenue` y `#stat-conversion` con sus etiquetas en `index.html`
- [x] T023 [US3] Ampliar `updateDashboardStats()` para renderizar los cuatro KPI desde `getCRMOverview()` en `src/app.js`
- [x] T024 [US3] Añadir `renderWelcomeBanner()` leyendo `AUTH_STORAGE_KEY` en `src/app.js`
- [x] T025 [US3] Sincronizar el alta/edición de `#entity-form` con `addCustomer()`/`updateCustomer()` para FR-014 en `src/app.js`
- [x] T026 [US3] Ajustar `.stats-grid` y `.welcome-banner` para 1366 × 768 sin desplazamiento vertical en `src/styles.css`

**Checkpoint**: US3 es verificable de forma aislada y refleja datos vigentes.

---

## Phase 6: User Story 4 - Capturar datos con formularios estandarizados (Priority: P2)

**Goal**: dos bloques con encabezados literals en mayúsculas, estructura repetida y errores uniformes (FR-015 a FR-018).

**Independent Test**: comprobar `textContent` exacto de ambos encabezados en alta y edición, enviar con campos vacíos y verificar errores junto al campo sin guardar.

### Tests for User Story 4

- [x] T027 [P] [US4] Añadir pruebas de encabezados exactos, agrupación y errores uniformes en `tests/integration/ui-contracts.test.js`
- [x] T028 [P] [US4] Añadir prueba estática de los literales `DATOS DEL CLIENTE` y `CONDICIONES COMERCIALES` en `tests/unit/form-headings.test.js`

### Implementation for User Story 4

- [x] T029 [US4] Reestructurar `#entity-form` en dos `.form-section` con encabezados literales en mayúsculas en `index.html`
- [x] T030 [US4] Migrar contacto al primer bloque y moneda/importe/plazos al segundo en `index.html`
- [x] T031 [US4] Unificar redacción y ubicación de `.validation-error` en `src/app.js`
- [x] T032 [US4] Igualar jerarquía, alineación y espaciado de `.form-section-title`, `.form-grid` y `.field` en `src/styles.css`

**Checkpoint**: US4 es consistente en alta y edición sin afectar a US3.

---

## Phase 7: User Story 5 - Leer textos en español sin caracteres mal formados (Priority: P3)

**Goal**: UTF-8 limpio en encabezados, etiquetas, listados y datos introducidos (FR-019 a FR-021).

**Independent Test**: verificar `<meta charset="UTF-8" />`, recorrer todas las vistas con acentos, «ñ» y símbolos monetarios y round-trip de `Ana García Ñuñez` sin U+FFFD.

### Tests for User Story 5

- [x] T033 [P] [US5] Añadir pruebas de round-trip y ausencia de U+FFFD/mojibake en `tests/integration/ui-contracts.test.js`
- [x] T034 [P] [US5] Añadir prueba estática de declaración UTF-8 en `tests/unit/utf8-contract.test.js`

### Implementation for User Story 5

- [x] T035 [US5] Auditar y mantener inserción exclusivamente con `textContent` en `src/app.js` y `src/main.js`
- [x] T036 [US5] Normalizar literales acentuados y símbolos monetarios de encabezados y etiquetas en `index.html`
- [x] T037 [US5] Regenerar el artefacto con `npm run build` y verificar la declaración UTF-8 en `dist/index.html`

**Checkpoint**: las cinco historias son funcionales y verificables de forma independiente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: validación final, accesibilidad y documentación.

- [x] T038 [P] Actualizar los ejemplos de validación con el comportamiento implementado en `specs/002-crm-saas-ui/quickstart.md`
- [x] T039 Ejecutar la verificación completa `npm run test:run`, `npm run lint` y `npm run build` desde `package.json`
- [x] T040 [P] Revisar `:focus-visible` y contraste de estados expandido/contraído en `src/styles.css`
- [x] T041 Registrar las suites heredadas fallidas y la deuda de `src/components/*` en `specs/002-crm-saas-ui/research.md`
- [x] T042 Completar la validación manual de los cinco escenarios de `specs/002-crm-saas-ui/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T002/T003 son bloqueantes para las pruebas de todas las historias
- **Foundational (Phase 2)**: depende de Setup; T004 y T006 bloquean la implementación visual y de sesión de US1–US3
- **User Stories (Phase 3–7)**: dependen de Foundational; se ejecutan en orden P1 → P2 → P2 → P2 → P3
- **Polish (Phase 8)**: depende de que las cinco historias estén completas

### User Story Dependencies

- **US1 (P1)**: sin dependencias entre historias; entregable MVP
- **US2 (P2)**: independiente de US1; comparte `index.html` y `src/styles.css`, por lo que sus ediciones se integran después de US1
- **US3 (P2)**: depende de T006 y de `getCRMOverview()` en `src/storage.js`; T025 garantiza que US4 tendrá datos coherentes
- **US4 (P2)**: depende de T022/T023 para que los cambios de `#entity-form` se reflejen en los KPI
- **US5 (P3)**: transversal; sus pruebas se ejecutan al final porque recorren todas las vistas

### Within Each User Story

1. Pruebas marcadas como [P] primero; deben fallar antes de tocar producción
2. Cambios de marcado y estilos
3. Lógica en los módulos conectados (`main.js`, `app.js`, `domain.js`)
4. Integración y checkpoint de la historia

### Parallel Opportunities

- T002 y T003 en paralelo; T004, T005 y T006 en paralelo (archivos distintos)
- US1: T007 + T008 en paralelo
- US2: T013 + T014 en paralelo
- US3: T019 + T020 en paralelo; T021 y T022 pueden prepararse en paralelo tras T020
- US4: T027 + T028 en paralelo
- US5: T033 + T034 en paralelo
- T038 y T040 en paralelo durante Polish

---

## Parallel Example: User Story 1

```text
Task: "Añadir pruebas de acceso dividido, visibilidad y errores en tests/integration/ui-contracts.test.js" (T007)
Task: "Añadir prueba estática de la rejilla 45%/55% y el apilado a 820 px en tests/unit/layout-contract.test.js" (T008)
```

## Parallel Example: User Story 2

```text
Task: "Añadir pruebas de colapso, persistencia, sección activa y accesibilidad en tests/integration/sidebar-collapse.test.js" (T013)
Task: "Añadir prueba de regresión que prohíbe .sidebar { display: none; } en tests/unit/layout-contract.test.js" (T014)
```

## Parallel Example: User Story 3

```text
Task: "Añadir pruebas unitarias de computeConversionRate() en tests/unit/conversion-rate.test.js" (T019)
Task: "Añadir pruebas de banner, cuatro KPI y estado vacío en tests/integration/ui-contracts.test.js" (T020)
```

## Parallel Example: User Story 4

```text
Task: "Añadir pruebas de encabezados exactos, agrupación y errores uniformes en tests/integration/ui-contracts.test.js" (T027)
Task: "Añadir prueba estática de los literales en tests/unit/form-headings.test.js" (T028)
```

## Parallel Example: User Story 5

```text
Task: "Añadir pruebas de round-trip y ausencia de U+FFFD/mojibake en tests/integration/ui-contracts.test.js" (T033)
Task: "Añadir prueba estática de declaración UTF-8 en tests/unit/utf8-contract.test.js" (T034)
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Completar Phase 1 y Phase 2
2. Completar Phase 3 (US1)
3. **DETENER Y VALIDAR**: ejecutar el Independent Test de US1; demostrar acceso dividido y contraseña visible
4. Desplegar o mostrar el MVP si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → validar → MVP
3. US2 → validar → navegación colapsable
4. US3 → validar → banner y KPI
5. US4 → validar → formularios estandarizados
6. US5 → validar → UTF-8 limpio
7. Polish → verificación completa

### Parallel Team Strategy

Con varios desarrolladores, tras la Fase 2: Dev A en US1, Dev B en US2, Dev C en US3; US4 y US5 se asignan al liberarse, coordinando las ediciones de `index.html`, `src/styles.css` y `src/app.js` para evitar conflictos.

---

## Notes

- `[P]` implica archivos distintos y ninguna dependencia pendiente; las ediciones sobre `index.html` o `src/app.js` se secuencian aunque pertenezcan a historias distintas
- `[Story]` garantiza trazabilidad con los FR de `spec.md`
- Numeración correlativa T001–T042: 42 tareas totales, sin duplicados ni huecos
- Todas las tareas incluyen ruta de archivo y son ejecutables sin contexto adicional
- No se editan `src/components/*` ni `dist/index.html` a mano, según `research.md`


