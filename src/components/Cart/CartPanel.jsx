import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import './CartPanel.css';
import Alerta from '../Alerta/alerta';
import {
  leerPedidos,
  guardarPedidos,
  leerCarrito,
  guardarCarrito,
  obtenerUsuarioActual
} from '../../data/almacenamiento';

function formatearPrecio(precio) {
  return (
    '$ ' +
    Number(precio).toLocaleString(
      'es-AR'
    )
  );
}

function generarRetiro(pedidos) {
  const numeros = pedidos
    .map((pedido) =>
      Number(
        String(pedido.retiro)
          .replace(/\D/g, '')
      )
    )
    .filter((numero) =>
      Number.isFinite(numero)
    );

  const ultimoNumero =
    numeros.length > 0
      ? Math.max(...numeros)
      : 1000;

  return `#${String(
    ultimoNumero + 1
  ).padStart(4, '0')}`;
}

function obtenerFechaActual() {
  return new Date().toLocaleDateString(
    'es-AR'
  );
}

function convertirItemsDelCarrito(
  carrito
) {
  return carrito.map((item) => {
    if (item.esImpresion) {
      return {
        producto: `Impresión - ${item.tipoImpresion}`,
        cantidad: Number(
          item.cantidad
        ),
        precioUnitario:
          Number(item.precio) || 0,
        esImpresion: true,
        tipoImpresion:
          item.tipoImpresion,
        tipoPapel:
          item.tipoPapel,
        descripcion:
          item.descripcion,
        archivo:
          item.archivo,
        archivoUrl:
          item.archivoUrl,
        archivoTipo:
          item.archivoTipo
      };
    }

    return {
      producto: item.nombre,
      cantidad: Number(
        item.cantidad
      ),
      precioUnitario:
        Number(item.precio) || 0,
      esImpresion: false
    };
  });
}

function obtenerNotas(carrito) {
  const impresiones =
    carrito.filter(
      (item) =>
        item.esImpresion
    );

  if (
    impresiones.length === 0
  ) {
    return '';
  }

  return impresiones
    .map((item, indice) =>
      [
        `Impresión ${indice + 1}`,
        `Tipo de impresión: ${item.tipoImpresion}`,
        `Tipo de papel: ${item.tipoPapel}`,
        `Cantidad de copias: ${item.cantidad}`,
        `Descripción: ${item.descripcion}`,
        `Archivo: ${item.archivo}`
      ].join('\n')
    )
    .join('\n\n');
}

