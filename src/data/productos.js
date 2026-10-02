import lapiceraBic from '../assets/img/lapicerabic.png';
import lapiceraFaber from '../assets/img/lapicerafaber.png';
import felponDoble from '../assets/img/felponpdoble.png';
import cuadernoAbc from '../assets/img/cuadernoABC.png';
import lapizPizarra from '../assets/img/lapizpizz.png';
import barraSilicona from '../assets/img/barradesil.png';
import siliconaLiquida from '../assets/img/siliconaliq.png';
import crayones from '../assets/img/crayones.png';
import hojasExito from '../assets/img/hojaexito24.png';
import felponPermanente from '../assets/img/felponper.png';
import cuadernoChico from '../assets/img/cuadernoc.png';
import papelGlase from '../assets/img/papelglace.png';
import lapizNegro from '../assets/img/lapiznegrob.png';
import juegoGeometria from '../assets/img/juegodeg.png';
import compas from '../assets/img/compas.png';
import liquidoCorrector from '../assets/img/liquidocorrector.png';
import felpasColores from '../assets/img/felpasdecolores.png';
import lapicesColores from '../assets/img/lapicesdecolores.png';
import plasticola from '../assets/img/plasticola.png';
import tijera from '../assets/img/tijera.png';
import boligoma from '../assets/img/boligoma.png';
import cintaPapel from '../assets/img/cintadepapel.png';
import cintaScotch from '../assets/img/cintasco.png';
import portaminas from '../assets/img/portaminas.png';

const productos = [
  { id: 1, nombre: 'Lapicera BIC Trazo Fino', precio: 900, categoria: 'Escritura', imagen: lapiceraBic, descripcion: 'Tinta de trazo fino para una escritura precisa.' },
  { id: 2, nombre: 'Lapicera Faber-Castell', precio: 800, categoria: 'Escritura', imagen: lapiceraFaber, descripcion: 'Bolígrafo ergonómico de secado rápido.' },
  { id: 3, nombre: 'Felpón Doble Punta', precio: 1500, categoria: 'Marcadores', imagen: felponDoble, descripcion: 'Marcador con punta fina y gruesa.' },
  { id: 4, nombre: 'Cuaderno Tapa Dura Grande', precio: 7000, categoria: 'Cuadernos', imagen: cuadernoAbc, descripcion: 'Cuaderno universitario resistente para uso diario.' },
  { id: 5, nombre: 'Lápiz / Marcador de Pizarra', precio: 1500, categoria: 'Marcadores', imagen: lapizPizarra, descripcion: 'Tinta borrable en seco para pizarras blancas.' },
  { id: 6, nombre: 'Barrita de Silicona Fina', precio: 500, categoria: 'Adhesivos', imagen: barraSilicona, descripcion: 'Adhesivo térmico para trabajos y manualidades.' },
  { id: 7, nombre: 'Silicona Líquida', precio: 2500, categoria: 'Adhesivos', imagen: siliconaLiquida, descripcion: 'Pegamento transparente ideal para goma EVA y tela.' },
  { id: 8, nombre: 'Crayones de Colores', precio: 3000, categoria: 'Arte', imagen: crayones, descripcion: 'Crayones de cera para colorear y dibujar.' },
  { id: 9, nombre: 'Hojas Cuadriculadas x24 Éxito', precio: 3500, categoria: 'Papelería', imagen: hojasExito, descripcion: 'Repuesto de hojas con bordes reforzados.' },
  { id: 10, nombre: 'Felpón Permanente', precio: 1500, categoria: 'Marcadores', imagen: felponPermanente, descripcion: 'Marcador indeleble resistente al agua para varias superficies.' },
  { id: 11, nombre: 'Cuaderno Chico Espiral', precio: 1500, categoria: 'Cuadernos', imagen: cuadernoChico, descripcion: 'Libreta de tamaño compacto para anotaciones rápidas.' },
  { id: 12, nombre: 'Papel Glasé', precio: 400, categoria: 'Papelería', imagen: papelGlase, descripcion: 'Hojas de colores lustradas para recortar y plegar.' },
  { id: 13, nombre: 'Lápiz Negro BIC', precio: 400, categoria: 'Escritura', imagen: lapizNegro, descripcion: 'Lápiz de grafito resistente y fácil de borrar.' },
  { id: 14, nombre: 'Juego de Geometría', precio: 3000, categoria: 'Geometría', imagen: juegoGeometria, descripcion: 'Set de regla, escuadras y transportador.' },
  { id: 15, nombre: 'Compás Escolar', precio: 1000, categoria: 'Geometría', imagen: compas, descripcion: 'Herramienta para trazar arcos y circunferencias.' },
  { id: 16, nombre: 'Líquido Corrector', precio: 1000, categoria: 'Escritura', imagen: liquidoCorrector, descripcion: 'Corrector blanco de secado rápido.' },
  { id: 17, nombre: 'Fibras / Felpas de Colores', precio: 1000, categoria: 'Arte', imagen: felpasColores, descripcion: 'Marcadores lavables para pintar y subrayar.' },
  { id: 18, nombre: 'Lápices de Colores Grandes', precio: 1500, categoria: 'Arte', imagen: lapicesColores, descripcion: 'Lápices de madera de mina suave e intensa.' },
  { id: 19, nombre: 'Plasticola', precio: 2000, categoria: 'Adhesivos', imagen: plasticola, descripcion: 'Adhesivo sintético lavable para uso escolar.' },
  { id: 20, nombre: 'Tijera Escolar', precio: 800, categoria: 'Útiles', imagen: tijera, descripcion: 'Tijera con punta redondeada para corte seguro.' },
  { id: 21, nombre: 'Boligoma / Pegamento Sintético', precio: 2000, categoria: 'Adhesivos', imagen: boligoma, descripcion: 'Adhesivo sintético lavable para papel y cartón.' },
  { id: 22, nombre: 'Cinta de Papel / Enmascarar', precio: 1500, categoria: 'Adhesivos', imagen: cintaPapel, descripcion: 'Cinta adhesiva de papel de fácil despegue sin dañar superficies.' },
  { id: 23, nombre: 'Cinta Adhesiva Transparente / Scotch', precio: 1500, categoria: 'Adhesivos', imagen: cintaScotch, descripcion: 'Cinta adhesiva transparente multiuso para pegar y embalar.' },
  { id: 24, nombre: 'Portaminas', precio: 1500, categoria: 'Escritura', imagen: portaminas, descripcion: 'Portaminas mecánico ideal para escritura fina y dibujo técnico.' },
];

export default productos;
