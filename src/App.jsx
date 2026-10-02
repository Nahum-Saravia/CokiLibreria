import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Rutas from './routes/Rutas';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Rutas />

      <Footer />
    </div>
  );
}

export default App;
