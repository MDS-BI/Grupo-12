# CRM Module (Vite + Vanilla JS)

Módulo CRM de página única construido con Vite, HTML, CSS y JavaScript vanilla (ES2022). La interfaz se ejecuta sobre el DOM real (`index.html`, `src/main.js`, `src/app.js`, `src/storage.js`, `src/module-config.js`) y persiste datos en `localStorage`.

La interfaz está en **español** e incluye validaciones, estados vacíos, diálogos y mensajes de error claros.

## Flujos CRM

- **Acceso**: pantalla dividida con login (`Cliente1` / `1234`) y control de mostrar/ocultar contraseña sin perder el valor ingresado.
- **Dashboard**: banner de bienvenida, accesos rápidos y KPI calculados desde los datos vigentes (`getCRMOverview()`): clientes activos, oportunidades activas, monto en pipeline y tasa de conversión. Los clientes archivados se excluyen del conteo de clientes activos, pero sus oportunidades abiertas siguen contando en oportunidades/pipeline/próximos cierres según la regla por etapa (FR-068).
- **Clientes (Entidades)**: alta, edición, selección y eliminación desde `#entity-form`. Los campos obligatorios y de contacto se validan antes de guardar.
- **Oportunidades/Documentos**: alta, edición, selección y eliminación desde `#document-form`, con estado/ciclo de vida configurable.
- **Búsqueda**: búsqueda de entidades por contenido visible; los campos personalizados eliminados de la configuración no participan en búsqueda ni se muestran (FR-071).
- **Navegación con cambios sin guardar**: al intentar navegar dentro de la app con cambios en formularios CRM, se muestra un diálogo con **Permanecer** / **Descartar** (FR-070).

## Archivado lógico

- El archivado se representa con el indicador `archived` en registros CRM.
- Los clientes archivados no cuentan como “Clientes activos”.
- Las oportunidades abiertas se determinan por etapa (no terminal); una oportunidad abierta de un cliente archivado sigue contando en oportunidades abiertas, pipeline y próximos cierres.
- El correo electrónico de un cliente archivado permanece reservado: `isEmailAvailable()` y la validación de cliente rechazan su reutilización (FR-069).

## Configuración del módulo

La configuración se normaliza en `src/module-config.js` (`normalizeConfig`, `getConfig`, `setActiveConfig`):

- `moduleName`: nombre visible del módulo.
- `labels`: etiquetas de navegación y textos; admite alias legados (`clientes`/`cliente`, etc.) mapeados a claves canónicas.
- `customFields`: campos personalizados por target (`entity`/`document`), con tipo, opciones y obligatoriedad. Los campos visibles se derivan de la configuración activa; los valores huérfanos se conservan en almacenamiento pero no se muestran ni editan.
- `statusLifecycle`: estados/transiciones para documentos.
- `theme.accentColor`: color de acento aplicado por CSS variables.

## Tema claro/oscuro

- El espacio de trabajo expone el selector `Claro`/`Oscuro`.
- La preferencia se guarda en `localStorage['crm.theme']` y se aplica antes del primer render visible desde `index.html`/`src/main.js` (sin transición visible de tema).
- El tema no se guarda en claves `crm_module:*` ni `erp_*`.

## Recuperación de storage

- `src/storage.js` valida las claves CRM `crm_module:customers/employees/opportunities/interactions`.
- Estado válido: clave ausente o arreglo JSON válido con forma esperada.
- Estado corrupto: JSON inválido o forma incorrecta. La app muestra un panel de error con acción explícita **Reiniciar datos corruptos**; no sobrescribe automáticamente.
- El reinicio escribe arreglos vacíos solo en claves `crm_module:*` y conserva claves de sesión/tema (por ejemplo `erp.authenticatedUser`, `crm.theme`).

## Setup

```bash
npm install
npm run dev
```

Abrir la URL que imprime Vite (normalmente `http://localhost:5173`).

## Verificación

```bash
npm run test:run
npm run lint
npm run build
```

## Notas

- Persistencia en `localStorage`: entidades/documentos base (`erp_base_module:*`) y datos CRM (`crm_module:*`).
- Claves especiales: `erp.authenticatedUser`, `erp.sidebarCollapsed`, `crm.theme`.
- La arquitectura histórica `src/components/*` se conserva como referencia; la ruta activa y validada es el DOM real en `index.html` + `src/*`.
