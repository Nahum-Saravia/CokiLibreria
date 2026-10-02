import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { tiposImpresion, tiposPapel } from '../data/opcionesImpresion';
import './Impresiones.css';

function Impresiones() {
  return (
    <main className="flex-grow-1">
      <title>Impresiones - Coki Librería</title>
      <Container className="py-4 py-md-5">
        <header className="text-center pt-4 mb-4">
          <h1 className="fw-bold coki-texto-claro">Servicio de impresiones</h1>
          <p className="coki-texto-claro mb-0">Configurá tu impresión y agregala al carrito.</p>
        </header>

        <section aria-labelledby="tituloOpciones">
          <h2 id="tituloOpciones" className="fw-bold mb-3 coki-texto-claro">
            Opciones de impresión
          </h2>

          <Card as="form" className="coki-impresiones">
            <Card.Body className="p-3 p-md-4">
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <Form.Group controlId="tipoImpresion">
                    <Form.Label>Tipo de impresión</Form.Label>
                    <Form.Select name="tipoImpresion">
                      {tiposImpresion.map((tipo) => (
                        <option key={tipo.id} value={tipo.valor}>
                          {tipo.texto}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group controlId="tipoPapel">
                    <Form.Label>Tipo de papel</Form.Label>
                    <Form.Select name="tipoPapel">
                      {tiposPapel.map((papel) => (
                        <option key={papel.id} value={papel.valor}>
                          {papel.texto}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="descripcion">
                    <Form.Label>Descripción de la impresión</Form.Label>
                    <Form.Control as="textarea" name="descripcion" rows={3} placeholder="Detalles sobre la impresión" />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="archivo">
                    <Form.Label>Adjuntar archivo</Form.Label>
                    <Form.Control type="file" name="archivo" />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Button type="button" variant="light">
                    Agregar al carrito
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </section>
      </Container>
    </main>
  );
}

export default Impresiones;
