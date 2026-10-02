import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Sesion.css';
import logo from '../assets/img/coki-logo.png';

function Sesion() {
  const [tipoUsuario, setTipoUsuario] = useState('cliente');
  const navigate = useNavigate();

  const esAdmin = tipoUsuario === 'admin';

  const handleTipoUsuario = (event) => {
    setTipoUsuario(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (esAdmin) {
      localStorage.setItem('tipoUsuario', 'admin');
      window.dispatchEvent(new Event('sesionCambiada'));
      navigate('/panel-admin');
      return;
    }

    localStorage.setItem('tipoUsuario', 'cliente');
    window.dispatchEvent(new Event('sesionCambiada'));
    navigate('/');
  };

  return (
    <main className="sesion-page">
      <header className="sesion-header">
        <img
            src={logo}
            alt="Logo de Coki Librería"
            className="sesion-logo"
        />

        <h1>Inicio de sesión</h1>

        <p>
          {esAdmin
            ? 'Acceso al panel de administración de Coki Librería'
            : 'Ingresá a tu cuenta de Coki Librería'}
        </p>
      </header>

      <Container className="sesion-container">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4}>
            <h2 className="sesion-title">
              {esAdmin ? 'Acceso de administrador' : 'Acceso de usuario'}
            </h2>

            <Card className="sesion-card">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <fieldset>
                    <legend className="sesion-legend">
                      Datos de acceso
                    </legend>

                    <Form.Group className="mb-3" controlId="tipoUsuario">
                      <Form.Label>Tipo de cuenta:</Form.Label>

                      <Form.Select
                        value={tipoUsuario}
                        onChange={handleTipoUsuario}
                        className="sesion-input"
                      >
                        <option value="cliente">Cliente</option>
                        <option value="admin">Administrador</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="identificador"
                    >
                      <Form.Label>
                        {esAdmin ? 'Usuario:' : 'Correo electrónico:'}
                      </Form.Label>

                      <Form.Control
                        type={esAdmin ? 'text' : 'email'}
                        name="identificador"
                        autoComplete={esAdmin ? 'username' : 'email'}
                        placeholder={
                          esAdmin
                            ? 'Ingresá tu usuario'
                            : 'Ingresá tu correo electrónico'
                        }
                        required
                        className="sesion-input"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Contraseña:</Form.Label>

                      <Form.Control
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        placeholder="Ingresá tu contraseña"
                        required
                        className="sesion-input"
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        type="submit"
                        className="sesion-button"
                      >
                        Iniciar sesión
                      </Button>
                    </div>
                  </fieldset>
                </Form>
              </Card.Body>
            </Card>

            {!esAdmin && (
              <>
                <p className="sesion-link-text">
                  ¿No tenés una cuenta? <a href="#registro">Registrate</a>
                </p>

                <p className="sesion-link-text">
                  <a href="#recuperar">¿Olvidaste tu contraseña?</a>
                </p>
              </>
            )}

            <p className="sesion-back">
              <Link to="/">Volver al inicio</Link>
            </p>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Sesion;