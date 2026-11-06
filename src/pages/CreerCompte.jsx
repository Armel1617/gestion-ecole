import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthVisuel from "../components/AuthVisuel";
import Champ from "../components/Champ";
import ChampMotDePasse from "../components/ChampMotDePasse";
import { useAuth } from "../context/AuthContext";

function CreerCompte() {
  const { creerCompte } = useAuth();

  // Les noms des champs sont ceux attendus par Laravel (password_confirmation : le mot de passe répété)
  const [formulaire, setFormulaire] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const changer = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value });

  const envoyer = (e) => {
    e.preventDefault();
    setErreurs({});
    setMessage("");
    setEnvoi(true);

    // En cas de succès, le compte est créé et on est connecté : RoutePublique nous envoie à l'accueil
    creerCompte(formulaire).catch((erreur) => {
      setEnvoi(false);
      const statut = erreur.response?.status;
      if (statut === 422) {
        setErreurs(erreur.response.data.errors);
      } else if (statut === 429) {
        setMessage("Trop de tentatives. Réessayer dans une minute.");
      } else {
        setMessage("Impossible de joindre le serveur. Vérifier que Laravel est lancé.");
      }
    });
  };

  const erreurDe = (champ) => (erreurs[champ] ? erreurs[champ][0] : undefined);

  return (
    <div className="auth">
      <AuthVisuel />

      <main className="auth-formulaire">
        <div className="auth-carte">
          <div>
            <h1>Créer mon compte étudiant</h1>
            <p className="auth-sous">Accédez à votre profil, vos inscriptions, vos notes, vos présences et vos notifications.</p>
          </div>

          {message && (
            <p className="alerte" role="alert">
              {message}
            </p>
          )}

          <form onSubmit={envoyer} className="auth-form" noValidate>
            <div className="duo">
              <Champ id="nom" label="Nom" erreur={erreurDe("nom")}>
                <input id="nom" name="nom" value={formulaire.nom} onChange={changer} placeholder="Dossou" autoComplete="family-name" autoFocus aria-invalid={Boolean(erreurDe("nom"))} />
              </Champ>
              <Champ id="prenom" label="Prénom" erreur={erreurDe("prenom")}>
                <input id="prenom" name="prenom" value={formulaire.prenom} onChange={changer} placeholder="Awa" autoComplete="given-name" aria-invalid={Boolean(erreurDe("prenom"))} />
              </Champ>
            </div>

            <Champ id="email" label="Email" erreur={erreurDe("email")}>
              <input
                id="email"
                type="email"
                name="email"
                value={formulaire.email}
                onChange={changer}
                placeholder="vous@exemple.com"
                autoComplete="email"
                aria-invalid={Boolean(erreurDe("email"))}
              />
            </Champ>

            <Champ id="password" label="Mot de passe" erreur={erreurDe("password")} aide="Au moins 8 caractères.">
              <ChampMotDePasse
                id="password"
                name="password"
                value={formulaire.password}
                onChange={changer}
                placeholder="Choisir un mot de passe"
                autoComplete="new-password"
                invalide={Boolean(erreurDe("password"))}
              />
            </Champ>

            <Champ id="password_confirmation" label="Confirmer le mot de passe" erreur={erreurDe("password_confirmation")}>
              <ChampMotDePasse
                id="password_confirmation"
                name="password_confirmation"
                value={formulaire.password_confirmation}
                onChange={changer}
                placeholder="Répéter le mot de passe"
                autoComplete="new-password"
                invalide={Boolean(erreurDe("password_confirmation"))}
              />
            </Champ>

            <button type="submit" className="principal plein" disabled={envoi}>
              {envoi ? (
                <>
                  <Loader2 size={18} className="tourne" />
                  Création du compte...
                </>
              ) : (
                "Créer mon compte étudiant"
              )}
            </button>
          </form>

          <p className="auth-pied">
            Vous avez déjà un compte ? <Link to="/connexion">Accéder à mon espace</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default CreerCompte;