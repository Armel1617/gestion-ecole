// Les textes affichés pour chaque statut
const TEXTES = { en_cours: "En cours", terminee: "Terminée", annulee: "Annulée" };

// Une pastille colorée avec le statut d'une inscription
function StatutBadge({ statut }) {
  return <span className={`badge s-${statut}`}>{TEXTES[statut] ?? statut}</span>;
}

export default StatutBadge;