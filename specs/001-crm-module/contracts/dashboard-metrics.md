# Contrato de Métricas del Dashboard

**Funcionalidad**: `001-crm-module` | **Especificación**: [../spec.md](../spec.md) | **Modelo**: [../data-model.md](../data-model.md)

## Propósito

Fija la fuente de datos, la fórmula, el formato y el estado vacío de las tarjetas KPI. Referencia para pruebas unitarias e integración.

## Fuente de datos

`getCRMOverview()` (`src/storage.js`) es la fuente canónica. Los KPI deben calcularse desde la misma fuente de verdad que usan altas, ediciones y eliminaciones de oportunidades desde la UI (FR-076/FR-077). Si la UI guarda oportunidades en una estructura de compatibilidad, la operación debe sincronizar la fuente canónica en la misma acción.

## Definiciones

| KPI | Expresión | Neutro | Formato |
|---|---|---:|---|
| Clientes activos | `overview.activeCustomers` | `0` | entero |
| Oportunidades activas | `overview.openOpportunities` | `0` | entero |
| Ingresos estimados | `overview.totalPipeline` | `$0` | moneda base CLP, sin mezcla ambigua |
| Tasa de conversión | `computeConversionRate(opportunities)` | `0 %` | entero + `%` |

## Reglas

- **Oportunidades activas**: `stage` no terminal (`Ganado`/`Perdido`). `archived` del cliente no excluye la oportunidad abierta (FR-068).
- **Ingresos estimados**: suma de montos de oportunidades abiertas. Agregado en moneda base CLP en MVP (FR-088).
- **Tasa de conversión**: `won/(won+lost)*100`, redondeo entero, 0 si no hay cerradas.
- **Consistencia**: tras crear/editar/eliminar oportunidad desde UI, el siguiente ingreso al dashboard refleja el cambio (SC-023).

## Casos límite

- `amount` ausente/ inválido: aporta 0.
- `stage` ausente: tratar como `Evaluación` solo si la normalización vigente lo define; preferir explicitar.
- Oportunidades archivadas: excluir si el dominio las marca archivadas.
- Monedas distintas: monto individual conserva moneda; agregado KPI usa CLP base y etiqueta/regla consistente.

## Verificación

- Unit: `getCRMOverview()` / `computeConversionRate()`.
- Integration: crear oportunidad por UI, navegar a dashboard, verificar KPI; editar/eliminar idem.