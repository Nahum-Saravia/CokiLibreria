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
import './ConsultarPedido.css';

function ConsultarPedido() {
  const navigate = useNavigate();

  const [consulta, setConsulta] = useState('');
  const [resultado, setResultado] = useState('');

  useEffect(() => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (!tipoUsuario) {
      navigate('/sesion');
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!consulta.trim()) {
      setResultado('Ingresá un número de retiro o teléfono.');
      return;
    }

    setResultado(
      `Consulta realizada para: ${consulta.trim()}`
    );
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
                      placeholder="Ej: R-00024"
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

                {resultado && (
                  <div className="pedido-resultado">
                    {resultado}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default ConsultarPedido;