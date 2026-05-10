# Architecture JOSEPH QUIZ

## Backend

### `JosephQuiz.Domain`

- Entités métier: `Question`, `Profile`, `Score`, `UserAnswer`, `CompetitiveSession`, `Team`, `TeamMember`
- Enums: `BiblicalZone`, `DifficultyLevel`, `QuizMode`

### `JosephQuiz.Application`

- Handlers MediatR pour les endpoints métier
- DTOs de requêtes et réponses
- Validation FluentValidation
- Mapping AutoMapper
- Calculs de progression et scoring

### `JosephQuiz.Infrastructure`

- `JosephQuizDbContext`
- Configurations EF Core
- Repositories
- Services: sélection de quiz, recommandations adaptatives
- Seeder JSON avec chargement automatique si la table `Questions` est vide

### `JosephQuiz.Api`

- Minimal API
- Swagger
- Serilog
- Gestion centralisée des erreurs
- Migrations et seed au démarrage

## Frontend

### Composition

- `DashboardComponent`
- `ChapterSelectorComponent`
- `QuizEngineComponent`
- `TimerComponent`
- `LeaderboardComponent`
- `TeamComponent`
- `ProfileComponent`

### Services Angular

- `quiz.service.ts`: moteur de session, scoring offline, synchronisation différée
- `leaderboard.service.ts`: leaderboard individuel et équipe
- `progress.service.ts`: pseudo local, profil, tunique-o-mètre
- `team.service.ts`: création et adhésion d’équipe
- `offline-cache.service.ts`: IndexedDB avec `idb-keyval`

### PWA

- Service worker Angular
- `manifest.webmanifest`
- cache des assets
- cache des appels quiz/profil/leaderboard
- mode offline avec file d’attente des soumissions

## Seed biblique

- Source intermédiaire: `tools/bible/genesis37-50.json`
- Générateur: `tools/bible/build-seed.mjs`
- Banque maintenable: `tools/bible/question-bank.mjs`
- Résultat final: `src/JosephQuiz.Infrastructure/SeedData/joseph-questions.json`
