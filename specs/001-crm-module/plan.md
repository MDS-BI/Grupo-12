# Plan de Implementación: Módulo CRM (Customer Relationship Management)

**Rama**: `001-crm-module` | **Fecha**: 2026-07-08 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificación de la funcionalidad desde `/specs/001-crm-module/spec.md`

## Resumen

Desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP que permita administrar clientes, mantener un catálogo de empleados responsables, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta. El MVP estará enfocado en el **frontend**, usará **datos ficticios** y persistirá en el navegador; no incluye backend, autenticación ni roles.

El alcance funcional se organiza en las historias de la especificación: gestión de clientes con estado `Posible/Activo/Inactivo`, catálogo de empleados, oportunidades con monto, fecha de cierre y transiciones de etapa (`Evaluación → Propuesta → Negociación → Ganado/Perdido`), registro de interacciones (`Llamada/Correo/Reunión`), ficha 360° del cliente, dashboard con indicadores, búsqueda y filtros, integridad referencial con eliminación lógica, configuración del módulo y un espacio de trabajo consistente.

El modelo de dominio y las reglas se documentan en [data-model.md](data-model.md) y en el MER de referencia [`../../Primer Avance/crm_mer.md`](../../Primer%20Avance/crm_mer.md).

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS  
**Dependencias Principales**: Vite, sin framework de interfaz pesado  
**Almacenamiento**: `localStorage` del navegador para una instancia de espacio único  
**Pruebas**: Vitest con jsdom para pruebas unitarias y de integración  
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles  
**Tipo de Proyecto**: Aplicación web de página única  
**Objetivos de Rendimiento**: Búsqueda, filtros y renderizado responsivos para al menos 500 clientes y sus oportunidades e interacciones asociadas (FR-042, SC-004)  
**Restricciones**: Huella mínima de librerías, despliegue simple, sin backend; estructura extensible para módulos personalizados  
**Seguridad**: Todo contenido introducido por el usuario se sanitiza antes de renderizarse (FR-041)

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- **Calidad (I)**: La implementación usará módulos JavaScript pequeños y enfocados (dominio, almacenamiento, sanitización, configuración, componentes de vista), con nombres consistentes y límites claros entre la capa de persistencia y la lógica de presentación.
- **Pruebas (II)**: Cada historia de usuario incluirá pruebas unitarias de la lógica de dominio/almacenamiento y pruebas de integración del flujo de interfaz **antes o junto a** la implementación. Los flujos críticos (alta de cliente, transiciones de etapa, archivado con preservación de historial, unicidad de correo, dashboard, búsqueda/filtros) tendrán cobertura automatizada y no se considerarán completos hasta que las pruebas pasen.
- **Experiencia de Usuario (III)**: Todas las pantallas compartirán un marco con barra superior y barra lateral, mensajes de validación claros, estados vacíos explícitos y retroalimentación consistente; la navegación será operable en ventanas estrechas.
- **Rendimiento (IV)**: La búsqueda, los filtros y el renderizado de listas se optimizarán para 500 clientes y sus registros asociados; las actualizaciones del DOM serán ligeras y no habrá trabajo bloqueante evitable.

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/001-crm-module/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── crm-storage.md
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
index.html
src/
├── main.js              (punto de entrada: carga configuración y monta la app)
├── app.js               (enrutamiento por módulos y orquestación de vistas)
├── styles.css           (tokens de diseño, shell, formularios, listas, estados)
├── domain.js            (enumeraciones, reglas de transición, cálculos de dashboard)
├── storage.js           (repositorios localStorage, validación, unicidad, archivado, integridad)
├── sanitize.js          (escape de contenido introducido por el usuario)
├── module-config.js     (carga/validación de configuración y valores por defecto)
└── components/
    ├── shell.js         (barra superior, logotipo SVG, barra lateral, módulo activo)
    ├── dashboard.js     (indicadores comerciales + accesos rápidos)
    ├── client-form.js   (alta/edición de clientes)
    ├── client-list.js   (lista operativa de clientes)
    ├── client-detail.js (ficha 360°: datos + oportunidades + interacciones)
    ├── employee-form.js (alta/edición de empleados)
    ├── employee-list.js (catálogo de empleados)
    ├── opportunity-form.js (alta/edición + transición de etapa)
    ├── opportunity-list.js (lista con filtros por etapa, responsable y fecha)
    ├── interaction-form.js (registro de interacciones)
    ├── interaction-list.js (historial de interacciones)
    └── search.js        (búsqueda de clientes y filtros de oportunidades)

tests/
├── unit/
├── integration/
└── setup/
```

**Decisión de Estructura**: Una aplicación Vite simple con un único punto de entrada HTML, módulos JavaScript pequeños y CSS en un archivo separado. `storage.js` concentra la identidad, las marcas de tiempo, la unicidad del correo, la integridad referencial y la eliminación lógica; `domain.js` contiene las enumeraciones y las reglas de transición/cálculo para que las vistas no dupliquen lógica. `module-config.js` centraliza los puntos de adaptación (nombre, etiquetas, campos personalizados, ciclo de vida de oportunidades y color de acento). `shell.js` envuelve todas las vistas para que la marca y la navegación permanezcan consistentes sin duplicar marcado. `sanitize.js` se aplica antes de insertar cualquier dato introducido por el usuario en el DOM. La separación cliente/empleado (datos maestros) frente a oportunidad/interacción (registros transaccionales) refleja el MER y permite que los módulos personalizados reutilicen cada par de forma independiente.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución. La eliminación lógica (en lugar de cascada) y la unicidad de correo se resuelven en la capa de almacenamiento para mantener la integridad referencial sin acoplar las vistas a las reglas de dominio.
