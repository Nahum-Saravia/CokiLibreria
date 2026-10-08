import productosIniciales from './productos';
import pedidosIniciales from './pedidos';

const CLAVE_PRODUCTOS = 'coki-productos';
const CLAVE_PEDIDOS = 'coki-pedidos';
const CLAVE_CARRITO = 'coki-carrito';

function leer(clave, valorInicial) {
  const guardado = localStorage.getItem(clave);

  if (!guardado) {
    return valorInicial;
  }

  try {
    return JSON.parse(guardado);
  } catch {
    localStorage.removeItem(clave);
    return valorInicial;
  }
}

export function leerProductos() {
  const guardados = leer(CLAVE_PRODUCTOS, productosIniciales);

  return guardados.map((producto) => {
    const original = productosIniciales.find((item) => item.id === producto.id);
    return original ? { ...producto, imagen: original.imagen } : producto;
  });
}

export function guardarProductos(productos) {
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
}

// Pedidos de ejemplo que pueden haber quedado guardados en el navegador
const PEDIDOS_DE_EJEMPLO = [
  '#1048 Martina López',
  '#1047 Tomás García',
  '#1046 Lucía Fernández',
  '#1045 Joaquín Pérez',
  '#1044 Valentina Ruiz'
];

export function leerPedidos() {
  const guardados = leer(CLAVE_PEDIDOS, pedidosIniciales);
  const pedidos = guardados.filter(
    (pedido) => !PEDIDOS_DE_EJEMPLO.includes(`${pedido.retiro} ${pedido.cliente}`)
  );

  if (pedidos.length !== guardados.length) {
    guardarPedidos(pedidos);
  }

  return pedidos;
}

export function guardarPedidos(pedidos) {
  localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos));
}

export function formatearFecha(fecha) {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');

  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function siguienteNumeroRetiro(pedidos) {
  const numeros = pedidos.map((pedido) => Number(pedido.retiro.replace('#', '')));
  return `#${Math.max(1000, ...numeros) + 1}`;
}

export function crearPedido({ cliente, telefono, notas }) {
  const carrito = leer(CLAVE_CARRITO, []);

  if (carrito.length === 0) {
    return { error: 'El carrito está vacío.' };
  }

  const productos = leerProductos();

  const sinStock = carrito.filter((item) => {
    const producto = productos.find((p) => p.id === item.id);
    return producto && producto.stock < item.cantidad;
  });

  if (sinStock.length > 0) {
    const nombres = sinStock.map((item) => item.nombre).join(', ');
    return { error: `No hay stock suficiente de: ${nombres}.` };
  }

  const pedidos = leerPedidos();

  const nuevoPedido = {
    retiro: siguienteNumeroRetiro(pedidos),
    cliente,
    telefono,
    fecha: formatearFecha(new Date()),
    detalle:
      carrito.length === 1
        ? carrito[0].nombre
        : `${carrito[0].nombre} y ${carrito.length - 1} más`,
    estado: 'Pendiente',
    items: carrito.map((item) => ({
      producto: item.nombre,
      cantidad: item.cantidad,
      precioUnitario: item.precio
    })),
    notas
  };

  guardarPedidos([nuevoPedido, ...pedidos]);

  guardarProductos(
    productos.map((producto) => {
      const item = carrito.find((i) => i.id === producto.id);
      return item ? { ...producto, stock: producto.stock - item.cantidad } : producto;
    })
  );

  localStorage.removeItem(CLAVE_CARRITO);

  window.dispatchEvent(new Event('carritoActualizado'));
  window.dispatchEvent(new Event('pedidosActualizados'));
  window.dispatchEvent(new Event('productosActualizados'));

  return { pedido: nuevoPedido };
}

export function buscarPedidos(texto) {
  const limpiar = (valor) => valor.replace('#', '').replace(/[\s-]/g, '');
  const buscado = limpiar(texto.trim());

  return leerPedidos().filter(
    (pedido) => limpiar(pedido.retiro) === buscado || limpiar(pedido.telefono) === buscado
  );
}
