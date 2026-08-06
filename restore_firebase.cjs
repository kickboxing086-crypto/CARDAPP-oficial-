const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `let firestoreConfig: any = null;
const configPaths = [
  path.join(process.cwd(), 'firebase-applet-config.json'),
  path.join(__dirname, 'firebase-applet-config.json'),
  path.join(__dirname, '../firebase-applet-config.json'),
  './firebase-applet-config.json'
];

for (const configPath of configPaths) {
  if (fs.existsSync(configPath)) {
    try {
      firestoreConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(\`[Firebase REST] Loaded Firestore config from JSON file: \${configPath}\`, firestoreConfig.projectId);
      break;
    } catch (err) {
      console.error(\`[Firebase REST] Error reading config file at \${configPath}:\`, err);
    }
  }
}

// Load configuration from environment variables
if (!firestoreConfig) {
  const envProjectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const envApiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  const envDbId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;
  
  if (envProjectId && envApiKey) {
    firestoreConfig = {
      projectId: envProjectId,
      appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID,
      apiKey: envApiKey,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
      firestoreDatabaseId: envDbId || '(default)',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    };
    console.log('[Firebase REST] Configuration initialized for project:', firestoreConfig.projectId);
    if (firestoreConfig.firestoreDatabaseId !== '(default)') {
      console.log('[Firebase REST] Using Custom Database ID:', firestoreConfig.firestoreDatabaseId);
    }
  } else {
    console.warn('[Firebase REST] Missing critical environment variables (PROJECT_ID or API_KEY).');
  }
}

// Final validation for firestoreDatabaseId when projectId is from AI Studio
if (firestoreConfig && firestoreConfig.projectId?.includes('gen-lang-client') && firestoreConfig.firestoreDatabaseId === '(default)') {
  console.warn('[Firebase REST] WARNING: Using "(default)" database with an AI Studio project ID. This usually requires a specific database ID found in firebase-applet-config.json.');
}

if (!firestoreConfig) {
  console.warn('[Firebase REST] Config file not found and no environment variables present. Running with local fallback.');
}`;

code = code.replace("let firestoreConfig: any = null;", replacement);

fs.writeFileSync('server.ts', code);
console.log('Firebase config restored');
