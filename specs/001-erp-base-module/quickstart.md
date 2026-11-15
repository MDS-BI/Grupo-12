# Inicio Rápido: Módulo CRM (Customer Relationship Management)

## Configuración

1. Instale las dependencias con `npm install`.
2. Inicie el servidor de desarrollo con `npm run dev`.
3. Abra la URL local de Vite en un navegador.

## Flujo de Usuario Principal

1. Aterrice en el dashboard CRM y use un acceso rápido para crear un cliente, una oportunidad o una interacción.
2. Cree un empleado en el catálogo (nombre y cargo) antes de registrar oportunidades o interacciones.
3. Cree un cliente con nombre de empresa, persona de contacto, correo y teléfono; verifique que su estado inicial es `Posible`.
4. Cree una oportunidad asociada a un cliente y a un empleado, con monto estimado y fecha de cierre; aváncela por las etapas permitidas.
5. Registre una interacción (`Llamada`, `Correo` o `Reunión`) y consulte el historial en la ficha 360° del cliente.
6. Busque clientes y filtre oportunidades por etapa, responsable y rango de fecha de cierre.
7. Archive un cliente o empleado y confirme que sus oportunidades e interacciones se conservan y que deja de ofrecerse para nuevos registros.
8. Cambie entre módulos usando la barra lateral y actualice la página para confirmar que los datos persisten y que el marco con marca permanece consistente.

## Validación

- Verifique que los campos obligatorios de cliente, empleado, oportunidad e interacción muestran errores claros.
- Verifique que un correo de cliente con formato inválido o duplicado (sin distinguir mayúsculas) se rechaza.
- Verifique que un monto negativo o una fecha de cierre vacía/inválida se rechazan.
- Verifique que solo se permiten las transiciones de etapa definidas y que `Ganado`/`Perdido` son terminales.
- Verifique que el dashboard muestra clientes activos, oportunidades abiertas, monto en pipeline y próximos cierres (30 días) coherentes con los datos.
- Verifique que una búsqueda o filtro sin resultados muestra un estado vacío claro.
- Verifique que archivar un cliente o empleado no elimina sus oportunidades ni interacciones.
- Verifique que la lista y los filtros siguen siendo responsivos con 500 clientes y sus registros asociados.

## Extender el Módulo

Los módulos ERP personalizados adaptan el CRM mediante un único archivo de configuración (`src/module-config.js`) en lugar de editar el código central:

1. Establezca el nombre del módulo y los mapeos de términos (p. ej., Cliente → Cuenta, Oportunidad → Venta); cada pantalla se reetiqueta, incluida la barra lateral y el logotipo.
2. Declare campos personalizados por tipo de registro (texto, número, fecha, selección) — aparecen automáticamente en formularios, listas, validación y búsqueda.
3. Redefina el ciclo de vida de las oportunidades y sus transiciones permitidas si el dominio lo requiere.
4. Opcionalmente establezca `theme.accentColor` para remarcar los resaltados y controles principales del espacio de trabajo.
5. Añada reglas de validación específicas del módulo junto a las reglas base donde sea necesario.

La generación de identidad, marcas de tiempo, unicidad de correo, integridad referencial, eliminación lógica, navegación y búsqueda siguen siendo gestionadas por el módulo base. Sin archivo de configuración, la aplicación se ejecuta con el comportamiento predeterminado del CRM. Consulte `specs/001-erp-base-module/` para la especificación completa.
