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

function PresenceForm() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [formulaire, setFormulaire] = useState({
    inscription_id: "",
    date_presence: new Date().toISOString().slice(0, 10),
    statut: "present",
    minutes_retard: "0",
    motif: "",
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
    api.post("/presences", { ...formulaire, inscription_id: Number(formulaire.inscription_id), minutes_retard: Number(formulaire.minutes_retard) })
      .then(() => navigate("/presences"))
      .catch((erreur) => {
        setEnvoi(false);
        if (erreur.response?.status === 422) setErreurs(erreur.response.data.errors ?? {});
        else setMessage("Impossible d’enregistrer la présence.");
      });
  };

  return (
    <div className="page-formulaire">
      <div className="formulaire-intro">
        <Link to="/presences" className="retour"><ArrowLeft size={16} /> Retour aux présences</Link>
        <h1>Ajouter une présence</h1>
        <p>Enregistrez la présence d’un étudiant pour une date donnée.</p>
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
          <Champ id="date_presence" label="Date" erreur={erreurDe("date_presence")}><input id="date_presence" name="date_presence" type="date" value={formulaire.date_presence} onChange={changer} /></Champ>
          <Champ id="statut" label="Statut" erreur={erreurDe("statut")}><select id="statut" name="statut" value={formulaire.statut} onChange={changer}><option value="present">Présent</option><option value="absent">Absent</option><option value="retard">En retard</option><option value="excuse">Excusé</option></select></Champ>
        </div>
        <div className="duo">
          <Champ id="minutes_retard" label="Minutes de retard" erreur={erreurDe("minutes_retard")}><input id="minutes_retard" name="minutes_retard" type="number" min="0" max="1440" value={formulaire.minutes_retard} onChange={changer} /></Champ>
          <Champ id="motif" label="Motif" erreur={erreurDe("motif")} facultatif><input id="motif" name="motif" value={formulaire.motif} onChange={changer} /></Champ>
        </div>
        <div className="boutons"><Link to="/presences" className="lien-bouton">Annuler</Link><button className="principal" disabled={envoi || chargement || inscriptions.length === 0}>{envoi ? <><Loader2 size={18} className="tourne" /> Enregistrement...</> : "Enregistrer la présence"}</button></div>
      </form>
    </div>
  );
}

export default PresenceForm;
