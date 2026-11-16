Feedback Avance 01 (26/10/26)

- hay que preserver la estructura del modulo de Desarrollo para que speckit funcione (es decir dentro de specs bajo 002, por ejemplo).
- modelo es demasiado simple para generar tareas y US.
- falta editar README

Proximos pasos:
 
- rectificar puntos anteriores 
- trabajar en los specs (historias de usuario, US) para definir tareas
- dividirse las US y tareas para una siguiente iteracion (avances cada semana)
- ejecutar una version integrada de prueba

  Feedback Avance 02 (2/11/26)

- No hubo avance del proyecto esta semana
- Evitar trabajar con modelos de IA fuera de speckit en local, porque crean ramas nuevas y se pierde la integridad del proyecto

Proximos pasos:

- rectificar puntos anteriores y crear tareas a partir de los specs
- hacer primera implmentacion, registar modificaciones/incremental y volver al spec
- dividir el grupo entre modificaciones (ajustes previos) e incremental (nueva funcionalidad)
- integrar nueva version en 2 semanas

Feedback Avance 03 (16/11/26)

- No hubo implementacion a la fecha de revision, fue ingresada manualmente por el profesor.
- spec.md y tasks.md pasaron del módulo base ERP al módulo CRM (10 historias, FR-001 a FR-046, tareas T001–T074). Son coherentes entre sí y se referencian por ID. Pero todas las tareas siguen sin marcar [ ], aunque hay código implementado.
- La carpeta sigue llamándose 001-erp-base-module, y spec.md aún dice "Rama: 001-erp-base-module".

Consistencia sitio–especificación:

- index.html y src/app.js siguen siendo el ERP genérico: formulario con Código, RFC, Límite de crédito, y de oportunidad con Serie, Folio, Subtotal. No cumple FR-001, FR-010 ni FR-011. T020 y T030 no cumplidas, aunque existen los componentes src/components/.
- src/app.js usa deleteEntity (borrado físico) y no el archivado lógico de storage.js (FR-024, T055–T056). Faltan Empleados e Interacciones en la barra lateral (FR-038, T067).
- src/storage.js, src/domain.js y src/module-config.js tienen lógica CRM, pero con campos distintos (companyName/etapa/stage) y dos conjuntos de almacenamiento. Dashboard del sitio cuenta registros, no los 4 indicadores de FR-026.
- El login (Cliente1/1234) en src/main.js no está en spec.md ni tasks.md.
- hacer mejoras de funcionalidad e interfaz de usuario, incluir data simulada para probar campos, incluir mejoras de estilo, transicion, navegacion, etcetera.

Presentacion de MVP final en 2 semanas.
