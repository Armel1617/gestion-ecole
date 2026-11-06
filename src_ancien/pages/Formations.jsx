import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Pencil, Plus, Search, SearchX, Trash2, X } from "lucide-react";
import api from "../api";
import Pagination from "../components/Pagination";
import { formatMontant, pluriel } from "../utils";

const PAR_PAGE = 8; // nombre de formations affichées par page

function Formations() {
  const [formations, setFormations] = useState([]); // la liste reçue de Laravel
  const [recherche, setRecherche] = useState(""); // ce que l'utilisateur tape
  const [page, setPage] = useState(1); // la page affichée
  const [erreur, setErreur] = useState("");

  // Recharge les formations au début, puis à chaque changement de la recherche
  useEffect(() => {
    api
      .get("/formations", { params: { search: recherche } })
      .then((reponse) => setFormations(reponse.data))
      .catch(() => setErreur("Impossible de charger les formations"));
  }, [recherche]);

  // Quand on change la recherche, on revient à la première page
  const changerRecherche = (valeur) => {
    setRecherche(valeur);
    setPage(1);
  };

  // Supprime une formation après confirmation
  const supprimer = (formation) => {
    if (
      !window.confirm(
        `Supprimer la formation "${formation.intitule}" ? Ses inscriptions seront aussi supprimées.`
      )
    )
      return;

    api
      .delete(`/formations/${formation.id}`)
      .then(() => {
        setFormations(formations.filter((f) => f.id !== formation.id));
      })
      .catch(() => setErreur("La suppression a échoué"));
  };

  const filtre = recherche !== "";
  const n = formations.length;

  // La page courante (jamais au-delà de la dernière) et les lignes à afficher
  const pageCourante = Math.min(page, Math.max(1, Math.ceil(n / PAR_PAGE)));
  const visibles = formations.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE);

  return (
    <div>
      {/* En-tête : titre, nombre de formations et bouton d'ajout */}
      <header className="entete">
        <div>
          <h1>Formations</h1>
          <p>
            {n} {pluriel(n, "formation")}
            {filtre && ` ${pluriel(n, "trouvée")}`}
          </p>
        </div>
        <Link to="/formations/nouveau" className="lien-bouton principal">
          <Plus size={18} />
          Ajouter une formation
        </Link>
      </header>

      {erreur && <p className="erreur">{erreur}</p>}

      <section className="carte">
        {/* Barre d'outils : recherche */}
        <div className="barre-outils">
          <label className="recherche">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher une formation"
              aria-label="Rechercher une formation"
              value={recherche}
              onChange={(e) => changerRecherche(e.target.value)}
            />
          </label>
          {filtre && (
            <button className="lien-reinit" onClick={() => changerRecherche("")}>
              <X size={16} />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Le tableau des formations */}
        <div className="defile">
          <table>
            <thead>
              <tr>
                <th>Formation</th>
                <th>Durée</th>
                <th>Prix</th>
                <th>Inscrits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="vide">
                      <span className="vide-icone">
                        <SearchX size={22} />
                      </span>
                      <strong>Aucune formation trouvée</strong>
                      {filtre ? (
                        <span>Aucun résultat pour cette recherche.</span>
                      ) : (
                        <span>
                          Aucune formation pour le moment. <Link to="/formations/nouveau">Ajouter une formation</Link>.
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visibles.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <div className="identite">
                        <span className="tuile-ligne">
                          <BookOpen size={18} />
                        </span>
                        <div>
                          <strong>{f.intitule}</strong>
                          {/* La description, seulement s'il y en a une */}
                          {f.description && <span>{f.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{f.duree} mois</td>
                    <td>{formatMontant(f.prix)} FCFA</td>
                    <td>
                      <span className="compteur">{f.inscriptions_count}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link
                          to={`/formations/${f.id}/modifier`}
                          className="btn-icone"
                          title="Modifier"
                          aria-label={`Modifier ${f.intitule}`}
                        >
                          <Pencil size={17} />
                        </Link>
                        <button
                          className="btn-icone danger"
                          title="Supprimer"
                          aria-label={`Supprimer ${f.intitule}`}
                          onClick={() => supprimer(f)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={pageCourante} parPage={PAR_PAGE} total={n} onChange={setPage} />
      </section>
    </div>
  );
}

export default Formations;