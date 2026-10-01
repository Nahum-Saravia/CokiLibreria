import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

function NotFound() {
  return (
    <main className="flex-grow-1 d-flex align-items-center">
      <title>Página no encontrada - Coki Librería</title>
      <Container className="text-center py-5">
        <h1 className="display-1 fw-bold coki-texto-claro">404</h1>
        <h2 className="fw-bold mb-3 coki-texto-claro">Página no encontrada</h2>
        <p className="coki-texto-claro mb-4">La página que buscás no existe o todavía está en construcción.</p>
        <Button as={Link} to="/" variant="primary" className="px-4 py-2">
          Volver al inicio
        </Button>
      </Container>
    </main>
  );
}

export default NotFound;
