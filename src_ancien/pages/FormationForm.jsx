import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";

function FormationForm() {
  // useParams lit le numéro dans l'adresse : /formations/3/modifier -> id = "3"
  const { id } = useParams();
  // useNavigate permet de changer de page par le code (après l'enregistrement)
  const navigate = useNavigate();
  // Si un id existe, on est en train de MODIFIER. Sinon, on AJOUTE.
  const modification = Boolean(id);

  // Les valeurs écrites dans les champs du formulaire
  const [formulaire, setFormulaire] = useState({
    intitule: "",
    description: "",
    duree: "",
    prix: "",
  });
  // Les messages d'erreur renvoyés par Laravel (validation)
  const [erreurs, setErreurs] = useState({});
  const [messageGeneral, setMessageGeneral] = useState("");

  // En modification : on charge la formation pour pré-remplir les champs
  useEffect(() => {
    if (!modification) return;
    api
      .get(`/formations/${id}`)
      .then((reponse) => {
        const f = reponse.data;
        setFormulaire({
          intitule: f.intitule,
          description: f.description || "", // null devient ""
          duree: f.duree,
          prix: f.prix,
        });
      })
      .catch(() => setMessageGeneral("Formation introuvable"));
  }, [id, modification]);

  // Appelée à chaque frappe : met à jour le champ modifié
  const changer = (e) => {
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  // Appelée quand on clique sur "Enregistrer"
  const envoyer = (e) => {
    e.preventDefault(); // empêche le navigateur de recharger la page
    setErreurs({});
    setMessageGeneral("");

    // PUT pour modifier, POST pour ajouter
    const requete = modification
      ? api.put(`/formations/${id}`, formulaire)
      : api.post("/formations", formulaire);

    requete
      .then(() => navigate("/formations")) // succès : retour à la liste
      .catch((erreur) => {
        if (erreur.response && erreur.response.status === 422) {
          // 422 = validation refusée : Laravel envoie les erreurs champ par champ
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
      <h1>{modification ? "Modifier la formation" : "Ajouter une formation"}</h1>

      {messageGeneral && <p className="erreur">{messageGeneral}</p>}

      <form onSubmit={envoyer} className="formulaire">
        <label>
          Intitulé
          <input name="intitule" value={formulaire.intitule} onChange={changer} />
          {erreurDe("intitule")}
        </label>

        <label>
          Description (facultative)
          <input name="description" value={formulaire.description} onChange={changer} />
          {erreurDe("description")}
        </label>

        <label>
          Durée (en mois)
          <input type="number" name="duree" min="1" value={formulaire.duree} onChange={changer} />
          {erreurDe("duree")}
        </label>

        <label>
          Prix
          <input type="number" name="prix" min="0" value={formulaire.prix} onChange={changer} />
          {erreurDe("prix")}
        </label>

        <div className="boutons">
          <button type="submit" className="principal">
            Enregistrer
          </button>
          <Link to="/formations" className="lien-bouton">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default FormationForm;