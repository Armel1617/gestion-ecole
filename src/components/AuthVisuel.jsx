import { Check } from "lucide-react";

// Le panneau de présentation des pages d'authentification
function AuthVisuel() {
  return (
    <aside className="auth-visuel">
      <div className="logo">
        <span className="logo-marque auth-logo">GE</span>
        <strong>Gestion École</strong>
      </div>

      <div className="auth-message">
        <h2>Tout le suivi de votre établissement au même endroit.</h2>
        <p>Une plateforme partagée entre administration, direction, secrétariat, enseignants et étudiants.</p>
        <ul>
          <li>
            <Check size={18} />
            Étudiants, formations et inscriptions centralisés
          </li>
          <li>
            <Check size={18} />
            Notes, présences et paiements suivis au quotidien
          </li>
          <li>
            <Check size={18} />
            Notifications et accès adaptés à chaque rôle
          </li>
        </ul>
      </div>

      <small>Gestion École · Une seule plateforme pour toute l'équipe</small>
    </aside>
  );
}

export default AuthVisuel;