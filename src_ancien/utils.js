// Petites fonctions réutilisées dans plusieurs pages

// Ajoute un "s" au mot quand le nombre est supérieur à 1 : pluriel(3, "étudiant") -> "étudiants"
export const pluriel = (n, mot) => (n > 1 ? `${mot}s` : mot);

// Les initiales d'une personne, pour son avatar : ("Awa", "Dossou") -> "AD"
export const initiales = (prenom = "", nom = "") =>
  `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();

// Un nombre avec des espaces entre les milliers : 1250000 -> "1 250 000"
export const formatMontant = (n) => Number(n || 0).toLocaleString("fr-FR");

// Une date au format français : "2026-10-27" -> "27/10/2026"
export const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");