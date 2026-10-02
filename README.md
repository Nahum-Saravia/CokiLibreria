# Coki Librería

## Integrantes

- **Nahum Saravia** — @Nahum-Saravia
- **Sofía Sánchez** — @sofisanchez126
- **Juan Cruz Carrer** — @juancarrer11

---

## Descripción breve

**Coki Librería** es un proyecto desarrollado para organizar y automatizar la gestión de una librería, especialmente los pedidos de impresiones, las consultas de clientes y el control de stock.

El sistema busca facilitar la identificación y seguimiento de pedidos, evitar la acumulación de impresiones no retiradas y mejorar la atención al cliente.

Esta es la segunda versión del proyecto: se migró el sitio original hecho con HTML, CSS y JavaScript a **React + Vite**, utilizando **React Bootstrap**.

🔗 **Deploy:** https://coki-libreria.vercel.app

---

## Funcionalidades

- **Inicio:** categorías principales del sitio (útiles escolares, impresiones y consulta de pedidos).
- **Librería:** listado de productos con buscador, paginación y botón para agregar al carrito.
- **Carrito:** panel lateral con los productos agregados y contador en el navbar. Se guarda en `localStorage`.
- **Impresiones:** formulario para configurar una impresión (tipo, papel y opciones).
- **Inicio de sesión:** ingreso como cliente o como administrador.
- **Consultar pedido:** búsqueda del estado de un pedido por número de retiro o teléfono (requiere iniciar sesión).
- **Panel de administrador:** estado de los pedidos y stock de la librería (solo para administradores).
- **Página 404:** se muestra cuando se ingresa a una ruta que no existe.
- **Diseño responsive:** el sitio se adapta a celulares, tablets y computadoras.

---

## Tecnologías utilizadas

- **React** para construir la interfaz con componentes.
- **Vite** como herramienta de desarrollo y build.
- **React Bootstrap** y **Bootstrap 5** para los componentes y el diseño responsive.
- **React Router** para la navegación entre páginas.
- **JavaScript (ES6+)**.
- **CSS3** con variables globales.
- **Google Fonts:** **Fredoka** para títulos y **Nunito** para textos.
- **Git y GitHub** para el trabajo colaborativo.
- **Vercel** para el deploy.

---

## Instalación y ejecución

