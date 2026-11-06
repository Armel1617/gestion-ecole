import { useEffect, useState } from "react";

// Affiche un nombre qui "défile" de 0 jusqu'à sa vraie valeur, puis s'arrête dessus.
// "format" est une fonction facultative pour mettre en forme (ex : espaces entre les milliers).
function Compteur({ valeur, format = (n) => n }) {
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    // Si la personne a réduit les animations, on affiche directement la valeur exacte
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAffiche(valeur);
      return;
    }

    const debut = performance.now();
    const duree = 900; // durée de l'animation en millisecondes
    let image;

    const avancer = (maintenant) => {
      const progression = Math.min((maintenant - debut) / duree, 1);
      // Courbe qui ralentit à la fin, pour un défilement plus naturel
      const adouci = 1 - Math.pow(1 - progression, 3);
      setAffiche(Math.round(valeur * adouci));
      if (progression < 1) image = requestAnimationFrame(avancer);
    };

    image = requestAnimationFrame(avancer);
    // Si le composant disparaît, on arrête l'animation
    return () => cancelAnimationFrame(image);
  }, [valeur]);

  return <>{format(affiche)}</>;
}

export default Compteur;