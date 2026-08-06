import fs from 'fs';
import fetch from 'node-fetch';

async function deleteDummyStores() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const { projectId, firestoreDatabaseId, apiKey } = config;

  const storesToDelete = ['test-store-id-999', 'test-new-merchant-store'];

  for (const storeId of storesToDelete) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/stores/${storeId}?key=${apiKey}`;
    try {
      const res = await fetch(url, { method: 'DELETE' });
      console.log(`Deleted ${storeId} status:`, res.status);
    } catch (e) {
      console.error(`Failed to delete ${storeId}:`, e);
    }
  }
}

deleteDummyStores();
