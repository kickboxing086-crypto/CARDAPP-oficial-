const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetInit = `const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;`;

const newInit = `import fetch from 'node-fetch';
import { Agent } from 'https';

const agent = new Agent({ family: 4 }); // Force IPv4
const customFetch = (url, options) => fetch(url, { ...options, agent });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  global: { fetch: customFetch }
}) : null;`;

if (code.includes(targetInit)) {
  code = code.replace(targetInit, newInit);
  fs.writeFileSync('server.ts', code);
  console.log("Patched supabase with node-fetch IPv4");
} else {
  console.log("Could not find target init for Supabase");
}
