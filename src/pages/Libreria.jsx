import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Pagination from 'react-bootstrap/Pagination';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import ProductCard from '../components/Card/ProductCard';
import { leerProductos } from '../data/almacenamiento';
import './Libreria.css';

const PRODUCTOS_POR_PAGINA = 6;

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function Libreria() {
  const [productos, setProductos] = useState(leerProductos);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [aviso, setAviso] = useState('');
  const [esAdmin, setEsAdmin] = useState(localStorage.getItem('tipoUsuario') === 'admin');

  useEffect(() => {
    const actualizarSesion = () => setEsAdmin(localStorage.getItem('tipoUsuario') === 'admin');

    window.addEventListener('sesionCambiada', actualizarSesion);
    window.addEventListener('storage', actualizarSesion);

    return () => {
      window.removeEventListener('sesionCambiada', actualizarSesion);
      window.removeEventListener('storage', actualizarSesion);
    };
  }, []);

  useEffect(() => {
    const actualizar = () => setProductos(leerProductos());

    window.addEventListener('productosActualizados', actualizar);
    window.addEventListener('storage', actualizar);

    return () => {
      window.removeEventListener('productosActualizados', actualizar);
      window.removeEventListener('storage', actualizar);
    };
  }, []);

  const buscado = normalizar(busqueda.trim());
  const encontrados = productos.filter((producto) =>
    normalizar(`${producto.nombre} ${producto.categoria} ${producto.descripcion}`).includes(buscado)
  );

  const totalPaginas = Math.ceil(encontrados.length / PRODUCTOS_POR_PAGINA);
  const desde = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const visibles = encontrados.slice(desde, desde + PRODUCTOS_POR_PAGINA);
  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1);

  function buscar(evento) {
    setBusqueda(evento.target.value);
    setPaginaActual(1);
  }

  function agregarAlCarrito(producto, cantidad = 1) {
    if (esAdmin) {
      return;
    }

    const carrito = JSON.parse(
      localStorage.getItem('coki-carrito') || '[]'
    );

    const yaEstaba = carrito.find(
      (item) => item.id === producto.id
    );

    const cantidadEnCarrito = yaEstaba ? yaEstaba.cantidad : 0;

    const disponible = producto.stock - cantidadEnCarrito;

    if (disponible <= 0) {
      setAviso(`No hay más stock de "${producto.nombre}".`);
      return;
    }

    if (cantidad > disponible) {
      setAviso(`Solo podés agregar ${disponible} más de "${producto.nombre}".`);
      return;
    }

    if (yaEstaba) {
      yaEstaba.cantidad += cantidad;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad
      });
    }

    localStorage.setItem(
      'coki-carrito',
      JSON.stringify(carrito)
    );

    window.dispatchEvent(new Event('carritoActualizado'));

    setAviso(`Agregaste ${cantidad} x "${producto.nombre}" al carrito.`);
  }

  return (
    <main className="flex-grow-1">
      <title>Librería Coki - Útiles escolares</title>
      <Container className="py-4 py-md-5">
        <div className="d-flex flex-wrap align-items-start gap-3 mb-4">
          <Button as={Link} to="/" variant="light">
            Volver al menú
          </Button>
          <div className="flex-grow-1">
            <h1 className="fw-bold coki-texto-claro">Productos de librería</h1>
            <p className="coki-texto-claro mb-0">
              Elegí productos, cantidad y color. Después podés ir al carrito para finalizar el pedido.
            </p>
          </div>
        </div>

        <Card className="coki-libreria">
          <Card.Body className="p-3 p-md-4">
            <Card.Title as="h2" className="fw-bold mb-3">
              Librería
            </Card.Title>

            <Form.Group controlId="busquedaProducto" className="mb-4">
              <Form.Label className="fw-bold">Buscar producto</Form.Label>
              <Form.Control value={busqueda} onChange={buscar} placeholder="Ej: lápiz, carpeta, goma" />
            </Form.Group>

            {encontrados.length === 0 ? (
              <p className="text-center p-4 mb-0 coki-libreria__vacio">
                No encontramos productos para tu búsqueda. Probá con otra palabra, por ejemplo "lápiz", "cuaderno" o "adhesivos".
              </p>
            ) : (
              <>
                <p className="fw-bold mb-2 coki-libreria__contador">
                  Mostrando {desde + 1}-{desde + visibles.length} de {encontrados.length} productos
                </p>

                <Row xs={2} sm={3} className="g-3 g-lg-4">
                  {visibles.map((producto) => (
                    <Col key={producto.id}>
                      <ProductCard
                        imagen={producto.imagen}
                        nombre={producto.nombre}
                        categoria={producto.categoria}
                        descripcion={producto.descripcion}
                        precio={producto.precio}
                        stock={producto.stock}
                        onAgregar={(cantidad) => agregarAlCarrito(producto, cantidad)}
                        puedeComprar={!esAdmin}
                      />
                    </Col>
                  ))}
                </Row>

                {totalPaginas > 1 && (
                  <Pagination aria-label="Paginación de productos" className="flex-wrap justify-content-center gap-1 mt-4 mb-0 coki-paginacion">
                    <Pagination.Prev disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)} />
                    {paginas.map((pagina) => (
                      <Pagination.Item key={pagina} active={pagina === paginaActual} onClick={() => setPaginaActual(pagina)}>
                        {pagina}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)} />
                  </Pagination>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      <ToastContainer position="bottom-end" containerPosition="fixed" className="p-3">
        <Toast show={aviso !== ''} onClose={() => setAviso('')} delay={2500} autohide className="coki-aviso">
          <Toast.Body className="fw-bold">{aviso}</Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  );
}

export default Libreria;
