# 🌌 PTShelf

PTShelf est une bibliothèque et un espace de travail **local-first** premium conçu pour organiser, concevoir, et exécuter vos prompts d'Intelligence Artificielle de manière structurée.

Plutôt que de copier-coller manuellement des invites à la structure volatile, PTShelf extrait automatiquement les paramètres dynamiques de vos prompts pour générer instantanément des formulaires de saisie réutilisables.

---

## 💡 Le Concept : Du Prompt Brut au Template Dynamique

### Le Problème
Les prompts utiles sont souvent éparpillés entre ChatGPT, Notion, Obsidian ou des fichiers texte locaux. Les adapter demande de réécrire manuellement des passages à chaque fois, ce qui induit de la friction et des erreurs de formatage.

### La Solution PTShelf
Au lieu d'enregistrer une invite statique :
> *"Génère un portrait photoréaliste de Rhysand portant une armure noire dans une forêt enneigée."*

PTShelf vous permet de stocker un template paramétrable :
> *"Génère un portrait photoréaliste de **[personnage]** portant une **[armure]** dans une **[environnement]**."*

PTShelf détecte automatiquement ces jetons et génère à la volée un **formulaire dynamique** intuitif.

---

## ✨ Fonctionnalités Clés

- **🪄 Créateur de Template Interactif** : Collez n'importe quel prompt brut, surlignez le texte que vous souhaitez paramétrer, et transformez-le en variable d'un simple clic.
- **❓ Variables Conditionnelles** : Structurez vos prompts avec des blocs facultatifs de type `[?condition]texte[/?condition]`. Le bloc s'active uniquement si la valeur de la variable est définie.
- **⚡ Rendu en Temps Réel** : Visualisez l'assemblage final du prompt au fur et à mesure que vous remplissez les variables.
- **💾 Système de Presets** : Sauvegardez différentes combinaisons de valeurs de variables sous forme de presets thématiques.
- **🔄 Suggestions d'Autocomplétion** : Suggère automatiquement des valeurs précédemment utilisées pour accélérer la saisie.
- **📂 Organisation par Dossiers** : Classez vos templates par thèmes, cas d'usage ou modèles cibles (ChatGPT, Midjourney, Suno, etc.).
- **☁️ Synchronisation Google Drive** : Sauvegardez et synchronisez vos templates et configurations de manière sécurisée en connectant votre propre compte Google Drive (via l'intégration de l'API Google Drive).

---

## 🛠️ Stack Technique

- **Framework** : [Next.js](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Style & UI** : [Tailwind CSS](https://tailwindcss.com/) & [ModoUI style](https://github.com/lucide-react/lucide-react) (thème sombre premium aux accents néon violet & rose)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Authentification & Stockage distant** : Authentification Google GSI & API REST Google Drive (Local-first et Cloud-sync)

---

## 🚀 Démarrage Rapide

### Prérequis
Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) (version 18+ recommandée).

### Installation
1. Clonez le dépôt et naviguez dans le projet :
   ```bash
   git clone <url-du-depot>
   cd ptshelf
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📂 Architecture du Projet

```text
├── app/                  # Pages, routage App Router & styles globaux
│   ├── creator/          # Page interactive du Créateur de Template
│   ├── library/          # Espace d'organisation par dossiers & templates
│   ├── templates/        # Terrain de jeu (Playground) et rendu des prompts
│   └── settings/         # Configuration de la synchronisation Google Drive
├── components/           # Composants réutilisables (Layout & Primitives UI)
│   ├── layout/           # AppShell, Header et Sidebar
│   └── ui/               # Primitives et boutons stylisés
├── context/              # Centralisation de l'état (LibraryContext) & persistance
├── types/                # Définitions des contrats TypeScript du domaine
└── lib/                  # Fonctions utilitaires transverses
```

---

## 🛡️ Confidentialité & Philosophie Local-First
PTShelf stocke vos templates localement dans votre navigateur (`localStorage`). Si vous activez la synchronisation Google Drive, vos données sont poussées sur votre espace Drive personnel sans passer par aucun serveur intermédiaire. **Vos prompts vous appartiennent.**
