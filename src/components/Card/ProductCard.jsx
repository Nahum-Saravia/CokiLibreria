import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import './ProductCard.css';

function ProductCard({ imagen, nombre, categoria, descripcion, precio, stock, onAgregar, puedeComprar = true }) {
  const sinStock = stock === 0;
  const [cantidad, setCantidad] = useState(1);

  const cambiarCantidad = (valor) => {
    const numero = Number(valor) || 1;
    setCantidad(Math.min(Math.max(numero, 1), Math.max(stock, 1)));
  };

  const agregar = () => {
    onAgregar(cantidad);
    setCantidad(1);
  };

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
          {puedeComprar && !sinStock && (
            <div className="d-flex align-items-center coki-product-card__cantidad">
              <button
                type="button"
                aria-label={`Restar una unidad de ${nombre}`}
                onClick={() => cambiarCantidad(cantidad - 1)}
                disabled={cantidad <= 1}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={stock}
                value={cantidad}
                onChange={(evento) => cambiarCantidad(evento.target.value)}
                aria-label={`Cantidad de ${nombre}`}
              />
              <button
                type="button"
                aria-label={`Sumar una unidad de ${nombre}`}
                onClick={() => cambiarCantidad(cantidad + 1)}
                disabled={cantidad >= stock}
              >
                +
              </button>
            </div>
          )}
          {puedeComprar ? (
            <Button variant="primary" className="flex-grow-1" onClick={agregar} disabled={sinStock}>
              {sinStock ? 'Sin stock' : 'Agregar'}
            </Button>
          ) : (
            <span className="small fw-bold coki-product-card__stock">Stock: {stock}</span>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
