import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function InscriptionForm() {
  // useNavigate permet de changer de page par le code (après l'enregistrement)
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
  // Les messages d'erreur renvoyés par Laravel (validation)
  const [erreurs, setErreurs] = useState({});
  const [messageGeneral, setMessageGeneral] = useState("");

  // Charge les étudiants et les formations pour remplir les menus déroulants
  useEffect(() => {
    api.get("/etudiants").then((reponse) => setEtudiants(reponse.data));
    api.get("/formations").then((reponse) => setFormations(reponse.data));
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

    api
      .post("/inscriptions", formulaire)
      .then(() => navigate("/inscriptions")) // succès : retour à la liste
      .catch((erreur) => {
        if (erreur.response && erreur.response.status === 422) {
          // 422 = validation refusée (champ vide, doublon...)
          setErreurs(erreur.response.data.errors);
        } else {
          setMessageGeneral("Une erreur est survenue, réessaie.");
        }
      });
  };

  // Affiche le premier message d'erreur d'un champ, s'il y en a un
  const erreurDe = (champ) =>
    erreurs[champ] ? <span className="erreur">{erreurs[champ][0]}</span> : null;

  return (
    <div>
      <h1>Inscrire un étudiant</h1>

      {messageGeneral && <p className="erreur">{messageGeneral}</p>}

      <form onSubmit={envoyer} className="formulaire">
        <label>
          Étudiant
          <select name="etudiant_id" value={formulaire.etudiant_id} onChange={changer}>
            <option value="">-- Choisir un étudiant --</option>
            {etudiants.map((e) => (
              <option key={e.id} value={e.id}>
                {e.prenom} {e.nom}
              </option>
            ))}
          </select>
          {erreurDe("etudiant_id")}
        </label>

        <label>
          Formation
          <select name="formation_id" value={formulaire.formation_id} onChange={changer}>
            <option value="">-- Choisir une formation --</option>
            {formations.map((f) => (
              <option key={f.id} value={f.id}>
                {f.intitule}
              </option>
            ))}
          </select>
          {erreurDe("formation_id")}
        </label>

        <label>
          Date d'inscription
          <input
            type="date"
            name="date_inscription"
            value={formulaire.date_inscription}
            onChange={changer}
          />
          {erreurDe("date_inscription")}
        </label>

        <label>
          Statut
          <select name="statut" value={formulaire.statut} onChange={changer}>
            <option value="en_cours">En cours</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
          {erreurDe("statut")}
        </label>

        <div className="boutons">
          <button type="submit" className="principal">
            Enregistrer
          </button>
          <Link to="/inscriptions" className="lien-bouton">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default InscriptionForm;