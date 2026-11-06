import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../api";
import { donneesListe } from "../utils";
import Champ from "../components/Champ";

function InscriptionForm() {
  const navigate = useNavigate();

  const [etudiants, setEtudiants] = useState([]); // pour le menu "étudiant"
  const [formations, setFormations] = useState([]); // pour le menu "formation"

  // Les valeurs du formulaire. La date commence à aujourd'hui (format AAAA-MM-JJ)
  const [formulaire, setFormulaire] = useState({
    etudiant_id: "",
    formation_id: "",
    date_inscription: new Date().toISOString().slice(0, 10),
    statut: "en_cours",
  });
  const [erreurs, setErreurs] = useState({}); // erreurs de validation renvoyées par Laravel (422)
  const [messageGeneral, setMessageGeneral] = useState("");
  const [envoi, setEnvoi] = useState(false); // vrai pendant l'enregistrement

  // Charge les étudiants et les formations pour remplir les menus déroulants
  useEffect(() => {
    api.get("/etudiants").then((reponse) => setEtudiants(donneesListe(reponse)));
    api.get("/formations").then((reponse) => setFormations(donneesListe(reponse)));
  }, []);

  // Appelée à chaque changement d'un champ
  const changer = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  // Appelée quand on clique sur "Enregistrer"
  const envoyer = (e) => {
    e.preventDefault(); // empêche le navigateur de recharger la page
    setErreurs({});
    setMessageGeneral("");
    setEnvoi(true);

    api
      .post("/inscriptions", formulaire)
      // Succès : retour à la liste avec un message de confirmation
      .then(() => navigate("/inscriptions", { state: { message: "Inscription enregistrée" } }))
      .catch((erreur) => {
        setEnvoi(false);
        if (erreur.response && erreur.response.status === 422) {
          // 422 = validation refusée (champ vide, doublon...)
          setErreurs(erreur.response.data.errors);
        } else {
          setMessageGeneral("Une erreur est survenue, réessaie.");
        }
      });
  };

  // Le premier message d'erreur d'un champ (ou rien)
  const erreurDe = (champ) => (erreurs[champ] ? erreurs[champ][0] : undefined);

  return (
    <div className="page-formulaire">
      {/* À gauche : le titre et une courte explication */}
      <aside className="formulaire-intro">
        <Link to="/inscriptions" className="retour">
          <ArrowLeft size={16} />
          Retour aux inscriptions
        </Link>
        <h1>Nouvelle inscription</h1>
        <p>Inscrire un étudiant à une formation. Un étudiant ne peut être inscrit qu'une seule fois à la même formation.</p>
      </aside>

      {/* À droite : le formulaire, en deux groupes de champs */}
      <form onSubmit={envoyer} className="formulaire">
        {messageGeneral && (
          <p className="alerte" role="alert">
            {messageGeneral}
          </p>
        )}

        <fieldset className="groupe">
          <legend>Qui et quoi</legend>
          <Champ
            id="etudiant_id"
            label="Étudiant"
            erreur={erreurDe("etudiant_id")}
            aide={
              etudiants.length === 0 ? (
                <>
                  Aucun étudiant pour le moment. <Link to="/etudiants/nouveau">Créer un étudiant</Link>.
                </>
              ) : undefined
            }
          >
            <select
              id="etudiant_id"
              name="etudiant_id"
              value={formulaire.etudiant_id}
              onChange={changer}
              aria-invalid={Boolean(erreurDe("etudiant_id"))}
            >
              <option value="">Choisir un étudiant</option>
              {etudiants.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom} {e.nom}
                </option>
              ))}
            </select>
          </Champ>
          <Champ
            id="formation_id"
            label="Formation"
            erreur={erreurDe("formation_id")}
            aide={
              formations.length === 0 ? (
                <>
                  Aucune formation pour le moment. <Link to="/formations/nouveau">Créer une formation</Link>.
                </>
              ) : undefined
            }
          >
            <select
              id="formation_id"
              name="formation_id"
              value={formulaire.formation_id}
              onChange={changer}
              aria-invalid={Boolean(erreurDe("formation_id"))}
            >
              <option value="">Choisir une formation</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.intitule}
                </option>
              ))}
            </select>
          </Champ>
        </fieldset>

        <fieldset className="groupe">
          <legend>Suivi</legend>
          <div className="duo">
            <Champ id="date_inscription" label="Date d'inscription" erreur={erreurDe("date_inscription")}>
              <input
                id="date_inscription"
                type="date"
                name="date_inscription"
                value={formulaire.date_inscription}
                onChange={changer}
                aria-invalid={Boolean(erreurDe("date_inscription"))}
              />
            </Champ>
            <Champ id="statut" label="Statut" erreur={erreurDe("statut")}>
              <select
                id="statut"
                name="statut"
                value={formulaire.statut}
                onChange={changer}
                aria-invalid={Boolean(erreurDe("statut"))}
              >
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </Champ>
          </div>
        </fieldset>

        <div className="boutons">
          <Link to="/inscriptions" className="lien-bouton">
            Annuler
          </Link>
          <button type="submit" className="principal" disabled={envoi}>
            {envoi ? (
              <>
                <Loader2 size={18} className="tourne" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default InscriptionForm;