function obtenerDetalle(carrito) {
  return carrito
    .map((item) => {
      if (
        item.esImpresion
      ) {
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
  const [carrito, setCarrito] =
    useState(leerCarrito);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion
  ] = useState(false);

  const [cantidades, setCantidades] =
    useState({});

  useEffect(() => {
    const actualizarCarrito =
      () => {
        setCarrito(
          leerCarrito()
        );
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
    const manejarEscape =
      (evento) => {
        if (
          evento.key !==
          'Escape'
        ) {
          return;
        }

        if (
          mostrarConfirmacion
        ) {
          setMostrarConfirmacion(
            false
          );
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

  const actualizarCarrito = (
    nuevoCarrito
  ) => {
    guardarCarrito(
      nuevoCarrito
    );

    setCarrito(
      nuevoCarrito
    );

    window.dispatchEvent(
      new Event(
        'carritoActualizado'
      )
    );

    if (
      onCarritoActualizado
    ) {
      onCarritoActualizado(
        nuevoCarrito
      );
    }
  };

  const quitarCantidad = (
    idProducto
  ) => {
    const cantidadSolicitada =
      Number(
        cantidades[
          idProducto
        ] || 1
      );

    const nuevoCarrito =
      carrito
        .map((item) => {
          if (
            item.id !==
            idProducto
          ) {
            return item;
          }

          const cantidad =
            Math.max(
              1,
              Math.min(
                cantidadSolicitada,
                item.cantidad
              )
            );

          return {
            ...item,
            cantidad:
              item.cantidad -
              cantidad
          };
        })
        .filter(
          (item) =>
            item.cantidad > 0
        );

    actualizarCarrito(
      nuevoCarrito
    );
  };

  const quitarTodo = (
    idProducto
  ) => {
    const nuevoCarrito =
      carrito.filter(
        (item) =>
          item.id !==
          idProducto
      );

    actualizarCarrito(
      nuevoCarrito
    );
  };

  const borrarCarrito =
    () => {
      actualizarCarrito([]);
      setMostrarConfirmacion(
        false
      );
      setCantidades({});
    };

  const confirmarPedido =
    async () => {
      if (
        carrito.length === 0
      ) {
        return;
      }

      const tipoUsuario =
        localStorage.getItem(
          'tipoUsuario'
        );

      if (
        tipoUsuario !==
        'cliente'
      ) {
        await Alerta.fire({
          icon: 'warning',
          title:
            'Acceso no permitido',
          text: 'Solo los clientes pueden confirmar pedidos.',
          confirmButtonText:
            'Entendido'
        });

        return;
      }

      // El nombre sale de la cuenta; solo se pide si la cuenta no lo tiene
      const nombreCuenta =
        obtenerUsuarioActual()?.nombre || '';

      const nombreEscapado =
        nombreCuenta
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;');

      const resultado =
        await Alerta.fire({
          icon: 'question',
          title:
            'Confirmar pedido',
          html: `
            <p class="coki-alerta__texto">Ingresá tus datos para confirmar el pedido.</p>
            <label for="pedido-nombre" class="swal2-input-label">Nombre y apellido</label>
            <input id="pedido-nombre" class="swal2-input" placeholder="Ej: Juan Pérez" maxlength="80" autocomplete="name" value="${nombreEscapado}" ${nombreCuenta ? 'readonly' : ''}>
            <label for="pedido-telefono" class="swal2-input-label">Teléfono</label>
            <input id="pedido-telefono" class="swal2-input" type="tel" inputmode="tel" placeholder="Ej: 381 555-1234" maxlength="20" autocomplete="tel">
          `,
          focusConfirm:
            false,
          didOpen: () => {
            document
              .getElementById(
                nombreCuenta
                  ? 'pedido-telefono'
                  : 'pedido-nombre'
              )
              .focus();
          },
          showCancelButton:
            true,
          confirmButtonText:
            'Confirmar pedido',
          cancelButtonText:
            'Cancelar',
          reverseButtons:
            true,
          preConfirm: () => {
            const nombre =
              document
                .getElementById('pedido-nombre')
                .value.trim();

            const telefono =
              document
                .getElementById('pedido-telefono')
                .value.trim();

            if (!nombre) {
              Alerta.showValidationMessage(
                'Ingresá tu nombre para continuar.'
              );
              return false;
            }

            const digitos =
              telefono.replace(/\D/g, '');

            if (
              !/^[\d\s()+-]+$/.test(telefono) ||
              digitos.length < 8 ||
              digitos.length > 15
            ) {
              Alerta.showValidationMessage(
                'Ingresá un teléfono válido (solo números, entre 8 y 15 dígitos).'
              );
              return false;
            }

            return { nombre, telefono };
          }
        });

      if (
        !resultado.isConfirmed
      ) {
        return;
      }

      const {
        nombre: nombreCliente,
        telefono
      } = resultado.value;

      const pedidosActuales =
        leerPedidos();

      const retiro =
        generarRetiro(
          pedidosActuales
        );

      const nuevoPedido = {
        retiro,
        cliente:
          nombreCliente,
        telefono,
        fecha:
          obtenerFechaActual(),
        estado:
          'Pendiente',
        detalle:
          obtenerDetalle(
            carrito
          ),
        items:
          convertirItemsDelCarrito(
            carrito
          ),
        notas:
          obtenerNotas(
            carrito
          )
      };

      const pedidosActualizados =
        [
          ...pedidosActuales,
          nuevoPedido
        ];

      try {
        guardarPedidos(
          pedidosActualizados
        );
      } catch {
        await Alerta.fire({
          icon: 'error',
          title:
            'No se pudo guardar el pedido',
          text: 'No hay suficiente espacio para guardar el pedido y su archivo.'
        });

        return;
      }

      window.dispatchEvent(
        new Event(
          'pedidosActualizados'
        )
      );

      actualizarCarrito([]);
      setCantidades({});

      await Alerta.fire({
        icon: 'success',
        title:
          'Pedido confirmado',
        html: `
          <p>Tu pedido fue confirmado correctamente.</p>
          <strong>Código de retiro: ${retiro}</strong>
        `,
        confirmButtonText:
          'Entendido'
      });

      onCerrar();
    };

  const cambiarCantidad = (
    idProducto,
    valor
  ) => {
    setCantidades(
      (anteriores) => ({
        ...anteriores,
        [idProducto]:
          valor
      })
    );
  };

  const total =
    carrito.reduce(
      (suma, item) =>
        suma +
        Number(
          item.precio
        ) *
          Number(
            item.cantidad
          ),
      0
    );

  return (
    <>
      <aside
        className={`coki-cart-panel position-fixed top-0 bottom-0 start-0 end-0 ${
          abierto
            ? 'is-open'
            : ''
        }`}
        aria-labelledby="cokiCartTitle"
        aria-hidden={!abierto}
      >
        <div
          className="coki-cart-panel__backdrop position-absolute top-0 bottom-0 start-0 end-0"
          onClick={onCerrar}
          aria-hidden="true"
        />

        <div
          className="coki-cart-panel__content position-absolute top-0 end-0 h-100 bg-white d-flex flex-column"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cokiCartTitle"
        >
          <header className="coki-cart-panel__header d-flex align-items-center justify-content-between gap-3">
            <h2 id="cokiCartTitle" className="m-0">
              Tu carrito
            </h2>

            <button
              type="button"
              className="coki-cart-panel__close border-0 bg-transparent lh-1 px-2 py-1"
              onClick={onCerrar}
              aria-label="Cerrar carrito"
            >
              &times;
            </button>
          </header>

          <div className="coki-cart-panel__body overflow-y-auto p-3">
            {carrito.length ===
            0 ? (
              <p className="coki-cart-panel__empty m-0 text-center py-5 px-3 fw-bold">
                Tu carrito está vacío.
              </p>
            ) : (
              carrito.map(
                (item) => (
                  <article
                    className="coki-cart-item d-flex flex-column gap-3 py-3"
                    key={item.id}
                  >
                    <div>
                      <h3 className="fs-6">
                        {item.nombre}
                      </h3>

                      <p className="m-0 fw-semibold">
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
                            {
                              item.tipoImpresion
                            }
                          </p>

                          <p>
                            <strong>
                              Tipo de papel:
                            </strong>{' '}
                            {
                              item.tipoPapel
                            }
                          </p>

                          <p>
                            <strong>
                              Cantidad de copias:
                            </strong>{' '}
                            {
                              item.cantidad
                            }
                          </p>

                          <p>
                            <strong>
                              Precio por copia:
                            </strong>{' '}
                            {
                              formatearPrecio(
                                item.precio
                              )
                            }
                          </p>

                          <p>
                            <strong>
                              Descripción:
                            </strong>{' '}
                            {
                              item.descripcion
                            }
                          </p>

                          <p>
                            <strong>
                              Archivo:
                            </strong>{' '}
                            {
                              item.archivo
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="coki-cart-item__controls d-flex flex-wrap align-items-stretch align-items-sm-center gap-2">
                      <Form.Label
                        className="w-100 fw-bold"
                        htmlFor={`cartRemoveQuantity-${item.id}`}
                      >
                        Quitar
                      </Form.Label>

                      <Form.Control
                        id={`cartRemoveQuantity-${item.id}`}
                        className="coki-cart-item__quantity fw-bold"
                        type="number"
                        min="1"
                        max={
                          item.cantidad
                        }
                        value={
                          cantidades[
                            item.id
                          ] || 1
                        }
                        onChange={(
                          event
                        ) =>
                          cambiarCantidad(
                            item.id,
                            event.target
                              .value
                          )
                        }
                      />

                      <Button
                        type="button"
                        className="coki-cart-item__remove border-0 rounded-3 fw-bold"
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
                        className="coki-cart-item__remove-all border-0 rounded-3 fw-bold text-white"
                        onClick={() =>
                          quitarTodo(
                            item.id
                          )
                        }
                      >
                        Quitar todo
                      </Button>
                    </div>
                  </article>
                )
              )
            )}
          </div>

          <footer className="coki-cart-panel__footer bg-white">
            <div className="coki-cart-panel__total d-flex justify-content-between align-items-center gap-3 mb-3">
              <span>
                Total
              </span>

              <strong>
                {formatearPrecio(
                  total
                )}
              </strong>
            </div>

            <div className="coki-cart-panel__actions d-flex flex-column">
              <Button
                type="button"
                className="coki-cart-panel__confirm w-100 border-0 rounded-3 fw-bold"
                onClick={
                  confirmarPedido
                }
                disabled={
                  carrito.length ===
                  0
                }
              >
                Confirmar pedido
              </Button>

              <Button
                type="button"
                className="coki-cart-panel__clear w-100 border-0 rounded-3 text-white"
                onClick={() => {
                  if (
                    carrito.length >
                    0
                  ) {
                    setMostrarConfirmacion(
                      true
                    );
                  }
                }}
                disabled={
                  carrito.length ===
                  0
                }
              >
                Borrar carrito
              </Button>
            </div>
          </footer>
        </div>
      </aside>

      {mostrarConfirmacion && (
        <div
          className="coki-cart-confirm position-fixed top-0 bottom-0 start-0 end-0 d-flex align-items-center justify-content-center p-3"
          aria-hidden="false"
        >
          <div
            className="coki-cart-confirm__backdrop position-absolute top-0 bottom-0 start-0 end-0"
            onClick={() =>
              setMostrarConfirmacion(
                false
              )
            }
          />

          <div
            className="coki-cart-confirm__content position-relative bg-white p-4 text-center"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cokiCartConfirmTitle"
          >
            <div
              className="coki-cart-confirm__icon mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              aria-hidden="true"
            >
              !
            </div>

            <h2 id="cokiCartConfirmTitle" className="mb-2">
              ¿Borrar carrito?
            </h2>

            <p>
              Se eliminarán todos los
              productos que agregaste.
            </p>

            <div className="coki-cart-confirm__actions d-flex flex-column flex-sm-row justify-content-center">
              <Button
                type="button"
                className="coki-cart-confirm__cancel border-0 rounded-3"
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
                className="coki-cart-confirm__accept border-0 rounded-3 text-white"
                onClick={
                  borrarCarrito
                }
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
