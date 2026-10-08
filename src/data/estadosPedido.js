const estadosPedido = [
  { valor: 'Pendiente', texto: 'Pendiente', clase: 'pendiente' },
  { valor: 'En preparación', texto: 'En preparación', clase: 'preparacion' },
  { valor: 'Listo', texto: 'Listo para retirar', clase: 'listo' },
  { valor: 'Entregado', texto: 'Entregado', clase: 'entregado' },
  { valor: 'Cancelado', texto: 'Cancelado', clase: 'cancelado' }
];

export function claseEstado(estado) {
  return estadosPedido.find((opcion) => opcion.valor === estado)?.clase;
}

export function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

export function calcularTotal(pedido) {
  return pedido.items.reduce(
    (total, item) => total + item.cantidad * item.precioUnitario,
    0
  );
}

export default estadosPedido;
