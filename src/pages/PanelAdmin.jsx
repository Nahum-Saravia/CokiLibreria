import { useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Modal,
  ButtonGroup,
  InputGroup
} from 'react-bootstrap';
import './PanelAdmin.css';
import { useEffect, useState } from 'react';
import Alerta from '../components/Alerta/alerta';
import {
  leerProductos,
  guardarProductos,
  leerPedidos,
  guardarPedidos
} from '../data/almacenamiento';
import productosIniciales from '../data/productos';
import estadosPedido, {
  claseEstado,
  formatearPrecio,
  calcularTotal
} from '../data/estadosPedido';

const STOCK_BAJO = 5;

const categorias = [...new Set(productosIniciales.map((producto) => producto.categoria))];

const TAMANIO_MAXIMO_IMAGEN = 1024 * 1024;

const productoVacio = {
  nombre: '',
  categoria: '',
  precio: '',
  stock: '',
  descripcion: '',
  imagen: ''
};

const periodosVentas = [
  { valor: 'dia', texto: 'Día', detalle: 'hoy' },
  { valor: 'semana', texto: 'Semana', detalle: 'esta semana' },
  { valor: 'mes', texto: 'Mes', detalle: 'este mes' }
];

function convertirFecha(texto) {
  const [dia, mes, anio] = texto.split('/').map(Number);
  return new Date(anio, mes - 1, dia);
}

