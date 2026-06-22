# ROADMAP.md

# V1

Objectif :

Créer une base simple et utilisable.

Fonctionnalités :

* projets
* dossiers
* templates
* variables automatiques
* formulaire dynamique
* génération de prompts
* copie du résultat
* recherche
* favoris

Stockage :

localStorage

# V2

Objectif :

Réutilisation avancée.

Fonctionnalités :

* presets
* duplication
* historique
* versioning simple
* export
* import

# V3

Objectif :

Expérience premium.

Fonctionnalités :

* détection automatique des variables (ex [variable] ou {{variable}})
* refonte ui dans le style ModoUI (dark mode par defaut fond sombre contour highlight violet et rose neon)

# V3.1
* — Responsive Layout Refactor
Goal

Make the whole application fully responsive and adaptive, with behavior similar to Notion, Cursor and ChatGPT.

The interface must work naturally on:

Mobile
Tablet
Laptop
Ultra-wide screens
2K and 4K displays

No fixed width should limit the available space.

Layout System
AppShell
Remove all layout width limitations.
Remove:
mx-auto
max-w-[1600px]
Use:
w-full
flex-1
min-w-0
overflow-auto
Header
Remove:
mx-auto
max-w-[1600px]
Header must always occupy the full width.
Page Containers

Refactor:

app/page.tsx
app/library/page.tsx
app/templates/page.tsx
app/settings/page.tsx
future pages

Remove:

max-w-4xl
max-w-5xl
max-w-6xl
max-w-[1600px]
container
mx-auto

Use responsive spacing:

p-4 md:p-6 lg:p-8
space-y-8
flex-1
Grid System

Replace fixed grids:

grid-cols-3

with:

grid-cols-1 md:grid-cols-2 xl:grid-cols-3

Replace:

grid-cols-4

with:

grid-cols-1 sm:grid-cols-2 lg:grid-cols-4

Cards must automatically adapt to screen size.

Width Cleanup

Search the entire project for:

max-w-
w-[
h-[
mx-auto
container

Remove unnecessary fixed dimensions.

Prefer:

w-full
h-full
flex-1
min-w-0
Sidebar

Desktop:

Keep sidebar visible.
Width remains fixed.

Mobile:

Hide sidebar.
Replace with a drawer / hamburger menu.
Overflow Management

All main containers must use:

min-w-0
overflow-auto

Avoid horizontal scrolling.

Expected Result
No large empty margins.
Fluid interface.
Mobile-first behavior.
Automatic adaptation to any screen size.
Similar UX to ChatGPT, Notion and Cursor.

# V4
Objectif :

Expérience premium.

Fonctionnalités :

* variables conditionnelles
* proposition d'autocompletion des valeurs de variables dans le template avec des valeur deja tapées
* gestion des proposition d'autocompletion (activer / desactiver / supprimer un choix avec une croix)

# V5
* La bibliothèque doit montrer tous les templates avec leur nom et une description
* on doit pouvoir ajouter les templates dans un dossier en le modifiant ou par glissé déposé
* on doit pouvoir faire des sous dossiers dans les dossiers initiaux
* Ajouter 3 dossiers en exemple : ChatGPT, Suno, Midjourney avec un template exemple chacun
* Les exemple peuvent être modifiés et supprimés

# V6
* Template créator : A partir d'un prompt, l'utilisateur peut créer un template en surlignant les arguments qui seront des variables et choisissent le nom de la variable qui sera utilisé dans les templates

# V7
* Template créator 2.0 : un agent IA permet de créer un template à partir d'un prompt
* ajustement du template créator 2.0


# V7
* connection aux IA personnelles de l'utilisateur (Chatgpt, Gemini, Claude, Suno, Midjourney)
* possibiliter d'envoyer le prompt directement a l'ia dans une nouvelle fenetre de chat
* refonte du formulaire pour avoir le chat à gauche et le résultat à droite
* possibiliter de choisir l'ia a utiliser
* 