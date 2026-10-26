# Plan de Implementación: Módulo Base de Software de Planificación de Recursos Empresariales (ERP)

**Rama**: `001-erp-base-module` | **Fecha**: 2026-07-08 | **Especificación**: [spec.md](spec.md)
**Entrada**: Especificación de la funcionalidad desde `/specs/001-erp-base-module/spec.md`

## Resumen

Desarrollar un módulo de **Customer Relationship Management (CRM)** integrado a un sistema ERP que permita administrar clientes, registrar interacciones comerciales y realizar seguimiento de oportunidades de venta, centralizando la información comercial de la empresa mediante una interfaz sencilla y funcional. El desarrollo se organiza en cinco etapas: diseño (funcionalidades y modelo entidad-relación), especificaciones (tareas y artefactos bajo *Spec Driven Development*), implementación (interfaz del CRM usando el template proporcionado), pruebas y entrega del MVP con su documentación. El **MVP**(Producto minimo viable) permitirá registrar y administrar clientes, consultar interacciones y gestionar oportunidades de venta con sus etapas, montos y empleados responsables; estará enfocado en el **frontend** y usará **datos ficticios** para evitar exponer información personal real. La descripción completa del módulo, los usuarios, el Modelo Entidad-Relación y las reglas del dominio se documentan en [`crm_mer.md`](../../Primer%20Avance/crm_mer.md). Los principales riesgos (transiciones de etapa mal delimitadas, catálogo de empleados incompleto, falta de validaciones y crecimiento del alcance) se mitigan definiendo la tabla de estados en el diseño, cargando los responsables antes de implementar, incorporando validaciones y congelando el alcance tras el MVP. Como mejoras futuras se contemplan reportes de ventas e indicadores comerciales, recordatorios automáticos de seguimiento e integración avanzada con otros módulos del ERP. Además, el alcance incluirá las siguientes **features** (funcionalidades) del CRM: gestión de clientes (alta, edición, consulta y estado `Posible/Activo/Inactivo`), catálogo de empleados responsables, gestión de oportunidades con monto, fecha de cierre y avance secuencial de etapas (`Evaluación → Propuesta → Negociación → Ganado/Perdido`), registro de interacciones (`Llamada/Correo/Reunión`), vista de detalle del cliente con su historial, dashboard con indicadores comerciales, búsqueda y filtros, validaciones e integridad referencial, y configuración del módulo para adaptar terminología y campos.

## Contexto Técnico

**Lenguaje/Versión**: JavaScript (ES2022), HTML, CSS  
**Dependencias Principales**: Vite, sin framework de interfaz pesado  
**Almacenamiento**: localStorage del navegador para una instancia del módulo de espacio único  
**Pruebas**: Vitest con jsdom para pruebas unitarias y de interacción  
**Plataforma Objetivo**: Navegadores modernos de escritorio y móviles  
**Tipo de Proyecto**: Aplicación web  
**Objetivos de Rendimiento**: Interacciones responsivas para listas de hasta 500 registros; la búsqueda y las actualizaciones de la interfaz deben sentirse instantáneas  
**Restricciones**: Huella mínima de librerías, despliegue simple, sin backend requerido; la estructura debe mantenerse extensible para módulos personalizados  
**Escala/Alcance**: Módulo base con CRUD de datos maestros (Entidad) y documentos transaccionales (Documento), búsqueda y capacidades de navegación

## Verificación de la Constitución

*COMPROBACIÓN: Debe pasar antes de la investigación de la Fase 0. Reverificar tras el diseño de la Fase 1.*

- Calidad: La implementación usará una estructura JavaScript pequeña y modular con límites de función claros y nomenclatura consistente, manteniendo las preocupaciones base (almacenamiento, identidad, integridad referencial) separadas de la lógica específica del dominio para que los módulos personalizados puedan extenderlas.
- Pruebas: Los flujos centrales de crear, editar, eliminar y buscar estarán cubiertos por pruebas automatizadas antes de completar.
- Experiencia de Usuario: La interfaz proporcionará mensajes de validación claros, estados vacíos y comportamiento de formulario consistente, presentados dentro de un marco de espacio de trabajo ERP con marca (barra superior + barra lateral) que se ve y se comporta idénticamente en todas las pantallas.
- Rendimiento: La búsqueda y el renderizado de listas se optimizarán para colecciones de hasta 500 registros usando actualizaciones ligeras del DOM.

## Estructura del Proyecto

### Documentación (esta funcionalidad)

```text
specs/001-erp-base-module/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Código Fuente (raíz del repositorio)

```text
src/
├── main.js
├── styles.css
├── storage.js
├── app.js
├── module-config.js
└── components/
    ├── shell.js        (marco del espacio de trabajo: barra superior, logotipo SVG, barra lateral, estado de módulo activo)
    ├── dashboard.js    (vista de inicio: cuadrícula de acciones rápidas + tarjetas de estadísticas en vivo)
    ├── entity-form.js  (formulario de creación/edición de entidades con campos personalizados)
    └── document-form.js (formulario de creación/edición de documentos con campos personalizados y ciclo de vida de estados)

tests/
├── unit/
├── integration/
└── setup/
```

**Decisión de Estructura**: Una aplicación Vite simple con un único punto de entrada HTML, un pequeño conjunto de módulos JavaScript y CSS en un archivo separado. Se usará localStorage para la persistencia de modo que la aplicación permanezca ligera y autónoma. Los componentes se dividen en pares de entidad (datos maestros) y documento (transaccional) que reflejan los dos conceptos centrales del módulo base, de modo que un módulo personalizado pueda renombrar o extender cada par de forma independiente. `shell.js` posee el marco del espacio de trabajo ERP — un logotipo monograma SVG en línea derivado del nombre del módulo, la barra superior y la barra lateral de módulos — envolviendo todas las vistas para que la marca y la navegación permanezcan consistentes sin duplicar marcado. `dashboard.js` renderiza los botones de acción rápida y las tarjetas de estadísticas de la pantalla de entrada, leyendo los recuentos del almacenamiento cada vez que se vuelve visible. `module-config.js` centraliza todos los puntos de adaptación — nombre del módulo, etiquetas de términos, definiciones de campos personalizados, ciclo de vida de estados y color de acento — manteniendo la personalización del dominio fuera del código central; el estilo se controla mediante propiedades personalizadas de CSS (tokens de diseño) en `styles.css` para que el color de acento configurado se aplique globalmente.

## Seguimiento de Complejidad

Este plan no introdujo violaciones de la constitución.
