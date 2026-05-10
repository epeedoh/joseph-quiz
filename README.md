# JOSEPH QUIZ

Application de quiz biblique gamifiée centrée sur la vie de Joseph dans **Genèse 37 à 50** avec la **Bible Louis Segond 1910** comme référence de seed.

## Stack

- Backend: .NET 8, ASP.NET Core Minimal API, Clean Architecture, EF Core, PostgreSQL, MediatR, FluentValidation, AutoMapper, Serilog, Swagger
- Frontend: Angular 18, Standalone Components, Angular Signals, Tailwind CSS, Angular Service Worker
- Déploiement cible: Render (API), Vercel (frontend), Supabase PostgreSQL

## Arborescence

```text
JosephQuiz.sln
src/
  JosephQuiz.Api/
  JosephQuiz.Application/
  JosephQuiz.Domain/
  JosephQuiz.Infrastructure/
  JosephQuiz.Shared/
web/
  joseph-quiz-web/
tools/
  bible/
scripts/
  sql/
docs/
```

## Fonctionnalités livrées

- Pseudo localStorage avec profil joueur
- Quiz custom par zone, chapitre, plage, erreurs, non jouées
- Mode révision et mode compétition avec timer 10s/15s/20s
- XP, niveaux, badges et tunique-o-mètre
- Système d’équipes avec création, rejoint et leaderboard collectif
- Révision adaptative basée sur les erreurs, zones faibles et lenteur
- PWA offline-ready avec cache des assets et des données API
- Seed automatique PostgreSQL de **100 questions réelles**

## Lancement local

### Option 1: Docker Compose

```bash
docker compose up --build
```

- Frontend: [http://localhost:8080](http://localhost:8080)
- API: [http://localhost:5099](http://localhost:5099)
- Swagger: [http://localhost:5099/swagger](http://localhost:5099/swagger)
- PostgreSQL de dev: `localhost:5433` avec `postgres/postgres`

### Option 2: Manuel

1. Préparer PostgreSQL.
   Option recommandée: `docker compose up -d postgres`
2. Copier `.env.example` si besoin pour vos variables locales.
3. Restaurer et compiler:

```bash
dotnet restore JosephQuiz.sln
dotnet build JosephQuiz.sln
```

4. Générer le seed si vous le regénérez après modification:

```bash
node tools/bible/build-seed.mjs
```

5. Appliquer la base:

```bash
dotnet tool restore
dotnet tool run dotnet-ef database update --project src/JosephQuiz.Infrastructure --startup-project src/JosephQuiz.Api
```

6. Lancer l’API:

```bash
dotnet run --project src/JosephQuiz.Api
```

7. Lancer le frontend:

```bash
cd web/joseph-quiz-web
npm install
npm start
```

## Variables d’environnement utiles

### Backend

- `ConnectionStrings__DefaultConnection`
- `Cors__AllowedOrigins__0`
- `Cors__AllowedOrigins__1`
- `ASPNETCORE_ENVIRONMENT`
- `GEMINI__ApiKey` optionnelle

### Frontend

- En local: `src/environments/environment.ts`
- En production Vercel: proxy `/api` défini dans [web/joseph-quiz-web/vercel.json](/C:/Users/surface/Documents/New%20project/web/joseph-quiz-web/vercel.json)

## Déploiement

### Backend Render

- Config prêt dans [render.yaml](/C:/Users/surface/Documents/New%20project/render.yaml)
- Docker multi-stage prêt dans [src/JosephQuiz.Api/Dockerfile](/C:/Users/surface/Documents/New%20project/src/JosephQuiz.Api/Dockerfile)
- Base PostgreSQL cible attendue via Supabase

### Frontend Vercel

- Projet Angular prêt dans [web/joseph-quiz-web/vercel.json](/C:/Users/surface/Documents/New%20project/web/joseph-quiz-web/vercel.json)
- Output attendu: `dist/joseph-quiz-web/browser`
- Le proxy `/api` redirige vers le service Render

## Base de données

- Migration initiale: `InitialCreate`
- Script SQL généré: [scripts/sql/init.sql](/C:/Users/surface/Documents/New%20project/scripts/sql/init.sql)
- Seed JSON runtime: [src/JosephQuiz.Infrastructure/SeedData/joseph-questions.json](/C:/Users/surface/Documents/New%20project/src/JosephQuiz.Infrastructure/SeedData/joseph-questions.json)

## Documentation complémentaire

- Architecture: [docs/architecture.md](/C:/Users/surface/Documents/New%20project/docs/architecture.md)
- Déploiement: [docs/deployment.md](/C:/Users/surface/Documents/New%20project/docs/deployment.md)
