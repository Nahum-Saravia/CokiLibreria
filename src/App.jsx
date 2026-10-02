import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Libreria from './pages/Libreria';
import Impresiones from './pages/Impresiones';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar cantidadCarrito={0} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/libreria" element={<Libreria />} />
        <Route path="/impresiones" element={<Impresiones />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
