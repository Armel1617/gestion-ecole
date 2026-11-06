import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Pencil, Search, SearchX, Trash2, UserPlus, X } from "lucide-react";
import api from "../api";
import Avatar from "../components/Avatar";
import Pagination from "../components/Pagination";
import { Toast, useToast } from "../components/Toast";
import { donneesListe, formatDate, pluriel } from "../utils";

const PAR_PAGE = 8; // nombre d'étudiants affichés par page

const messageErreurApi = (erreur, messageParDefaut) => {
  const statut = erreur.response?.status;
  const message =
    erreur.response?.data?.message ||
    erreur.response?.data?.error ||
    erreur.message;

  if (statut === 401) return "Votre session a expiré. Reconnectez-vous.";
  if (statut === 403) return "Vous n’avez pas l’autorisation de consulter les étudiants.";
  if (statut >= 500) return "Le serveur ou la base de données est indisponible. Vérifiez que MySQL est démarré.";
  if (message && message !== "Network Error") return `${messageParDefaut} (${message})`;
  return `${messageParDefaut} Vérifiez que le serveur Laravel et MySQL sont démarrés.`;
};

function Etudiants() {
  const [etudiants, setEtudiants] = useState([]); // la liste reçue de Laravel
  const [formations, setFormations] = useState([]); // pour remplir le menu de filtre
  const [recherche, setRecherche] = useState(""); // ce que l'utilisateur tape
  const [formationId, setFormationId] = useState(""); // la formation choisie dans le filtre
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

  // Charge la liste des formations une seule fois (pour le menu déroulant)
  useEffect(() => {
    api
      .get("/formations")
      .then((reponse) => setFormations(donneesListe(reponse)))
      .catch(() => setFormations([]));
  }, []);

  // Recharge les étudiants au début, puis à CHAQUE changement de recherche ou de filtre
  useEffect(() => {
    api
      .get("/etudiants", {
        // Ces paramètres deviennent : /etudiants?search=...&formation_id=...
        params: { search: recherche, formation_id: formationId },
      })
      .then((reponse) => {
        setEtudiants(donneesListe(reponse));
        setErreur("");
      })
      .catch((erreurApi) => setErreur(messageErreurApi(erreurApi, "Impossible de charger les étudiants.")))
      .finally(() => setChargement(false));
  }, [recherche, formationId]);

  // Quand on change un filtre, on revient à la première page
  const changerRecherche = (valeur) => {
    setRecherche(valeur);
    setPage(1);
  };
  const changerFormation = (valeur) => {
    setFormationId(valeur);
    setPage(1);
  };
  const reinitialiser = () => {
    setRecherche("");
    setFormationId("");
    setPage(1);
  };

  // Supprime un étudiant après confirmation
  const supprimer = (etudiant) => {
    if (!window.confirm(`Supprimer ${etudiant.prenom} ${etudiant.nom} ?`)) return;

    api
      .delete(`/etudiants/${etudiant.id}`)
      .then(() => {
        // On retire l'étudiant de la liste affichée, sans recharger la page
        setEtudiants(etudiants.filter((e) => e.id !== etudiant.id));
        afficherToast("Étudiant supprimé");
      })
      .catch(() => afficherToast("La suppression a échoué", "erreur"));
  };

  const filtre = recherche !== "" || formationId !== ""; // vrai si un filtre est actif
  const n = etudiants.length;

  // La page courante (jamais au-delà de la dernière) et les lignes à afficher
  const pageCourante = Math.min(page, Math.max(1, Math.ceil(n / PAR_PAGE)));
  const visibles = etudiants.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE);

  return (
    <div>
      {/* En-tête : titre, nombre d'étudiants et bouton de création */}
      <header className="entete">
        <div>
          <h1>Étudiants</h1>
          <p>
            {chargement ? "Chargement..." : `${n} ${pluriel(n, "étudiant")}${filtre ? ` ${pluriel(n, "trouvé")}` : ""}`}
          </p>
        </div>
        <Link to="/etudiants/nouveau" className="lien-bouton principal">
          <UserPlus size={18} />
          Nouvel étudiant
        </Link>
      </header>

      {erreur && (
        <p className="alerte" role="alert">
          {erreur}
        </p>
      )}

      <section className="carte">
        {/* Barre d'outils : recherche et filtre */}
        <div className="barre-outils">
          <label className="recherche">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Rechercher par nom, prénom ou email"
              aria-label="Rechercher un étudiant"
              value={recherche}
              onChange={(e) => changerRecherche(e.target.value)}
            />
          </label>

          <select
            aria-label="Filtrer par formation"
            value={formationId}
            onChange={(e) => changerFormation(e.target.value)}
          >
            <option value="">Toutes les formations</option>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.intitule}
              </option>
            ))}
          </select>

          {/* Le bouton n'apparaît que si un filtre est actif */}
          {filtre && (
            <button className="lien-reinit" onClick={reinitialiser}>
              <X size={16} />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Le tableau des étudiants */}
        <div className="defile">
          <table>
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Téléphone</th>
                <th>Ajouté le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chargement ? (
                // Pendant le premier chargement : cinq lignes grises qui brillent
                Array.from({ length: 5 }).map((_, k) => (
                  <tr key={k}>
                    <td colSpan="4">
                      <div className="squelette" style={{ height: 40 }} />
                    </td>
                  </tr>
                ))
              ) : visibles.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    <div className="vide">
                      <span className="vide-icone">
                        <SearchX size={22} />
                      </span>
                      <strong>Aucun étudiant trouvé</strong>
                      {filtre ? (
                        <span>Aucun résultat pour cette recherche. Modifier les filtres.</span>
                      ) : (
                        <span>
                          Aucun étudiant pour le moment. <Link to="/etudiants/nouveau">Créer un étudiant</Link>.
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visibles.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {/* Avatar avec les initiales, puis le nom et l'email */}
                      <div className="identite">
                        <Avatar prenom={e.prenom} nom={e.nom} />
                        <div>
                          <strong>
                            {e.prenom} {e.nom}
                          </strong>
                          <span>{e.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{e.telephone || <span className="discret">Non renseigné</span>}</td>
                    <td>{formatDate(e.created_at)}</td>
                    <td>
                      <div className="actions">
                        <Link
                          to={`/etudiants/${e.id}/modifier`}
                          className="btn-icone"
                          title="Modifier"
                          aria-label={`Modifier ${e.prenom} ${e.nom}`}
                        >
                          <Pencil size={17} />
                        </Link>
                        <button
                          className="btn-icone danger"
                          title="Supprimer"
                          aria-label={`Supprimer ${e.prenom} ${e.nom}`}
                          onClick={() => supprimer(e)}
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

export default Etudiants;