# PTShelf

PTShelf est une base de travail minimaliste pour organiser à terme des projets, dossiers, templates, variables et presets.

## Démarrage

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Scripts

- `npm run dev` : démarre le serveur de développement.
- `npm run build` : génère la version de production.
- `npm run start` : démarre la version de production.
- `npm run lint` : exécute ESLint.
- `npm run typecheck` : vérifie les types TypeScript.

## Architecture

- `app/` : routes, layout racine et styles globaux.
- `components/` : composants de layout et primitives UI.
- `lib/` : utilitaires sans dépendance métier.
- `types/` : contrats du domaine PTShelf.
- `hooks/` : futurs hooks React réutilisables.
- `context/` : futurs providers React.
- `data/` : futures sources et couches d’accès aux données.

La V1 pose volontairement uniquement les fondations : aucune persistance, authentification ou logique métier complexe n’est encore implémentée.
