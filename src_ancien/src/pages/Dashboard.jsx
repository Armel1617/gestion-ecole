import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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
import StatutBadge from "../components/StatutBadge";
import { formatDate, formatMontant, pluriel } from "../utils";

// Les couleurs des statuts dans le graphique en anneau
const COULEURS_STATUT = { en_cours: "#3447D4", terminee: "#0B7F5A", annulee: "#D13C3C" };

// La petite bulle qui apparaît quand on survole le graphique
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

// "+3 ce mois-ci" : une pastille avec le nombre et un texte
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

// Une carte de chiffre : icône, titre, grand nombre et une ligne d'information
function Kpi({ section, Icone, label, valeur, unite, pied }) {
  return (
    <article className="carte kpi" data-section={section}>
      <div className="kpi-haut">
        <span className="kpi-label">{label}</span>
        <span className="tuile-kpi">
          <Icone size={20} />
        </span>
      </div>
      <div className="kpi-nombre">
        {valeur}
        {unite && <small>{unite}</small>}
      </div>
      <div className="kpi-pied">{pied}</div>
    </article>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null); // les chiffres reçus de Laravel
  const [erreur, setErreur] = useState(""); // message en cas de problème

  // Au premier affichage de la page, on demande les statistiques à Laravel
  useEffect(() => {
    api
      .get("/dashboard")
      .then((reponse) => setStats(reponse.data))
      .catch(() => setErreur("Impossible de joindre Laravel"));
  }, []);

  if (erreur) return <p className="erreur">{erreur}</p>;
  if (!stats) return <p>Chargement...</p>;

  // Les données du graphique : un point par mois ("oct.", "novembre 2026", nombre)
  const serie = (stats.inscriptions_par_mois ?? []).map((m) => {
    const date = new Date(`${m.mois}-01T12:00:00`);
    return {
      libelle: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
      complet: date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      total: m.total,
    };
  });
  const serieVide = serie.every((point) => point.total === 0);

  // Les trois statuts, pour l'anneau et sa légende
  const statuts = [
    { cle: "en_cours", texte: "En cours", valeur: stats.inscriptions_en_cours },
    { cle: "terminee", texte: "Terminées", valeur: stats.inscriptions_terminees },
    { cle: "annulee", texte: "Annulées", valeur: stats.inscriptions_annulees },
  ];
  const total = stats.total_inscriptions;
  const pourcent = (n) => (total === 0 ? 0 : Math.round((n / total) * 100));

  // La formation la plus demandée sert de référence pour la longueur des barres
  const maximum = Math.max(0, ...stats.formations_populaires.map((f) => f.inscriptions_count));

  // Nombre moyen d'inscrits par formation (null s'il n'y a aucune formation)
  const moyenne =
    stats.total_formations > 0
      ? (stats.total_inscriptions / stats.total_formations).toFixed(1).replace(".", ",")
      : null;

  const dernieres = stats.dernieres_inscriptions ?? [];

  return (
    <div>
      {/* En-tête de page avec les deux actions les plus fréquentes */}
      <header className="entete">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble des étudiants, des formations et des inscriptions</p>
        </div>
        <div className="entete-actions">
          <Link to="/etudiants/nouveau" className="lien-bouton">
            <UserPlus size={18} />
            Ajouter un étudiant
          </Link>
          <span data-section="inscriptions">
            <Link to="/inscriptions/nouvelle" className="lien-bouton principal">
              <ClipboardList size={18} />
              Inscrire un étudiant
            </Link>
          </span>
        </div>
      </header>

      {/* Les quatre cartes de chiffres, alignées sur une même ligne */}
      <section className="kpis" aria-label="Chiffres clés">
        <Kpi
          section="etudiants"
          Icone={Users}
          label="Étudiants"
          valeur={stats.total_etudiants}
          pied={<Tendance n={stats.etudiants_ce_mois ?? 0} texte="ce mois-ci" />}
        />
        <Kpi
          section="formations"
          Icone={BookOpen}
          label="Formations"
          valeur={stats.total_formations}
          pied={
            moyenne === null ? "Aucune formation proposée" : `${moyenne} inscrits en moyenne par formation`
          }
        />
        <Kpi
          section="inscriptions"
          Icone={ClipboardList}
          label="Inscriptions"
          valeur={stats.total_inscriptions}
          pied={<Tendance n={stats.inscriptions_ce_mois ?? 0} texte="ce mois-ci" />}
        />
        <Kpi
          section="accueil"
          Icone={Wallet}
          label="Revenus estimés"
          valeur={formatMontant(stats.revenus_estimes)}
          unite="FCFA"
          pied={`${stats.inscriptions_actives ?? 0} ${pluriel(stats.inscriptions_actives ?? 0, "inscription")} hors annulations`}
        />
      </section>

      <div className="grille">
        {/* Graphique 1 : les inscriptions des six derniers mois */}
        <section className="carte span-2" data-section="inscriptions">
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
                  <Link to="/inscriptions/nouvelle">Inscrire un étudiant</Link> pour alimenter ce graphique.
                </span>
              </div>
            ) : (
              <div className="graphique">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={serie} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      {/* Le léger dégradé sous la courbe */}
                      <linearGradient id="degrade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E07B1F" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#E07B1F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#E8EBF2" />
                    <XAxis
                      dataKey="libelle"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#667085", fontSize: 12 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#667085", fontSize: 12 }}
                    />
                    <Tooltip content={<InfoBulle />} cursor={{ stroke: "#C8CEE0" }} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#E07B1F"
                      strokeWidth={2.5}
                      fill="url(#degrade)"
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* Graphique 2 : la répartition des inscriptions par statut */}
        <section className="carte">
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
                      <Pie
                        data={statuts}
                        dataKey="valeur"
                        nameKey="texte"
                        innerRadius={62}
                        outerRadius={88}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {statuts.map((s) => (
                          <Cell key={s.cle} fill={COULEURS_STATUT[s.cle]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Le total au centre de l'anneau */}
                  <div className="donut-centre">
                    <strong>{total}</strong>
                    <span>{pluriel(total, "inscription")}</span>
                  </div>
                </div>

                <ul className="legende">
                  {statuts.map((s) => (
                    <li key={s.cle} style={{ "--c": COULEURS_STATUT[s.cle] }}>
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

        {/* Le classement des formations les plus demandées */}
        <section className="carte" data-section="formations">
          <div className="carte-tete">
            <div>
              <h2>Formations les plus demandées</h2>
              <p>Classées par nombre d'inscrits</p>
            </div>
          </div>
          <div className="carte-corps">
            {stats.formations_populaires.length === 0 ? (
              <p className="discret">
                Aucune formation pour le moment. <Link to="/formations/nouveau">Ajouter une formation</Link>.
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

        {/* Les dernières inscriptions */}
        <section className="carte span-2" data-section="inscriptions">
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
              <p className="discret" style={{ padding: "6px 22px 22px" }}>
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
      </div>
    </div>
  );
}

export default Dashboard;