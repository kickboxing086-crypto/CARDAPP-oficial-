const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  if (firestoreConfig) {
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;`;

const replacement = `  if (supabase) {
    try {
      const { data, error } = await supabase.from('stores').select('*');
      if (!error && data) {
        for (const item of data) {
          if (deletedStoreIds.has(item.id)) continue;
          
          const localStore = stores.get(item.id);
          const fsTime = item.updated_at_local || 0;
          const localTime = localStore?.updatedAtLocal || 0;
          
          if (fsTime > localTime || !localStore) {
             const storeObj = {
                id: item.id,
                email: item.email,
                username: item.username,
                password: item.password,
                settings: item.settings || {},
                products: item.products || [],
                orders: item.orders || [],
                createdAt: item.created_at || new Date().toISOString(),
                updatedAtLocal: item.updated_at_local || 0
             };
             stores.set(item.id, storeObj);
          }
        }
        saveDataLocalOnly();
      }
    } catch (err) {
      console.error('[Supabase] Error fetching all stores:', err);
    }
  } else if (firestoreConfig) {
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;`;

code = code.replace(targetStr, replacement);
fs.writeFileSync('server.ts', code);
console.log("Patched super/stores");
