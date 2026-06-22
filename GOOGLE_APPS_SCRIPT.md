# PTShelf - Synchronisation Google Drive via Google Apps Script

Ce guide vous explique comment lier votre application PTShelf locale à votre propre espace de stockage Google Drive en utilisant **Google Apps Script**.

## Le Script Google Apps Script

Ce script va agir comme une base de données sans serveur. Il crée et gère des fichiers nommés `ptshelf_<email_clean>_data.json` à la racine de votre Google Drive pour isoler les données de chaque utilisateur.

```javascript
function doGet(e) {
  try {
    const email = e.parameter.email;
    if (!email) {
      throw new Error("Missing email parameter");
    }
    const file = getOrCreateFile(email);
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
    const email = postData.email;
    const data = postData.data;
    if (!email) {
      throw new Error("Missing email in payload");
    }
    if (!data) {
      throw new Error("Missing data in payload");
    }
    const file = getOrCreateFile(email);
    file.setContent(JSON.stringify(data, null, 2));
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFile(email) {
  // Nettoyage de l'email pour créer un nom de fichier valide
  const cleanEmail = email.replace(/[^a-zA-Z0-9@._-]/g, "_");
  const fileName = "ptshelf_" + cleanEmail + "_data.json";
  
  const files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
    return files.next();
  } else {
    const initialData = {
      folders: [],
      templates: [],
      presets: [],
      autocompleteSuggestions: {}
    };
    return DriveApp.createFile(fileName, JSON.stringify(initialData, null, 2));
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
