import productosIniciales from './productos';
import pedidosIniciales from './pedidos';

const CLAVE_PRODUCTOS = 'coki-productos';
const CLAVE_PEDIDOS = 'coki-pedidos';
const CLAVE_CARRITO = 'coki-carrito';
const CLAVE_USUARIOS = 'coki-usuarios';
const CLAVE_USUARIO_ACTUAL = 'coki-usuario-actual';

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

// Usuarios y sesión

function leerUsuarios() {
  return leer(CLAVE_USUARIOS, []);
}

function normalizarCorreo(correo) {
  return correo.trim().toLowerCase();
}

export function registrarUsuario(nombre, correo, contrasena) {
  const usuarios = leerUsuarios();
  const correoNormalizado = normalizarCorreo(correo);

  if (usuarios.some((usuario) => usuario.correo === correoNormalizado)) {
    return { error: 'Ya existe una cuenta con ese correo electrónico.' };
  }

  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify([
      ...usuarios,
      { nombre: nombre.trim(), correo: correoNormalizado, contrasena }
    ])
  );

  return { ok: true };
}

export function validarUsuario(correo, contrasena) {
  const correoNormalizado = normalizarCorreo(correo);
  const usuario = leerUsuarios().find((item) => item.correo === correoNormalizado);

  if (!usuario) {
    return { error: 'No existe una cuenta con ese correo. Registrate primero.' };
  }

  if (usuario.contrasena !== contrasena) {
    return { error: 'La contraseña es incorrecta.' };
  }

  return { ok: true };
}

// Devuelve { nombre, correo } del cliente logueado, o null si no hay ninguno
export function obtenerUsuarioActual() {
  const correo = localStorage.getItem(CLAVE_USUARIO_ACTUAL);

  if (!correo) {
    return null;
  }

  const usuario = leerUsuarios().find((item) => item.correo === correo);

  return { nombre: usuario?.nombre || '', correo };
}

// Cuenta fija del administrador
const ADMIN_CORREO = 'cokilibreria@gmail.com';
const ADMIN_CONTRASENA = 'cokiI1256';

export function validarAdmin(correo, contrasena) {
  return (
    normalizarCorreo(correo) === ADMIN_CORREO &&
    contrasena === ADMIN_CONTRASENA
  );
}

// Si se pasa un nombre, queda guardado en la cuenta para usarlo en los pedidos
export function iniciarSesion(tipoUsuario, correo = '', nombre = '') {
  localStorage.setItem('tipoUsuario', tipoUsuario);

  if (correo) {
    const correoNormalizado = normalizarCorreo(correo);

    localStorage.setItem(CLAVE_USUARIO_ACTUAL, correoNormalizado);

    if (nombre.trim()) {
      localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(
          leerUsuarios().map((usuario) =>
            usuario.correo === correoNormalizado
              ? { ...usuario, nombre: nombre.trim() }
              : usuario
          )
        )
      );
    }
  } else {
    localStorage.removeItem(CLAVE_USUARIO_ACTUAL);
  }

  window.dispatchEvent(new Event('sesionCambiada'));
  window.dispatchEvent(new Event('carritoActualizado'));
}

export function cerrarSesion() {
  localStorage.removeItem('tipoUsuario');
  localStorage.removeItem(CLAVE_USUARIO_ACTUAL);

  window.dispatchEvent(new Event('sesionCambiada'));
  window.dispatchEvent(new Event('carritoActualizado'));
}

// Carrito: cada cliente tiene el suyo; sin sesión se usa el carrito de invitado

function claveCarrito() {
  const usuario = localStorage.getItem(CLAVE_USUARIO_ACTUAL);
  return usuario ? `${CLAVE_CARRITO}-${usuario}` : CLAVE_CARRITO;
}

export function leerCarrito() {
  return leer(claveCarrito(), []);
}

// Puede lanzar si el carrito no entra en localStorage (por ejemplo, archivos grandes)
export function guardarCarrito(carrito) {
  localStorage.setItem(claveCarrito(), JSON.stringify(carrito));
}

export function vaciarCarrito() {
  localStorage.removeItem(claveCarrito());
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
  const carrito = leerCarrito();

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

  vaciarCarrito();

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