Requisitos: tener instalado [Node.js](https://nodejs.org/).

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Nahum-Saravia/CokiLibreria.git
   cd CokiLibreria
   ```

2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

4. Abrir en el navegador la dirección que aparece en la terminal (por defecto `http://localhost:5173`).

Otros comandos:

| Comando | Para qué sirve |
|---|---|
| `npm run build` | Genera la versión final del sitio en la carpeta `dist/` |
| `npm run preview` | Muestra localmente la versión generada con `build` |
| `npm run lint` | Revisa el código con ESLint |

---

## Páginas y rutas

La navegación se maneja con **React Router**. Todas las rutas están definidas en `src/routes/Rutas.jsx`.

| Ruta | Página | Contenido |
|---|---|---|
| `/` | `Home.jsx` | Página de inicio |
| `/libreria` | `Libreria.jsx` | Productos y útiles escolares |
| `/impresiones` | `Impresiones.jsx` | Solicitud de impresiones |
| `/pedidos` | `ConsultarPedido.jsx` | Consulta de pedidos |
| `/sesion` | `Sesion.jsx` | Inicio de sesión de cliente y administrador |
| `/panel-admin` | `PanelAdmin.jsx` | Panel de administrador |
| `*` | `NotFound.jsx` | Página 404 |

Los enlaces internos usan el componente `Link` de React Router, por lo que la navegación es fluida y no recarga la página.

El archivo `vercel.json` redirige todas las rutas a `index.html`, para que funcionen al recargar la página o al ingresar directamente a una dirección en el deploy.

---

## Estructura del proyecto

```text
CokiLibreria/
├── public/
│   └── coki-logo.png
├── src/
│   ├── assets/img/      → imágenes del sitio
│   ├── components/      → componentes reutilizables (Navbar, Footer, cards, carrito)
│   ├── data/            → datos que se muestran en el sitio (productos, categorías, secciones)
│   ├── pages/           → una página por cada vista del sitio
│   ├── routes/          → configuración de las rutas (Rutas.jsx)
│   ├── App.jsx          → estructura general: Navbar + rutas + Footer
│   ├── index.css        → variables globales
│   └── main.jsx         → punto de entrada de la aplicación
├── index.html
├── vercel.json
├── package.json
└── README.md
```

---

## Componentes, props y map()

La interfaz está dividida en **componentes reutilizables**, ubicados en `src/components/`:

| Componente | Uso |
|---|---|
| `Navbar` | Barra de navegación con menú para celular, sesión y carrito |
| `Footer` | Pie de página con contacto y ubicación |
| `CategoryCard` | Tarjeta de categoría del inicio |
| `ProductCard` | Tarjeta de producto de la librería |
| `CartIcon` | Ícono del carrito con la cantidad de productos |
| `CartPanel` | Panel lateral del carrito |

Los componentes reciben la información mediante **props**, lo que permite reutilizarlos con distintos datos. Por ejemplo, la misma `CategoryCard` se usa para las tres categorías del inicio:

```jsx
<CategoryCard
  imagen={categoria.imagen}
  titulo={categoria.titulo}
  textoBoton={categoria.textoBoton}
  link={categoria.link}
/>
```

Los datos están separados del diseño, en la carpeta `src/data/`, y las listas se generan con **`map()`**, evitando repetir código:

```jsx
{categorias.map((categoria) => (
  <CategoryCard key={categoria.id} {...categoria} />
))}
```

`map()` se utiliza en las categorías del inicio, los links del navbar, los productos de la librería, las opciones de impresión y los datos del footer.

---

## Estilos y diseño responsive

Se utilizó **React Bootstrap** para la mayor parte de la interfaz, buscando escribir la menor cantidad posible de CSS propio.

- **Variables CSS:** los colores, tipografías, espaciados, bordes y sombras del diseño original se mantienen como variables globales en `src/index.css` (`--color-primario`, `--fuente-titulos`, `--sombra-dura`, etc.). También se usan para adaptar los colores de Bootstrap a la identidad de Coki.
- **CSS por componente:** cada componente o página que necesita estilos propios tiene su archivo `.css`, que utiliza las variables con `var()`.
- **Responsive sin media queries:** el diseño se adapta mediante los breakpoints de Bootstrap (`sm`, `md`, `lg`), con componentes como `Row` y `Col` (por ejemplo `<Row xs={1} sm={2} lg={3}>`), el `Navbar` con `expand="lg"` y `Offcanvas` para el menú en celulares, y clases utilitarias como `d-none d-lg-flex`.

---

## Estrategias SEO implementadas

### 1. Títulos descriptivos

Cada página define su propio `<title>`, que cambia al navegar (por ejemplo, *"Impresiones - Coki Librería"*).

### 2. Meta descripción

El `index.html` incluye `<meta name="description">` con una descripción del sitio y el idioma definido con `lang="es"`.

### 3. HTML5 semántico

Se utilizan etiquetas como `header`, `nav`, `main`, `section`, `article` y `footer`, y una jerarquía de títulos (`h1`, `h2`, `h3`) en cada página.

### 4. Texto alternativo en imágenes

Las imágenes poseen atributos `alt` descriptivos.

```jsx
<img src={logo} alt="Logo de Coki Librería" />
```

### 5. Diseño Responsive

El sitio se adapta a celulares, tablets y computadoras gracias a Bootstrap y a la etiqueta meta viewport.

---

## Flujo de trabajo con Git y GitHub

Se trabajó con:

- `main`: versión final.
- `dev`: rama principal de desarrollo.
- Ramas `feature/...` para cada tarea, creadas a partir de `dev`.
- Commits para registrar cambios.
- Pull Requests para integrar modificaciones.

Los cambios se desarrollan en las ramas `feature`, luego se integran a `dev` mediante Pull Requests y finalmente se incorporan a `main`.

---

## Uso de herramientas de IA

Se utilizaron herramientas de Inteligencia Artificial como apoyo para consultar, aprender y generar ideas durante el desarrollo.
