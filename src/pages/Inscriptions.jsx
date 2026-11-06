import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ClipboardList, SearchX, Trash2, X } from "lucide-react";
import api from "../api";
import Avatar from "../components/Avatar";
import Pagination from "../components/Pagination";
import { Toast, useToast } from "../components/Toast";
import { donneesListe, formatDate, pluriel } from "../utils";

const PAR_PAGE = 8; // nombre d'inscriptions affichées par page

// Les trois statuts possibles, avec le texte affiché à l'écran
const STATUTS = [
  { valeur: "en_cours", texte: "En cours" },
  { valeur: "terminee", texte: "Terminée" },
  { valeur: "annulee", texte: "Annulée" },
];

function Inscriptions() {
  const [inscriptions, setInscriptions] = useState([]); // la liste reçue de Laravel
  const [etudiants, setEtudiants] = useState([]); // pour le filtre "étudiant"
  const [formations, setFormations] = useState([]); // pour le filtre "formation"
  const [etudiantId, setEtudiantId] = useState(""); // étudiant choisi dans le filtre
  const [formationId, setFormationId] = useState(""); // formation choisie dans le filtre
  const [statut, setStatut] = useState(""); // statut choisi dans le filtre
  const [page, setPage] = useState(1); // la page affichée
  const [chargement, setChargement] = useState(true); // vrai tant que la première liste n'est pas arrivée
  const [erreur, setErreur] = useState("");
  const [toast, afficherToast] = useToast(); // petit message de confirmation

  // Après un ajout, le formulaire nous renvoie ici avec un message à afficher
  const location = useLocation();
  useEffect(() => {
    if (location.state?.message) {
      afficherToast(location.state.message);
      window.history.replaceState({}, ""); // pour ne pas le réafficher au rechargement
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charge les étudiants et les formations une seule fois (pour remplir les menus de filtre)
  useEffect(() => {
    api.get("/etudiants").then((reponse) => setEtudiants(donneesListe(reponse)));
    api.get("/formations").then((reponse) => setFormations(donneesListe(reponse)));
  }, []);

  // Recharge les inscriptions au début, puis à CHAQUE changement de filtre
  useEffect(() => {
    api
      .get("/inscriptions", {
        params: { etudiant_id: etudiantId, formation_id: formationId, statut: statut },
      })
      .then((reponse) => {
        setInscriptions(donneesListe(reponse));
        setErreur("");
      })
      .catch(() => setErreur("Impossible de charger les inscriptions"))
      .finally(() => setChargement(false));
  }, [etudiantId, formationId, statut]);

  // Quand on change un filtre, on revient à la première page
  const changer = (fonction) => (valeur) => {
    fonction(valeur);
    setPage(1);
  };
  const reinitialiser = () => {
    setEtudiantId("");
    setFormationId("");
    setStatut("");
    setPage(1);
  };

  // Change le statut d'une inscription (en cours, terminée, annulée)
  const changerStatut = (inscription, nouveauStatut) => {
    api
      .put(`/inscriptions/${inscription.id}`, { statut: nouveauStatut })
      .then(() => {
        // On met à jour seulement cette ligne dans la liste affichée
        setInscriptions(
          inscriptions.map((i) =>
            i.id === inscription.id ? { ...i, statut: nouveauStatut } : i
          )
        );
        afficherToast("Statut mis à jour");
      })
      .catch(() => afficherToast("Le changement de statut a échoué", "erreur"));
  };

  // Supprime une inscription après confirmation
  const supprimer = (inscription) => {
    const nom = `${inscription.etudiant.prenom} ${inscription.etudiant.nom}`;
    if (
      !window.confirm(`Supprimer l'inscription de ${nom} à "${inscription.formation.intitule}" ?`)
    )
      return;

    api
      .delete(`/inscriptions/${inscription.id}`)
      .then(() => {
        setInscriptions(inscriptions.filter((i) => i.id !== inscription.id));
        afficherToast("Inscription supprimée");
      })
      .catch(() => afficherToast("La suppression a échoué", "erreur"));
  };

  const filtre = etudiantId !== "" || formationId !== "" || statut !== ""; // vrai si un filtre est actif
  const n = inscriptions.length;

  // La page courante (jamais au-delà de la dernière) et les lignes à afficher
  const pageCourante = Math.min(page, Math.max(1, Math.ceil(n / PAR_PAGE)));
  const visibles = inscriptions.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE);

  return (
    <div>
      {/* En-tête : titre, nombre d'inscriptions et bouton de création */}
      <header className="entete">
        <div>
          <h1>Inscriptions</h1>
          <p>
            {chargement ? "Chargement..." : `${n} ${pluriel(n, "inscription")}${filtre ? ` ${pluriel(n, "trouvée")}` : ""}`}
          </p>
        </div>
        <Link to="/inscriptions/nouvelle" className="lien-bouton principal">
          <ClipboardList size={18} />
          Nouvelle inscription
        </Link>
      </header>

      {erreur && (
        <p className="alerte" role="alert">
          {erreur}
        </p>
      )}

      <section className="carte">
        {/* Barre d'outils : les trois filtres (recherche multicritère) */}
        <div className="barre-outils">
          <select
            aria-label="Filtrer par étudiant"
            value={etudiantId}
            onChange={(e) => changer(setEtudiantId)(e.target.value)}
          >
            <option value="">Tous les étudiants</option>
            {etudiants.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrer par formation"
            value={formationId}
            onChange={(e) => changer(setFormationId)(e.target.value)}
          >
            <option value="">Toutes les formations</option>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.intitule}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrer par statut"
            value={statut}
            onChange={(e) => changer(setStatut)(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => (
              <option key={s.valeur} value={s.valeur}>
                {s.texte}
              </option>
            ))}
          </select>

          {filtre && (
            <button className="lien-reinit" onClick={reinitialiser}>
              <X size={16} />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Le tableau des inscriptions */}
        <div className="defile">
          <table>
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Formation</th>
                <th>Date</th>
                <th>Statut</th>
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
                      <strong>Aucune inscription trouvée</strong>
                      {filtre ? (
                        <span>Aucun résultat pour ces filtres. Les modifier.</span>
                      ) : (
                        <span>
                          Aucune inscription pour le moment. <Link to="/inscriptions/nouvelle">Créer une inscription</Link>.
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                visibles.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="identite">
                        <Avatar prenom={i.etudiant.prenom} nom={i.etudiant.nom} />
                        <div>
                          <strong>
                            {i.etudiant.prenom} {i.etudiant.nom}
                          </strong>
                          <span>{i.etudiant.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{i.formation.intitule}</td>
                    <td>{formatDate(i.date_inscription)}</td>
                    <td>
                      {/* Menu en forme de pastille colorée : le changement est enregistré tout de suite */}
                      <select
                        className={`select-statut s-${i.statut}`}
                        aria-label="Statut de l'inscription"
                        value={i.statut}
                        onChange={(e) => changerStatut(i, e.target.value)}
                      >
                        {STATUTS.map((s) => (
                          <option key={s.valeur} value={s.valeur}>
                            {s.texte}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn-icone danger"
                          title="Supprimer"
                          aria-label={`Supprimer l'inscription de ${i.etudiant.prenom} ${i.etudiant.nom}`}
                          onClick={() => supprimer(i)}
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

export default Inscriptions;