# Investigación: Módulo CRM (Customer Relationship Management)

## Decisión: Usar Vite con HTML, CSS y JavaScript vanilla

**Justificación**: El alcance del MVP es un módulo CRM de frontend con datos ficticios. Vite proporciona un flujo de desarrollo rápido y una compilación simple sin añadir un framework pesado. JavaScript vanilla mantiene el módulo fácil de entender, probar y extender por otros módulos ERP.

**Alternativas consideradas**

- React o Vue: mejor ecosistema de componentes, pero añade abstracción y dependencias innecesarias para el alcance actual.
- HTML estático sin Vite: más simple, pero Vite ofrece un mejor flujo de desarrollo y un paso de construcción para crecimiento futuro.
- Persistencia con backend y base de datos: innecesaria para un módulo de espacio único; la capa de almacenamiento está aislada, por lo que un backend puede introducirse más adelante sin reescribir la lógica de dominio.

## Decisiones adicionales

- **Persistencia**: `localStorage` del navegador para clientes, empleados, oportunidades e interacciones; sin backend ni autenticación en el MVP.
- **Modelo de dominio**: cuatro entidades (Cliente, Empleado, Oportunidad, Interacción) según el MER. Se separan los datos maestros (cliente/empleado) de los registros transaccionales (oportunidad/interacción) para que los módulos personalizados extiendan cada lado sin cambios estructurales.
- **Eliminación lógica**: clientes y empleados se archivan (`archived`), preservando sus oportunidades e interacciones. No se implementa eliminación en cascada. Las oportunidades e interacciones admiten eliminación física.
- **Unicidad de correo**: la capa de almacenamiento normaliza el correo (trim + minúsculas) y rechaza duplicados entre todos los clientes.
- **Transiciones de etapa**: se modelan como tabla declarativa en `domain.js` y pueden redefinirse mediante `ModuleConfig.opportunityLifecycle`; por defecto `Evaluación → Propuesta → Negociación` con cierre en `Ganado` (solo desde `Negociación`) o `Perdido` (desde cualquier etapa no terminal). `Ganado` y `Perdido` son terminales.
- **Indicadores del dashboard**: se calculan en el momento de mostrar la pantalla a partir del almacenamiento. Clientes activos = estado `Activo` y no archivados; oportunidades abiertas = etapa distinta de `Ganado`/`Perdido`; pipeline = suma de montos de oportunidades abiertas; próximos cierres = oportunidades abiertas con fecha entre hoy y los próximos 30 días (excluye vencidas).
- **Seguridad**: todo texto introducido por el usuario se escapa antes de renderizarse para prevenir inyección de scripts.
- **Pruebas**: Vitest + jsdom; pruebas unitarias para dominio/almacenamiento y pruebas de integración para los flujos de interfaz de cada historia.
- **Extensibilidad**: `module-config.js` permite cambiar nombre, etiquetas, campos personalizados, ciclo de vida y color de acento sin editar el código central; sin configuración se aplican los valores predeterminados del CRM.
