# PTShelf - Synchronisation Google Drive via Google Apps Script

Ce guide vous explique comment lier votre application PTShelf locale à votre propre espace de stockage Google Drive en utilisant **Google Apps Script**.

## Le Script Google Apps Script

Ce script va agir comme une base de données sans serveur. Il crée et gère un fichier nommé `ptshelf_data.json` à la racine de votre Google Drive.

```javascript
const FILE_NAME = "ptshelf_data.json";

function doGet(e) {
  try {
    const file = getOrCreateFile();
    const content = file.getBlob().getDataAsString();
    return ContentService.createTextOutput(content)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const file = getOrCreateFile();
    file.setContent(JSON.stringify(postData, null, 2));
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFile() {
  const files = DriveApp.getFilesByName(FILE_NAME);
  if (files.hasNext()) {
    return files.next();
  } else {
    const initialData = {
      projects: [],
      folders: [],
      templates: [],
      presets: []
    };
    return DriveApp.createFile(FILE_NAME, JSON.stringify(initialData, null, 2));
  }
}
```

## Étapes de déploiement

1. Allez sur [Google Apps Script](https://script.google.com/).
2. Connectez-vous avec votre compte Google et cliquez sur **Nouveau projet**.
3. Remplacez le code par défaut de l'éditeur (généralement dans le fichier `Code.gs`) par le code ci-dessus.
4. Donnez un nom à votre projet (ex. `PTShelf Sync`).
5. Cliquez sur le bouton **Déployer** (en haut à droite) -> **Nouveau déploiement**.
6. Cliquez sur l'engrenage à côté de "Sélectionner le type" et choisissez **Application Web**.
7. Remplissez les champs de configuration :
   - **Description** : `PTShelf Sync API`
   - **Exécuter en tant que** : `Moi (votre-email@gmail.com)`
   - **Qui a accès** : `Tout le monde` (indispensable pour que votre application PTShelf locale puisse communiquer avec l'API. Vos données sont protégées car l'URL du script contient un identifiant unique et confidentiel).
8. Cliquez sur **Déployer**.
9. Google vous demandera d'autoriser l'accès à votre Google Drive. Cliquez sur **Autoriser l'accès**, sélectionnez votre compte, cliquez sur **Paramètres avancés** (si un avertissement de sécurité apparaît) puis sur **Accéder à PTShelf Sync (non sécurisé)** et validez les autorisations.
10. Une fois le déploiement terminé, copiez l'**URL de l'application Web** (elle ressemble à `https://script.google.com/macros/s/XXXXX/exec`).
11. Collez cette URL dans l'onglet **Paramètres** de votre application PTShelf pour activer la synchronisation !
