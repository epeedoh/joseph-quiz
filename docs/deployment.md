# Déploiement

## Supabase PostgreSQL

1. Créer un projet Supabase.
2. Récupérer la chaîne PostgreSQL.
3. L’injecter dans `ConnectionStrings__DefaultConnection` côté Render.

## Render

1. Connecter le dépôt GitHub.
2. Choisir `Blueprint` ou charger [render.yaml](/C:/Users/surface/Documents/New%20project/render.yaml).
3. Définir:
   - `ConnectionStrings__DefaultConnection`
   - `Cors__AllowedOrigins__0`
4. Laisser `autoDeploy` activé.

Le conteneur utilise [src/JosephQuiz.Api/Dockerfile](/C:/Users/surface/Documents/New%20project/src/JosephQuiz.Api/Dockerfile), applique les migrations et seed les questions au démarrage.

## Vercel

1. Importer `web/joseph-quiz-web` comme projet.
2. Vérifier que le build command est `npm run build`.
3. Vérifier que l’output directory est `dist/joseph-quiz-web/browser`.
4. Déployer avec [web/joseph-quiz-web/vercel.json](/C:/Users/surface/Documents/New%20project/web/joseph-quiz-web/vercel.json).

Le frontend parle à `/api`, que Vercel redirige vers Render via la règle de rewrite.

## GitHub

- CI prête dans [.github/workflows/ci.yml](/C:/Users/surface/Documents/New%20project/.github/workflows/ci.yml)
- Render et Vercel peuvent auto-déployer à chaque push sur la branche choisie
