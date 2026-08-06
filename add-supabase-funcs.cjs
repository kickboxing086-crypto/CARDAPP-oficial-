const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const supabaseFuncs = `
// --- SUPABASE SYNC FUNCTIONS ---
async function saveStoreToSupabase(storeId, data) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('stores')
      .upsert({
        id: storeId,
        email: data.email || '',
        username: data.username || '',
        password: data.password || '',
        settings: data.settings || {},
        products: data.products || [],
        orders: data.orders || [],
        updated_at_local: Date.now()
      });
    if (error) {
      console.error('[Supabase] Error saving store:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Supabase] Exception saving store:', err);
    return false;
  }
}

async function syncStoreFromSupabase(storeId) {
  if (!supabase) return undefined;
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    if (error || !data) return undefined;
    
    return {
      id: data.id,
      email: data.email,
      username: data.username,
      password: data.password,
      settings: data.settings || {},
      products: data.products || [],
      orders: data.orders || [],
      createdAt: data.created_at || new Date().toISOString(),
      updatedAtLocal: data.updated_at_local || 0
    };
  } catch (err) {
    console.error('[Supabase] Exception syncing store:', err);
    return undefined;
  }
}

async function saveTransactionToSupabase(tx) {
  if (!supabase) return;
  try {
    await supabase.from('transactions').upsert({
      id: tx.id,
      store_id: tx.storeId || tx.store_id,
      store_name: tx.storeName || tx.store_name,
      plan_type: tx.planType || tx.plan_type,
      amount: tx.amount,
      date: tx.date
    });
  } catch (err) {
    console.error('[Supabase] Error saving transaction:', err);
  }
}

async function syncTransactionsFromSupabase() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error || !data) return;
    
    const mapped = data.map(tx => ({
      id: tx.id,
      storeId: tx.store_id,
      storeName: tx.store_name,
      planType: tx.plan_type,
      amount: tx.amount,
      date: tx.date
    }));
    
    // Merge logic
    const existingIds = new Set(transactions.map(t => t.id));
    for (const tx of mapped) {
      if (!existingIds.has(tx.id) && !deletedTransactionIds.has(tx.id)) {
        transactions.push(tx);
        existingIds.add(tx.id);
      }
    }
  } catch (err) {
    console.error('[Supabase] Error syncing transactions:', err);
  }
}
`;

if (!code.includes('saveStoreToSupabase')) {
  code = code.replace('// --- PLATFORM TRANSACTIONS (REVENUE/BILLING HISTORY) ---', supabaseFuncs + '\n// --- PLATFORM TRANSACTIONS (REVENUE/BILLING HISTORY) ---');
  fs.writeFileSync('server.ts', code);
  console.log("Added Supabase sync functions");
}
