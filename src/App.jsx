import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Libreria from './pages/Libreria';
import Impresiones from './pages/Impresiones';
import Sesion from './pages/Sesion';
import ConsultarPedido from './pages/ConsultarPedido';
import PanelAdmin from './pages/PanelAdmin';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/libreria" element={<Libreria />} />
        <Route path="/impresiones" element={<Impresiones />} />
        <Route path="/pedidos" element={<ConsultarPedido />} />
        <Route path="/sesion" element={<Sesion />} />
        <Route path="/panel-admin" element={<PanelAdmin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;