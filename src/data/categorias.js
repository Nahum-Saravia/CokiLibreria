import utilesEscolares from '../assets/img/utilesescolares.png';
import impresiones from '../assets/img/impresiones.png';
import consultas from '../assets/img/consultas.png';

const categorias = [
  {
    id: 1,
    imagen: utilesEscolares,
    alt: 'Útiles escolares de Coki Librería',
    titulo: 'Útiles escolares',
    textoBoton: 'Ver útiles escolares',
    link: '/libreria',
  },
  {
    id: 2,
    imagen: impresiones,
    alt: 'Servicio de impresiones de Coki Librería',
    titulo: 'Impresiones',
    textoBoton: 'Ir a impresiones',
    link: '/impresiones',
  },
  {
    id: 3,
    imagen: consultas,
    alt: 'Consulta de pedidos de Coki Librería',
    titulo: 'Consultar pedido',
    textoBoton: 'Consultar mi pedido',
    link: '/pedidos',
  },
];

export default categorias;
