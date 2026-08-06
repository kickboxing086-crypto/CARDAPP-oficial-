const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the initialization of firestoreConfig with just a null declaration
code = code.replace(/let firestoreConfig: any = null;[\s\S]*?\/\/ Load configuration from environment variables[\s\S]*?if \(!firestoreConfig\) \{[\s\S]*?console\.warn\('\[Firebase REST\] Config file not found and no environment variables present\. Running with local fallback\.'\);\n\}/, 'let firestoreConfig: any = null;');

fs.writeFileSync('server.ts', code);
