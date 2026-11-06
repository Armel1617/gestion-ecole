import { useEffect, useRef, useState } from "react";

// Hook : donne le message à afficher et une fonction pour en afficher un nouveau.
// Le message disparaît tout seul au bout de 3 secondes.
export function useToast() {
  const [toast, setToast] = useState(null);
  const minuteur = useRef(null);

  const afficher = (texte, type = "succes") => {
    setToast({ texte, type });
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setToast(null), 3000);
  };

  // Si la page disparaît, on annule le minuteur
  useEffect(() => () => clearTimeout(minuteur.current), []);

  return [toast, afficher];
}

// Le petit message en bas à droite (ne s'affiche que s'il y en a un)
export function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`} role="status">
      {toast.texte}
    </div>
  );
}