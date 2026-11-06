import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { BookOpen, ClipboardList, LayoutDashboard, Menu, Users } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Etudiants from "./pages/Etudiants";
import EtudiantForm from "./pages/EtudiantForm";
import Formations from "./pages/Formations";
import FormationForm from "./pages/FormationForm";
import Inscriptions from "./pages/Inscriptions";
import InscriptionForm from "./pages/InscriptionForm";

// Le nom de chaque section, affiché dans le fil d'Ariane
const TITRES = {
  accueil: "Tableau de bord",
  etudiants: "Étudiants",
  formations: "Formations",
  inscriptions: "Inscriptions",
};

// Les liens du menu : l'adresse, le texte, l'icône et la classe de couleur
const LIEN_ACCUEIL = { to: "/", texte: "Tableau de bord", classe: "m-accueil", Icone: LayoutDashboard };
const LIENS_GESTION = [
  { to: "/etudiants", texte: "Étudiants", classe: "m-etudiants", Icone: Users },
  { to: "/formations", texte: "Formations", classe: "m-formations", Icone: BookOpen },
  { to: "/inscriptions", texte: "Inscriptions", classe: "m-inscriptions", Icone: ClipboardList },
];

function App() {
  // useLocation donne l'adresse actuelle : "/etudiants/3/modifier"
  const { pathname } = useLocation();
  // On en tire la section ("etudiants") : le CSS s'en sert pour choisir la couleur de la page
  const section = pathname.split("/")[1] || "accueil";

  // Pour le téléphone : le menu latéral est un tiroir, ouvert ou fermé
  const [menuOuvert, setMenuOuvert] = useState(false);

  // La touche Échap ferme le tiroir
  useEffect(() => {
    const fermer = (e) => {
      if (e.key === "Escape") setMenuOuvert(false);
    };
    window.addEventListener("keydown", fermer);
    return () => window.removeEventListener("keydown", fermer);
  }, []);

  // Sur une page d'ajout ou de modification, le fil d'Ariane a un niveau de plus
  const parties = pathname.split("/").filter(Boolean);
  const action = parties.includes("modifier")
    ? "Modification"
    : parties.includes("nouveau") || parties.includes("nouvelle")
    ? "Ajout"
    : null;

  // La date du jour, par exemple "mardi 27 octobre"
  const aujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Un lien du menu (identique pour tous, seule l'icône change)
  const renderLien = ({ to, texte, classe, Icone }, fin = false) => (
    <NavLink
      key={to}
      to={to}
      end={fin}
      className={`lien-menu ${classe}`}
      onClick={() => setMenuOuvert(false)} // on ferme le tiroir après un clic
    >
      <span className="tuile">
        <Icone size={18} />
      </span>
      {texte}
    </NavLink>
  );

  return (
    <div className="appli">
      {/* La barre latérale (tiroir sur téléphone) */}
      <aside className={`lateral ${menuOuvert ? "ouvert" : ""}`} aria-label="Menu principal">
        <div className="logo">
          <span className="logo-signe">
            <i />
            <i />
            <i />
          </span>
          <div>
            <strong>Gestion École</strong>
            <small>Administration</small>
          </div>
        </div>

        <nav>
          {/* "end" : ce lien n'est actif que sur la page d'accueil exacte */}
          {renderLien(LIEN_ACCUEIL, true)}
        </nav>

        <nav>
          <div className="groupe-titre">Gestion</div>
          {LIENS_GESTION.map((lien) => renderLien(lien))}
        </nav>
      </aside>

      {/* Le voile sombre derrière le tiroir : un clic dessus le ferme */}
      <div className={`voile ${menuOuvert ? "visible" : ""}`} onClick={() => setMenuOuvert(false)} />

      {/* data-section donne à toute la zone la couleur de sa section */}
      <div className="zone" data-section={section}>
        {/* La barre du haut : bouton de menu (mobile), fil d'Ariane et date */}
        <header className="haut">
          <button
            className="burger btn-icone"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOuvert(true)}
          >
            <Menu size={20} />
          </button>

          <nav className="fil" aria-label="Fil d'Ariane">
            <span>Gestion École</span>
            <span className="sep">/</span>
            {action ? (
              <>
                <Link to={`/${section}`}>{TITRES[section]}</Link>
                <span className="sep">/</span>
                <strong>{action}</strong>
              </>
            ) : (
              <strong>{TITRES[section] ?? "Page"}</strong>
            )}
          </nav>

          <span className="date">{aujourdhui}</span>
        </header>

        {/* Le contenu change selon l'adresse (l'URL) */}
        <main className="contenu">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/etudiants" element={<Etudiants />} />
            <Route path="/etudiants/nouveau" element={<EtudiantForm />} />
            <Route path="/etudiants/:id/modifier" element={<EtudiantForm />} />

            <Route path="/formations" element={<Formations />} />
            <Route path="/formations/nouveau" element={<FormationForm />} />
            <Route path="/formations/:id/modifier" element={<FormationForm />} />

            <Route path="/inscriptions" element={<Inscriptions />} />
            <Route path="/inscriptions/nouvelle" element={<InscriptionForm />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;