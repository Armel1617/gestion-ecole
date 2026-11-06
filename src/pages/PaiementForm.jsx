import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Champ from "../components/Champ";

const STATUTS = [
  ["en_attente", "En attente"],
  ["partiel", "Partiel"],
  ["paye", "Payé"],
  ["annule", "Annulé"],
];

function extraireListe(reponse) {
  const donnees = reponse?.data;
  return Array.isArray(donnees) ? donnees : donnees?.data ?? [];
}

function libelleInscription(inscription) {
  const etudiant = inscription.etudiant;
  const formation = inscription.formation?.intitule ?? "Formation";
  const nom = etudiant ? `${etudiant.prenom} ${etudiant.nom}` : `Inscription #${inscription.id}`;
  return `${nom} — ${formation}`;
}

function PaiementForm() {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [formulaire, setFormulaire] = useState({
    inscription_id: "",
    montant: "",
    date_paiement: new Date().toISOString().slice(0, 10),
    reference: "",
    statut: "paye",
    notes: "",
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
    api.post("/paiements", { ...formulaire, inscription_id: Number(formulaire.inscription_id), montant: Number(formulaire.montant) })
      .then(() => navigate("/paiements"))
      .catch((erreur) => {
        setEnvoi(false);
        if (erreur.response?.status === 422) setErreurs(erreur.response.data.errors ?? {});
        else setMessage("Impossible d’enregistrer le paiement.");
      });
  };

  return (
    <div className="page-formulaire">
      <div className="formulaire-intro">
        <Link to="/paiements" className="retour"><ArrowLeft size={16} /> Retour aux paiements</Link>
        <h1>Ajouter un paiement</h1>
        <p>Associez le paiement à une inscription existante.</p>
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
          <Champ id="montant" label="Montant (FCFA)" erreur={erreurDe("montant")}><input id="montant" name="montant" type="number" min="1" value={formulaire.montant} onChange={changer} /></Champ>
          <Champ id="date_paiement" label="Date" erreur={erreurDe("date_paiement")}><input id="date_paiement" name="date_paiement" type="date" value={formulaire.date_paiement} onChange={changer} /></Champ>
        </div>
        <div className="duo">
          <Champ id="reference" label="Référence" erreur={erreurDe("reference")}><input id="reference" name="reference" value={formulaire.reference} onChange={changer} placeholder="PAY-001" /></Champ>
          <Champ id="statut" label="Statut" erreur={erreurDe("statut")}><select id="statut" name="statut" value={formulaire.statut} onChange={changer}>{STATUTS.map(([valeur, label]) => <option key={valeur} value={valeur}>{label}</option>)}</select></Champ>
        </div>
        <Champ id="notes" label="Notes" erreur={erreurDe("notes")}><textarea id="notes" name="notes" value={formulaire.notes} onChange={changer} /></Champ>
        <div className="boutons"><Link to="/paiements" className="lien-bouton">Annuler</Link><button className="principal" disabled={envoi || chargement || inscriptions.length === 0}>{envoi ? <><Loader2 size={18} className="tourne" /> Enregistrement...</> : "Enregistrer le paiement"}</button></div>
      </form>
    </div>
  );
}

export default PaiementForm;
