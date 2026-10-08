import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BsNavbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import CartIcon from '../Cart/CartIcon';
import secciones from '../../data/secciones';
import logo from '../../assets/img/coki-logo.png';
import casa from '../../assets/img/casa.png';
import './Navbar.css';
import CartPanel from '../Cart/CartPanel';
import Alerta from '../Alerta/alerta';

function Navbar() {
  const navigate = useNavigate();
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  const [tipoUsuario, setTipoUsuario] = useState(
    localStorage.getItem('tipoUsuario')
  );

  useEffect(() => {
    const actualizarSesion = () => {
      setTipoUsuario(localStorage.getItem('tipoUsuario'));
    };

    window.addEventListener('storage', actualizarSesion);
    window.addEventListener('sesionCambiada', actualizarSesion);

    return () => {
      window.removeEventListener('storage', actualizarSesion);
      window.removeEventListener('sesionCambiada', actualizarSesion);
    };
  }, []);

  const calcularCantidadCarrito = () => {
    const guardado = localStorage.getItem('coki-carrito');

    if (!guardado) {
      return 0;
    }

    try {
      const carrito = JSON.parse(guardado);

      return carrito.reduce(
        (total, item) => total + Number(item.cantidad || 0),
        0
      );
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const actualizarCantidad = () => {
      setCantidadCarrito(calcularCantidadCarrito());
    };

    actualizarCantidad();

    window.addEventListener(
      'carritoActualizado',
      actualizarCantidad
    );

    window.addEventListener(
      'storage',
      actualizarCantidad
    );

    return () => {
      window.removeEventListener(
        'carritoActualizado',
        actualizarCantidad
      );

      window.removeEventListener(
        'storage',
        actualizarCantidad
      );
    };
  }, []);

  const cerrarSesion = async () => {
    const resultado = await Alerta.fire({
      icon: 'warning',
      title: '¿Estás seguro de querer cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!resultado.isConfirmed) {
      return;
    }

    localStorage.removeItem('tipoUsuario');
    window.dispatchEvent(new Event('sesionCambiada'));

    await Alerta.fire({
      icon: 'success',
      title: 'Sesión cerrada',
      text: 'Cerraste sesión correctamente.'
    });

    navigate('/sesion');
  };

  const esAdmin = tipoUsuario === 'admin';

  const estaLogueado =
    tipoUsuario === 'admin' || tipoUsuario === 'cliente';

  return (
    <BsNavbar
      as="header"
      expand="lg"
      collapseOnSelect
      className="coki-navbar py-3"
    >
      <Container fluid>
        <Row className="w-100 align-items-center g-0">
          <Col className="d-none d-lg-flex align-items-center gap-2">
            <Button
              as={Link}
              to="/"
              variant="light"
              className="d-flex align-items-center gap-2"
            >
              <img
                src={casa}
                alt=""
                width="20"
                height="20"
              />
              Volver al inicio
            </Button>

            {!estaLogueado && (
              <Button
                as={Link}
                to="/sesion"
                variant="primary"
              >
                Iniciar sesión
              </Button>
            )}

            {esAdmin && (
              <>
                <Button
                  as={Link}
                  to="/panel-admin"
                  variant="primary"
                >
                  Panel de administración
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  onClick={cerrarSesion}
                >
                  Cerrar sesión
                </Button>
              </>
            )}

            {tipoUsuario === 'cliente' && (
              <Button
                type="button"
                variant="primary"
                onClick={cerrarSesion}
              >
                Cerrar sesión
              </Button>
            )}
          </Col>

          <Col xs="auto">
            <BsNavbar.Brand as={Link} to="/" className="m-0">
              <img
                src={logo}
                alt="Logo de Coki Librería"
                className="coki-navbar__logo"
              />
            </BsNavbar.Brand>
          </Col>

          <Col className="d-flex justify-content-end">
            <BsNavbar.Toggle
              aria-controls="menuMovil"
              aria-label="Abrir menú"
              className="coki-navbar__toggle"
            >
              <svg
                viewBox="0 0 16 16"
                width="22"
                height="22"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
              </svg>
            </BsNavbar.Toggle>

            <BsNavbar.Offcanvas
              id="menuMovil"
              aria-labelledby="menuMovilTitulo"
              placement="end"
              className="coki-offcanvas"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title
                  as="h2"
                  id="menuMovilTitulo"
                  className="h4 fw-bold m-0"
                >
                  Menú
                </Offcanvas.Title>
              </Offcanvas.Header>

              <Offcanvas.Body className="align-items-center justify-content-end gap-2">
                <Nav
                  as="nav"
                  aria-label="Secciones principales"
                  className="d-none d-lg-flex flex-row align-items-center gap-1 p-1 rounded-pill coki-navbar__links"
                >
                  {secciones
                    .filter(
                      (seccion) =>
                        !esAdmin || seccion.link !== '/pedidos'
                    )
                    .map((seccion) => (
                      <Nav.Link
                        key={seccion.id}
                        as={Link}
                        to={seccion.link}
                        eventKey={seccion.link}
                        className="fw-bold px-3 rounded-pill"
                      >
                        {seccion.texto}
                      </Nav.Link>
                    ))}

                  {!esAdmin && (
                    <Button
                      type="button"
                      variant="link"
                      aria-label="Ver carrito"
                      className="d-inline-flex text-reset rounded-pill px-3 coki-navbar__carrito"
                      onClick={() =>
                        setCarritoAbierto(true)
                      }
                    >
                      <CartIcon cantidad={cantidadCarrito} />
                    </Button>
                  )}
                </Nav>

                <Nav
                  as="nav"
                  aria-label="Menú móvil"
                  className="d-lg-none flex-column gap-1"
                >
                  {secciones
                    .filter(
                      (seccion) =>
                        !esAdmin || seccion.link !== '/pedidos'
                    )
                    .map((seccion) => (
                      <Nav.Link
                        key={seccion.id}
                        as={Link}
                        to={seccion.link}
                        eventKey={seccion.link}
                        className="fw-bold px-3 rounded-3"
                      >
                        {seccion.texto}
                      </Nav.Link>
                    ))}

                  <hr className="my-2" />

                  <Nav.Link
                    as={Link}
                    to="/"
                    eventKey="/"
                    className="fw-bold px-3 rounded-3"
                  >
                    Volver al inicio
                  </Nav.Link>

                  {!estaLogueado && (
                    <Nav.Link
                      as={Link}
                      to="/sesion"
                      eventKey="/sesion"
                      className="fw-bold px-3 rounded-3"
                    >
                      Iniciar sesión
                    </Nav.Link>
                  )}

                  {esAdmin && (
                    <>
                      <Nav.Link
                        as={Link}
                        to="/panel-admin"
                        eventKey="/panel-admin"
                        className="fw-bold px-3 rounded-3"
                      >
                        Panel de administración
                      </Nav.Link>

                      <Nav.Link
                        as="button"
                        type="button"
                        onClick={cerrarSesion}
                        className="fw-bold px-3 rounded-3 text-start border-0 bg-transparent"
                      >
                        Cerrar sesión
                      </Nav.Link>
                    </>
                  )}

                  {tipoUsuario === 'cliente' && (
                    <Nav.Link
                      as="button"
                      type="button"
                      onClick={cerrarSesion}
                      className="fw-bold px-3 rounded-3 text-start border-0 bg-transparent"
                    >
                      Cerrar sesión
                    </Nav.Link>
                  )}

                  {!esAdmin && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={() =>
                        setCarritoAbierto(true)
                      }
                      className="d-flex align-items-center gap-3 fw-bold text-reset text-decoration-none px-3 rounded-3 coki-offcanvas__carrito"
                    >
                      <CartIcon cantidad={cantidadCarrito} />
                      Carrito
                    </Button>
                  )}
                </Nav>
              </Offcanvas.Body>
            </BsNavbar.Offcanvas>
          </Col>
        </Row>
      </Container>

      <CartPanel
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
      />
    </BsNavbar>
  );
}

export default Navbar;
