const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `async function isStoreSlugTaken(slug: string, currentStoreId: string): Promise<boolean> {
  const norm = slug.toLowerCase().trim();
  const localTaken = Array.from(stores.values()).some(s => s.id !== currentStoreId && (s.settings?.storeSlug?.toLowerCase().trim() === norm || s.id?.toLowerCase().trim() === norm));
  if (localTaken) return true;
  
  if (!firestoreConfig) return false;`;

const replacement = `async function isStoreSlugTaken(slug: string, currentStoreId: string): Promise<boolean> {
  const norm = slug.toLowerCase().trim();
  const localTaken = Array.from(stores.values()).some(s => s.id !== currentStoreId && (s.settings?.storeSlug?.toLowerCase().trim() === norm || s.id?.toLowerCase().trim() === norm));
  if (localTaken) return true;
  
  if (supabase) {
     const { data } = await supabase.from('stores')
       .select('id')
       .or(\`id.eq.\${norm},settings->>storeSlug.eq.\${norm}\`)
       .neq('id', currentStoreId)
       .limit(1);
     if (data && data.length > 0) return true;
  }
  
  if (!firestoreConfig) return false;`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched isStoreSlugTaken");
