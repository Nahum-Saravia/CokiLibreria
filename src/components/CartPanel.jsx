import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import './CartPanel.css';

const CLAVE_CARRITO = 'coki-carrito';

function leerCarrito() {
  const guardado = localStorage.getItem(CLAVE_CARRITO);

  if (!guardado) {
    return [];
  }

  try {
    return JSON.parse(guardado);
  } catch (error) {
    localStorage.removeItem(CLAVE_CARRITO);
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function formatearPrecio(precio) {
  return '$ ' + Number(precio).toLocaleString('es-AR');
}

function CartPanel({ abierto, onCerrar, onCarritoActualizado }) {
  const [carrito, setCarrito] = useState([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cantidades, setCantidades] = useState({});

  useEffect(() => {
    setCarrito(leerCarrito());
  }, [abierto]);

  useEffect(() => {
    const actualizarCarrito = () => {
      setCarrito(leerCarrito());
    };

    window.addEventListener('carritoActualizado', actualizarCarrito);
    window.addEventListener('storage', actualizarCarrito);

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

    document.addEventListener('keydown', manejarEscape);

    return () => {
      document.removeEventListener('keydown', manejarEscape);
    };
  }, [abierto, mostrarConfirmacion, onCerrar]);

  const actualizarCarrito = (nuevoCarrito) => {
    guardarCarrito(nuevoCarrito);
    setCarrito(nuevoCarrito);

    window.dispatchEvent(new Event('carritoActualizado'));

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
            Math.min(cantidadSolicitada, item.cantidad)
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
  };

  const cambiarCantidad = (idProducto, valor) => {
    setCantidades((anteriores) => ({
      ...anteriores,
      [idProducto]: valor
    }));
  };

  const total = carrito.reduce(
    (suma, item) => suma + Number(item.precio) * Number(item.cantidad),
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
            <h2 id="cokiCartTitle">Tu carrito</h2>

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
                      {formatearPrecio(item.precio)}
                    </p>
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
                      value={cantidades[item.id] || 1}
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
                        quitarCantidad(item.id)
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

              <strong>{formatearPrecio(total)}</strong>
            </div>

            <Button
              type="button"
              className="coki-cart-panel__clear"
              onClick={() => {
                if (carrito.length > 0) {
                  setMostrarConfirmacion(true);
                }
              }}
              disabled={carrito.length === 0}
            >
              Borrar carrito
            </Button>
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
            onClick={() => setMostrarConfirmacion(false)}
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
              Se eliminarán todos los productos que agregaste.
            </p>

            <div className="coki-cart-confirm__actions">
              <Button
                type="button"
                className="coki-cart-confirm__cancel"
                onClick={() =>
                  setMostrarConfirmacion(false)
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
