import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Libreria from "../pages/Libreria";
import Impresiones from "../pages/Impresiones";
import Sesion from "../pages/Sesion";
import ConsultarPedido from "../pages/ConsultarPedido";
import PanelAdmin from "../pages/PanelAdmin";
import NotFound from "../pages/NotFound";

function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/libreria" element={<Libreria />} />
      <Route path="/impresiones" element={<Impresiones />} />
      <Route path="/pedidos" element={<ConsultarPedido />} />
      <Route path="/sesion" element={<Sesion />} />
      <Route path="/panel-admin" element={<PanelAdmin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default Rutas;
