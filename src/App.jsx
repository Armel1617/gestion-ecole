import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  BookMarked,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Receipt,
  UserCog,
  Users,
} from "lucide-react";
import Avatar from "./components/Avatar";
import RouteProtegee from "./components/RouteProtegee";
import RoutePublique from "./components/RoutePublique";
import RouteAutorisee from "./components/RouteAutorisee";
import api from "./api";
import { useAuth } from "./context/AuthContext";
const Connexion = lazy(() => import("./pages/Connexion"));
const CreerCompte = lazy(() => import("./pages/CreerCompte"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Etudiants = lazy(() => import("./pages/Etudiants"));
const EtudiantForm = lazy(() => import("./pages/EtudiantForm"));
const Formations = lazy(() => import("./pages/Formations"));
const FormationForm = lazy(() => import("./pages/FormationForm"));
const Inscriptions = lazy(() => import("./pages/Inscriptions"));
const InscriptionForm = lazy(() => import("./pages/InscriptionForm"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const NoteForm = lazy(() => import("./pages/NoteForm"));
const PaiementForm = lazy(() => import("./pages/PaiementForm"));
const PresenceForm = lazy(() => import("./pages/PresenceForm"));
const MotDePasse = lazy(() => import("./pages/MotDePasse"));
const UtilisateurForm = lazy(() => import("./pages/UtilisateurForm"));
const Utilisateurs = lazy(() => import("./pages/Utilisateurs"));

function ChargementPage() {
  return (
    <div className="plein-ecran" role="status" aria-label="Chargement">
      <span className="squelette" style={{ height: 8, width: 140 }} />
    </div>
  );
}

function AccesInterdit() {
  return (
    <div className="vide">
      <strong>Accès interdit</strong>
      <span>Vous n’avez pas la permission d’accéder à cette page.</span>
      <Link to="/" className="lien-bouton principal">Retour au tableau de bord</Link>
    </div>
  );
}

// Le nom de chaque section, affiché dans le fil d'Ariane
const TITRES = {
  accueil: "Tableau de bord",
  etudiants: "Étudiants",
  formations: "Formations",
  inscriptions: "Inscriptions",
  notes: "Notes",
  presences: "Présences",
  notifications: "Notifications",
};

// Les liens du menu : l'adresse, le texte et l'icône
const LIENS = [
  { to: "/", texte: "Tableau de bord", Icone: LayoutDashboard, fin: true, roles: ["administrateur", "direction", "secretaire", "enseignant"] },
  { to: "/etudiants", texte: "Étudiants", Icone: Users, roles: ["administrateur", "direction", "secretaire", "enseignant"] },
  { to: "/formations", texte: "Formations", Icone: BookOpen, roles: ["administrateur", "direction", "secretaire", "enseignant"] },
  { to: "/inscriptions", texte: "Inscriptions", Icone: ClipboardList, roles: ["administrateur", "direction", "secretaire", "enseignant"] },
  { to: "/paiements", texte: "Paiements", Icone: Receipt, roles: ["administrateur", "direction", "secretaire"] },
  { to: "/presences", texte: "Présences", Icone: ClipboardCheck, roles: ["administrateur", "direction", "enseignant"] },
  { to: "/notes", texte: "Notes", Icone: BookMarked, roles: ["administrateur", "direction", "enseignant"] },
  { to: "/documents", texte: "Documents", Icone: FileText, roles: ["administrateur", "direction", "secretaire", "enseignant"] },
  { to: "/notifications", texte: "Notifications", Icone: Bell, roles: ["administrateur", "direction", "secretaire", "enseignant", "etudiant"] },
  { to: "/mot-de-passe", texte: "Changer le mot de passe", Icone: KeyRound, roles: ["administrateur", "direction", "secretaire", "enseignant", "etudiant"] },
  { to: "/utilisateurs", texte: "Utilisateurs", Icone: UserCog, roles: ["administrateur", "direction"] },
];

// La "coque" : la barre latérale + la barre du haut, qui entourent toutes les pages privées
function Coque() {
  const { pathname } = useLocation();
  const section = pathname.split("/")[1] || "accueil";
  const { utilisateur, deconnexion } = useAuth();
  const role = utilisateur.role;

  // Sur téléphone, le menu est un tiroir : ouvert ou fermé
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

  // La date du jour, par exemple "mercredi 28 octobre"
  const aujourdhui = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Le nom de l'utilisateur coupé en deux pour les initiales de l'avatar
  const [premier = "", second = ""] = utilisateur.name.split(" ");

  return (
    <div className="appli">
      {/* Navigation compacte (tiroir sur téléphone) */}
      <aside className={`lateral ${menuOuvert ? "ouvert" : ""}`} aria-label="Menu principal">
        <div className="logo">
          <span className="logo-marque">GE</span>
          <div className="logo-texte">
            <strong>Gestion École</strong>
            <small>Administration</small>
          </div>
        </div>

        <nav>
          {(role === "etudiant"
            ? [
                { to: "/profil", texte: "Mon profil", Icone: GraduationCap },
                { to: "/mes-inscriptions", texte: "Mes inscriptions", Icone: ClipboardList },
                { to: "/mes-paiements", texte: "Mes paiements", Icone: Receipt },
                { to: "/mes-notes", texte: "Mes notes", Icone: BookMarked },
                { to: "/mes-presences", texte: "Mes présences", Icone: ClipboardCheck },
                { to: "/mes-documents", texte: "Mes documents", Icone: FileText },
                { to: "/mes-notifications", texte: "Notifications", Icone: Bell },
                { to: "/mot-de-passe", texte: "Changer le mot de passe", Icone: KeyRound },
              ]
            : LIENS.filter((lien) => lien.roles.includes(role))
          ).map(({ to, texte, Icone, fin }) => (
            <NavLink
              key={to}
              to={to}
              end={fin}
              className="lien-menu"
              data-label={texte}
              onClick={() => setMenuOuvert(false)}
            >
              <Icone size={21} strokeWidth={1.9} aria-hidden="true" />
              <span className="texte">{texte}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Fond sombre derrière le tiroir (visible seulement sur téléphone) */}
      <div className={`voile ${menuOuvert ? "visible" : ""}`} onClick={() => setMenuOuvert(false)} />

      <div className="zone">
        <header className="haut">
          <button
            className="burger btn-icone"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            {menuOuvert ? <X size={20} /> : <Menu size={20} />}
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
          <NotificationsRapides />

          {/* L'utilisateur connecté et le bouton de déconnexion */}
          <div className="utilisateur">
            <Avatar prenom={premier} nom={second} />
            <div className="utilisateur-nom">
              <strong>{utilisateur.name}</strong>
              <small>{utilisateur.email}</small>
            </div>
            <button
              className="btn-icone"
              title="Se déconnecter"
              aria-label="Se déconnecter"
              onClick={deconnexion}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>

        <main className="contenu">
          {/* key={pathname} : à chaque changement de page, la transition d'entrée se rejoue */}
          <div className="page" key={pathname}>
            {/* Outlet : c'est ici que s'affiche la page choisie */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NotificationsRapides() {
  const { utilisateur } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);

  const charger = () => {
    api.get("/notifications", { params: { per_page: 5 } })
      .then((reponse) => {
        const donnees = reponse.data ?? {};
        setNotifications(donnees.data?.data ?? donnees.data ?? []);
        setNonLues(donnees.non_lues ?? 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    charger();
    const intervalle = window.setInterval(charger, 60000);
    return () => window.clearInterval(intervalle);
  }, []);

  const lireTout = () => {
    if (nonLues === 0) return;
    api.post("/notifications/lire-tout").then(() => {
      setNonLues(0);
      setNotifications((actuelles) => actuelles.map((notification) => ({ ...notification, read_at: new Date().toISOString() })));
    }).catch(() => {});
  };

  return (
    <div className="notifications-rapides">
      <button
        className="btn-icone cloche"
        title="Consulter les notifications"
        aria-label={`Notifications${nonLues ? `, ${nonLues} non lues` : ""}`}
        aria-expanded={ouvert}
        onClick={() => setOuvert((valeur) => !valeur)}
      >
        <Bell size={20} />
        {nonLues > 0 && <span className="badge-notifications">{nonLues > 99 ? "99+" : nonLues}</span>}
      </button>
      {ouvert && (
        <div className="panneau-notifications">
          <div className="panneau-notifications-tete">
            <strong>Notifications</strong>
            <button className="lien-reinit" onClick={lireTout} disabled={nonLues === 0}>Tout lire</button>
          </div>
          {notifications.length === 0 ? (
            <p className="notifications-vides">Aucune notification.</p>
          ) : (
            <div className="notifications-liste">
              {notifications.map((notification) => (
                <div className={`notification-rapide ${notification.read_at ? "" : "non-lue"}`} key={notification.id}>
                  <strong>{notification.data?.title ?? notification.type?.split("\\").pop() ?? "Notification"}</strong>
                  <span>{notification.data?.message ?? notification.data?.text ?? "Nouvelle notification"}</span>
                </div>
              ))}
            </div>
          )}
          <Link
            to={utilisateur.role === "etudiant" ? "/mes-notifications" : "/notifications"}
            className="voir-tout"
            onClick={() => setOuvert(false)}
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Routes>
      {/* Pages publiques : connexion et création de compte */}
      <Route element={<RoutePublique />}>
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/creer-compte" element={<CreerCompte />} />
      </Route>

      {/* Pages privées : il faut être connecté */}
      <Route element={<RouteProtegee />}>
        <Route element={<Coque />}>
          <Route element={<RouteAutorisee roles={["administrateur", "direction", "secretaire", "enseignant"]} />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/etudiants" element={<Etudiants />} />
            <Route path="/etudiants/nouveau" element={<EtudiantForm />} />
            <Route path="/etudiants/:id/modifier" element={<EtudiantForm />} />

            <Route path="/formations" element={<Formations />} />
            <Route path="/formations/nouveau" element={<FormationForm />} />
            <Route path="/formations/:id/modifier" element={<FormationForm />} />

            <Route path="/inscriptions" element={<Inscriptions />} />
            <Route path="/inscriptions/nouvelle" element={<InscriptionForm />} />
            <Route path="/paiements" element={<ModulePage module="paiements" />} />
            <Route path="/paiements/nouveau" element={<PaiementForm />} />
            <Route path="/presences" element={<ModulePage module="presences" />} />
            <Route path="/presences/nouveau" element={<PresenceForm />} />
            <Route path="/notes" element={<ModulePage module="notes" />} />
            <Route path="/notes/nouveau" element={<NoteForm />} />
            <Route path="/documents" element={<ModulePage module="documents" />} />
            <Route path="/notifications" element={<ModulePage module="notifications" />} />
            <Route path="/annees" element={<ModulePage module="annees" />} />
          </Route>

          <Route element={<RouteAutorisee roles={["administrateur", "direction"]} />}>
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/utilisateurs/nouveau" element={<UtilisateurForm />} />
            <Route path="/utilisateurs/:id/modifier" element={<UtilisateurForm />} />
          </Route>
          <Route path="/mot-de-passe" element={<MotDePasse />} />

          <Route element={<RouteAutorisee roles={["etudiant"]} />}>
            <Route path="/profil" element={<ModulePage module="profil" etudiant />} />
            <Route path="/mes-inscriptions" element={<ModulePage module="inscriptions" etudiant />} />
            <Route path="/mes-paiements" element={<ModulePage module="paiements" etudiant />} />
            <Route path="/mes-notes" element={<ModulePage module="notes" etudiant />} />
            <Route path="/mes-presences" element={<ModulePage module="presences" etudiant />} />
            <Route path="/mes-documents" element={<ModulePage module="documents" etudiant />} />
            <Route path="/mes-notifications" element={<ModulePage module="notifications" etudiant />} />
          </Route>
        </Route>
      </Route>

      {/* Toute autre adresse : retour à l'accueil */}
      <Route path="/acces-interdit" element={<AccesInterdit />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;