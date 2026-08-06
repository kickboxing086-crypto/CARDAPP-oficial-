import fs from 'node:fs';
import path from 'node:path';

async function resetAllData() {
  console.log('--- STARTING COMPLETE DATA RESET ---');

  // 1. Clear local disk files
  const filesToDelete = [
    'app_data.json',
    'app_transactions.json',
    'super_stores.txt',
    'deleted_stores.json',
    'firebase_err.log'
  ];

  for (const file of filesToDelete) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Local Reset] Deleted file: ${file}`);
      } catch (e) {
        console.error(`[Local Reset] Could not delete ${file}:`, e);
      }
    } else {
      console.log(`[Local Reset] File not found (clean): ${file}`);
    }
  }

  // 2. Clear Firestore Collections using runQuery
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.log('[Firestore Reset] No firebase-applet-config.json found. Local cleanup completed.');
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const { projectId, firestoreDatabaseId, apiKey } = config;
    if (!projectId || !apiKey) {
      console.log('[Firestore Reset] Missing projectId or apiKey in config.');
      return;
    }

    const dbId = firestoreDatabaseId || '(default)';
    const collections = ['stores', 'transactions', 'config'];

    for (const collectionId of collections) {
      console.log(`[Firestore Reset] Scanning collection "${collectionId}" via runQuery...`);
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents:runQuery?key=${apiKey}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId }],
          limit: 300
        }
      };
      
      try {
        const res = await fetch(queryUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryBody)
        });
        if (res.status === 200) {
          const rows = await res.json() as any[];
          let deletedCount = 0;
          if (Array.isArray(rows)) {
            for (const row of rows) {
              if (row.document && row.document.name) {
                const docName = row.document.name;
                const deleteUrl = `https://firestore.googleapis.com/v1/${docName}?key=${apiKey}`;
                const delRes = await fetch(deleteUrl, { method: 'DELETE' });
                if (delRes.ok) {
                  deletedCount++;
                  console.log(`   Deleted: ${docName.split('/').pop()}`);
                } else {
                  console.warn(`   Failed to delete: ${docName.split('/').pop()} (status ${delRes.status})`);
                }
              }
            }
          }
          console.log(`[Firestore Reset] Collection "${collectionId}": ${deletedCount} document(s) deleted.`);
        } else {
          console.log(`[Firestore Reset] Collection "${collectionId}" query returned status ${res.status}`);
        }
      } catch (collErr) {
        console.error(`[Firestore Reset] Error cleaning collection "${collectionId}":`, collErr);
      }
    }

    console.log('--- FIRESTORE RESET COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('[Firestore Reset] Fatal error:', err);
  }
}

resetAllData();
