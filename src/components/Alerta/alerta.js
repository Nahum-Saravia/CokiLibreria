import Swal from 'sweetalert2';
import './Alerta.css';

// SweetAlert con el estilo de Coki: usar Alerta.fire({...}) igual que Swal.fire
const Alerta = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: 'coki-alerta',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-light'
  }
});

export default Alerta;
