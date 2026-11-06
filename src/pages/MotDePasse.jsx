import { useState } from "react";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api";
import Champ from "../components/Champ";
import ChampMotDePasse from "../components/ChampMotDePasse";

function MotDePasse() {
  const [formulaire, setFormulaire] = useState({ current_password: "", password: "", password_confirmation: "" });
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const changer = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  const erreurDe = (champ) => erreurs[champ]?.[0];
  const envoyer = (e) => {
    e.preventDefault();
    setEnvoi(true); setErreurs({}); setMessage(""); setSucces("");
    api.put("/mot-de-passe", formulaire)
      .then(() => { setSucces("Votre mot de passe a été modifié."); setFormulaire({ current_password: "", password: "", password_confirmation: "" }); })
      .catch((erreur) => {
        if (erreur.response?.status === 422) setErreurs(erreur.response.data.errors ?? {});
        else setMessage("Impossible de modifier le mot de passe.");
      })
      .finally(() => setEnvoi(false));
  };
  return (
    <div className="page-formulaire">
      <div className="formulaire-intro">
        <Link to="/" className="retour"><ArrowLeft size={16} /> Retour au tableau de bord</Link>
        <h1><KeyRound size={26} /> Changer le mot de passe</h1>
        <p>Vous pouvez modifier votre mot de passe à tout moment.</p>
      </div>
      <form className="formulaire" onSubmit={envoyer} noValidate>
        {message && <p className="alerte" role="alert">{message}</p>}
        {succes && <p className="succes" role="status">{succes}</p>}
        <Champ id="current_password" label="Mot de passe actuel" erreur={erreurDe("current_password")}><ChampMotDePasse id="current_password" name="current_password" value={formulaire.current_password} onChange={changer} /></Champ>
        <Champ id="password" label="Nouveau mot de passe" erreur={erreurDe("password")}><ChampMotDePasse id="password" name="password" value={formulaire.password} onChange={changer} /></Champ>
        <Champ id="password_confirmation" label="Confirmer le nouveau mot de passe" erreur={erreurDe("password_confirmation")}><ChampMotDePasse id="password_confirmation" name="password_confirmation" value={formulaire.password_confirmation} onChange={changer} /></Champ>
        <div className="boutons"><button className="principal" disabled={envoi}>{envoi ? <><Loader2 size={18} className="tourne" /> Enregistrement...</> : "Enregistrer"}</button></div>
      </form>
    </div>
  );
}

export default MotDePasse;
