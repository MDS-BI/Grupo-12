# Código del diagrama — CRM (DBML)

Código fuente del diagrama entidad-relación en formato **DBML**, compatible con <https://dbdiagram.io/d>.

```dbml
// CRM - Modelo Entidad-Relación (entrega inicial)

Table Cliente {
  id_cliente int [pk]
  nombre_empresa varchar
  persona_contacto varchar
  correo varchar
  telefono varchar
  estado_cliente varchar
}

Table Empleado {
  id_empleado int [pk]
  nombre varchar
  cargo varchar
}

Table Oportunidad {
  id_oportunidad int [pk]
  id_cliente int
  id_empleado int
  descripcion varchar
  monto_estimado decimal
  etapa varchar
  fecha_estimada_cierre date
}

Table Interaccion {
  id_interaccion int [pk]
  id_cliente int
  id_empleado int
  fecha date
  tipo_interaccion varchar
  descripcion varchar
}

Ref: Cliente.id_cliente < Oportunidad.id_cliente
Ref: Empleado.id_empleado < Oportunidad.id_empleado
Ref: Cliente.id_cliente < Interaccion.id_cliente
Ref: Empleado.id_empleado < Interaccion.id_empleado
```
