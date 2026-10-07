import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal
} from 'react-bootstrap';
import './PanelAdmin.css';
import { useEffect, useState } from 'react';

const estadosPedido = [
  { valor: 'Pendiente', texto: 'Pendiente', clase: 'pendiente' },
  { valor: 'En preparación', texto: 'En preparación', clase: 'preparacion' },
  { valor: 'Listo', texto: 'Listo para retirar', clase: 'listo' },
  { valor: 'Entregado', texto: 'Entregado', clase: 'entregado' }
];

function claseEstado(estado) {
  return estadosPedido.find((opcion) => opcion.valor === estado)?.clase;
}

function formatearPrecio(precio) {
  return `$${precio.toLocaleString('es-AR')}`;
}

function calcularTotal(pedido) {
  return pedido.items.reduce(
    (total, item) => total + item.cantidad * item.precioUnitario,
    0
  );
}

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const pedidosIniciales = [
  {
    retiro: '#1048',
    cliente: 'Martina López',
    telefono: '381 412-5587',
    fecha: '07/10/2026',
    detalle: '20 fotocopias A4',
    estado: 'Pendiente',
    items: [
      { producto: 'Fotocopia A4 blanco y negro', cantidad: 20, precioUnitario: 90 }
    ],
    notas: 'Doble faz y abrochadas.'
  },
  {
    retiro: '#1047',
    cliente: 'Tomás García',
    telefono: '381 455-2210',
    fecha: '06/10/2026',
    detalle: 'Cuaderno + lápices',
    estado: 'Listo',
    items: [
      { producto: 'Cuaderno ABC tapa dura', cantidad: 1, precioUnitario: 4200 },
      { producto: 'Lápices de colores x12', cantidad: 1, precioUnitario: 2250 }
    ],
    notas: ''
  },
  {
    retiro: '#1046',
    cliente: 'Lucía Fernández',
    telefono: '381 467-9031',
    fecha: '06/10/2026',
    detalle: 'Impresión color',
    estado: 'En preparación',
    items: [
      { producto: 'Impresión color A4', cantidad: 10, precioUnitario: 230 }
    ],
    notas: 'Papel ilustración 150g.'
  },
  {
    retiro: '#1045',
    cliente: 'Joaquín Pérez',
    telefono: '381 430-7764',
    fecha: '05/10/2026',
    detalle: 'Resma A4 + carpeta',
    estado: 'Entregado',
    items: [
      { producto: 'Resma A4 80g', cantidad: 1, precioUnitario: 6500 },
      { producto: 'Carpeta N°3 con anillos', cantidad: 1, precioUnitario: 2400 }
    ],
    notas: ''
  }
];

