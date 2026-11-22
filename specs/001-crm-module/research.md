# Investigación: Módulo CRM (Customer Relationship Management)

## Decisión: Usar Vite con HTML, CSS y JavaScript vanilla

**Justificación**: El alcance del MVP es un módulo CRM de frontend con datos ficticios. Vite proporciona un flujo de desarrollo rápido y una compilación simple sin añadir un framework pesado. JavaScript vanilla mantiene el módulo fácil de entender, probar y extender por otros módulos ERP.

**Alternativas consideradas**

- React o Vue: mejor ecosistema de componentes, pero añade abstracción y dependencias innecesarias para el alcance actual.
- HTML estático sin Vite: más simple, pero Vite ofrece un mejor flujo de desarrollo y un paso de construcción para crecimiento futuro.
- Persistencia con backend y base de datos: innecesaria para un módulo de espacio único; la capa de almacenamiento está aislada, por lo que un backend puede introducirse más adelante sin reescribir la lógica de dominio.

## Decisiones adicionales

- **Persistencia**: `localStorage` del navegador para clientes, empleados, oportunidades e interacciones; sin backend ni autenticación en el MVP.
- **Datos ficticios**: datos de ejemplo de clientes, empleados, oportunidades e interacciones cargados al iniciar la aplicación si el almacenamiento está vacío.
- **Eliminación lógica**: clientes y empleados se archivan (`archived = true`) en lugar de eliminarse físicamente; sus oportunidades e interacciones se conservan íntegras. Se eligió sobre la eliminación en cascada para preservar el historial y la trazabilidad. Las oportunidades e interacciones sí admiten eliminación física.
- **Correo único**: `storage.js` normaliza (trim + minúsculas) y rechaza duplicados en alta y edición, incluyendo correos de clientes archivados.
- **Integridad referencial**: solo se pueden asignar clientes y empleados existentes y no archivados a nuevas oportunidades e interacciones. Si al cargar se detecta una referencia inexistente, se reporta visiblemente.
- **Transiciones de oportunidad**: validadas en `domain.js`/`storage.js`, permitiendo solo `Evaluación → Propuesta → Negociación → Ganado/Perdido` y ningún cambio desde etapas terminales.
- **Cálculo de dashboard**: `computeDashboardMetrics()` deriva indicadores de los datos actuales al renderizar o al entrar al dashboard; no se recalcula automáticamente mientras el dashboard permanece abierto.
- **Campos personalizados**: `ModuleConfig.customFields` se aplican en formularios, listas, validación y búsqueda; los valores se almacenan junto al registro base.
- **Configuración inválida**: se valida al cargar, se reportan errores visibles y se hace fallback controlado a los valores predeterminados.
- **Saneamiento XSS**: toda cadena introducida por el usuario se escapa antes de insertarse en el DOM; no se usa `innerHTML` con datos sin sanear.
- **Rendimiento**: búsqueda, filtros y renderizado se validan con 500 clientes y sus registros asociados (≤10 s búsqueda, ≤2 s renderizado inicial).
- **Accesibilidad**: etiquetas asociadas a campos, orden de foco lógico, `aria-current` en la navegación, encabezados semánticos y contraste suficiente.

## Decisiones de la interfaz SaaS

- **Selector de iconos**: SVG inline con `stroke="currentColor"` y tamaños controlados por CSS.
- **Ancho de la barra lateral**: 260 px expandida y 64 px contraída en escritorio; capa superpuesta a ≤ 900 px.
- **Persistencia del estado del menú**: `sessionStorage['erp.sidebarCollapsed']`, lectura antes de enlazar eventos, escritura en cada alternancia y borrado en cierre de sesión.
- **Fuente de métricas del Dashboard**: `getCRMOverview()` (base canónica) y `computeConversionRate()` para tasa de conversión. Las vistas no deben crear una fuente paralela.
- **Adaptador del formulario estático**: el alta/edición de `#entity-form` se sincroniza con la fuente canónica que alimenta los KPI.
- **Codificación y mojibake**: `<meta charset="UTF-8" />`, revisión de literales en español, inserción de texto con `textContent` y prueba contra U+FFFD/secuencias mojibake.

## Decisiones US16–US24 (correcciones incrementales)

### US16 - Tema oscuro coherente

- **Decisión**: Completar el dark mode mediante tokens/variables CSS y reemplazo de colores fijos en componentes críticos (`.topbar`, `.form-section`, `.action-button`, `.empty-state`, `.search-*`, `.confirm-dialog-card`, `.logout-button`, login/form controls, badges/estados).
- **Rationale**: Ya existe `crm.theme`, `applyTheme()` y un script temprano en `index.html`; el defecto actual es cobertura incompleta de estilos, no falta de mecanismo.
- **Alternativas**: Crear una hoja de tema separada (más mantenimiento); usar clases por componente sin variables (propenso a regresión). Se descarta duplicar lógica JS.

### US17 - Dashboard coherente con oportunidades gestionadas

- **Decisión**: Establecer una única fuente de verdad para oportunidades del dashboard. La UI de oportunidades debe persistir en la estructura que `getCRMOverview()` consume (`crm_module:opportunities`) mediante un adaptador de normalización; `erp_base_module:documents` puede mantenerse solo como compatibilidad temporal si se sincroniza desde la misma operación.
- **Rationale**: Hoy `handleDocumentSubmit()` guarda en documentos base y el dashboard lee overview CRM, causando KPIs desactualizados. La corrección debe eliminar la divergencia, no duplicar cálculos.
- **Alternativas**: Hacer que `getCRMOverview()` lea también documentos base (rápido pero perpetúa dualidad); migración completa a CRM opportunities (más limpia). Se prefiere adaptador canónico con sincronización en una sola operación y pruebas de regresión.

