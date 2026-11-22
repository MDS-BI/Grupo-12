# Quickstart: Cierre de brechas históricas del CRM

**Feature**: 002-crm-historical-gaps  
**Ruta activa**: `index.html` + `src/*` (no `src/components/*`)

## Preparación

```bash
npm install
npm run test:run
npm run lint
npm run build
npm run dev
```

## Escenarios de verificación manual

### US1 - Empleados (FR-001..003, T025/T055/T056)
1. Iniciar sesión y abrir vista `Empleados`.
2. Crear empleado válido (nombre + cargo). **Esperado**: aparece en listado y en selectores de responsable activos.
3. Editar cargo. **Esperado**: cambio visible en listado y selectores.
4. Archivar empleado. **Esperado**: desaparece de selectores operativos; visible al activar "Mostrar archivados".
5. Restaurar. **Esperado**: vuelve a selectores/lista operativa.

### US2 - Interacciones (FR-004..005, T036)
1. Abrir `Interacciones`.
2. Crear interacción con cliente activo, empleado activo, fecha, tipo y nota. **Esperado**: aparece en historial.
3. Editar nota/tipo. **Esperado**: se actualiza sin duplicar.
4. Eliminar con confirmación. **Esperado**: desaparece; cancelar no elimina.

### US3 - Oportunidades lifecycle/config (FR-006..007, FR-013, T030/T062/T064)
1. Crear oportunidad en etapa inicial.
2. Cambiar a transición permitida por lifecycle. **Esperado**: persiste.
3. Intentar transición no permitida. **Esperado**: mensaje claro, no persiste.
4. Cargar config inválida (fixture de prueba). **Esperado**: banner visible de error/fallback, app sigue utilizable.

### US4 - Ficha cliente 360° (FR-008..009, T041)
1. Desde listado Clientes, abrir "Ver ficha" de cliente con datos.
2. **Esperado**: resumen, oportunidades e interacciones relacionadas.
3. Volver al listado. **Esperado**: conserva filtro/selección visible.
4. Abrir cliente sin historial. **Esperado**: estados vacíos claros por sección.

### US5 - Próximos cierres e integridad (FR-010..011, T046/T057)
1. Cargar oportunidades abiertas con closeDate en próximos 30 días. **Esperado**: sección "Próximos cierres" visible con acceso al registro.
2. Inyectar referencia inexistente (fixture). **Esperado**: reporte de integridad visible con tipo/registro/referencia faltante.
3. Sin datos/problemás. **Esperado**: estados vacíos/no-error, sin falsos positivos.

### US6 - Archivado visible y rendimiento 500 (FR-012, FR-014, T052/T055/T056)
1. Archivar cliente desde UI. **Esperado**: fuera de lista operativa y selectores por defecto; visible en archivados.
2. Restaurar cliente. **Esperado**: vuelve a operativos.
3. Ejecutar prueba DOM 500 registros. **Esperado**: filtro <=10s, render inicial <=2s.

## Validación automatizada esperada

```bash
npm run test:run
npm run lint
npm run build
```

Nuevas pruebas esperadas (plan): `tests/unit/lifecycle-transitions.test.js`, `tests/unit/referential-integrity.test.js`, `tests/integration/employees-ui.test.js`, `tests/integration/interactions-ui.test.js`, `tests/integration/opportunities-lifecycle.test.js`, `tests/integration/client-360.test.js`, `tests/integration/dashboard-upcoming-integrity.test.js`, `tests/integration/archive-restore-ui.test.js`, `tests/integration/performance-dom.test.js`.
