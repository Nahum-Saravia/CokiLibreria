import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './ProductCard.css';

function ProductCard({ imagen, nombre, categoria, descripcion, precio, onAgregar }) {
  return (
    <Card as="article" className="h-100 coki-product-card">
      <div className="coki-product-card__media">
        <Card.Img
          variant="top"
          src={imagen}
          alt={`${nombre} - ${categoria} en Coki Librería`}
          loading="lazy"
          className="w-100 h-100 object-fit-contain p-2 rounded-0"
        />
      </div>
      <Card.Body className="d-flex flex-column gap-1 p-3">
        <Card.Subtitle as="p" className="small fw-bolder text-uppercase m-0 coki-product-card__categoria">
          {categoria}
        </Card.Subtitle>
        <Card.Title as="h3" className="fs-6 m-0 coki-product-card__nombre">
          {nombre}
        </Card.Title>
        <Card.Text className="small m-0 coki-product-card__descripcion">{descripcion}</Card.Text>
        <div className="d-flex flex-wrap align-items-center gap-2 mt-auto pt-2">
          <span className="fw-bold coki-product-card__precio">$ {precio.toLocaleString('es-AR')}</span>
          <Button variant="primary" className="flex-grow-1" onClick={onAgregar}>
            Agregar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
