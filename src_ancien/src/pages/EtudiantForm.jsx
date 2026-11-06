import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";

function EtudiantForm() {
  // useParams lit le numéro dans l'adresse : /etudiants/3/modifier -> id = "3"
  const { id } = useParams();
  // useNavigate permet de changer de page par le code (après l'enregistrement)
  const navigate = useNavigate();
  // Si un id existe, on est en train de MODIFIER. Sinon, on AJOUTE.
  const modification = Boolean(id);

  // Les valeurs écrites dans les champs du formulaire
  const [formulaire, setFormulaire] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    date_naissance: "",
  });
  // Les messages d'erreur renvoyés par Laravel (validation)
  const [erreurs, setErreurs] = useState({});
  const [messageGeneral, setMessageGeneral] = useState("");

  // En modification : on charge l'étudiant pour pré-remplir les champs
  useEffect(() => {
    if (!modification) return;
    api
      .get(`/etudiants/${id}`)
      .then((reponse) => {
        const e = reponse.data;
        setFormulaire({
          nom: e.nom,
          prenom: e.prenom,
          email: e.email,
          telephone: e.telephone || "", // null devient "" (un champ texte n'accepte pas null)
          date_naissance: e.date_naissance || "",
        });
      })
      .catch(() => setMessageGeneral("Étudiant introuvable"));
  }, [id, modification]);

  // Appelée à chaque frappe : met à jour le champ modifié
  const changer = (e) => {
    // e.target.name = le nom du champ (ex: "email"), e.target.value = ce qui est écrit
    setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  };

  // Appelée quand on clique sur "Enregistrer"
  const envoyer = (e) => {
    e.preventDefault(); // empêche le navigateur de recharger la page
    setErreurs({});
    setMessageGeneral("");

    // PUT pour modifier, POST pour ajouter
    const requete = modification
      ? api.put(`/etudiants/${id}`, formulaire)
      : api.post("/etudiants", formulaire);

    requete
      .then(() => navigate("/etudiants")) // succès : retour à la liste
      .catch((erreur) => {
        if (erreur.response && erreur.response.status === 422) {
          // 422 = validation refusée : Laravel envoie les erreurs champ par champ
          setErreurs(erreur.response.data.errors);
        } else {
          setMessageGeneral("Une erreur est survenue, réessaie.");
        }
      });
  };

  // Petite aide : affiche le premier message d'erreur d'un champ, s'il y en a un
  const erreurDe = (champ) =>
    erreurs[champ] ? <span className="erreur">{erreurs[champ][0]}</span> : null;

  return (
    <div>
      <h1>{modification ? "Modifier l'étudiant" : "Ajouter un étudiant"}</h1>

      {messageGeneral && <p className="erreur">{messageGeneral}</p>}
      

      <form onSubmit={envoyer} className="formulaire">
        <label>
          Nom
          <input name="nom" value={formulaire.nom} onChange={changer} />
          {erreurDe("nom")}
        </label>

        <label>
          Prénom
          <input name="prenom" value={formulaire.prenom} onChange={changer} />
          {erreurDe("prenom")}
        </label>

        <label>
          Email
          <input type="email" name="email" value={formulaire.email} onChange={changer} />
          {erreurDe("email")}
        </label>

        <label>
          Téléphone
          <input name="telephone" value={formulaire.telephone} onChange={changer} />
          {erreurDe("telephone")}
        </label>

        <label>
          Date de naissance
          <input
            type="date"
            name="date_naissance"
            value={formulaire.date_naissance}
            onChange={changer}
          />
          {erreurDe("date_naissance")}
        </label>

        <div className="boutons">
          <button type="submit" className="principal">
            Enregistrer
          </button>
          <Link to="/etudiants" className="lien-bouton">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EtudiantForm;