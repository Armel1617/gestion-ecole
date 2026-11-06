<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## API professionnelle

Les nouveaux endpoints versionnés sont disponibles sous `/api/v1` et nécessitent un
jeton Sanctum :

- `GET|POST /api/v1/etudiants`
- `GET|POST /api/v1/formations`
- `GET|POST /api/v1/inscriptions`
- `GET|POST /api/v1/annees-academiques`
- `GET|POST /api/v1/paiements`
- `GET|POST /api/v1/presences`
- `GET|POST /api/v1/notes`
- `GET /api/v1/inscriptions/{id}/bulletin`
- `GET|POST /api/v1/documents`
- `GET /api/v1/documents/{id}/download`
- `GET /api/v1/notifications`
- `GET /api/health`
- `GET /api/openapi.json`
- `GET /api/v1/dashboard`

Les listes sont paginées par défaut à 15 éléments. Le paramètre `per_page` accepte
une valeur de 1 à 100. Les anciennes routes `/api/...` restent disponibles pour
préserver la compatibilité avec le client existant.

Les rôles disponibles sont `administrateur`, `direction`, `secretaire` et
`enseignant`. La suppression d'un étudiant, d'une formation ou d'une inscription
est réservée à l'administration et à la direction.

La création des comptes est privée : seul un utilisateur ayant le rôle
`administrateur` ou `direction` peut appeler `POST /api/v1/utilisateurs`.
L'administrateur peut créer tous les rôles, y compris administrateur et
direction. La direction peut créer les comptes opérationnels et étudiants, mais
pas un administrateur ou un autre directeur.

L'inscription publique `POST /api/creer-compte` reste active, mais crée
exclusivement un compte `etudiant` lié à son dossier étudiant. L'étudiant ne
peut consulter que son profil, ses inscriptions, ses paiements, ses notes, ses
présences, ses documents et ses notifications via `/api/v1/etudiant/*`.

Une inscription `/api/v1/inscriptions` utilise automatiquement l'année académique
active si `annee_academique_id` n'est pas fourni. Les paiements sont exprimés dans
la plus petite unité monétaire entière de l'application et possèdent une référence
unique facultative.

Les notes sont pondérées par coefficient et normalisées sur 20 dans le bulletin.
Les présences sont uniques par inscription et par date, avec les statuts
`present`, `absent`, `retard` et `excuse`.

Les documents sont stockés sur le disque privé Laravel et ne sont jamais exposés
directement par une URL publique. Les paiements créent une notification pour
l'administration et la direction, traitée via la queue Laravel.

Les mutations API authentifiées sont enregistrées dans `audit_logs` avec
l'utilisateur, la route, le statut HTTP, l'adresse IP et un payload expurgé des
secrets. Les erreurs de validation et HTTP utilisent un format JSON uniforme.

Après déploiement, exécuter :

```bash
php artisan migrate --force
php artisan optimize
```

### Déploiement production

1. Copier `.env.production.example` vers `.env` et renseigner les secrets.
2. Installer les dépendances sans les paquets de développement :

```bash
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
```

3. Démarrer un worker persistant avec Supervisor ou un service équivalent :

```bash
php artisan queue:work database --sleep=3 --tries=3 --timeout=90
```

4. Le serveur web doit pointer vers `public/`, jamais vers la racine du projet.
5. Vérifier `GET /api/health` après chaque déploiement.

La CI vérifie automatiquement Composer, Pint, les migrations/tests Laravel et le
build Vite sur chaque pull request.

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
