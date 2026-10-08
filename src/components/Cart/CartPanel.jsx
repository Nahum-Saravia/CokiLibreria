import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Alerta from '../Alerta/alerta';
import { crearPedido } from '../../data/almacenamiento';
import './CartPanel.css';

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
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function formatearPrecio(precio) {
  return '$ ' + Number(precio).toLocaleString('es-AR');
}

function CartPanel({ abierto, onCerrar, onCarritoActualizado }) {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(leerCarrito);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [cantidades, setCantidades] = useState({});

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
    cambiarCantidad(idProducto, 1, 1);
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

  const confirmarPedido = async () => {
    if (!localStorage.getItem('tipoUsuario')) {
      await Alerta.fire({
        icon: 'info',
        title: 'Iniciá sesión',
        text: 'Para hacer un pedido tenés que iniciar sesión.',
        confirmButtonText: 'Ir a iniciar sesión'
      });
      onCerrar();
      navigate('/sesion');
      return;
    }

    const { value: datos } = await Alerta.fire({
      title: 'Confirmar pedido',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre y apellido">
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono">
        <textarea id="swal-notas" class="swal2-textarea" placeholder="Notas (opcional)"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const cliente = document.getElementById('swal-nombre').value.trim();
        const telefono = document.getElementById('swal-telefono').value.trim();
        const notas = document.getElementById('swal-notas').value.trim();

        if (!cliente || !telefono) {
          Alerta.showValidationMessage('Completá tu nombre y teléfono.');
          return false;
        }

        return { cliente, telefono, notas };
      }
    });

    if (!datos) {
      return;
    }

    const resultado = crearPedido(datos);

    if (resultado.error) {
      Alerta.fire({
        icon: 'error',
        title: 'No se pudo hacer el pedido',
        text: resultado.error
      });
      return;
    }

    setCarrito([]);
    onCerrar();

    Alerta.fire({
      icon: 'success',
      title: '¡Pedido confirmado!',
      html: `Tu número de retiro es <strong>${resultado.pedido.retiro}</strong>.<br>Guardalo para consultar el estado de tu pedido.`
    });
  };

  const cambiarCantidad = (idProducto, valor, maximo) => {
    const cantidad =
      valor === '' ? '' : Math.min(Math.max(Number(valor) || 1, 1), maximo);

    setCantidades((anteriores) => ({
      ...anteriores,
      [idProducto]: cantidad
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
                      value={
                        cantidades[item.id] === ''
                          ? ''
                          : Math.min(cantidades[item.id] || 1, item.cantidad)
                      }
                      onChange={(event) =>
                        cambiarCantidad(
                          item.id,
                          event.target.value,
                          item.cantidad
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
