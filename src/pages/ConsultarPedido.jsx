import { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { buscarPedidos } from '../data/almacenamiento';
import {
  claseEstado,
  formatearPrecio,
  calcularTotal
} from '../data/estadosPedido';
import './ConsultarPedido.css';

function ConsultarPedido() {
  const navigate = useNavigate();

  const [consulta, setConsulta] = useState('');
  const [pedidosEncontrados, setPedidosEncontrados] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (!tipoUsuario) {
      navigate('/sesion');
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!consulta.trim()) {
      setError('Ingresá un número de retiro o teléfono.');
      setPedidosEncontrados(null);
      return;
    }

    setError('');
    setPedidosEncontrados(buscarPedidos(consulta));
  };

  return (
    <main className="pedido-page">
      <Container className="pedido-container">
        <Row className="justify-content-center">
          <Col xs={12} lg={9} xl={8}>
            <section className="pedido-header">
              <Link to="/" className="pedido-back">
                Volver al menú
              </Link>

              <h1>Consultar pedido</h1>

              <p>
                Buscá tu pedido con el número de retiro o teléfono.
              </p>
            </section>

            <Card className="pedido-card">
              <Card.Body>
                <h2>Estado de tu pedido</h2>

                <Form onSubmit={handleSubmit}>
                  <Form.Group
                    className="mb-4"
                    controlId="query"
                  >
                    <Form.Label>
                      Número de retiro o teléfono
                    </Form.Label>

                    <Form.Control
                      type="text"
                      value={consulta}
                      onChange={(event) =>
                        setConsulta(event.target.value)
                      }
                      placeholder="Ej: #1048 o 381 412-5587"
                      className="pedido-input"
                    />
                  </Form.Group>

                  <div className="d-grid d-sm-flex">
                    <Button
                      type="submit"
                      className="pedido-button"
                    >
                      Buscar pedido
                    </Button>
                  </div>
                </Form>

                {error && (
                  <div className="pedido-resultado">
                    {error}
                  </div>
                )}

                {pedidosEncontrados && pedidosEncontrados.length === 0 && (
                  <div className="pedido-resultado">
                    No encontramos pedidos con ese número o teléfono.
                  </div>
                )}

                {pedidosEncontrados &&
                  pedidosEncontrados.map((pedido) => (
                    <article
                      key={pedido.retiro}
                      className="pedido-resultado"
                    >
                      <div className="pedido-resultado__encabezado">
                        <div>
                          <h3>Pedido {pedido.retiro}</h3>
                          <p className="pedido-resultado__fecha">
                            {pedido.fecha}
                          </p>
                        </div>

                        <span
                          className={`pedido-estado pedido-estado--${claseEstado(pedido.estado)}`}
                        >
                          {pedido.estado}
                        </span>
                      </div>

                      <ul className="pedido-resultado__items">
                        {pedido.items.map((item) => (
                          <li key={item.producto}>
                            <span>
                              {item.cantidad} x {item.producto}
                            </span>
                            <span>
                              {formatearPrecio(
                                item.cantidad * item.precioUnitario
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <p className="pedido-resultado__total">
                        Total: {formatearPrecio(calcularTotal(pedido))}
                      </p>
                      {pedido.notas && (
                        <div className="pedido-resultado__notas">
                          <strong>Detalles de impresión:</strong>
                          <p>{pedido.notas}</p>
                        </div>
                      )}
                    </article>
                  ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default ConsultarPedido;