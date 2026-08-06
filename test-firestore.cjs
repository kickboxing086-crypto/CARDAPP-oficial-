const fs = require('fs');
const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const { projectId, firestoreDatabaseId, apiKey } = config;
console.log({ projectId, firestoreDatabaseId, apiKey });

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
console.log(url);

const queryBody = {
  structuredQuery: {
    from: [{ collectionId: "stores" }],
    limit: 1
  }
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(queryBody)
}).then(res => res.text()).then(text => console.log('Response:', text)).catch(err => console.error(err));
