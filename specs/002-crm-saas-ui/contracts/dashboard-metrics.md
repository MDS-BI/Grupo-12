# Contrato de Métricas del Dashboard

**Rama**: `002-crm-saas-ui` | **Especificación**: [spec.md](spec.md) | **Modelo**: [data-model.md](../data-model.md)

## Propósito

Fija la fuente de datos, la fórmula, el formato y el estado vacío de las cuatro tarjetas KPI. Es la referencia para las pruebas unitarias de la derivación y para las pruebas de integración del Dashboard.

## Fuente de datos

`getCRMOverview()` (`src/storage.js:957-986`), que lee `crm_module:customers`, `crm_module:opportunities` y `crm_module:employees` y excluye registros con `archived === true`. No se usa `computeDashboardMetrics()` directamente: sus campos (`estado`, `etapa`, `montoEstimado`) no coinciden con los registros normalizados que escribe `addCustomer()`/`addOpportunity()`.

## Definiciones

| KPI | Expresión | Tipo | Neutro | Formato de pantalla |
|---|---|---|---|---|
| Clientes activos | `overview.activeCustomers` | entero | `0` | `String(valor)` |
| Oportunidades activas | `overview.openOpportunities` | entero | `0` | `String(valor)` |
| Ingresos estimados | `overview.totalPipeline` | numérico | `0` | moneda local con separadores, p. ej. `$1.234.567` |
| Tasa de conversión | `computeConversionRate(overview.opportunities)` | entero 0-100 | `0` | `` `${valor} %` `` |

### Oportunidades activas

Se consideran abiertas las oportunidades cuyo `stage` (o `etapa`, como alias de entrada) no es `Ganado` ni `Perdido`. `getCRMOverview()` ya aplica esta regla con `stage || 'Evaluación'`.

### Ingresos estimados

Suma de `Number(amount) || 0` sobre las oportunidades abiertas. Es el valor del pipeline, no ingresos realizados; la etiqueta «Ingresos estimados» y el texto de apoyo de la tarjeta deben hacer explícito este significado para evitar interpretaciones erróneas.

### Tasa de conversión

```text
won    = oportunidades con stage (o etapa) === 'Ganado'
lost   = oportunidades con stage (o etapa) === 'Perdido'
closed = won + lost
rate   = closed === 0 ? 0 : Math.round((won / closed) * 100)
```

La función `computeConversionRate(opportunities)` se añade a `src/domain.js` y no muta su entrada. Las etapas terminales ya están definidas en `src/domain.js:20` (`TERMINAL_STAGES`). Ejemplos:

| Oportunidades cerradas | Resultado |
|---|---|
| ninguna | `0` |
| 2 Ganado, 2 Perdido | `50` |
| 3 Ganado, 1 Perdido | `75` |
| 1 Ganado, 2 Perdido | `33` |

## Reglas de actualización

1. Al entrar a `#view-dashboard` se llama a `updateDashboardStats()`, que obtiene una única vez `getCRMOverview()`.
2. Tras guardar o editar un cliente desde `#entity-form`, el adaptador escribe en `crm_module:customers`; la siguiente entrada al Dashboard refleja el cambio.
3. Trasguardar una oportunidad con `stage: 'Ganado'`, la conversión cambia en la siguiente entrada al Dashboard.
4. Sin datos, las cuatro tarjetas muestran sus valores neutros y no aparece ningún mensaje de error.
5. No se realizan peticiones de red ni se recalcula la vista completa para actualizar una tarjeta.

## Casos límite

- `amount` ausente, `null`, negativo o no numérico: aporta `0` al total.
- `stage` ausente: se trata como `Evaluación` (abierta), según `getCRMOverview()`.
- Registros archivados: se excluyen de todas las tarjetas.
- Importes muy grandes: se formatean sin desbordar la tarjeta.
- `closed === 0`: `0 %`, nunca `NaN` ni `Infinity`.

## Verificación

- Unitaria: `tests/unit/conversion-rate.test.js` cubre los ejemplos de la tabla, alias `etapa`, valores vacíos y ausencia de mutación.
- Integración: `tests/integration/ui-contracts.test.js` comprueba las cuatro etiquetas y valores con almacenamiento vacío y con datos sembrados mediante `addCustomer()` / `addOpportunity()`.
- Regresión: los valores se leen de `getCRMOverview()`, no de `erp_base_module:*`, por lo que sembrar claves obsoletas no debe afectar a los KPI.
