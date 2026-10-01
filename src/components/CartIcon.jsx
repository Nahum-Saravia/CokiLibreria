import Badge from 'react-bootstrap/Badge';

function CartIcon({ cantidad }) {
  return (
    <span className="position-relative d-inline-flex">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <path
          d="M6 7h14l-1.4 8.2H7.2L6 7Zm0 0 1.4-3h3.2M9 20h.01M17 20h.01"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <Badge pill bg="primary" className="position-absolute top-0 start-100 translate-middle">
        {cantidad}
      </Badge>
    </span>
  );
}

export default CartIcon;
