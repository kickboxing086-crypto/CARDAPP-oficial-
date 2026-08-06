const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('import { createClient } from "@supabase/supabase-js"')) {
  code = code.replace(
    "import { v4 as uuidv4 } from 'uuid';",
    "import { v4 as uuidv4 } from 'uuid';\nimport { createClient } from '@supabase/supabase-js';"
  );
  
  const supabaseSetup = `
// --- SUPABASE SETUP ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
if (supabase) {
  console.log('[Supabase] Client initialized successfully.');
} else {
  console.log('[Supabase] Client NOT initialized. Missing variables.');
}
`;

  code = code.replace("// Load configuration from environment variables", supabaseSetup + "\n// Load configuration from environment variables");
  
  fs.writeFileSync('server.ts', code);
  console.log("Injected Supabase import and setup into server.ts");
}
