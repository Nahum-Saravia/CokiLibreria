import Card from 'react-bootstrap/Card';
import './CategoryCard.css';

function CategoryCard({ imagen, alt, titulo, textoBoton, link }) {
  return (
    <Card as="a" href={link} className="w-100 text-decoration-none coki-category-card">
      <div className="coki-category-card__media">
        <Card.Img variant="top" src={imagen} alt={alt} className="w-100 h-100 object-fit-contain p-2" />
      </div>
      <Card.Body className="d-flex flex-column gap-2">
        <Card.Title as="h3" className="h5 fw-bold m-0">
          {titulo}
        </Card.Title>
        <span className="btn btn-primary align-self-start px-4 py-2 mt-1">{textoBoton}</span>
      </Card.Body>
    </Card>
  );
}

export default CategoryCard;
