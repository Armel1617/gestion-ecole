import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AuthVisuel from "../components/AuthVisuel";
import Champ from "../components/Champ";
import ChampMotDePasse from "../components/ChampMotDePasse";
import { useAuth } from "../context/AuthContext";

function Connexion() {
  const { connexion } = useAuth();

  const [formulaire, setFormulaire] = useState({ email: "", password: "" });
  const [erreurs, setErreurs] = useState({}); // erreurs de validation renvoyées par Laravel (422)
  const [message, setMessage] = useState(""); // erreur générale (serveur éteint, trop de tentatives...)
  const [envoi, setEnvoi] = useState(false); // vrai pendant la vérification

  // Appelée à chaque frappe
  const changer = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value });

  // Appelée au clic sur "Se connecter"
  const envoyer = (e) => {
    e.preventDefault();
    setErreurs({});
    setMessage("");
    setEnvoi(true);

    // En cas de succès, RoutePublique voit qu'on est connecté et nous envoie vers l'accueil tout seul
    connexion(formulaire.email, formulaire.password).catch((erreur) => {
      setEnvoi(false);
      const statut = erreur.response?.status;
      if (statut === 422) {
        setErreurs(erreur.response.data.errors); // email ou mot de passe incorrect, champ vide...
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
            <h1>Connexion à votre espace</h1>
            <p className="auth-sous">Retrouvez les informations de votre établissement selon votre rôle.</p>
          </div>

          {message && (
            <p className="alerte" role="alert">
              {message}
            </p>
          )}

          {/* noValidate : c'est Laravel qui affiche les messages, pas le navigateur */}
          <form onSubmit={envoyer} className="auth-form" noValidate>
            <Champ id="email" label="Email" erreur={erreurDe("email")}>
              <input
                id="email"
                type="email"
                name="email"
                value={formulaire.email}
                onChange={changer}
                placeholder="vous@exemple.com"
                autoComplete="email"
                autoFocus
                aria-invalid={Boolean(erreurDe("email"))}
              />
            </Champ>

            <Champ id="password" label="Mot de passe" erreur={erreurDe("password")}>
              <ChampMotDePasse
                id="password"
                name="password"
                value={formulaire.password}
                onChange={changer}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                invalide={Boolean(erreurDe("password"))}
              />
            </Champ>

            <button type="submit" className="principal plein" disabled={envoi}>
              {envoi ? (
                <>
                  <Loader2 size={18} className="tourne" />
                  Connexion...
                </>
              ) : (
                "Accéder à mon espace"
              )}
            </button>
          </form>

          <p className="auth-pied">
            Vous êtes étudiant et vous n’avez pas encore de compte ?{" "}
            <Link to="/creer-compte">Créer mon compte étudiant</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Connexion;