function esDelPeriodo(fechaTexto, periodo) {
  const fecha = convertirFecha(fechaTexto);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (periodo === 'dia') {
    return fecha.getTime() === hoy.getTime();
  }

  if (periodo === 'mes') {
    return (
      fecha.getMonth() === hoy.getMonth() &&
      fecha.getFullYear() === hoy.getFullYear()
    );
  }

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));

  return fecha >= inicioSemana && fecha <= hoy;
}

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function PanelAdmin() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState(leerPedidos);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [pedidoAVer, setPedidoAVer] = useState(null);
  const [pedidoAGestionar, setPedidoAGestionar] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [periodoVentas, setPeriodoVentas] = useState('dia');
  const [productos, setProductos] = useState(leerProductos);
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [productoAActualizar, setProductoAActualizar] = useState(null);
  const [nuevoStock, setNuevoStock] = useState('');
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [productoNuevo, setProductoNuevo] = useState(productoVacio);

  useEffect(() => {
    const tipoUsuario = localStorage.getItem('tipoUsuario');

    if (tipoUsuario !== 'admin') {
      navigate('/sesion');
    }
  }, [navigate]);

  useEffect(() => {
    guardarPedidos(pedidos);
  }, [pedidos]);

  useEffect(() => {
    guardarProductos(productos);
  }, [productos]);

  useEffect(() => {
    const recargar = () => {
      setPedidos(leerPedidos());
      setProductos(leerProductos());
    };

    window.addEventListener('pedidosActualizados', recargar);
    window.addEventListener('productosActualizados', recargar);
    window.addEventListener('storage', recargar);

    return () => {
      window.removeEventListener('pedidosActualizados', recargar);
      window.removeEventListener('productosActualizados', recargar);
      window.removeEventListener('storage', recargar);
    };
  }, []);

  const hayEntregados = pedidos.some((pedido) => pedido.estado === 'Entregado');

  const avisarSinPedidos = (tipo) => {
    Alerta.fire({
      icon: 'info',
      title: `No hay pedidos ${tipo}`,
      text: `No hay pedidos ${tipo} para eliminar.`,
      confirmButtonText: 'Entendido'
    });
  };

  const eliminarEntregados = () => {
    if (!hayEntregados) {
      avisarSinPedidos('entregados');
      return;
    }

    setPedidos(pedidos.filter((pedido) => pedido.estado !== 'Entregado'));
  };

  const hayCancelados = pedidos.some((pedido) => pedido.estado === 'Cancelado');

  const eliminarCancelados = () => {
    if (!hayCancelados) {
      avisarSinPedidos('cancelados');
      return;
    }

    setPedidos(pedidos.filter((pedido) => pedido.estado !== 'Cancelado'));
  };

  const abrirGestion = (pedido) => {
    setPedidoAGestionar(pedido);
    setNuevoEstado(pedido.estado);
  };

  const guardarEstado = () => {
    setPedidos(
      pedidos.map((pedido) =>
        pedido.retiro === pedidoAGestionar.retiro
          ? { ...pedido, estado: nuevoEstado }
          : pedido
      )
    );
    setPedidoAGestionar(null);
  };

  const buscado = normalizar(busquedaPedido.trim()).replace('#', '');

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const coincideEstado =
      estadoFiltro === 'todos' || pedido.estado === estadoFiltro;

    const coincideBusqueda = normalizar(
      `${pedido.retiro} ${pedido.cliente}`
    ).includes(buscado);

    return coincideEstado && coincideBusqueda;
  });

  const pedidosPendientes = pedidos.filter(
    (pedido) => pedido.estado === 'Pendiente'
  ).length;

  const periodoActual = periodosVentas.find(
    (periodo) => periodo.valor === periodoVentas
  );

  const pedidosDelPeriodo = pedidos.filter(
    (pedido) =>
      pedido.estado !== 'Cancelado' && esDelPeriodo(pedido.fecha, periodoVentas)
  );

  const ventasDelPeriodo = pedidosDelPeriodo.reduce(
    (total, pedido) => total + calcularTotal(pedido),
    0
  );

  const productosConPocoStock = productos.filter(
    (producto) => producto.stock <= STOCK_BAJO
  ).length;

  const textoBuscado = normalizar(busquedaProducto.trim());

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaFiltro === 'todas' || producto.categoria === categoriaFiltro;

    const coincideNombre = normalizar(producto.nombre).includes(textoBuscado);

    return coincideCategoria && coincideNombre;
  });

  const abrirActualizarStock = (producto) => {
    setProductoAActualizar(producto);
    setNuevoStock(String(producto.stock));
  };

  const guardarStock = () => {
    setProductos(
      productos.map((producto) =>
        producto.id === productoAActualizar.id
          ? { ...producto, stock: Number(nuevoStock) }
          : producto
      )
    );
    setProductoAActualizar(null);
  };

  const stockValido = nuevoStock !== '' && Number(nuevoStock) >= 0;

  const abrirAgregarProducto = () => {
    setProductoNuevo({ ...productoVacio, categoria: categorias[0] });
    setMostrarAgregar(true);
  };

  const cambiarProductoNuevo = (evento) => {
    setProductoNuevo({
      ...productoNuevo,
      [evento.target.name]: evento.target.value
    });
  };

  const cambiarImagen = (evento) => {
    const archivo = evento.target.files[0];

    if (!archivo) {
      return;
    }

    if (archivo.size > TAMANIO_MAXIMO_IMAGEN) {
      evento.target.value = '';
      Alerta.fire({
        icon: 'warning',
        title: 'La imagen es muy pesada',
        text: 'Elegí una imagen de hasta 1 MB.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      setProductoNuevo((anterior) => ({ ...anterior, imagen: lector.result }));
    };

    lector.readAsDataURL(archivo);
  };

  const productoNuevoValido =
    productoNuevo.nombre.trim() !== '' &&
    Number(productoNuevo.precio) > 0 &&
    productoNuevo.stock !== '' &&
    Number(productoNuevo.stock) >= 0 &&
    productoNuevo.descripcion.trim() !== '' &&
    productoNuevo.imagen !== '';

  const guardarProductoNuevo = () => {
    const nuevoId = Math.max(0, ...productos.map((producto) => producto.id)) + 1;

    setProductos([
      ...productos,
      {
        id: nuevoId,
        nombre: productoNuevo.nombre.trim(),
        categoria: productoNuevo.categoria,
        precio: Number(productoNuevo.precio),
        stock: Number(productoNuevo.stock),
        imagen: productoNuevo.imagen,
        descripcion: productoNuevo.descripcion.trim()
      }
    ]);
    setMostrarAgregar(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('tipoUsuario');
    navigate('/sesion');
  };

  return (
    <main className="admin-page">
      <Container className="admin-container">
        <section className="admin-heading">
          <p className="admin-kicker">Gestión interna</p>
          <h1>Panel de administrador</h1>
        </section>

        <Row className="g-3 mb-4">
          <Col xs={12} sm={4}>
            <Card className="admin-stat-card h-100">
              <Card.Body>
                <span>Pedidos pendientes</span>
                <strong>{pedidosPendientes}</strong>
                <small>Requieren atención</small>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={4}>
            <Card className="admin-stat-card h-100">
              <Card.Body>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <span>Ventas</span>
                  <ButtonGroup size="sm" aria-label="Período de ventas">
                    {periodosVentas.map((periodo) => (
                      <Button
                        key={periodo.valor}
                        type="button"
                        className="admin-periodo"
                        active={periodoVentas === periodo.valor}
                        onClick={() => setPeriodoVentas(periodo.valor)}
                      >
                        {periodo.texto}
                      </Button>
                    ))}
                  </ButtonGroup>
                </div>
                <strong>{formatearPrecio(ventasDelPeriodo)}</strong>
                <small>
                  {pedidosDelPeriodo.length} {pedidosDelPeriodo.length === 1 ? 'pedido' : 'pedidos'} {periodoActual.detalle}
                </small>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} sm={4}>
            <Card className="admin-stat-card h-100">
              <Card.Body>
                <span>Productos con poco stock</span>
                <strong>{productosConPocoStock}</strong>
                <small>Para reponer</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="admin-section-card mb-4">
          <Card.Body>
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Seguimiento</p>
                <h2>Estado de pedidos</h2>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="admin-primary-button"
                  onClick={eliminarEntregados}
                >
                  Eliminar entregados
                </Button>
                <Button
                  type="button"
                  className="admin-primary-button"
                  onClick={eliminarCancelados}
                >
                  Eliminar cancelados
                </Button>
              </div>
            </div>

            <Row className="g-3 admin-filters">
              <Col xs={12} md={6}>
                <Form.Group controlId="estado">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={estadoFiltro}
                    onChange={(evento) => setEstadoFiltro(evento.target.value)}
                  >
                    <option value="todos">Todos los estados</option>
                    {estadosPedido.map((estado) => (
                      <option key={estado.valor} value={estado.valor}>
                        {estado.texto}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="buscarPedido">
                  <Form.Label>Buscar</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Cliente o número de retiro"
                    value={busquedaPedido}
                    onChange={(evento) => setBusquedaPedido(evento.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="admin-table-wrapper">
              <Table className="admin-table" responsive>
                <thead>
                  <tr>
                    <th>Retiro</th>
                    <th>Cliente</th>
                    <th>Detalle</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  )}

                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.retiro}>
                      <td>{pedido.retiro}</td>
                      <td>{pedido.cliente}</td>
                      <td>{pedido.detalle}</td>
                      <td>
                        <span
                          className={`admin-status admin-status--${claseEstado(pedido.estado)}`}
                        >
                          {pedido.estado}
                        </span>
                      </td>
                      <td>{formatearPrecio(calcularTotal(pedido))}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            type="button"
                            className="admin-table-button"
                            onClick={() => setPedidoAVer(pedido)}
                          >
                            Ver pedido
                          </Button>
                          <Button
                            type="button"
                            className="admin-table-button"
                            onClick={() => abrirGestion(pedido)}
                          >
                            Gestionar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card className="admin-section-card mb-4">
          <Card.Body>
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Inventario</p>
                <h2>Stock de librería</h2>
              </div>

              <Button
                type="button"
                className="admin-primary-button"
                onClick={abrirAgregarProducto}
              >
                Agregar producto
              </Button>
            </div>

            <Row className="g-3 admin-filters">
              <Col xs={12} md={6}>
                <Form.Group controlId="buscarProducto">
                  <Form.Label>Buscar producto</Form.Label>
                  <Form.Control
                    type="search"
                    placeholder="Nombre del producto"
                    value={busquedaProducto}
                    onChange={(evento) => setBusquedaProducto(evento.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group controlId="categoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select
                    value={categoriaFiltro}
                    onChange={(evento) => setCategoriaFiltro(evento.target.value)}
                  >
                    <option value="todas">Todas las categorías</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {productosFiltrados.length === 0 && (
              <p className="text-center fw-bold py-3 m-0">
                No se encontraron productos.
              </p>
            )}

            <Row className="g-3 admin-stock-grid">
              {productosFiltrados.map((producto) => (
                <Col xs={12} md={6} lg={4} key={producto.id}>
                  <article className="admin-product">
                    <strong>{producto.nombre}</strong>
                    <span>{producto.categoria}</span>
                    <b className={producto.stock <= STOCK_BAJO ? 'stock-low' : 'stock-ok'}>
                      {producto.stock} {producto.stock === 1 ? 'unidad' : 'unidades'}
                    </b>

                    <Button
                      type="button"
                      className="admin-table-button"
                      onClick={() => abrirActualizarStock(producto)}
                    >
                      Actualizar stock
                    </Button>
                  </article>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>

        <div className="admin-logout-wrapper">
          <Button
            type="button"
            className="admin-logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </Button>
        </div>
      </Container>

      <Modal
        show={pedidoAVer !== null}
        onHide={() => setPedidoAVer(null)}
        centered
        size="lg"
        contentClassName="admin-modal"
      >
        {pedidoAVer && (
          <>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h4 fw-bold m-0">
                Pedido {pedidoAVer.retiro}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Row className="g-3 mb-4">
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Cliente</p>
                  <p className="fw-bold m-0">{pedidoAVer.cliente}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Teléfono</p>
                  <p className="fw-bold m-0">{pedidoAVer.telefono}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Fecha</p>
                  <p className="fw-bold m-0">{pedidoAVer.fecha}</p>
                </Col>
                <Col xs={12} sm={6}>
                  <p className="admin-modal__dato">Estado</p>
                  <span
                    className={`admin-status admin-status--${claseEstado(pedidoAVer.estado)}`}
                  >
                    {pedidoAVer.estado}
                  </span>
                </Col>
              </Row>

              <Table className="admin-table" responsive>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoAVer.items.map((item) => (
                    <tr key={item.producto}>
                      <td>{item.producto}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatearPrecio(item.precioUnitario)}</td>
                      <td>{formatearPrecio(item.cantidad * item.precioUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <p className="text-end fs-5 fw-bold mt-3 mb-0">
                Total: {formatearPrecio(calcularTotal(pedidoAVer))}
              </p>

              {pedidoAVer.notas && (
                <div className="mt-3">
                  <p className="admin-modal__dato">Notas del cliente</p>
                  <p className="m-0">{pedidoAVer.notas}</p>
                </div>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>

      <Modal
        show={pedidoAGestionar !== null}
        onHide={() => setPedidoAGestionar(null)}
        centered
        contentClassName="admin-modal"
      >
        {pedidoAGestionar && (
          <>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h4 fw-bold m-0">
                Gestionar pedido {pedidoAGestionar.retiro}
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p className="mb-3">
                Cliente: <strong>{pedidoAGestionar.cliente}</strong>
              </p>

              <Form.Group controlId="nuevoEstado">
                <Form.Label className="fw-bold">Estado del pedido</Form.Label>
                <Form.Select
                  value={nuevoEstado}
                  onChange={(evento) => setNuevoEstado(evento.target.value)}
                >
                  {estadosPedido.map((estado) => (
                    <option key={estado.valor} value={estado.valor}>
                      {estado.texto}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                className="admin-table-button"
                onClick={() => setPedidoAGestionar(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="admin-primary-button"
                onClick={guardarEstado}
              >
                Guardar cambios
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <Modal
        show={productoAActualizar !== null}
        onHide={() => setProductoAActualizar(null)}
        centered
        contentClassName="admin-modal"
      >
        {productoAActualizar && (
          <>
            <Modal.Header closeButton>
              <Modal.Title as="h2" className="h4 fw-bold m-0">
                Actualizar stock
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <p className="mb-3">
                Producto: <strong>{productoAActualizar.nombre}</strong>
              </p>

              <Form.Group controlId="nuevoStock">
                <Form.Label className="fw-bold">Unidades en stock</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={nuevoStock}
                  onChange={(evento) => setNuevoStock(evento.target.value)}
                />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                className="admin-table-button"
                onClick={() => setProductoAActualizar(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="admin-primary-button"
                onClick={guardarStock}
                disabled={!stockValido}
              >
                Guardar stock
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <Modal
        show={mostrarAgregar}
        onHide={() => setMostrarAgregar(false)}
        centered
        contentClassName="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h4 fw-bold m-0">
            Agregar producto
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Group controlId="nombreProducto">
                <Form.Label className="fw-bold">Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Ej: Regla 30 cm"
                  value={productoNuevo.nombre}
                  onChange={cambiarProductoNuevo}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="categoriaProducto">
                <Form.Label className="fw-bold">Categoría</Form.Label>
                <Form.Select
                  name="categoria"
                  value={productoNuevo.categoria}
                  onChange={cambiarProductoNuevo}
                >
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group controlId="precioProducto">
                <Form.Label className="fw-bold">Precio</Form.Label>
                <InputGroup>
                  <InputGroup.Text className="admin-modal__prefijo">$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="0"
                    name="precio"
                    value={productoNuevo.precio}
                    onChange={cambiarProductoNuevo}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group controlId="stockProducto">
                <Form.Label className="fw-bold">Stock</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="stock"
                  value={productoNuevo.stock}
                  onChange={cambiarProductoNuevo}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="descripcionProducto">
                <Form.Label className="fw-bold">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="descripcion"
                  placeholder="Ej: Regla de plástico transparente con graduación en cm."
                  value={productoNuevo.descripcion}
                  onChange={cambiarProductoNuevo}
                />
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="imagenProducto">
                <Form.Label className="fw-bold">Imagen</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={cambiarImagen}
                />
                <Form.Text>Formato JPG o PNG, de hasta 1 MB.</Form.Text>
              </Form.Group>

              {productoNuevo.imagen && (
                <img
                  src={productoNuevo.imagen}
                  alt="Vista previa del producto"
                  className="admin-modal__preview mt-2"
                />
              )}
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            className="admin-table-button"
            onClick={() => setMostrarAgregar(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="admin-primary-button"
            onClick={guardarProductoNuevo}
            disabled={!productoNuevoValido}
          >
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
}

export default PanelAdmin;