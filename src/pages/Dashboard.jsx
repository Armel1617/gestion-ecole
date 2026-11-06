import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, BookOpen, ClipboardList, Minus, UserPlus, Users, Wallet } from "lucide-react";
import api from "../api";
import Avatar from "../components/Avatar";
import Compteur from "../components/Compteur";
import StatutBadge from "../components/StatutBadge";
import { formatDate, formatMontant, pluriel } from "../utils";

// Couleurs des statuts dans l'anneau : orange = en cours, vert = terminée, rouge = annulée
const COULEURS_STATUT = { en_cours: "#D99520", terminee: "#168765", annulee: "#D9485F" };

// La bulle qui apparaît quand on survole le graphique
function InfoBulle({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="infobulle">
      <strong>{point.complet}</strong>
      <span>
        {point.total} {pluriel(point.total, "inscription")}
      </span>
    </div>
  );
}

// "+3 ce mois-ci" : une pastille avec le nombre, puis un texte
function Tendance({ n, texte }) {
  return (
    <>
      <span className={`tendance ${n === 0 ? "neutre" : ""}`}>
        {n === 0 ? <Minus size={14} /> : <ArrowUpRight size={14} />}
        {n}
      </span>
      <span>{texte}</span>
    </>
  );
}

// Une petite carte de chiffre (le nombre défile jusqu'à sa valeur réelle)
function Kpi({ rang, Icone, label, valeur, pied }) {
  return (
    <article className="carte kpi apparait" style={{ "--i": rang }}>
      <span className="kpi-icone">
        <Icone size={18} />
      </span>
      <div className="kpi-label">{label}</div>
      <div className="kpi-nombre">
        <Compteur valeur={valeur} />
      </div>
      <div className="kpi-pied">{pied}</div>
    </article>
  );
}

