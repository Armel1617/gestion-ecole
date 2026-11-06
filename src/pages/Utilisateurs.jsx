import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, UserRound } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils";

const ROLES = {
  administrateur: "Administrateur",
  direction: "Directeur",
  secretaire: "Secrétaire",
  enseignant: "Enseignant",
  etudiant: "Étudiant",
};

function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const { utilisateur } = useAuth();

  useEffect(() => {
    api.get("/utilisateurs")
      .then((reponse) => setUtilisateurs(Array.isArray(reponse.data?.data) ? reponse.data.data : reponse.data))
      .catch(() => setErreur("Impossible de charger les utilisateurs."))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div>
      <header className="entete">
        <div>
          <h1>Utilisateurs</h1>
          <p>Gérez les comptes et les rôles de l’établissement.</p>
        </div>
        <Link to="/utilisateurs/nouveau" className="lien-bouton principal">
          <Plus size={18} /> Nouvel utilisateur
        </Link>
      </header>
      {erreur && <p className="alerte" role="alert">{erreur}</p>}
      <section className="carte">
        {chargement ? <div className="module-chargement">Chargement...</div> : utilisateurs.length === 0 ? (
          <div className="vide"><span className="vide-icone"><UserRound size={22} /></span><strong>Aucun utilisateur</strong></div>
        ) : (
          <div className="defile">
            <table>
              <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Créé le</th>{utilisateur.role === "administrateur" && <th>Actions</th>}</tr></thead>
              <tbody>{utilisateurs.map((utilisateur) => (
                <tr key={utilisateur.id}>
                  <td><div className="identite"><span className="tuile-ligne"><UserRound size={18} /></span><strong>{utilisateur.name}</strong></div></td>
                  <td>{utilisateur.email}</td>
                  <td><span className="statut">{ROLES[utilisateur.role] ?? utilisateur.role}</span></td>
                  <td>{formatDate(utilisateur.created_at)}</td>
                  {utilisateur.role === "administrateur" && (
                    <td>
                      <Link className="btn-icone" to={`/utilisateurs/${utilisateur.id}/modifier`} title="Modifier" aria-label={`Modifier ${utilisateur.name}`}>
                        <Pencil size={17} />
                      </Link>
                    </td>
                  )}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Utilisateurs;
