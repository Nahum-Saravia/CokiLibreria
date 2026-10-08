import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import {
  tiposImpresion,
  tiposPapel
} from '../data/opcionesImpresion';
import Alerta from '../components/Alerta/alerta';
import './Impresiones.css';

function obtenerPrecioImpresion(tipo) {
  const texto = String(
    tipo?.texto || tipo?.valor || ''
  ).toLowerCase();

  return texto.includes('color') ? 400 : 200;
}

function leerArchivo(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      resolve(lector.result);
    };

    lector.onerror = () => {
      reject(
        new Error('No se pudo leer el archivo.')
      );
    };

    lector.readAsDataURL(archivo);
  });
}

function Impresiones() {
  const esCliente =
    localStorage.getItem('tipoUsuario') === 'cliente';

  const [tipoImpresion, setTipoImpresion] =
    useState(
      tiposImpresion[0]?.valor || ''
    );

  const [tipoPapel, setTipoPapel] =
    useState(
      tiposPapel[0]?.valor || ''
    );

  const [cantidad, setCantidad] = useState(1);
  const [descripcion, setDescripcion] =
    useState('');
  const [archivo, setArchivo] =
    useState(null);
  const [aviso, setAviso] =
    useState('');

  const agregarAlCarrito = async (event) => {
    event.preventDefault();

    const tipoUsuario =
      localStorage.getItem('tipoUsuario');

    if (tipoUsuario !== 'cliente') {
      await Alerta.fire({
        icon: 'warning',
        title: 'Acceso no permitido',
        text: 'Solo los clientes pueden agregar impresiones al carrito.'
      });

      return;
    }

    if (cantidad < 1) {
      await Alerta.fire({
        icon: 'warning',
        title: 'Cantidad no válida',
        text: 'La cantidad de copias debe ser de al menos 1.'
      });

      return;
    }

    if (!descripcion.trim()) {
      await Alerta.fire({
        icon: 'warning',
        title: 'Falta la descripción',
        text: 'Ingresá una descripción para la impresión.'
      });

      return;
    }

    if (!archivo) {
      await Alerta.fire({
        icon: 'warning',
        title: 'Falta el archivo',
        text: 'Seleccioná el archivo que querés mandar a imprimir.'
      });

      return;
    }

    const tipoImpresionSeleccionado =
      tiposImpresion.find(
        (tipo) =>
          tipo.valor === tipoImpresion
      );

    const tipoPapelSeleccionado =
      tiposPapel.find(
        (papel) =>
          papel.valor === tipoPapel
      );

    const precioUnitario =
      obtenerPrecioImpresion(
        tipoImpresionSeleccionado
      );

    let archivoUrl;

    try {
      archivoUrl =
        await leerArchivo(archivo);
    } catch {
      await Alerta.fire({
        icon: 'error',
        title: 'No se pudo cargar el archivo',
        text: 'No fue posible guardar el archivo seleccionado.'
      });

      return;
    }

    const guardado =
      localStorage.getItem(
        'coki-carrito'
      );

    let carrito = [];

    if (guardado) {
      try {
        carrito = JSON.parse(guardado);
      } catch {
        carrito = [];
      }
    }

    const nuevaImpresion = {
      id: `impresion-${Date.now()}`,
      nombre: 'Servicio de impresión',
      precio: precioUnitario,
      cantidad,
      esImpresion: true,
      tipoImpresion:
        tipoImpresionSeleccionado?.texto ||
        tipoImpresion,
      tipoPapel:
        tipoPapelSeleccionado?.texto ||
        tipoPapel,
      descripcion: descripcion.trim(),
      archivo: archivo.name,
      archivoUrl,
      archivoTipo: archivo.type
    };

    carrito.push(nuevaImpresion);

    try {
      localStorage.setItem(
        'coki-carrito',
        JSON.stringify(carrito)
      );
    } catch {
      await Alerta.fire({
        icon: 'error',
        title: 'No se pudo guardar la impresión',
        text: 'El archivo es demasiado grande para guardarlo en el carrito.'
      });

      return;
    }

    window.dispatchEvent(
      new Event('carritoActualizado')
    );

    setAviso(
      'La impresión se agregó correctamente al carrito.'
    );

    setCantidad(1);
    setDescripcion('');
    setArchivo(null);

    event.currentTarget.reset();

    setTipoImpresion(
      tiposImpresion[0]?.valor || ''
    );

    setTipoPapel(
      tiposPapel[0]?.valor || ''
    );
  };

  return (
    <main className="flex-grow-1">
      <title>
        Impresiones - Coki Librería
      </title>

      <Container className="py-4 py-md-5">
        <header className="text-center pt-4 mb-4">
          <h1 className="fw-bold coki-texto-claro">
            Servicio de impresiones
          </h1>

          <p className="coki-texto-claro mb-0">
            {esCliente
              ? 'Configurá tu impresión y agregala al carrito.'
              : 'Configurá las opciones de impresión.'}
          </p>
        </header>

        <section
          aria-labelledby="tituloOpciones"
        >
          <h2
            id="tituloOpciones"
            className="fw-bold mb-3 coki-texto-claro"
          >
            Opciones de impresión
          </h2>

          <Card
            as="form"
            className="coki-impresiones"
            onSubmit={agregarAlCarrito}
          >
            <Card.Body className="p-3 p-md-4">
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <Form.Group
                    controlId="tipoImpresion"
                  >
                    <Form.Label>
                      Tipo de impresión
                    </Form.Label>

                    <Form.Select
                      name="tipoImpresion"
                      value={tipoImpresion}
                      onChange={(event) =>
                        setTipoImpresion(
                          event.target.value
                        )
                      }
                    >
                      {tiposImpresion.map(
                        (tipo) => (
                          <option
                            key={tipo.id}
                            value={tipo.valor}
                          >
                            {tipo.texto}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} sm={6}>
                  <Form.Group
                    controlId="tipoPapel"
                  >
                    <Form.Label>
                      Tipo de papel
                    </Form.Label>

                    <Form.Select
                      name="tipoPapel"
                      value={tipoPapel}
                      onChange={(event) =>
                        setTipoPapel(
                          event.target.value
                        )
                      }
                    >
                      {tiposPapel.map(
                        (papel) => (
                          <option
                            key={papel.id}
                            value={papel.valor}
                          >
                            {papel.texto}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group
                    controlId="cantidad"
                  >
                    <Form.Label>
                      Cantidad de copias
                    </Form.Label>

                    <Form.Control
                      type="number"
                      name="cantidad"
                      min="1"
                      value={cantidad}
                      onChange={(event) => {
                        const valor =
                          Number(
                            event.target.value
                          );

                        setCantidad(
                          valor > 0
                            ? valor
                            : 1
                        );
                      }}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group
                    controlId="descripcion"
                  >
                    <Form.Label>
                      Descripción de la impresión
                    </Form.Label>

                    <Form.Control
                      as="textarea"
                      name="descripcion"
                      rows={3}
                      placeholder="Detalles sobre la impresión"
                      value={descripcion}
                      onChange={(event) =>
                        setDescripcion(
                          event.target.value
                        )
                      }
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group
                    controlId="archivo"
                  >
                    <Form.Label>
                      Adjuntar archivo
                    </Form.Label>

                    <Form.Control
                      type="file"
                      name="archivo"
                      onChange={(event) =>
                        setArchivo(
                          event.target.files[0] ||
                            null
                        )
                      }
                    />
                  </Form.Group>
                </Col>

                {esCliente && (
                  <Col xs={12}>
                    <Button
                      type="submit"
                      variant="light"
                    >
                      Agregar al carrito
                    </Button>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </section>
      </Container>

      <ToastContainer
        position="bottom-end"
        containerPosition="fixed"
        className="p-3"
      >
        <Toast
          show={aviso !== ''}
          onClose={() => setAviso('')}
          delay={2500}
          autohide
          className="coki-aviso"
        >
          <Toast.Body className="fw-bold">
            {aviso}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </main>
  );
}

export default Impresiones;

