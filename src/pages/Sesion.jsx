import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './Sesion.css';
import logo from '../assets/img/coki-logo.png';
import Alerta from '../components/Alerta/alerta';

function Sesion() {
  const [tipoUsuario, setTipoUsuario] = useState('cliente');
  const [modoRegistro, setModoRegistro] = useState(false);
  const [contrasena, setContrasena] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const navigate = useNavigate();

  const esAdmin = tipoUsuario === 'admin';
  const esRegistro = !esAdmin && modoRegistro;

  const handleTipoUsuario = (event) => {
    const nuevoTipo = event.target.value;

    setTipoUsuario(nuevoTipo);
    setModoRegistro(false);
    setContrasena('');
    setRepetirContrasena('');
    setMostrarContrasena(false);
  };

  const cambiarModoRegistro = (registro) => {
    setModoRegistro(registro);
    setContrasena('');
    setRepetirContrasena('');
    setMostrarContrasena(false);
  };

  const validarContrasena = (valor) => {
    return (
      valor.length >= 8 &&
      /[A-Z]/.test(valor) &&
      /[a-z]/.test(valor) &&
      /\d/.test(valor) &&
      /[^A-Za-z0-9]/.test(valor)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (esRegistro) {
      if (!validarContrasena(contrasena)) {
        await Alerta.fire({
          icon: 'warning',
          title: 'Contraseña no válida',
          text: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.'
        });
        return;
      }

      if (contrasena !== repetirContrasena) {
        await Alerta.fire({
          icon: 'error',
          title: 'Las contraseñas no coinciden',
          text: 'Ingresá la misma contraseña en ambos campos.'
        });
        return;
      }

      await Alerta.fire({
        icon: 'success',
        title: 'Registro correcto',
        text: 'El formulario de registro es válido. Ya podés iniciar sesión.'
      });

      setModoRegistro(false);
      setContrasena('');
      setRepetirContrasena('');
      setMostrarContrasena(false);

      return;
    }

    if (esAdmin) {
      const formulario = event.currentTarget;
      const usuario = formulario.elements.identificador.value.trim();
      const password = formulario.elements.password.value;

      if (!usuario) {
        await Alerta.fire({
          icon: 'warning',
          title: 'Falta el usuario',
          text: 'Ingresá tu usuario de administrador.'
        });
        return;
      }

      if (!usuario.includes('@')) {
        await Alerta.fire({
          icon: 'warning',
          title: 'Usuario no válido',
          text: 'El usuario de administrador debe contener @.'
        });
        return;
      }

      if (!password) {
        await Alerta.fire({
          icon: 'warning',
          title: 'Falta la contraseña',
          text: 'Ingresá una contraseña para continuar.'
        });
        return;
      }

      localStorage.setItem('tipoUsuario', 'admin');

      window.dispatchEvent(
        new Event('sesionCambiada')
      );

      await Alerta.fire({
        icon: 'success',
        title: 'Inicio de sesión exitoso',
        text: 'Bienvenido al panel de administración de Coki Librería.'
      });

      navigate('/panel-admin');

      return;
    }

    localStorage.setItem('tipoUsuario', 'cliente');

    window.dispatchEvent(
      new Event('sesionCambiada')
    );

    await Alerta.fire({
      icon: 'success',
      title: 'Inicio de sesión exitoso',
      text: 'Bienvenido a Coki Librería.'
    });

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

        <h1>
          {esRegistro
            ? 'Registrarse'
            : 'Inicio de sesión'}
        </h1>

        <p>
          {esRegistro
            ? 'Creá tu cuenta de Coki Librería'
            : esAdmin
              ? 'Acceso al panel de administración de Coki Librería'
              : 'Ingresá a tu cuenta de Coki Librería'}
        </p>
      </header>

      <Container className="sesion-container">
        <Row className="justify-content-center">
          <Col
            xs={12}
            sm={10}
            md={8}
            lg={6}
            xl={5}
            xxl={4}
          >
            <h2 className="sesion-title">
              {esRegistro
                ? 'Crear una cuenta'
                : esAdmin
                  ? 'Acceso de administrador'
                  : 'Acceso de usuario'}
            </h2>

            <Card className="sesion-card">
              <Card.Body className="p-4">
                <Form
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <fieldset>
                    <legend className="sesion-legend">
                      {esRegistro
                        ? 'Datos de registro'
                        : 'Datos de acceso'}
                    </legend>

                    <Form.Group
                      className="mb-3"
                      controlId="tipoUsuario"
                    >
                      <Form.Label>
                        Tipo de cuenta:
                      </Form.Label>

                      <Form.Select
                        value={tipoUsuario}
                        onChange={handleTipoUsuario}
                        className="sesion-input"
                      >
                        <option value="cliente">
                          Cliente
                        </option>

                        <option value="admin">
                          Administrador
                        </option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group
                      className="mb-3"
                      controlId="identificador"
                    >
                      <Form.Label>
                        {esAdmin
                          ? 'Usuario:'
                          : 'Correo electrónico:'}
                      </Form.Label>

                      <Form.Control
                        type={
                          esAdmin
                            ? 'text'
                            : 'email'
                        }
                        name="identificador"
                        autoComplete={
                          esAdmin
                            ? 'username'
                            : 'email'
                        }
                        placeholder={
                          esAdmin
                            ? 'Ingresá tu usuario'
                            : 'Ingresá tu correo electrónico'
                        }
                        required
                        className="sesion-input"
                      />
                    </Form.Group>

                    <Form.Group
                      className="mb-2"
                      controlId="password"
                    >
                      <Form.Label>
                        Contraseña:
                      </Form.Label>

                      <div className="sesion-password-wrapper">
                        <Form.Control
                          type={
                            mostrarContrasena
                              ? 'text'
                              : 'password'
                          }
                          name="password"
                          autoComplete={
                            esRegistro
                              ? 'new-password'
                              : 'current-password'
                          }
                          placeholder="Ingresá tu contraseña"
                          value={contrasena}
                          onChange={(event) =>
                            setContrasena(
                              event.target.value
                            )
                          }
                          minLength={8}
                          required
                          className="sesion-input sesion-password-input"
                        />

                        <button
                          type="button"
                          className="sesion-password-toggle"
                          onClick={() =>
                            setMostrarContrasena(
                              !mostrarContrasena
                            )
                          }
                          aria-label={
                            mostrarContrasena
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
                        >
                          {mostrarContrasena ? (
                            <svg
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3 3l18 18" />
                              <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                              <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 8.5 5 8.5 5a16.5 16.5 0 0 1-4.02 4.47" />
                              <path d="M6.61 6.61C4.22 8.09 2.5 10 2.5 10S6 15 11 15c.73 0 1.43-.1 2.09-.29" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              width="20"
                              height="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M2.5 12S6 7 12 7s9.5 5 9.5 5S18 17 12 17 2.5 12 2.5 12Z" />
                              <circle
                                cx="12"
                                cy="12"
                                r="2.5"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </Form.Group>

                    {esRegistro && (
                      <>
                        <div className="sesion-requisitos">
                          <p>
                            La contraseña debe tener:
                          </p>

                          <ul>
                            <li>
                              Mínimo 8 caracteres.
                            </li>
                            <li>
                              Al menos una letra mayúscula.
                            </li>
                            <li>
                              Al menos una letra minúscula.
                            </li>
                            <li>
                              Al menos un número.
                            </li>
                            <li>
                              Al menos un carácter especial.
                            </li>
                          </ul>
                        </div>

                        <Form.Group
                          className="mb-3"
                          controlId="repetirPassword"
                        >
                          <Form.Label>
                            Repetir contraseña:
                          </Form.Label>

                          <div className="sesion-password-wrapper">
                            <Form.Control
                              type={
                                mostrarContrasena
                                  ? 'text'
                                  : 'password'
                              }
                              name="repetirPassword"
                              autoComplete="new-password"
                              placeholder="Repetí tu contraseña"
                              value={repetirContrasena}
                              onChange={(event) =>
                                setRepetirContrasena(
                                  event.target.value
                                )
                              }
                              required
                              className="sesion-input sesion-password-input"
                            />

                            <button
                              type="button"
                              className="sesion-password-toggle"
                              onClick={() =>
                                setMostrarContrasena(
                                  !mostrarContrasena
                                )
                              }
                              aria-label={
                                mostrarContrasena
                                  ? 'Ocultar contraseña'
                                  : 'Mostrar contraseña'
                              }
                            >
                              {mostrarContrasena ? (
                                <svg
                                  viewBox="0 0 24 24"
                                  width="20"
                                  height="20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M3 3l18 18" />
                                  <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                  <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 8.5 5 8.5 5a16.5 16.5 0 0 1-4.02 4.47" />
                                  <path d="M6.61 6.61C4.22 8.09 2.5 10 2.5 10S6 15 11 15c.73 0 1.43-.1 2.09-.29" />
                                </svg>
                              ) : (
                                <svg
                                  viewBox="0 0 24 24"
                                  width="20"
                                  height="20"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M2.5 12S6 7 12 7s9.5 5 9.5 5S18 17 12 17 2.5 12 2.5 12Z" />
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="2.5"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </Form.Group>
                      </>
                    )}

                    <div className="d-grid">
                      <Button
                        type="submit"
                        className="sesion-button"
                      >
                        {esRegistro
                          ? 'Registrarse'
                          : 'Iniciar sesión'}
                      </Button>
                    </div>
                  </fieldset>
                </Form>
              </Card.Body>
            </Card>

            {!esAdmin && !esRegistro && (
              <p className="sesion-link-text">
                ¿No tenés una cuenta?{' '}
                <button
                  type="button"
                  className="sesion-link-button"
                  onClick={() =>
                    cambiarModoRegistro(true)
                  }
                >
                  Registrate
                </button>
              </p>
            )}

            {!esAdmin && esRegistro && (
              <p className="sesion-link-text">
                ¿Ya tenés una cuenta?{' '}
                <button
                  type="button"
                  className="sesion-link-button"
                  onClick={() =>
                    cambiarModoRegistro(false)
                  }
                >
                  Iniciá sesión
                </button>
              </p>
            )}

            <p className="sesion-back">
              <Link to="/">
                Volver al inicio
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

export default Sesion;

