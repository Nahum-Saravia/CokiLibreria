import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table
} from 'react-bootstrap';
import './PanelAdmin.css';
import { useEffect } from 'react';

function PanelAdmin() {
  const navigate = useNavigate();

  useEffect(() => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (tipoUsuario !== 'admin') {
      navigate('/sesion');
    }
  }, [navigate]);

  const pedidos = [
    {
      retiro: '#1048',
      cliente: 'Martina López',
      detalle: '20 fotocopias A4',
      estado: 'Pendiente',
      total: '$1.800',
      clase: 'pendiente'
    },
    {
      retiro: '#1047',
      cliente: 'Tomás García',
      detalle: 'Cuaderno + lápices',
      estado: 'Listo',
      total: '$6.450',
      clase: 'listo'
    },
    {
      retiro: '#1046',
      cliente: 'Lucía Fernández',
      detalle: 'Impresión color',
      estado: 'En preparación',
      total: '$2.300',
      clase: 'preparacion'
    }
  ];

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

              <Link
                to="/pedidos"
                className="admin-primary-button"
              >
                Consultar pedidos
              </Link>
            </div>

            <Row className="g-3 admin-filters">
              <Col xs={12} md={6}>
                <Form.Group controlId="estado">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select>
                    <option>Todos los estados</option>
                    <option>Pendiente</option>
                    <option>En preparación</option>
                    <option>Listo para retirar</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="buscarPedido">
                  <Form.Label>Buscar</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Cliente o número de retiro"
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
                  {pedidos.map((pedido) => (
                    <tr key={pedido.retiro}>
                      <td>{pedido.retiro}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.detalle}</td>
                      <td>
                        <span
                          className={`admin-status admin-status--${pedido.clase}`}
                        >
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{pedido.total}</td>
                      <td>
                        <Button
                          type="button"
                          className="admin-table-button"
                        >
                          {pedido.estado === 'Listo'
                            ? 'Ver pedido'
                            : 'Gestionar'}
                        </Button>
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
    </main>
  );
}

export default PanelAdmin;