# Plan de Pruebas QA - AlaBurger

## Objetivo
Verificar que los prototipos y endpoints del sistema AlaBurger cumplan
con las reglas de negocio definidas, sin fallos lógicos ni acciones
que generen mermas descontroladas.

---

## Casos de Prueba - Caja Negra

| ID | Caso de Prueba | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|----|---------------|---------|-------------------|-------------------|--------|
| CP-01 | Crear pedido con sucursal asignada | Pedido con sucursal válida | Pedido guardado correctamente | - | Pendiente |
| CP-02 | Crear pedido sin sucursal asignada | Pedido sin sucursal | API rechaza el pedido con error | - | Pendiente |
| CP-03 | Actualizar estado de pedido en cocina | Estado: "en preparación" | Estado actualizado correctamente | - | Pendiente |
| CP-04 | Cancelar pedido ya entregado | Pedido con estado "entregado" | Sistema rechaza la cancelación | - | Pendiente |
| CP-05 | Registrar ingrediente con stock en cero | Ingrediente agotado | Alerta de stock generada | - | Pendiente |

---

## Estrategia de Pruebas

### Caja Negra
Se validan entradas y salidas sin considerar el código interno.
Se verifica que el sistema responda correctamente ante datos válidos e inválidos.

### Regresión
Después de cada cambio en el sistema se vuelven a ejecutar todos los
casos de prueba para asegurar que nada se haya roto.

---

## Criterios de Aceptación
- Todos los casos de prueba deben pasar sin errores.
- La API debe rechazar pedidos sin sucursal asignada.
- No deben existir acciones que generen mermas descontroladas.