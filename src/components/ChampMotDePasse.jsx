import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Un champ mot de passe avec un bouton "afficher / masquer"
function ChampMotDePasse({ invalide, ...proprietes }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="mdp">
      <input {...proprietes} type={visible ? "text" : "password"} aria-invalid={invalide} />
      <button
        type="button"
        className="btn-icone"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default ChampMotDePasse;