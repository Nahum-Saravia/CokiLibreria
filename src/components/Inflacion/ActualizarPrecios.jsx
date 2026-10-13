import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card, Button, Modal, Form, InputGroup,
  Table, Spinner, Badge, Row, Col
} from 'react-bootstrap';
import Alerta from '../Alerta/alerta';
import { formatearPrecio } from '../../data/estadosPedido';

const API_URL = import.meta.env.VITE_API_URL;

const opcionesRedondeo = [
  { valor: 1, texto: 'Sin redondear' },
  { valor: 10, texto: 'A $10' },
  { valor: 50, texto: 'A $50' },
  { valor: 100, texto: 'A $100' }
];

function nombreDelMes(fecha) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  });
}

function formatearPorcentaje(valor) {
  return valor.toLocaleString('es-AR');
}

function redondear(valor, multiplo) {
  return Math.round(valor / multiplo) * multiplo;
}

function ActualizarPrecios({ productos, onAplicar }) {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [porcentaje, setPorcentaje] = useState('');
  const [redondeo, setRedondeo] = useState(10);
  const [categoria, setCategoria] = useState('todas');
  const [seleccionados, setSeleccionados] = useState({});
  const [preciosEditados, setPreciosEditados] = useState({});

  useEffect(() => {
    const obtenerInflacion = async () => {
      try {
        const response = await axios.get(API_URL);
        const ultimosMeses = response.data.slice(-6);

        setHistorial(ultimosMeses);
        setPorcentaje(String(ultimosMeses[ultimosMeses.length - 1].valor));
      } catch {
        setError(true);

        Alerta.fire({
          icon: 'error',
          title: 'No se pudo obtener la inflación',
          text: 'Revisá tu conexión. Igual podés escribir el porcentaje a mano.',
          confirmButtonText: 'Entendido'
        });
      } finally {
        setCargando(false);
      }
    };

    obtenerInflacion();
  }, []);

  const ultimoMes = historial[historial.length - 1];

  const categorias = [
    ...new Set(productos.map((producto) => producto.categoria))
  ];

  const productosVista = productos.filter(
    (producto) => categoria === 'todas' || producto.categoria === categoria
  );

  const calcularPrecio = (precio) =>
    redondear(precio * (1 + Number(porcentaje) / 100), redondeo);

  const precioNuevo = (producto) =>
    preciosEditados[producto.id] !== undefined
      ? Number(preciosEditados[producto.id])
      : calcularPrecio(producto.precio);

  const abrirVistaPrevia = () => {
    const todos = {};

    productos.forEach((producto) => {
      todos[producto.id] = true;
    });

    setSeleccionados(todos);
    setPreciosEditados({});
    setCategoria('todas');
    setMostrarVistaPrevia(true);
  };

  const cambiarSeleccion = (id) => {
    setSeleccionados({ ...seleccionados, [id]: !seleccionados[id] });
  };

  const marcarTodos = (valor) => {
    const nuevos = { ...seleccionados };

    productosVista.forEach((producto) => {
      nuevos[producto.id] = valor;
    });

    setSeleccionados(nuevos);
  };

  const editarPrecio = (id, valor) => {
    setPreciosEditados({ ...preciosEditados, [id]: valor });
  };

  const quitarEdicion = (id) => {
    const nuevos = { ...preciosEditados };

    delete nuevos[id];
    setPreciosEditados(nuevos);
  };

  const productosAActualizar = productosVista.filter(
    (producto) => seleccionados[producto.id]
  );

  const porcentajeValido = porcentaje !== '' && Number(porcentaje) > -100;

  const preciosValidos = productosAActualizar.every(
    (producto) => precioNuevo(producto) > 0
  );

  const sePuedeAplicar =
    porcentajeValido && preciosValidos && productosAActualizar.length > 0;

  const aplicarCambios = async () => {
    const cantidad = productosAActualizar.length;

    const respuesta = await Alerta.fire({
      icon: 'question',
      title: '¿Actualizar precios?',
      text: `Se va a cambiar el precio de ${cantidad} ${cantidad === 1 ? 'producto' : 'productos'}.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    });

    if (!respuesta.isConfirmed) {
      return;
    }

    const ids = productosAActualizar.map((producto) => producto.id);

    onAplicar(
      productos.map((producto) =>
        ids.includes(producto.id)
          ? { ...producto, precio: precioNuevo(producto) }
          : producto
      )
    );

    setMostrarVistaPrevia(false);

    Alerta.fire({
      icon: 'success',
      title: 'Precios actualizados',
      text: 'Los nuevos precios ya se ven en la Librería.',
      confirmButtonText: 'Entendido'
    });
  };

  return (
    <>
      <Card className="coki-panel mb-4">
        <Card.Body className="p-4">
          <div className="admin-section-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div>
              <p className="admin-kicker text-uppercase fw-bold mb-0">
                Precios
              </p>

              <h2 className="m-0">
                Inflación y actualización de precios
              </h2>
            </div>

            <Button
              type="button"
              className="admin-primary-button text-nowrap"
              onClick={abrirVistaPrevia}
              disabled={cargando}
            >
              Actualizar precios según inflación
            </Button>
          </div>

          {cargando && (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Cargando inflación...</span>
            </div>
          )}

          {!cargando && error && (
            <p className="m-0">
              No se pudo obtener la inflación. Podés escribir el porcentaje a
              mano en la vista previa.
            </p>
          )}

          {!cargando && !error && ultimoMes && (
            <>
              <p className="fs-5 mb-3">
                Inflación de <strong>{nombreDelMes(ultimoMes.fecha)}</strong>:{' '}
                <strong>{formatearPorcentaje(ultimoMes.valor)} %</strong>
              </p>

              <div className="d-flex flex-wrap gap-2">
                {historial.map((mes) => (
                  <span key={mes.fecha} className="estado-pedido bg-white">
                    {nombreDelMes(mes.fecha)}: {formatearPorcentaje(mes.valor)} %
                  </span>
                ))}
              </div>
            </>
          )}

          <p className="small mt-3 mb-0">
            Fuente: INDEC, a través de ArgentinaDatos.
          </p>
        </Card.Body>
      </Card>

      <Modal
        show={mostrarVistaPrevia}
        onHide={() => setMostrarVistaPrevia(false)}
        centered
        scrollable
        size="xl"
        contentClassName="admin-modal coki-panel"
      >
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h4 fw-bold m-0">
            Vista previa de precios
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3 mb-3">
            <Col xs={12} md={4}>
              <Form.Group controlId="porcentajeAumento">
                <Form.Label className="fw-bold">Aumento</Form.Label>

                <InputGroup>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={porcentaje}
                    onChange={(evento) => setPorcentaje(evento.target.value)}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group controlId="redondeoPrecios">
                <Form.Label className="fw-bold">Redondear</Form.Label>

                <Form.Select
                  value={redondeo}
                  onChange={(evento) => setRedondeo(Number(evento.target.value))}
                >
                  {opcionesRedondeo.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={4}>
              <Form.Group controlId="categoriaPrecios">
                <Form.Label className="fw-bold">Categoría</Form.Label>

                <Form.Select
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                >
                  <option value="todas">Todas las categorías</option>

                  {categorias.map((nombre) => (
                    <option key={nombre} value={nombre}>
                      {nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex flex-wrap gap-2 mb-3">
            <Button
              type="button"
              className="admin-table-button text-nowrap"
              onClick={() => marcarTodos(true)}
            >
              Marcar todos
            </Button>

            <Button
              type="button"
              className="admin-table-button text-nowrap"
              onClick={() => marcarTodos(false)}
            >
              Desmarcar todos
            </Button>
          </div>

          <Table className="admin-table mb-0 align-middle" responsive>
            <thead>
              <tr>
                <th>Actualizar</th>
                <th>Producto</th>
                <th>Precio actual</th>
                <th>Precio nuevo</th>
              </tr>
            </thead>

            <tbody>
              {productosVista.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      aria-label={`Actualizar ${producto.nombre}`}
                      checked={Boolean(seleccionados[producto.id])}
                      onChange={() => cambiarSeleccion(producto.id)}
                    />
                  </td>

                  <td>
                    {producto.nombre}
                    <div className="small">{producto.categoria}</div>
                  </td>

                  <td className="text-nowrap">
                    {formatearPrecio(producto.precio)}
                  </td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <InputGroup size="sm" className="flex-nowrap">
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          min="0"
                          aria-label={`Precio nuevo de ${producto.nombre}`}
                          value={
                            preciosEditados[producto.id] ??
                            calcularPrecio(producto.precio)
                          }
                          onChange={(evento) =>
                            editarPrecio(producto.id, evento.target.value)
                          }
                          disabled={!seleccionados[producto.id]}
                        />
                      </InputGroup>

                      {preciosEditados[producto.id] !== undefined && (
                        <>
                          <Badge bg="warning" text="dark">
                            Editado
                          </Badge>

                          <Button
                            type="button"
                            size="sm"
                            className="admin-table-button text-nowrap"
                            onClick={() => quitarEdicion(producto.id)}
                          >
                            Deshacer
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <span className="me-auto fw-bold">
            {productosAActualizar.length}{' '}
            {productosAActualizar.length === 1
              ? 'producto seleccionado'
              : 'productos seleccionados'}
          </span>

          <Button
            type="button"
            className="admin-table-button text-nowrap"
            onClick={() => setMostrarVistaPrevia(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            className="admin-primary-button text-nowrap"
            onClick={aplicarCambios}
            disabled={!sePuedeAplicar}
          >
            Aplicar cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ActualizarPrecios;
