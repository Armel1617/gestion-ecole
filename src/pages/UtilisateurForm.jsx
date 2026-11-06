import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "../api";
import Champ from "../components/Champ";
import ChampMotDePasse from "../components/ChampMotDePasse";
import { useAuth } from "../context/AuthContext";

const ROLES_INFERIEURS = [
  ["secretaire", "Secrétaire"],
  ["enseignant", "Enseignant"],
  ["etudiant", "Étudiant"],
];

function UtilisateurForm() {
  const { utilisateur } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const modification = Boolean(id);
  const peutCreerDirection = utilisateur.role === "administrateur";
  const roles = peutCreerDirection
    ? [
        ["administrateur", "Administrateur"],
        ["direction", "Directeur"],
        ...ROLES_INFERIEURS,
      ]
    : ROLES_INFERIEURS;
  const [formulaire, setFormulaire] = useState({ name: "", email: "", role: roles[0][0], password: "", password_confirmation: "" });
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const changer = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value });
  const erreurDe = (champ) => erreurs[champ]?.[0];

  useEffect(() => {
    if (!modification) return;
    api.get(`/utilisateurs/${id}`)
      .then((reponse) => setFormulaire((ancien) => ({ ...ancien, ...reponse.data, password: "", password_confirmation: "" })))
      .catch(() => setMessage("Impossible de charger cet utilisateur."));
  }, [id, modification]);

  const envoyer = (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreurs({});
    setMessage("");
    const requete = modification
      ? api.put(`/utilisateurs/${id}`, formulaire)
      : api.post("/utilisateurs", formulaire);
    requete
      .then(() => navigate("/utilisateurs"))
      .catch((erreur) => {
        setEnvoi(false);
        if (erreur.response?.status === 422) setErreurs(erreur.response.data.errors ?? {});
        else if (erreur.response?.status === 403) setMessage("Vous n’avez pas la permission de créer ce rôle.");
        else setMessage("Impossible de créer cet utilisateur.");
      });
  };

  return (
    <div className="page-formulaire">
      <div className="formulaire-intro">
        <Link to="/utilisateurs" className="retour"><ArrowLeft size={16} /> Retour aux utilisateurs</Link>
        <h1>{modification ? "Modifier un utilisateur" : "Nouvel utilisateur"}</h1>
        <p>{modification ? "Modifiez le rôle ou le mot de passe de ce compte." : "Le directeur peut créer les secrétaires, enseignants et étudiants. Seul l’administrateur peut créer un administrateur ou un directeur."}</p>
      </div>
      <form className="formulaire" onSubmit={envoyer} noValidate>
        {message && <p className="alerte" role="alert">{message}</p>}
        <Champ id="name" label="Nom complet" erreur={erreurDe("name")}><input id="name" name="name" value={formulaire.name} onChange={changer} /></Champ>
        <Champ id="email" label="Email" erreur={erreurDe("email")}><input id="email" name="email" type="email" value={formulaire.email} onChange={changer} /></Champ>
        <Champ id="role" label="Rôle" erreur={erreurDe("role")}><select id="role" name="role" value={formulaire.role} onChange={changer}>{roles.map(([valeur, label]) => <option key={valeur} value={valeur}>{label}</option>)}</select></Champ>
        <Champ id="password" label={modification ? "Nouveau mot de passe (facultatif)" : "Mot de passe"} erreur={erreurDe("password")}><ChampMotDePasse id="password" name="password" value={formulaire.password} onChange={changer} /></Champ>
        <Champ id="password_confirmation" label="Confirmer le mot de passe" erreur={erreurDe("password_confirmation")}><ChampMotDePasse id="password_confirmation" name="password_confirmation" value={formulaire.password_confirmation} onChange={changer} /></Champ>
        <div className="boutons"><Link to="/utilisateurs" className="lien-bouton">Annuler</Link><button className="principal" disabled={envoi}>{envoi ? <><Loader2 size={18} className="tourne" /> Enregistrement...</> : modification ? "Enregistrer les modifications" : "Créer l’utilisateur"}</button></div>
      </form>
    </div>
  );
}

export default UtilisateurForm;
