import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import './CartPanel.css';
import Alerta from '../Alerta/alerta';
import {
  leerPedidos,
  guardarPedidos
} from '../../data/almacenamiento';

const CLAVE_CARRITO = 'coki-carrito';

function leerCarrito() {
  const guardado = localStorage.getItem(CLAVE_CARRITO);

  if (!guardado) {
    return [];
  }

  try {
    return JSON.parse(guardado);
  } catch {
    localStorage.removeItem(CLAVE_CARRITO);
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(
    CLAVE_CARRITO,
    JSON.stringify(carrito)
  );
}

function formatearPrecio(precio) {
  return '$ ' + Number(precio).toLocaleString('es-AR');
}

function generarRetiro(pedidos) {
  const numeros = pedidos
    .map((pedido) =>
      Number(String(pedido.retiro).replace(/\D/g, ''))
    )
    .filter((numero) => Number.isFinite(numero));

  const ultimoNumero =
    numeros.length > 0
      ? Math.max(...numeros)
      : 1000;

  return `#${String(ultimoNumero + 1).padStart(4, '0')}`;
}

function obtenerFechaActual() {
  const hoy = new Date();

  return hoy.toLocaleDateString('es-AR');
}

function convertirItemsDelCarrito(carrito) {
  return carrito.map((item) => ({
    producto: item.esImpresion
      ? `Impresión - ${item.tipoImpresion}`
      : item.nombre,
    cantidad: Number(item.cantidad),
    precioUnitario: Number(item.precio) || 0
  }));
}

function obtenerNotas(carrito) {
  const impresiones = carrito.filter(
    (item) => item.esImpresion
  );

  if (impresiones.length === 0) {
    return '';
  }

  return impresiones
    .map((item, indice) => {
      return [
        `Impresión ${indice + 1}`,
        `Tipo de impresión: ${item.tipoImpresion}`,
        `Tipo de papel: ${item.tipoPapel}`,
        `Descripción: ${item.descripcion}`,
        `Archivo: ${item.archivo}`
      ].join('\n');
    })
    .join('\n\n');
}

function obtenerDetalle(carrito) {
  return carrito
    .map((item) => {
      if (item.esImpresion) {
        return `Impresión (${item.tipoImpresion}) x${item.cantidad}`;
      }

      return `${item.nombre} x${item.cantidad}`;
    })
    .join(' + ');
}

function CartPanel({
  abierto,
  onCerrar,
  onCarritoActualizado
}) {
  const [carrito, setCarrito] = useState(leerCarrito);
  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    const actualizarCarrito = () => {
      setCarrito(leerCarrito());
    };

    window.addEventListener(
      'carritoActualizado',
      actualizarCarrito
    );

    window.addEventListener(
      'storage',
      actualizarCarrito
    );

    return () => {
      window.removeEventListener(
        'carritoActualizado',
        actualizarCarrito
      );

      window.removeEventListener(
        'storage',
        actualizarCarrito
      );
    };
  }, []);

  useEffect(() => {
    const manejarEscape = (evento) => {
      if (evento.key !== 'Escape') {
        return;
      }

      if (mostrarConfirmacion) {
        setMostrarConfirmacion(false);
        return;
      }

      if (abierto) {
        onCerrar();
      }
    };

    document.addEventListener(
      'keydown',
      manejarEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        manejarEscape
      );
    };
  }, [
    abierto,
    mostrarConfirmacion,
    onCerrar
  ]);

  const actualizarCarrito = (nuevoCarrito) => {
    guardarCarrito(nuevoCarrito);
    setCarrito(nuevoCarrito);

    window.dispatchEvent(
      new Event('carritoActualizado')
    );

    if (onCarritoActualizado) {
      onCarritoActualizado(nuevoCarrito);
    }
  };

  const quitarCantidad = (idProducto) => {
    const cantidadSolicitada = Number(
      cantidades[idProducto] || 1
    );

    const nuevoCarrito = carrito
      .map((item) => {
        if (item.id !== idProducto) {
          return item;
        }

        const cantidad = Math.max(
          1,
          Math.min(
            cantidadSolicitada,
            item.cantidad
          )
        );

        return {
          ...item,
          cantidad: item.cantidad - cantidad
        };
      })
      .filter((item) => item.cantidad > 0);

    actualizarCarrito(nuevoCarrito);
  };

  const quitarTodo = (idProducto) => {
    const nuevoCarrito = carrito.filter(
      (item) => item.id !== idProducto
    );

    actualizarCarrito(nuevoCarrito);
  };

  const borrarCarrito = () => {
    actualizarCarrito([]);
    setMostrarConfirmacion(false);
    setCantidades({});
  };

  const confirmarPedido = async () => {
    if (carrito.length === 0) {
      return;
    }

    const tipoUsuario =
      localStorage.getItem('tipoUsuario');

    if (tipoUsuario !== 'cliente') {
      await Alerta.fire({
        icon: 'warning',
        title: 'Acceso no permitido',
        text: 'Solo los clientes pueden confirmar pedidos.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    const resultado = await Alerta.fire({
      icon: 'question',
      title: 'Confirmar pedido',
      text: 'Ingresá tu nombre para confirmar el pedido.',
      input: 'text',
      inputLabel: 'Nombre y apellido',
      inputPlaceholder: 'Ej: Juan Pérez',
      inputAttributes: {
        maxlength: '80',
        autocomplete: 'name'
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar pedido',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      inputValidator: (valor) => {
        if (!valor || !valor.trim()) {
          return 'Ingresá tu nombre para continuar.';
        }

        return null;
      }
    });

    if (!resultado.isConfirmed) {
      return;
    }

    const nombreCliente =
      resultado.value.trim();

    const pedidosActuales = leerPedidos();
    const retiro = generarRetiro(
      pedidosActuales
    );

    const nuevoPedido = {
      retiro,
      cliente: nombreCliente,
      telefono: '',
      fecha: obtenerFechaActual(),
      estado: 'Pendiente',
      detalle: obtenerDetalle(carrito),
      items: convertirItemsDelCarrito(carrito),
      notas: obtenerNotas(carrito)
    };

    const pedidosActualizados = [
      ...pedidosActuales,
      nuevoPedido
    ];

    guardarPedidos(pedidosActualizados);

    window.dispatchEvent(
      new Event('pedidosActualizados')
    );

    actualizarCarrito([]);
    setCantidades({});

    await Alerta.fire({
      icon: 'success',
      title: 'Pedido confirmado',
      html: `
        <p>Tu pedido fue confirmado correctamente.</p>
        <strong>Código de retiro: ${retiro}</strong>
      `,
      confirmButtonText: 'Entendido'
    });

    onCerrar();
  };

  const cambiarCantidad = (
    idProducto,
    valor
  ) => {
    setCantidades((anteriores) => ({
      ...anteriores,
      [idProducto]: valor
    }));
  };

  const total = carrito.reduce(
    (suma, item) =>
      suma +
      Number(item.precio) *
        Number(item.cantidad),
    0
  );

  return (
    <>
      <aside
        className={`coki-cart-panel ${
          abierto ? 'is-open' : ''
        }`}
        aria-labelledby="cokiCartTitle"
        aria-hidden={!abierto}
      >
        <div
          className="coki-cart-panel__backdrop"
          onClick={onCerrar}
          aria-hidden="true"
        />

        <div
          className="coki-cart-panel__content"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cokiCartTitle"
        >
          <header className="coki-cart-panel__header">
            <h2 id="cokiCartTitle">
              Tu carrito
            </h2>

            <button
              type="button"
              className="coki-cart-panel__close"
              onClick={onCerrar}
              aria-label="Cerrar carrito"
            >
              &times;
            </button>
          </header>

          <div className="coki-cart-panel__body">
            {carrito.length === 0 ? (
              <p className="coki-cart-panel__empty">
                Tu carrito está vacío.
              </p>
            ) : (
              carrito.map((item) => (
                <article
                  className="coki-cart-item"
                  key={item.id}
                >
                  <div>
                    <h3>{item.nombre}</h3>

                    <p>
                      {item.cantidad} x{' '}
                      {formatearPrecio(
                        item.precio
                      )}
                    </p>

                    {item.esImpresion && (
                      <div className="coki-cart-item__printing">
                        <p>
                          <strong>
                            Tipo de impresión:
                          </strong>{' '}
                          {item.tipoImpresion}
                        </p>

                        <p>
                          <strong>
                            Tipo de papel:
                          </strong>{' '}
                          {item.tipoPapel}
                        </p>

                        <p>
                          <strong>
                            Descripción:
                          </strong>{' '}
                          {item.descripcion}
                        </p>

                        <p>
                          <strong>
                            Archivo:
                          </strong>{' '}
                          {item.archivo}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="coki-cart-item__controls">
                    <Form.Label
                      htmlFor={`cartRemoveQuantity-${item.id}`}
                    >
                      Quitar
                    </Form.Label>

                    <Form.Control
                      id={`cartRemoveQuantity-${item.id}`}
                      className="coki-cart-item__quantity"
                      type="number"
                      min="1"
                      max={item.cantidad}
                      value={
                        cantidades[item.id] || 1
                      }
                      onChange={(event) =>
                        cambiarCantidad(
                          item.id,
                          event.target.value
                        )
                      }
                    />

                    <Button
                      type="button"
                      className="coki-cart-item__remove"
                      onClick={() =>
                        quitarCantidad(
                          item.id
                        )
                      }
                    >
                      Quitar cantidad
                    </Button>

                    <Button
                      type="button"
                      className="coki-cart-item__remove-all"
                      onClick={() =>
                        quitarTodo(item.id)
                      }
                    >
                      Quitar todo
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer className="coki-cart-panel__footer">
            <div className="coki-cart-panel__total">
              <span>Total</span>

              <strong>
                {formatearPrecio(total)}
              </strong>
            </div>

            <div className="coki-cart-panel__actions">
              <Button
                type="button"
                className="coki-cart-panel__confirm"
                onClick={confirmarPedido}
                disabled={carrito.length === 0}
              >
                Confirmar pedido
              </Button>

              <Button
                type="button"
                className="coki-cart-panel__clear"
                onClick={() => {
                  if (carrito.length > 0) {
                    setMostrarConfirmacion(
                      true
                    );
                  }
                }}
                disabled={carrito.length === 0}
              >
                Borrar carrito
              </Button>
            </div>
          </footer>
        </div>
      </aside>

      {mostrarConfirmacion && (
        <div
          className="coki-cart-confirm is-open"
          aria-hidden="false"
        >
          <div
            className="coki-cart-confirm__backdrop"
            onClick={() =>
              setMostrarConfirmacion(
                false
              )
            }
          />

          <div
            className="coki-cart-confirm__content"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cokiCartConfirmTitle"
          >
            <div
              className="coki-cart-confirm__icon"
              aria-hidden="true"
            >
              !
            </div>

            <h2 id="cokiCartConfirmTitle">
              ¿Borrar carrito?
            </h2>

            <p>
              Se eliminarán todos los productos
              que agregaste.
            </p>

            <div className="coki-cart-confirm__actions">
              <Button
                type="button"
                className="coki-cart-confirm__cancel"
                onClick={() =>
                  setMostrarConfirmacion(
                    false
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                className="coki-cart-confirm__accept"
                onClick={borrarCarrito}
              >
                Borrar carrito
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CartPanel;