function PanelAdmin() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [pedidoAVer, setPedidoAVer] = useState(null);
  const [pedidoAGestionar, setPedidoAGestionar] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (tipoUsuario !== 'admin') {
      navigate('/sesion');
    }
  }, [navigate]);

  const hayEntregados = pedidos.some((pedido) => pedido.estado === 'Entregado');

  const eliminarEntregados = () => {
    setPedidos(pedidos.filter((pedido) => pedido.estado !== 'Entregado'));
  };

  const abrirGestion = (pedido) => {
    setPedidoAGestionar(pedido);
    setNuevoEstado(pedido.estado);
  };

  const guardarEstado = () => {
    setPedidos(
      pedidos.map((pedido) =>
        pedido.retiro === pedidoAGestionar.retiro
          ? { ...pedido, estado: nuevoEstado }
          : pedido
      )
    );
    setPedidoAGestionar(null);
  };

  const buscado = normalizar(busquedaPedido.trim()).replace('#', '');

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const coincideEstado =
      estadoFiltro === 'todos' || pedido.estado === estadoFiltro;

    const coincideBusqueda = normalizar(
      `${pedido.retiro} ${pedido.cliente}`
    ).includes(buscado);

    return coincideEstado && coincideBusqueda;
  });

  const productos = [
    {
      nombre: 'Cuaderno ABC tapa dura',
      categoria: 'Útiles escolares',
      stock: '24 unidades',
      clase: 'stock-ok'
    },
    {
      nombre: 'Resma A4 80g',
      categoria: 'Impresiones',
      stock: '3 unidades',
      clase: 'stock-low'
    },
    {
      nombre: 'Lapicera azul',
      categoria: 'Útiles escolares',
      stock: '56 unidades',
      clase: 'stock-ok'
    }
  ];

  const cerrarSesion = () => {
    localStorage.removeItem('tipoUsuario');
    navigate('/sesion');
  };

  return (
    <main className="admin-page">
      <Container className="admin-container">
        <section className="admin-heading">
          <p className="admin-kicker">Gestión interna</p>
          <h1>Panel de administrador</h1>
        </section>

        <Row className="g-3 mb-4">
          <Col xs={12} sm={4}>
            <Card className="admin-stat-card">
              <Card.Body>
                <span>Pedidos pendientes</span>
                <strong>12</strong>
                <small>Requieren atención</small>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={4}>
            <Card className="admin-stat-card">
              <Card.Body>
                <span>Ventas del día</span>
                <strong>$48.750</strong>
                <small>+8% respecto a ayer</small>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={4}>
            <Card className="admin-stat-card">
              <Card.Body>
                <span>Productos con poco stock</span>
                <strong>7</strong>
                <small>Para reponer</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="admin-section-card mb-4">
          <Card.Body>
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Seguimiento</p>
                <h2>Estado de pedidos</h2>
              </div>

              <Button
                type="button"
                className="admin-primary-button"
                onClick={eliminarEntregados}
                disabled={!hayEntregados}
              >
                Eliminar entregados
              </Button>
            </div>

            <Row className="g-3 admin-filters">
              <Col xs={12} md={6}>
                <Form.Group controlId="estado">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={estadoFiltro}
                    onChange={(evento) => setEstadoFiltro(evento.target.value)}
                  >
                    <option value="todos">Todos los estados</option>
                    {estadosPedido.map((estado) => (
                      <option key={estado.valor} value={estado.valor}>
                        {estado.texto}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="buscarPedido">
                  <Form.Label>Buscar</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Cliente o número de retiro"
                    value={busquedaPedido}
                    onChange={(evento) => setBusquedaPedido(evento.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="admin-table-wrapper">
              <Table className="admin-table" responsive>
                <thead>
                  <tr>
                    <th>Retiro</th>
                    <th>Cliente</th>
                    <th>Detalle</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  )}

                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.retiro}>
                      <td>{pedido.retiro}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.detalle}</td>
                      <td>
                        <span
                          className={`admin-status admin-status--${claseEstado(pedido.estado)}`}
                        >
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{formatearPrecio(calcularTotal(pedido))}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            type="button"
                            className="admin-table-button"
                            onClick={() => setPedidoAVer(pedido)}
                          >
                            Ver pedido
                          </Button>
                          <Button
                            type="button"
                            className="admin-table-button"
                            onClick={() => abrirGestion(pedido)}
                          >
                            Gestionar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-section-card mb-4">
          <Card.Body>
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Inventario</p>
                <h2>Stock de librería</h2>
              </div>

              <Button className="admin-primary-button">
                Agregar producto
              </Button>
            </div>

            <Row className="g-3 admin-filters">
              <Col xs={12} md={6}>
                <Form.Group controlId="buscarProducto">
                  <Form.Label>Buscar producto</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Nombre del producto"
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="categoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select>
                    <option>Todas las categorías</option>
                    <option>Útiles escolares</option>
                    <option>Cuadernos</option>
                    <option>Impresiones</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 admin-stock-grid">
              {productos.map((producto) => (
                <Col xs={12} md={4} key={producto.nombre}>
                  <article className="admin-product">
                    <strong>{producto.nombre}</strong>
                    <span>{producto.categoria}</span>
                    <b className={producto.clase}>
                      {producto.stock}
                    </b>

                    <Button
                      type="button"
                      className="admin-table-button"
                    >
                      Actualizar stock
                    </Button>
                  </article>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <div className="admin-logout-wrapper">
          <Button
            type="button"
            className="admin-logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </Button>
        </div>
      </Container>

      <Modal
        show={pedidoAVer !== null}
        onHide={() => setPedidoAVer(null)}
        centered
        size="lg"
        contentClassName="admin-modal"
      >
        {pedidoAVer && (
          <>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h4 fw-bold m-0">
                Pedido {pedidoAVer.retiro}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className="g-3 mb-4">
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Cliente</p>
                  <p className="fw-bold m-0">{pedidoAVer.cliente}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Teléfono</p>
                  <p className="fw-bold m-0">{pedidoAVer.telefono}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Fecha</p>
                  <p className="fw-bold m-0">{pedidoAVer.fecha}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Estado</p>
                  <span
                    className={`admin-status admin-status--${claseEstado(pedidoAVer.estado)}`}
                  >
                    {pedidoAVer.estado}
                  </span>
                </Col>
              </Row>

              <Table className="admin-table" responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoAVer.items.map((item) => (
                    <tr key={item.producto}>
                      <td>{item.producto}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatearPrecio(item.precioUnitario)}</td>
                      <td>{formatearPrecio(item.cantidad * item.precioUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <p className="text-end fs-5 fw-bold mt-3 mb-0">
                Total: {formatearPrecio(calcularTotal(pedidoAVer))}
              </p>

              {pedidoAVer.notas && (
                <div className="mt-3">
                  <p className="admin-modal__dato">Notas del cliente</p>
                  <p className="m-0">{pedidoAVer.notas}</p>
                </div>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>

      <Modal
        show={pedidoAGestionar !== null}
        onHide={() => setPedidoAGestionar(null)}
        centered
        contentClassName="admin-modal"
      >
        {pedidoAGestionar && (
          <>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h4 fw-bold m-0">
                Gestionar pedido {pedidoAGestionar.retiro}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p className="mb-3">
                Cliente: <strong>{pedidoAGestionar.cliente}</strong>
              </p>

              <Form.Group controlId="nuevoEstado">
                <Form.Label className="fw-bold">Estado del pedido</Form.Label>
                <Form.Select
                  value={nuevoEstado}
                  onChange={(evento) => setNuevoEstado(evento.target.value)}
                >
                  {estadosPedido.map((estado) => (
                    <option key={estado.valor} value={estado.valor}>
                      {estado.texto}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                className="admin-table-button"
                onClick={() => setPedidoAGestionar(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="admin-primary-button"
                onClick={guardarEstado}
              >
                Guardar cambios
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </main>
  );
}

export default PanelAdmin;