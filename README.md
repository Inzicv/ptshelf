# README.md

# PTShelf

PTShelf est une bibliothèque personnelle de templates IA.

L'objectif n'est pas de créer un simple gestionnaire de prompts mais un espace de travail permettant de stocker, organiser, modifier et réutiliser facilement des modèles de prompts.

Le produit est inspiré de :

* Promptmetheus
* Canva
* Notion
* Bitwarden

## Le problème

Les prompts sont souvent dispersés :

* ChatGPT
* Notion
* Obsidian
* Discord
* Fichiers texte
* Notes

Ils sont difficiles à retrouver et nécessitent souvent de modifier manuellement les mêmes éléments.

## Principe

Au lieu de stocker :

```text
Photorealistic portrait of Rhysand wearing black armor in a snowy forest.
```

on stocke :

```text
Photorealistic portrait of [character] wearing [armor] in a [environment].
```

Les variables entre crochets sont détectées automatiquement.

Lorsque l'utilisateur ouvre le template, un formulaire dynamique est généré :

```text
character = Rhysand

armor = black armor

environment = snowy forest
```

Le prompt final est ensuite généré.

## Organisation

Projects

↓

Folders

↓

Templates

## Fonctionnalités principales

* bibliothèque de templates
* variables automatiques
* génération de formulaires
* recherche
* favoris
* presets
* duplication
* évolution des templates

## Inspirations

### Promptmetheus

Variables et génération.

### Canva

Dashboard et duplication.

### Notion

Organisation.

### Bitwarden

Bibliothèque personnelle.

## Stack

* Next.js
* TypeScript
* Tailwind
* shadcn/ui
* GitHub
* Vercel

## Philosophie

Construire une base solide avant les fonctionnalités avancées.

Privilégier l'expérience utilisateur et la cohérence du produit.



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

## Fonctionnalités V2

- dashboard alimenté par les données de la bibliothèque ;
- création et suppression de dossiers et projets ;
- création de templates avec variables `{{clé}}` ;
- création de presets associés à un template ;
- génération et copie du prompt final depuis un preset ;
- persistance locale automatique dans le navigateur ;
- navigation responsive et thème sombre.

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
- `context/` : état applicatif et commandes métier locales.
- `data/` : configuration et valeurs initiales de la bibliothèque.

La V2 reste volontairement local-first : aucune authentification ni infrastructure serveur n’est requise. Le contexte de bibliothèque isole la persistance afin de pouvoir la remplacer plus tard par une API sans réécrire les écrans.

