import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Pencil, Plus, Search, SearchX, Trash2, X } from "lucide-react";
import api from "../api";
import Pagination from "../components/Pagination";
import { Toast, useToast } from "../components/Toast";
import { donneesListe, formatMontant, pluriel } from "../utils";

const PAR_PAGE = 8; // nombre de formations affichées par page

function Formations() {
  const [formations, setFormations] = useState([]); // la liste reçue de Laravel
  const [recherche, setRecherche] = useState(""); // ce que l'utilisateur tape
  const [page, setPage] = useState(1); // la page affichée
  const [chargement, setChargement] = useState(true); // vrai tant que la première liste n'est pas arrivée
  const [erreur, setErreur] = useState("");
  const [toast, afficherToast] = useToast(); // petit message de confirmation

  // Après un ajout ou une modification, le formulaire nous renvoie ici avec un message à afficher
  const location = useLocation();
  useEffect(() => {
    if (location.state?.message) {
      afficherToast(location.state.message);
      window.history.replaceState({}, ""); // pour ne pas le réafficher au rechargement
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharge les formations au début, puis à chaque changement de la recherche
  useEffect(() => {
    api
      .get("/formations", { params: { search: recherche } })
      .then((reponse) => {
        setFormations(donneesListe(reponse));
        setErreur("");
      })
      .catch(() => setErreur("Impossible de charger les formations"))
      .finally(() => setChargement(false));
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
        afficherToast("Formation supprimée");
      })
      .catch(() => afficherToast("La suppression a échoué", "erreur"));
  };

  const filtre = recherche !== "";
  const n = formations.length;

  // La page courante (jamais au-delà de la dernière) et les lignes à afficher
  const pageCourante = Math.min(page, Math.max(1, Math.ceil(n / PAR_PAGE)));
  const visibles = formations.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE);

  return (
    <div>
      {/* En-tête : titre, nombre de formations et bouton de création */}
      <header className="entete">
        <div>
          <h1>Formations</h1>
          <p>
            {chargement ? "Chargement..." : `${n} ${pluriel(n, "formation")}${filtre ? ` ${pluriel(n, "trouvée")}` : ""}`}
          </p>
        </div>
        <Link to="/formations/nouveau" className="lien-bouton principal">
          <Plus size={18} />
          Nouvelle formation
        </Link>
      </header>

      {erreur && (
        <p className="alerte" role="alert">
          {erreur}
        </p>
      )}

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
              {chargement ? (
                Array.from({ length: 5 }).map((_, k) => (
                  <tr key={k}>
                    <td colSpan="5">
                      <div className="squelette" style={{ height: 40 }} />
                    </td>
                  </tr>
                ))
              ) : visibles.length === 0 ? (
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
                          Aucune formation pour le moment. <Link to="/formations/nouveau">Créer une formation</Link>.
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

      <Toast toast={toast} />
    </div>
  );
}

export default Formations;