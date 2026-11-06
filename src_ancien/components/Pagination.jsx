import { ChevronLeft, ChevronRight } from "lucide-react";

// Le bas d'un tableau : "1 à 8 sur 20" et les boutons Précédent / Suivant
function Pagination({ page, parPage, total, onChange }) {
  // Pas besoin de pagination s'il y a peu de lignes
  if (total <= parPage) return null;

  const pages = Math.ceil(total / parPage);
  const debut = (page - 1) * parPage + 1;
  const fin = Math.min(page * parPage, total);

  return (
    <div className="pagination">
      <span>
        {debut} à {fin} sur {total}
      </span>
      <div className="pagination-boutons">
        <button
          className="btn-icone"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Page précédente"
        >
          <ChevronLeft size={18} />
        </button>
        <span>
          Page {page} sur {pages}
        </span>
        <button
          className="btn-icone"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Page suivante"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;