// Ce qu'on affiche pendant que les données arrivent
function Squelette() {
  return (
    <div>
      <div className="squelette" style={{ height: 56, width: 320, marginBottom: 24 }} />
      <div className="bento">
        <div className="squelette c5" style={{ height: 270 }} />
        <div className="squelette c7" style={{ height: 270 }} />
        <div className="squelette c8" style={{ height: 340 }} />
        <div className="squelette c4" style={{ height: 340 }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null); // les chiffres reçus de Laravel
  const [erreur, setErreur] = useState(""); // message en cas de problème

  // Au premier affichage de la page, on demande les statistiques à Laravel
  useEffect(() => {
    api
      .get("/dashboard")
      .then((reponse) => {
        const donnees = reponse.data?.data ?? reponse.data ?? {};
        setStats({
          total_etudiants: donnees.total_etudiants ?? 0,
          total_formations: donnees.total_formations ?? 0,
          total_inscriptions: donnees.total_inscriptions ?? 0,
          etudiants_ce_mois: donnees.etudiants_ce_mois ?? 0,
          inscriptions_ce_mois: donnees.inscriptions_ce_mois ?? 0,
          inscriptions_en_cours: donnees.inscriptions_en_cours ?? 0,
          inscriptions_terminees: donnees.inscriptions_terminees ?? 0,
          inscriptions_annulees: donnees.inscriptions_annulees ?? 0,
          inscriptions_actives: donnees.inscriptions_actives ?? 0,
          revenus_estimes: donnees.revenus_estimes ?? 0,
          inscriptions_par_mois: Array.isArray(donnees.inscriptions_par_mois)
            ? donnees.inscriptions_par_mois
            : [],
          formations_populaires: Array.isArray(donnees.formations_populaires)
            ? donnees.formations_populaires
            : [],
          derniers_etudiants: Array.isArray(donnees.derniers_etudiants)
            ? donnees.derniers_etudiants
            : [],
          dernieres_inscriptions: Array.isArray(donnees.dernieres_inscriptions)
            ? donnees.dernieres_inscriptions
            : [],
        });
      })
      .catch(() => setErreur("Impossible de joindre Laravel. Vérifier que le serveur tourne."));
  }, []);

  if (erreur)
    return (
      <p className="alerte" role="alert">
        {erreur}
      </p>
    );
  if (!stats) return <Squelette />;

  // Les données du graphique : un point par mois (étiquette courte, étiquette longue, nombre)
  const serie = (stats.inscriptions_par_mois ?? []).map((m) => {
    const date = new Date(`${m.mois}-01T12:00:00`);
    return {
      libelle: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
      complet: date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      total: m.total,
    };
  });
  const serieVide = serie.every((point) => point.total === 0);
  const maxMois = Math.max(1, ...serie.map((point) => point.total)); // pour la hauteur des mini-barres

  // Les trois statuts (la couleur est dans "fill", lu par le graphique en anneau)
  const statuts = [
    { cle: "en_cours", texte: "En cours", valeur: stats.inscriptions_en_cours, fill: COULEURS_STATUT.en_cours },
    { cle: "terminee", texte: "Terminées", valeur: stats.inscriptions_terminees, fill: COULEURS_STATUT.terminee },
    { cle: "annulee", texte: "Annulées", valeur: stats.inscriptions_annulees, fill: COULEURS_STATUT.annulee },
  ];
  const total = stats.total_inscriptions;
  const pourcent = (n) => (total === 0 ? 0 : Math.round((n / total) * 100));

  // La formation la plus demandée sert de référence pour la longueur des barres
  const maximum = Math.max(0, ...stats.formations_populaires.map((f) => f.inscriptions_count ?? 0));

  // Nombre moyen d'inscrits par formation (null s'il n'y a aucune formation)
  const moyenne =
    stats.total_formations > 0
      ? (stats.total_inscriptions / stats.total_formations).toFixed(1).replace(".", ",")
      : null;

  const actives = stats.inscriptions_actives ?? 0;
  const dernieres = stats.dernieres_inscriptions ?? [];

  return (
    <div>
      {/* En-tête de page avec les deux actions les plus fréquentes */}
      <header className="entete apparait">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble des étudiants, des formations et des inscriptions</p>
        </div>
        <div className="entete-actions">
          <Link to="/etudiants/nouveau" className="lien-bouton">
            <UserPlus size={18} />
            Nouvel étudiant
          </Link>
          <Link to="/inscriptions/nouvelle" className="lien-bouton principal">
            <ClipboardList size={18} />
            Nouvelle inscription
          </Link>
        </div>
      </header>

      <div className="bento">
        {/* La grande carte violette : revenus estimés + inscriptions des 6 derniers mois */}
        <article className="carte hero c5 apparait" style={{ "--i": 1 }}>
          <div>
            <div className="hero-label">
              <Wallet size={18} />
              Revenus estimés
            </div>
            <div className="hero-nombre">
              <Compteur valeur={stats.revenus_estimes} format={formatMontant} />
              <small>FCFA</small>
            </div>
            <p className="hero-pied">
              {actives} {pluriel(actives, "inscription")} hors annulations
            </p>
          </div>

          <div>
            {/* Une barre par mois, hauteur proportionnelle au nombre d'inscriptions */}
            <div className="mini-barres" role="img" aria-label="Inscriptions des six derniers mois">
              {serie.map((point) => (
                <span
                  key={point.complet}
                  title={`${point.complet} : ${point.total}`}
                  style={{ "--h": `${(point.total / maxMois) * 100}%` }}
                />
              ))}
            </div>
            <div className="mini-legende">
              {serie.map((point) => (
                <span key={point.complet}>{point.libelle}</span>
              ))}
            </div>
          </div>
        </article>

        {/* Les trois cartes de chiffres */}
        <div className="kpis c7">
          <Kpi
            rang={2}
            Icone={Users}
            label="Étudiants"
            valeur={stats.total_etudiants}
            pied={<Tendance n={stats.etudiants_ce_mois ?? 0} texte="ce mois-ci" />}
          />
          <Kpi
            rang={3}
            Icone={BookOpen}
            label="Formations"
            valeur={stats.total_formations}
            pied={moyenne === null ? "Aucune formation proposée" : `${moyenne} inscrits en moyenne`}
          />
          <Kpi
            rang={4}
            Icone={ClipboardList}
            label="Inscriptions"
            valeur={stats.total_inscriptions}
            pied={<Tendance n={stats.inscriptions_ce_mois ?? 0} texte="ce mois-ci" />}
          />
        </div>

        {/* Graphique : les inscriptions des six derniers mois */}
        <section className="carte c8 apparait" style={{ "--i": 5 }}>
          <div className="carte-tete">
            <div>
              <h2>Inscriptions par mois</h2>
              <p>Les six derniers mois</p>
            </div>
          </div>
          <div className="carte-corps">
            {serieVide ? (
              <div className="vide">
                <span className="vide-icone">
                  <ClipboardList size={22} />
                </span>
                <strong>Aucune inscription sur les six derniers mois</strong>
                <span>
                  <Link to="/inscriptions/nouvelle">Créer une inscription</Link> pour alimenter ce graphique.
                </span>
              </div>
            ) : (
              <div className="graphique">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={serie} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      {/* Le léger dégradé violet sous la courbe */}
                      <linearGradient id="degradeViolet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7557F6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#7557F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#E8E8F0" />
                    <XAxis dataKey="libelle" tickLine={false} axisLine={false} tick={{ fill: "#6B6D80", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#6B6D80", fontSize: 12 }} />
                    <Tooltip content={<InfoBulle />} cursor={{ stroke: "#D6D7E4" }} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#7557F6"
                      strokeWidth={2.5}
                      fill="url(#degradeViolet)"
                      activeDot={{ r: 5 }}
                      animationDuration={900}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* Anneau : répartition des statuts */}
        <section className="carte c4 apparait" style={{ "--i": 6 }}>
          <div className="carte-tete">
            <div>
              <h2>Statuts des inscriptions</h2>
              <p>
                {total} {pluriel(total, "inscription")} au total
              </p>
            </div>
          </div>
          <div className="carte-corps">
            {total === 0 ? (
              <p className="discret">Aucune inscription pour le moment.</p>
            ) : (
              <>
                <div className="donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      {/* La couleur de chaque part vient du champ "fill" des données */}
                      <Pie
                        data={statuts}
                        dataKey="valeur"
                        nameKey="texte"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={3}
                        cornerRadius={4}
                        stroke="none"
                        animationDuration={800}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-centre">
                    <strong>{total}</strong>
                    <span>{pluriel(total, "inscription")}</span>
                  </div>
                </div>

                <ul className="legende">
                  {statuts.map((s) => (
                    <li key={s.cle} style={{ "--c": s.fill }}>
                      <span className="point" />
                      {s.texte}
                      <b>{s.valeur}</b>
                      <em>{pourcent(s.valeur)} %</em>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Classement des formations les plus demandées */}
        <section className="carte c4 apparait" style={{ "--i": 7 }}>
          <div className="carte-tete">
            <div>
              <h2>Formations populaires</h2>
              <p>Classées par nombre d'inscrits</p>
            </div>
          </div>
          <div className="carte-corps">
            {stats.formations_populaires.length === 0 ? (
              <p className="discret">
                Aucune formation pour le moment. <Link to="/formations/nouveau">Créer une formation</Link>.
              </p>
            ) : (
              <ol className="classement">
                {/* .map() transforme chaque formation en une ligne avec sa barre */}
                {stats.formations_populaires.map((f) => (
                  <li key={f.id}>
                    <div className="ligne">
                      <span>{f.intitule}</span>
                      <span>
                        {f.inscriptions_count} {pluriel(f.inscriptions_count, "inscrit")}
                      </span>
                    </div>
                    <div className="piste">
                      <div
                        className="remplissage"
                        style={{ "--w": `${maximum ? (f.inscriptions_count / maximum) * 100 : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* Dernières inscriptions */}
        <section className="carte c8 apparait" style={{ "--i": 8 }}>
          <div className="carte-tete">
            <div>
              <h2>Dernières inscriptions</h2>
              <p>Les cinq plus récentes</p>
            </div>
            <Link to="/inscriptions" className="voir-tout">
              Voir tout
            </Link>
          </div>
          <div className="carte-corps" style={{ padding: "12px 0 0" }}>
            {dernieres.length === 0 ? (
              <p className="discret" style={{ padding: "6px 24px 24px" }}>
                Aucune inscription pour le moment.
              </p>
            ) : (
              <div className="defile">
                <table>
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Formation</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dernieres.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <div className="identite">
                            <Avatar prenom={i.etudiant.prenom} nom={i.etudiant.nom} />
                            <div>
                              <strong>
                                {i.etudiant.prenom} {i.etudiant.nom}
                              </strong>
                              <span>{i.etudiant.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>{i.formation.intitule}</td>
                        <td>{formatDate(i.date_inscription)}</td>
                        <td>
                          <StatutBadge statut={i.statut} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Derniers étudiants ajoutés */}
        <section className="carte c12 apparait" style={{ "--i": 9 }}>
          <div className="carte-tete">
            <div>
              <h2>Derniers étudiants ajoutés</h2>
              <p>Cliquer sur un étudiant pour modifier sa fiche</p>
            </div>
            <Link to="/etudiants" className="voir-tout">
              Voir tout
            </Link>
          </div>
          <div className="carte-corps">
            {stats.derniers_etudiants.length === 0 ? (
              <p className="discret">
                Aucun étudiant pour le moment. <Link to="/etudiants/nouveau">Créer un étudiant</Link>.
              </p>
            ) : (
              <div className="personnes">
                {stats.derniers_etudiants.map((e) => (
                  <Link key={e.id} to={`/etudiants/${e.id}/modifier`} className="personne identite">
                    <Avatar prenom={e.prenom} nom={e.nom} />
                    <div>
                      <strong>
                        {e.prenom} {e.nom}
                      </strong>
                      <span>Ajouté le {formatDate(e.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;