import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Entoure /connexion et /creer-compte : si on est déjà connecté, on file au tableau de bord
function RoutePublique() {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();

  if (chargement) {
    return (
      <div className="plein-ecran">
        <Loader2 className="tourne" aria-label="Chargement" />
      </div>
    );
  }

  // Connecté (par exemple juste après la connexion) : on va à la page demandée au départ, ou à l'accueil
  if (utilisateur) return <Navigate to={location.state?.depuis || "/"} replace />;

  return <Outlet />;
}

export default RoutePublique;