import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RouteAutorisee({ roles }) {
  const { utilisateur } = useAuth();
  const role = utilisateur?.role === "directeur" ? "direction" : utilisateur?.role;
  return roles.includes(role) ? <Outlet /> : <Navigate to="/acces-interdit" replace />;
}

export default RouteAutorisee;
