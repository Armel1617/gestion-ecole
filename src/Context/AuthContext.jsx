import { createContext, useContext, useEffect, useState } from "react";
import api, { apiPublique, CLE_TOKEN } from "../api";

// Un "contexte" : une mémoire partagée par toute l'application.
// Ici, elle retient QUI est connecté, pour que toutes les pages le sachent.
const AuthContext = createContext(null);

const normaliserUtilisateur = (utilisateur) => {
  if (!utilisateur) return null;
  const nom = utilisateur.name ?? [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(" ");
  const role = utilisateur.role === "directeur" ? "direction" : utilisateur.role;
  return { ...utilisateur, name: nom || utilisateur.email, role };
};

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null); // l'utilisateur connecté (ou null)
  // Au démarrage, s'il y a un jeton, il faut vérifier qu'il est encore valable : on "charge"
  const [chargement, setChargement] = useState(Boolean(localStorage.getItem(CLE_TOKEN)));

  // Au rechargement de la page : on demande à Laravel "qui suis-je ?" avec le jeton rangé
  useEffect(() => {
    if (!localStorage.getItem(CLE_TOKEN)) return;
    api
      .get("/me")
      .then((reponse) => setUtilisateur(normaliserUtilisateur(reponse.data.user ?? reponse.data)))
      .catch(() => localStorage.removeItem(CLE_TOKEN))
      .finally(() => setChargement(false));
  }, []);

  // Range le jeton et l'utilisateur après une connexion ou une création de compte
  const ouvrirSession = (donnees) => {
    localStorage.setItem(CLE_TOKEN, donnees.token);
    setUtilisateur(normaliserUtilisateur(donnees.user));
  };

  const connexion = (email, password) =>
    apiPublique.post("/connexion", { email, password }).then((reponse) => ouvrirSession(reponse.data));

  const creerCompte = (champs) =>
    apiPublique.post("/creer-compte", champs).then((reponse) => ouvrirSession(reponse.data));

  const deconnexion = () =>
    api
      .post("/deconnexion")
      .catch(() => {}) // même si Laravel ne répond pas, on se déconnecte côté navigateur
      .finally(() => {
        localStorage.removeItem(CLE_TOKEN);
        setUtilisateur(null);
      });

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connexion, creerCompte, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Petit raccourci pour lire la mémoire dans n'importe quel composant : const { utilisateur } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}