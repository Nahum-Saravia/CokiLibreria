import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import contacto from '../data/contacto';
import logo from '../assets/img/coki-logo.png';
import './Footer.css';

function Footer() {
  return (
    <footer className="coki-footer mt-auto pt-4 pt-md-5 pb-3 text-center text-md-start">
      <Container>
        <Row className="gy-4">
          <Col xs={12} md={4}>
            <img src={logo} alt="Logo de Coki Librería" width="56" height="56" className="d-block mx-auto mx-md-0 mb-2" />
            <h2 className="coki-footer__titulo">Coki Librería</h2>
            <p className="small mb-0">Útiles escolares, impresiones y mucho más.</p>
          </Col>

          {contacto.map((grupo) => (
            <Col key={grupo.id} xs={12} sm={6} md={4}>
              <h3 className="coki-footer__titulo">{grupo.titulo}</h3>
              <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                {grupo.links.map((item) => (
                  <li key={item.id}>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="d-inline-flex align-items-center gap-2">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" className="coki-footer__icono">
                        <path d={item.icono} />
                      </svg>
                      {item.texto}
                    </a>
                  </li>
                ))}
              </ul>
            </Col>
          ))}
        </Row>

        <hr className="coki-footer__sep my-3" />

        <p className="small text-center mb-0">&copy; 2026 Coki Librería</p>
      </Container>
    </footer>
  );
}

export default Footer;
