import axios from "axios";

export const CLE_TOKEN = "ecole_token";

const appliquerIntercepteurToken = (client) => {
  client.interceptors.request.use((config) => {
    const jeton = localStorage.getItem(CLE_TOKEN);
    if (jeton) config.headers.Authorization = `Bearer ${jeton}`;
    return config;
  });

  client.interceptors.response.use(
    (reponse) => reponse,
    (erreur) => {
      if (erreur.response?.status === 401) {
        localStorage.removeItem(CLE_TOKEN);
        const surPageAuth = ["/connexion", "/creer-compte"].includes(window.location.pathname);
        if (!surPageAuth) window.location.href = "/connexion";
      }
      return Promise.reject(erreur);
    }
  );
  return client;
};

const api = appliquerIntercepteurToken(
  axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
    timeout: 10000,
    headers: { Accept: "application/json" },
  })
);

export const apiPublique = appliquerIntercepteurToken(
  axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    timeout: 10000,
    headers: { Accept: "application/json" },
  })
);

export default api;
