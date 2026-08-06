const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "async function saveStoreToFirestore(storeId: string, data: StoreData): Promise<boolean> {",
  "async function saveStoreToFirestore(storeId: string, data: StoreData): Promise<boolean> {\n  if (supabase) { await saveStoreToSupabase(storeId, data); }"
);

code = code.replace(
  "async function saveTransactionToFirestore(tx: any) {",
  "async function saveTransactionToFirestore(tx: any) {\n  if (supabase) { await saveTransactionToSupabase(tx); }"
);

code = code.replace(
  "async function syncTransactionsFromFirestore() {",
  "async function syncTransactionsFromFirestore() {\n  if (supabase) { await syncTransactionsFromSupabase(); }"
);

fs.writeFileSync('server.ts', code);
console.log("Patched save and sync functions to include Supabase");
