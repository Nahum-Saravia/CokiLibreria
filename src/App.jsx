import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Rutas from './components/routes/Rutas';

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
