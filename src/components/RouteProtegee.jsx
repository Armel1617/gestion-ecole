import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Entoure les pages privées : si personne n'est connecté, on renvoie vers /connexion
function RouteProtegee() {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();

  // On attend la réponse de Laravel avant de décider
  if (chargement) {
    return (
      <div className="plein-ecran">
        <Loader2 className="tourne" aria-label="Chargement" />
      </div>
    );
  }

  // Pas connecté : retour à la connexion (on retient la page demandée pour y revenir après)
  if (!utilisateur) {
    return <Navigate to="/connexion" replace state={{ depuis: location.pathname }} />;
  }
  if (utilisateur.role === "etudiant" && location.pathname === "/") {
    return <Navigate to="/profil" replace />;
  }

  // Connecté : on affiche la page demandée
  return <Outlet />;
}

export default RouteProtegee;