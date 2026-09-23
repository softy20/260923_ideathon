export default function Pagination({ page, totalPages, onChange, prevLabel, nextLabel }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="page-btn"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        {prevLabel}
      </button>

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className="page-btn"
          aria-current={n === page}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        {nextLabel}
      </button>
    </nav>
  );
}
