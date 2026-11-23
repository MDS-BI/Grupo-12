# Contrato de Rendimiento: DOM real 500 registros

**Funcionalidad**: `001-crm-module` (cierre de brechas históricas, antes `002-crm-historical-gaps`)  
**Cubre**: histórica T052, FR-102, SC-035  
**Nota de fusión (2026-11-23)**: contrato conservado íntegramente; sus identificadores originales eran FR-014 y SC-005 de la spec 002.

## Presupuesto

- **Búsqueda/filtro completa**: <= 10 s
- **Renderizado inicial de listado**: <= 2 s
- **Dataset**: 500 clientes y registros asociados (oportunidades e interacciones) en ruta DOM real.
- **Medición**: prueba automatizada con `performance.now()`/Date delta en entorno de test.

## Metodología

1. Sembrar dataset determinista (500 clientes, N oportunidades, N interacciones; distribución estable).
2. Montar/bootear DOM real (`index.html` + app real).
3. Medir render inicial de listado objetivo (clientes/empleados/oportunidades según escenario definido por prueba).
4. Aplicar filtro/búsqueda representativa y medir hasta que DOM refleje resultado.
5. Assert umbrales SC-035 (antes 002-SC-005; equivalentes a FR-042/SC-004 del módulo base).
6. No usar sleeps largos; esperar condición DOM/estado.

## No regresión

- No recalcular KPIs 001 fuera de flujo existente.
- Evitar O(n^2) innecesario en render por filtro; preferir DocumentFragment y filtrado lineal simple.
- Mantener compatibilidad con tests existentes.
