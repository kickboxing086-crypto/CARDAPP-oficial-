const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `async function syncStore(storeId: string): Promise<StoreData | undefined> {
  const localStore = stores.get(storeId);`;

const replacement = `async function syncStore(storeId: string): Promise<StoreData | undefined> {
  let localStore = stores.get(storeId);
  
  if (supabase) {
    const supabaseStore = await syncStoreFromSupabase(storeId);
    if (supabaseStore) {
      const fsTime = supabaseStore.updatedAtLocal || 0;
      const localTime = localStore?.updatedAtLocal || 0;
      if (fsTime > localTime || !localStore) {
         stores.set(storeId, supabaseStore);
         saveDataLocalOnly();
         localStore = supabaseStore;
      }
    }
  }
`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched syncStore");
