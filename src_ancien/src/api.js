// Importe Axios, l'outil qui envoie les demandes à Laravel
import axios from "axios";

// On crée UNE configuration réutilisée partout dans l'application
const api = axios.create({
  // Adresse de base de ton API Laravel : on n'écrira plus que "/etudiants", "/formations"...
  baseURL: "http://127.0.0.1:8000/api",
  // Dit à Laravel de répondre en JSON (même rôle que l'en-tête Accept de Thunder Client)
  headers: { Accept: "application/json" },
});

export default api;