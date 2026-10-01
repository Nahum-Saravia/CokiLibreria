import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CategoryCard from '../components/CategoryCard';
import categorias from '../data/categorias';

function Home() {
  return (
    <main className="flex-grow-1">
      <Container className="py-4">
        <h1 className="text-center fw-bold pt-5 pb-2 coki-texto-claro">Coki Librería</h1>

        <section aria-labelledby="tituloCategorias" className="py-4">
          <h2 id="tituloCategorias" className="text-center fw-bold mb-4 coki-texto-claro">
            Categorías
          </h2>

          <Row xs={1} sm={2} lg={3} className="g-4 justify-content-center">
            {categorias.map((categoria) => (
              <Col key={categoria.id} className="d-flex justify-content-center">
                <CategoryCard
                  imagen={categoria.imagen}
                  alt={categoria.alt}
                  titulo={categoria.titulo}
                  textoBoton={categoria.textoBoton}
                  link={categoria.link}
                />
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </main>
  );
}

export default Home;
