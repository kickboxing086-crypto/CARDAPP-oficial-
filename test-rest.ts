import fs from 'fs';
import fetch from 'node-fetch';

async function testRest() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const { projectId, firestoreDatabaseId, apiKey } = config;

  const urlQuery = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "stores" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "settings.storeSlug" },
          op: "EQUAL",
          value: { stringValue: "volcan-doces" }
        }
      },
      limit: 1
    }
  };
  try {
    const res = await fetch(urlQuery, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });
    console.log("Query status:", res.status);
    const data = await res.json();
    console.log("Query response:", JSON.stringify(data));
  } catch (e) {
    console.error("Query failed:", e);
  }
}

testRest();
