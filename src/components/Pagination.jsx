function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button
        className="btn btn-ghost btn-sm"
        onClick={onPrev}
        disabled={page <= 1}
      >
        ← Prev
      </button>
      <span>
        Page {page} of {totalPages || 1}
      </span>
      <button
        className="btn btn-ghost btn-sm"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