### US18 - Recordar mi sesión

- **Decisión**: Implementar persistencia condicionada por `#login-remember`. Marcado: guardar sesión en `localStorage` y limpiar copia en `sessionStorage`; desmarcado: guardar en `sessionStorage` y limpiar `localStorage`. `isAuthenticated()`/arranque consulta ambas. Cierre de sesión limpia ambas.
- **Rationale**: El control ya existe en UI; la expectativa del usuario y FR-078 favorecen comportamiento real. `sessionStorage` representa sesión de navegador/pestaña; es el mejor ajuste frontend sin backend.
- **Alternativas**: Eliminar checkbox (alcance menor, pero pierde funcionalidad visible); cookie con expiración (innecesaria en MVP frontend). Se descarta eliminar por ahora.

### US19 - Confirmación de eliminación accesible

- **Decisión**: Reemplazar `window.confirm()` por un diálogo modal del CRM reutilizable, con `role="dialog"`, `aria-modal="true"`, mensaje, Confirmar/Cancelar, focus trap, Escape, y restauración de foco al disparador.
- **Rationale**: `confirm()` no es estilizable, no consistente, y tiene accesibilidad/comportamiento variable. El proyecto ya tiene patrón de diálogo (`#unsaved-dialog`).
- **Alternativas**: Mantener `confirm()` (incumple FR-079/080); crear diálogo por entidad (duplicación). Se elige componente/patrón reutilizable.

### US20 - Búsqueda de clientes y oportunidades

- **Decisión**: Extender la búsqueda a resultados tipados de clientes y oportunidades. Cada resultado muestra tipo, etiqueta principal y detalle; al seleccionar navega a la vista correspondiente y precarga el registro.
- **Rationale**: FR-081/082 exigen alcance claro y navegación. La vista ya existe (`#view-search`).
- **Alternativas**: Dos cajas de búsqueda separadas (más UI, menos simple); solo aclarar texto (no cumple valor). Se elige búsqueda unificada con tipo visible.

### US21 - Listas escalables para editar/eliminar

- **Decisión**: Añadir listados/tablas en Clientes y Oportunidades con acciones por fila (Editar/Eliminar). El `<select>` existente puede mantenerse temporalmente como compatibilidad, pero la gestión principal pasa a la lista.
- **Rationale**: Selects no escalan y FR-083/084 piden gestión por fila y sincronización con formulario.
- **Alternativas**: Solo mejorar select con búsqueda (insuficiente); virtualización compleja (innecesaria para 50-500 en MVP). Se usa renderizado simple en memoria.

### US22 - Restaurar vista activa tras recargar

- **Decisión**: Persistir la última vista interna válida en `localStorage` (clave dedicada, p.ej. `erp.activeView`) al navegar; restaurar al iniciar solo si autenticado y vista en whitelist; fallback a dashboard.
- **Rationale**: Mejora continuidad y es de bajo riesgo con whitelist/fallback.
- **Alternativas**: Usar `location.hash` (visible pero cambia contrato de URL); `sessionStorage` (no cubre recarga con nueva sesión navegador según expectativa; localStorage es aceptable para vista UI). Se elige `localStorage` con validación.

### US23 - Accesibilidad completa en formularios y diálogos

- **Decisión**: Estandarizar accesibilidad: campos inválidos reciben `aria-invalid="true"` y `aria-describedby` al mensaje; foco al primer inválido en submit; todos los diálogos modales usan focus trap, Escape, y restauración de foco. `#unsaved-dialog` debe alinearse también.
- **Rationale**: FR-086/087 y SC-029 requieren comportamiento verificable por teclado/AT.
- **Alternativas**: Solo `role="alert"` (insuficiente para asociación de campo); librería de focus trap (dependencia nueva, innecesaria). Se implementa utilidad pequeña local.

### US24 - Moneda clara y consistente

- **Decisión**: Regla MVP explícita: KPI agregados del dashboard se expresan en moneda base `CLP` (etiqueta visible) y no mezclan monedas. Montos individuales muestran la moneda del registro cuando exista; si falta, se normaliza a CLP. `formatCurrency` recibe moneda/config.
- **Rationale**: Hay ambigüedad actual: `formatCurrency()` fija CLP, formularios permiten capturar moneda.
- **Alternativas**: Conversión automática multi-moneda (fuera de MVP, requiere tasas); bloquear captura a CLP solamente (simple, pero menos flexible). Se elige regla clara con normalización y etiquetado; si se detectan monedas mixtas, agregados usan solo CLP con nota/normalización definida por implementación y tests.

## Riesgos / Deuda conocida

- `src/components/*` es arquitectura histórica no conectada; no se debe reactivar.
- Existe dualidad `erp_base_module:*` y `crm_module:*`; US17 debe reducirla sin romper tests heredados.
- `app.js` concentra mucha lógica; los cambios deben ser quirúrgicos y cubrirse con pruebas.
- La accesibilidad de diálogos custom requiere cuidado con foco y listeners para no filtrar eventos globales.