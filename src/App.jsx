import Navbar from './components/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar cantidadCarrito={0} />
      <Home />
    </div>
  );
}

export default App;
