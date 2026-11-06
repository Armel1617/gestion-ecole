import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Champ from "../components/Champ";

function extraireListe(reponse) {
  const donnees = reponse?.data;
  return Array.isArray(donnees) ? donnees : donnees?.data ?? [];
}

function libelleInscription(inscription) {
  const etudiant = inscription.etudiant;
  const nom = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : `Inscription #${inscription.id}`;
  return `${nom} — ${inscription.formation?.intitule ?? "Formation"}`;
}

function NoteForm() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [formulaire, setFormulaire] = useState({
    inscription_id: "",
    matiere: "",
    valeur: "",
    bareme: "20",
    coefficient: "1",
    date_evaluation: new Date().toISOString().slice(0, 10),
    commentaire: "",
  });
  const [chargement, setChargement] = useState(true);
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get("/inscriptions", { params: { per_page: 100 } })
      .then((reponse) => setInscriptions(extraireListe(reponse)))
      .catch(() => setMessage("Impossible de charger les inscriptions."))
      .finally(() => setChargement(false));
  }, []);

  const changer = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  const erreurDe = (champ) => erreurs[champ]?.[0];

  const envoyer = (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreurs({});
    setMessage("");
    api.post("/notes", {
      ...formulaire,
      inscription_id: Number(formulaire.inscription_id),
      valeur: Number(formulaire.valeur),
      bareme: Number(formulaire.bareme),
      coefficient: Number(formulaire.coefficient),
    })
      .then(() => navigate("/notes"))
      .catch((erreur) => {
        setEnvoi(false);
        if (erreur.response?.status === 422) setErreurs(erreur.response.data.errors ?? {});
        else setMessage("Impossible d’enregistrer la note.");
      });
  };

  return (
    <div className="page-formulaire">
      <div className="formulaire-intro">
        <Link to="/notes" className="retour"><ArrowLeft size={16} /> Retour aux notes</Link>
        <h1>Ajouter une note</h1>
        <p>Enregistrez une évaluation pour une inscription existante.</p>
      </div>
      <form className="formulaire" onSubmit={envoyer} noValidate>
        {message && <p className="alerte" role="alert">{message}</p>}
        <Champ id="inscription_id" label="Étudiant et formation" erreur={erreurDe("inscription_id")}>
          <select id="inscription_id" name="inscription_id" value={formulaire.inscription_id} onChange={changer} disabled={chargement}>
            <option value="">{chargement ? "Chargement..." : "Sélectionner une inscription"}</option>
            {inscriptions.map((inscription) => <option key={inscription.id} value={inscription.id}>{libelleInscription(inscription)}</option>)}
          </select>
        </Champ>
        <div className="duo">
          <Champ id="matiere" label="Matière" erreur={erreurDe("matiere")}><input id="matiere" name="matiere" value={formulaire.matiere} onChange={changer} /></Champ>
          <Champ id="date_evaluation" label="Date d'évaluation" erreur={erreurDe("date_evaluation")}><input id="date_evaluation" name="date_evaluation" type="date" value={formulaire.date_evaluation} onChange={changer} /></Champ>
        </div>
        <div className="duo">
          <Champ id="valeur" label="Note" erreur={erreurDe("valeur")}><input id="valeur" name="valeur" type="number" min="0" step="0.01" value={formulaire.valeur} onChange={changer} /></Champ>
          <Champ id="bareme" label="Barème" erreur={erreurDe("bareme")}><input id="bareme" name="bareme" type="number" min="0.01" step="0.01" value={formulaire.bareme} onChange={changer} /></Champ>
        </div>
        <Champ id="coefficient" label="Coefficient" erreur={erreurDe("coefficient")}><input id="coefficient" name="coefficient" type="number" min="0.01" step="0.01" value={formulaire.coefficient} onChange={changer} /></Champ>
        <Champ id="commentaire" label="Commentaire" erreur={erreurDe("commentaire")} facultatif><textarea id="commentaire" name="commentaire" value={formulaire.commentaire} onChange={changer} /></Champ>
        <div className="boutons"><Link to="/notes" className="lien-bouton">Annuler</Link><button className="principal" disabled={envoi || chargement || inscriptions.length === 0}>{envoi ? <><Loader2 size={18} className="tourne" /> Enregistrement...</> : "Enregistrer la note"}</button></div>
      </form>
    </div>
  );
}

export default NoteForm;
