import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2, Plus } from "lucide-react";
import api from "../api";
import { formatDate, formatMontant } from "../utils";

const CONFIG = {
  profil: { titre: "Mon profil", endpoint: "/etudiant/profil", champs: ["nom", "prenom", "email", "telephone"] },
  inscriptions: { titre: "Mes inscriptions", endpoint: "/inscriptions", champs: ["formation", "statut", "date_inscription"] },
  paiements: { titre: "Paiements", endpoint: "/paiements", champs: ["reference", "montant", "statut", "date_paiement"] },
  presences: { titre: "Présences", endpoint: "/presences", champs: ["date_presence", "statut", "minutes_retard"] },
  notes: { titre: "Notes", endpoint: "/notes", champs: ["matiere", "valeur", "bareme", "coefficient", "date_evaluation"] },
  documents: { titre: "Documents", endpoint: "/documents", champs: ["nom", "type", "created_at"] },
  notifications: { titre: "Notifications", endpoint: "/notifications", champs: ["type", "message", "created_at"] },
  annees: { titre: "Années académiques", endpoint: "/annees-academiques", champs: ["libelle", "date_debut", "date_fin", "active"] },
};

const LIBELLES = {
  reference: "Référence",
  montant: "Montant",
  statut: "Statut",
  date_paiement: "Date",
  date_presence: "Date",
  minutes_retard: "Retard",
  matiere: "Matière",
  valeur: "Note",
  bareme: "Barème",
  coefficient: "Coefficient",
  date_evaluation: "Évaluation",
  nom: "Document",
  type: "Type",
  created_at: "Date",
  libelle: "Année",
  date_debut: "Début",
  date_fin: "Fin",
  active: "État",
  message: "Message",
  formation: "Formation",
  date_inscription: "Date d'inscription",
  email: "Email",
  telephone: "Téléphone",
};

function valeurChamp(item, champ) {
  const valeur = item[champ];
  if (champ === "montant") return `${formatMontant(valeur)} FCFA`;
  if (champ.includes("date") || champ === "created_at") return valeur ? formatDate(valeur) : "—";
  if (champ === "active") return valeur ? "Active" : "Archivée";
  return valeur ?? "—";
}

function extraireElements(reponse) {
  const donnees = reponse?.data;
  if (Array.isArray(donnees)) return donnees;
  if (Array.isArray(donnees?.data)) return donnees.data;
  if (Array.isArray(donnees?.data?.data)) return donnees.data.data;
  if (donnees?.etudiant && typeof donnees.etudiant === "object") return [donnees.etudiant];
  if (donnees && typeof donnees === "object") return [donnees];
  return [];
}

function ModulePage({ module, etudiant = false }) {
  const configuration = CONFIG[module];
  const endpoint = etudiant ? `/etudiant/${module}` : configuration.endpoint;
  const [items, setItems] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get(endpoint)
      .then((reponse) => {
        setItems(extraireElements(reponse));
        setErreur("");
      })
      .catch((erreur) => {
        const message = erreur.code === "ECONNABORTED"
          ? "Le serveur met trop de temps à répondre."
          : `Impossible de charger ${configuration.titre.toLowerCase()}.`;
        setErreur(message);
      })
      .finally(() => setChargement(false));
  }, [endpoint, configuration.titre]);

  return (
    <div>
      <header className="entete">
        <div>
          <h1>{configuration.titre}</h1>
          <p>Consultez et suivez les données de votre établissement.</p>
        </div>
        {!etudiant && !["notifications", "documents"].includes(module) && (
          <Link to={`/${module}/nouveau`} className="lien-bouton principal">
            <Plus size={18} /> Ajouter
          </Link>
        )}
      </header>

      {erreur && <p className="alerte" role="alert">{erreur}</p>}
      <section className="carte">
        {chargement ? (
          <div className="module-chargement"><Loader2 className="tourne" size={24} /> Chargement...</div>
        ) : items.length === 0 ? (
          <div className="vide">
            <span className="vide-icone"><FileText size={22} /></span>
            <strong>Aucune donnée</strong>
            <span>Les éléments apparaîtront ici dès leur création.</span>
          </div>
        ) : (
          <div className="defile">
            <table>
              <thead><tr>{configuration.champs.map((champ) => <th key={champ}>{LIBELLES[champ]}</th>)}</tr></thead>
              <tbody>{items.map((item) => (
                <tr key={item.id}>{configuration.champs.map((champ) => <td key={champ}>{valeurChamp(item, champ)}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default ModulePage;
