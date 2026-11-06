import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../api";
import Champ from "../components/Champ";

function FormationForm() {
  // useParams lit le numéro dans l'adresse : /formations/3/modifier -> id = "3"
  const { id } = useParams();
  const navigate = useNavigate();
  // Si un id existe, on MODIFIE une formation. Sinon, on en AJOUTE une.
  const modification = Boolean(id);

  // Les valeurs écrites dans les champs (les noms sont ceux attendus par Laravel)
  const [formulaire, setFormulaire] = useState({
    intitule: "",
    description: "",
    duree: "",
    prix: "",
  });
  const [erreurs, setErreurs] = useState({}); // erreurs de validation renvoyées par Laravel (422)
  const [messageGeneral, setMessageGeneral] = useState("");
  const [envoi, setEnvoi] = useState(false); // vrai pendant l'enregistrement
  const [chargement, setChargement] = useState(modification); // vrai pendant le chargement de la formation

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
      .catch(() => setMessageGeneral("Formation introuvable"))
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
      ? api.put(`/formations/${id}`, formulaire)
      : api.post("/formations", formulaire);

    requete
      // Succès : retour à la liste avec un message de confirmation
      .then(() =>
        navigate("/formations", { state: { message: modification ? "Formation modifiée" : "Formation ajoutée" } })
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
        <Link to="/formations" className="retour">
          <ArrowLeft size={16} />
          Retour aux formations
        </Link>
        <h1>{modification ? "Modifier la formation" : "Nouvelle formation"}</h1>
        <p>
          {modification
            ? "Mettre à jour les informations de la formation."
            : "Décrire la formation proposée. L'intitulé, la durée et le prix sont obligatoires."}
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
          <legend>Présentation</legend>
          <Champ id="intitule" label="Intitulé" erreur={erreurDe("intitule")}>
            <input
              id="intitule"
              name="intitule"
              value={formulaire.intitule}
              onChange={changer}
              placeholder="Ex. Développement web"
              aria-invalid={Boolean(erreurDe("intitule"))}
            />
          </Champ>
          <Champ id="description" label="Description" facultatif erreur={erreurDe("description")}>
            <textarea
              id="description"
              name="description"
              value={formulaire.description}
              onChange={changer}
              placeholder="Ce que les étudiants vont apprendre"
              aria-invalid={Boolean(erreurDe("description"))}
            />
          </Champ>
        </fieldset>

        <fieldset className="groupe">
          <legend>Durée et tarif</legend>
          <div className="duo">
            <Champ id="duree" label="Durée" erreur={erreurDe("duree")}>
              <div className="input-suffixe">
                <input
                  id="duree"
                  type="number"
                  name="duree"
                  min="1"
                  value={formulaire.duree}
                  onChange={changer}
                  placeholder="6"
                  aria-invalid={Boolean(erreurDe("duree"))}
                />
                <span>mois</span>
              </div>
            </Champ>
            <Champ id="prix" label="Prix" erreur={erreurDe("prix")}>
              <div className="input-suffixe">
                <input
                  id="prix"
                  type="number"
                  name="prix"
                  min="0"
                  value={formulaire.prix}
                  onChange={changer}
                  placeholder="150000"
                  aria-invalid={Boolean(erreurDe("prix"))}
                />
                <span>FCFA</span>
              </div>
            </Champ>
          </div>
        </fieldset>

        <div className="boutons">
          <Link to="/formations" className="lien-bouton">
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

export default FormationForm;