import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../api";
import Champ from "../components/Champ";

function EtudiantForm() {
  // useParams lit le numéro dans l'adresse : /etudiants/3/modifier -> id = "3"
  const { id } = useParams();
  const navigate = useNavigate();
  // Si un id existe, on MODIFIE un étudiant. Sinon, on en AJOUTE un.
  const modification = Boolean(id);

  // Les valeurs écrites dans les champs (les noms sont ceux attendus par Laravel)
  const [formulaire, setFormulaire] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    date_naissance: "",
  });
  const [erreurs, setErreurs] = useState({}); // erreurs de validation renvoyées par Laravel (422)
  const [messageGeneral, setMessageGeneral] = useState("");
  const [envoi, setEnvoi] = useState(false); // vrai pendant l'enregistrement
  const [chargement, setChargement] = useState(modification); // vrai pendant le chargement de l'étudiant

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
      .catch(() => setMessageGeneral("Étudiant introuvable"))
      .finally(() => setChargement(false));
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
    setEnvoi(true);

    // PUT pour modifier, POST pour ajouter
    const requete = modification
      ? api.put(`/etudiants/${id}`, formulaire)
      : api.post("/etudiants", formulaire);

    requete
      // Succès : retour à la liste avec un message de confirmation
      .then(() =>
        navigate("/etudiants", { state: { message: modification ? "Étudiant modifié" : "Étudiant ajouté" } })
      )
      .catch((erreur) => {
        setEnvoi(false);
        if (erreur.response && erreur.response.status === 422) {
          // 422 = validation refusée : Laravel envoie les erreurs champ par champ
          setErreurs(erreur.response.data.errors);
        } else {
          setMessageGeneral("Une erreur est survenue, réessaie.");
        }
      });
  };

  // Le premier message d'erreur d'un champ (ou rien)
  const erreurDe = (champ) => (erreurs[champ] ? erreurs[champ][0] : undefined);

  if (chargement) {
    return (
      <div className="page-formulaire">
        <div className="squelette" style={{ height: 120 }} />
        <div className="squelette" style={{ height: 420 }} />
      </div>
    );
  }

  return (
    <div className="page-formulaire">
      {/* À gauche : le titre et une courte explication */}
      <aside className="formulaire-intro">
        <Link to="/etudiants" className="retour">
          <ArrowLeft size={16} />
          Retour aux étudiants
        </Link>
        <h1>{modification ? "Modifier l'étudiant" : "Nouvel étudiant"}</h1>
        <p>
          {modification
            ? "Mettre à jour les informations de l'étudiant."
            : "Renseigner les informations de l'étudiant. Seuls le nom, le prénom et l'email sont obligatoires."}
        </p>
      </aside>

      {/* À droite : le formulaire, en deux groupes de champs */}
      <form onSubmit={envoyer} className="formulaire">
        {messageGeneral && (
          <p className="alerte" role="alert">
            {messageGeneral}
          </p>
        )}

        <fieldset className="groupe">
          <legend>Identité</legend>
          <div className="duo">
            <Champ id="nom" label="Nom" erreur={erreurDe("nom")}>
              <input
                id="nom"
                name="nom"
                value={formulaire.nom}
                onChange={changer}
                placeholder="Ex. Dossou"
                autoComplete="family-name"
                aria-invalid={Boolean(erreurDe("nom"))}
              />
            </Champ>
            <Champ id="prenom" label="Prénom" erreur={erreurDe("prenom")}>
              <input
                id="prenom"
                name="prenom"
                value={formulaire.prenom}
                onChange={changer}
                placeholder="Ex. Awa"
                autoComplete="given-name"
                aria-invalid={Boolean(erreurDe("prenom"))}
              />
            </Champ>
          </div>
          <Champ id="date_naissance" label="Date de naissance" facultatif erreur={erreurDe("date_naissance")}>
            <input
              id="date_naissance"
              type="date"
              name="date_naissance"
              value={formulaire.date_naissance}
              onChange={changer}
              aria-invalid={Boolean(erreurDe("date_naissance"))}
            />
          </Champ>
        </fieldset>

        <fieldset className="groupe">
          <legend>Contact</legend>
          <Champ id="email" label="Email" erreur={erreurDe("email")} aide="Chaque étudiant doit avoir un email unique.">
            <input
              id="email"
              type="email"
              name="email"
              value={formulaire.email}
              onChange={changer}
              placeholder="awa@exemple.com"
              autoComplete="email"
              aria-invalid={Boolean(erreurDe("email"))}
            />
          </Champ>
          <Champ id="telephone" label="Téléphone" facultatif erreur={erreurDe("telephone")}>
            <input
              id="telephone"
              name="telephone"
              value={formulaire.telephone}
              onChange={changer}
              placeholder="Ex. 97 00 00 00"
              autoComplete="tel"
              aria-invalid={Boolean(erreurDe("telephone"))}
            />
          </Champ>
        </fieldset>

        <div className="boutons">
          <Link to="/etudiants" className="lien-bouton">
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

export default EtudiantForm;