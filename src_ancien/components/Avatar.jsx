import { initiales } from "../utils";

// Un rond avec les initiales de la personne (aux couleurs de la section affichée)
function Avatar({ prenom, nom }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initiales(prenom, nom)}
    </span>
  );
}

export default Avatar;