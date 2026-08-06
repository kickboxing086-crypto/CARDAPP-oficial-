import dns from 'dns';
try {
  if (dns && typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (dnsErr) {
  console.warn('[System] Could not set DNS default result order:', dnsErr);
}
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';
import { Product, StoreSettings, Order, OrderStatus } from './src/types.js';

let _filename = '';
let _dirname = '';
try {
  if (typeof __filename !== 'undefined') {
    _filename = __filename;
  } else if (import.meta && import.meta.url) {
    _filename = fileURLToPath(import.meta.url);
  }
} catch (e) {
  _filename = '';
}

try {
  if (typeof __dirname !== 'undefined') {
    _dirname = __dirname;
  } else if (_filename) {
    _dirname = path.dirname(_filename);
  } else {
    _dirname = process.cwd();
  }
} catch (e) {
  _dirname = process.cwd();
}

const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// Validate fetch availability (Node 18+)
if (typeof fetch === 'undefined') {
  console.warn('[System] Global fetch is not available. Please ensure you are using Node.js 18 or higher.');
}

import webpush from 'web-push';

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface StoreData {
  id: string;
  email: string;
  username?: string;
  password: string;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
  createdAt?: string;
  pushSubscriptions?: PushSubscriptionData[];
  ambassadors?: any[];
  vapidKeys?: { publicKey: string, privateKey: string };
  updatedAtLocal?: number;
  lastSavedToFirestore?: number;
  lastSyncedFromFirestore?: number;
}

const DATA_FILE = path.join(process.cwd(), 'app_data.json');
const DELETED_STORES_FILE = path.join(process.cwd(), 'app_deleted_stores.json');

let stores = new Map<string, StoreData>();
let deletedStoreIds = new Set<string>();

function loadDeletedStores() {
  if (fs.existsSync(DELETED_STORES_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DELETED_STORES_FILE, 'utf-8'));
      if (Array.isArray(data)) {
        deletedStoreIds = new Set(data);
      }
    } catch (e) {
      console.error('Error loading deleted stores:', e);
    }
  }
}

function saveDeletedStores() {
  if (isProd) {
    saveDeletedStoresToFirestore().catch(e => console.error('[Firebase REST] Failed to save deleted stores to Firestore:', e));
    return;
  }
  try {
    fs.writeFileSync(DELETED_STORES_FILE, JSON.stringify(Array.from(deletedStoreIds), null, 2));
  } catch (e) {
    console.error('Error saving deleted stores:', e);
  }
}

// Read Firebase config from multiple potential paths to ensure compatibility with Vercel and different runtimes
let firestoreConfig: any = null;
const configPaths = [
  path.join(process.cwd(), 'firebase-applet-config.json'),
  path.join(_dirname, 'firebase-applet-config.json'),
  path.join(_dirname, '../firebase-applet-config.json'),
  './firebase-applet-config.json'
];

for (const configPath of configPaths) {
  if (fs.existsSync(configPath)) {
    try {
      firestoreConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log(`[Firebase REST] Loaded Firestore config from JSON file: ${configPath}`, firestoreConfig.projectId);
      break;
    } catch (err) {
      console.error(`[Firebase REST] Error reading config file at ${configPath}:`, err);
    }
  }
}


// --- SUPABASE SETUP ---


const getAbortSignalWithTimeout = (ms: number): any => {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    try {
      return AbortSignal.timeout(ms);
    } catch (e) {}
  }
  try {
    const controller = new AbortController();
    setTimeout(() => {
      try {
        controller.abort();
      } catch (e) {}
    }, ms);
    return controller.signal;
  } catch (err) {
    return null;
  }
};

// Use native Node 18 fetch with safe timeout
const customFetch = (url: string, options: any = {}) => {
  const signal = options.signal || getAbortSignalWithTimeout(4500);
  const fetchOpts: any = { ...options };
  if (signal) {
    fetchOpts.signal = signal;
  }
  return globalThis.fetch(url, fetchOpts);
};


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
}


// REST Helper function: Convert JS object to Firestore Proto fields representation
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && k !== '') {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

function toFirestoreValue(val: any): any {
  try {
    if (val === null || val === undefined) {
      return { nullValue: null };
    }
    if (typeof val === 'string') {
      return { stringValue: val };
    }
    if (typeof val === 'number') {
      if (isNaN(val) || !isFinite(val)) {
        return { nullValue: null };
      }
      return { doubleValue: val };
    }
    if (typeof val === 'boolean') {
      return { booleanValue: val };
    }
    if (Array.isArray(val)) {
      return {
        arrayValue: {
          values: val.map(toFirestoreValue)
        }
      };
    }
    if (typeof val === 'object') {
      // If it's a plain object or something we can iterate
      return {
        mapValue: {
          fields: toFirestoreFields(val)
        }
      };
    }
    return { stringValue: String(val) };
  } catch (e) {
    console.error('[Firebase REST] Serialization error in toFirestoreValue:', e);
    return { stringValue: '[Serialization Error]' };
  }
}

// REST Helper function: Convert Firestore Proto fields representation to standard JS object
function fromFirestoreFields(fields: Record<string, any>): Record<string, any> {
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields || {})) {
    res[k] = fromFirestoreValue(v);
  }
  return res;
}

function fromFirestoreValue(val: any): any {
  if (!val) return null;
  if ('nullValue' in val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('integerValue' in val) return Number(val.integerValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(fromFirestoreValue);
  }
  if ('mapValue' in val) {
    return fromFirestoreFields(val.mapValue.fields || {});
  }
  return null;
}

async function saveDeletedStoresToFirestore() {
  if (!firestoreConfig) return;
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/config/deleted_stores?key=${apiKey}`;
  try {
    const list = Array.from(deletedStoreIds);
    const fields = toFirestoreFields({ ids: list });
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    console.log('[Firebase REST] Successfully saved deleted stores to Firestore config.');
  } catch (e) {
    console.error('[Firebase REST] Error saving deleted stores config:', e);
  }
}

async function loadDeletedStoresFromFirestore() {
  if (!firestoreConfig) return;
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/config/deleted_stores?key=${apiKey}`;
  try {
    const res = await fetch(url);
    if (res.status === 200) {
      const data = await res.json() as any;
      if (data.fields) {
        const parsed = fromFirestoreFields(data.fields) as { ids?: string[] };
        if (parsed && Array.isArray(parsed.ids)) {
          parsed.ids.forEach(id => deletedStoreIds.add(id));
          console.log('[Firebase REST] Loaded deleted store IDs from Firestore:', deletedStoreIds.size);
        }
      }
    }
  } catch (e) {
    console.error('[Firebase REST] Error loading deleted stores config:', e);
  }
}

function loadData() {
  loadDeletedStores();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      stores = new Map<string, StoreData>(parsed);
      for (const delId of deletedStoreIds) {
        stores.delete(delId);
      }
      return;
    } catch (e) {
      console.error('Error loading data locally:', e);
    }
  }
  
  // Default store if no file exists
  stores.set('barraca-do-samuel', {
    id: 'barraca-do-samuel',
    email: 'elitestreambr1@gmail.com',
    password: '86113980',
    settings: {
      storeName: 'Barraca do Samuel',
      logo: '/logo.png',
      primaryColor: '#fbbf24',
      whatsappNumber: '5584986113980',
      storeSlug: 'barraca-do-samuel'
    },
    products: [],
    orders: []
  });
  saveDataLocalOnly();
}

function saveDataLocalOnly() {
  if (isProd) return; // Skip disk writes in restricted environments (Vercel)
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(stores.entries()), null, 2));
  } catch (e) {
    console.error('Error saving data locally:', e);
  }
}


// --- PLATFORM TRANSACTIONS (REVENUE/BILLING HISTORY) ---
let transactions: Array<any> = [];
let deletedTransactionIds = new Set<string>();
const TX_FILE = path.join(process.cwd(), 'app_transactions.json');

function saveTransactionsLocal() {
  if (isProd) return; // Skip disk writes in restricted environments (Vercel)
  try {
    fs.writeFileSync(TX_FILE, JSON.stringify(transactions, null, 2));
  } catch (e) {
    console.error('Error saving transactions locally:', e);
  }
}

function loadTransactionsLocal() {
  if (fs.existsSync(TX_FILE)) {
    try {
      transactions = JSON.parse(fs.readFileSync(TX_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error loading transactions locally:', e);
    }
  } else {
    const now = new Date();
    
    // Create dates for past months and current month
    const d1 = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 2), 10, 0, 0).toISOString();
    const d2 = new Date(now.getFullYear(), now.getMonth() - 1, 15, 14, 30, 0).toISOString();
    const d3 = new Date(now.getFullYear(), now.getMonth() - 1, 20, 9, 15, 0).toISOString();
    const d4 = new Date(now.getFullYear(), now.getMonth() - 2, 10, 16, 45, 0).toISOString();
    const d5 = new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 1), 11, 20, 0).toISOString();
    const d6 = new Date(now.getFullYear(), now.getMonth() - 1, 28, 18, 10, 0).toISOString();
    const d7 = now.toISOString();

    transactions = [
      { id: 'tx-1-seed', storeId: 'barraca-do-samuel', storeName: 'Barraca do Samuel', planType: 'monthly', amount: 24.90, date: d1 },
      { id: 'tx-2-seed', storeId: 'barraca-do-samuel', storeName: 'Barraca do Samuel', planType: 'monthly', amount: 24.90, date: d2 },
      { id: 'tx-3-seed', storeId: 'pizza-italia', storeName: 'Pizzaria Bella Italia', planType: 'quarterly', amount: 59.90, date: d3 },
      { id: 'tx-4-seed', storeId: 'crisp-burger', storeName: 'Burguer Crisp', planType: 'annual', amount: 199.90, date: d4 },
      { id: 'tx-5-seed', storeId: 'villa-acai', storeName: 'Açaí da Villa', planType: 'monthly', amount: 24.90, date: d5 },
      { id: 'tx-6-seed', storeId: 'king-pastel', storeName: 'Pastelaria King', planType: 'semiannual', amount: 109.90, date: d6 },
      { id: 'tx-7-seed', storeId: 'sushi-prime', storeName: 'Sushi Prime', planType: 'monthly', amount: 24.90, date: d7 }
    ];
    saveTransactionsLocal();
  }
}

async function syncTransactionsFromFirestore() {
  if (!firestoreConfig) return;
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "transactions" }]
    }
  };
  try {
    const res = await globalThis.fetch(url, {
      signal: getAbortSignalWithTimeout(4000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });
    if (res.status === 200) {
      const resData = await res.json() as any[];
      console.log('[Firebase REST] Sync transactions response:', JSON.stringify(resData).substring(0, 500));
      if (Array.isArray(resData)) {
        const fetchedTxList = [];
        for (const item of resData) {
          if (item.document && item.document.fields) {
            const txObj = fromFirestoreFields(item.document.fields);
            if (!deletedTransactionIds.has(txObj.id)) {
              fetchedTxList.push(txObj);
            }
          }
        }
        transactions = fetchedTxList;
        saveTransactionsLocal();
      } else {
        console.warn('[Firebase REST] Sync transactions response is not an array:', resData);
      }
    } else {
        console.error('[Firebase REST] Sync transactions failed with status:', res.status);
    }
  } catch (e) {
    console.error('[Firebase REST] Error syncing transactions:', e);
  }
}

async function saveTransactionToFirestore(tx: any) {
  saveTransactionsLocal();
  if (!firestoreConfig) return;
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/transactions/${tx.id}?key=${apiKey}`;
  try {
    const fields = toFirestoreFields(tx);
    await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
  } catch (e) {
    console.error('[Firebase REST] Error saving tx to Firestore:', e);
  }
}

async function deleteTransactionFromFirestore(txId: string) {
  if (!firestoreConfig) return;
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/transactions/${txId}?key=${apiKey}`;
  try {
    await fetch(url, { method: 'DELETE' });
  } catch (e) {
    console.error('[Firebase REST] Error deleting tx from Firestore:', e);
  }
}

// Synchronizes a single store from Firestore to local memory Map
async function syncStore(storeId: string): Promise<StoreData | undefined> {
  let localStore = stores.get(storeId);
  
  const now = Date.now();

  // Smart Sync & Race-Condition Protection:
  // If we recently synced or saved to Firestore (within 5 seconds), return the memory state.
  // This prevents 2-second polls from fetching and overwriting with stale Firestore states.
  if (localStore) {
    const lastSync = localStore.lastSyncedFromFirestore || 0;
    const lastSave = localStore.lastSavedToFirestore || 0;
    if (now - lastSync < 5000 || now - lastSave < 5000) {
      return localStore;
    }
  }

  // Define default values for master-ceo
  const getDefaultMaster = (): StoreData => ({
    id: 'master-ceo',
    email: 'samuellsilvva02@gmail.com',
    password: '86113980',
    settings: {
      storeName: 'CEO MASTER PANEL',
      primaryColor: '#fbbf24', // Amber/Gold
      storeSlug: 'master',
      storeTagline: 'Controle Global do Ecossistema Cardapp',
      whatsappNumber: '5584986113980',
      businessType: 'outros'
    },
    products: [],
    orders: [],
    createdAt: new Date().toISOString()
  });

  if (!firestoreConfig) {
    if (storeId === 'master-ceo' && !localStore) {
      const defaultMaster = getDefaultMaster();
      stores.set(storeId, defaultMaster);
      saveDataLocalOnly();
      return defaultMaster;
    }
    return localStore;
  }
  
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/stores/${storeId}?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    if (res.status === 200) {
      const data = await res.json() as any;
      if (data.fields) {
        const storeObj = fromFirestoreFields(data.fields) as StoreData;
        
        // Smart Sync Protection: If local store has unsaved local changes (localTime > lastSavedTime),
        // do not overwrite with old data from Firestore.
        if (localStore) {
          const localTime = localStore.updatedAtLocal || 0;
          const lastSavedTime = localStore.lastSavedToFirestore || 0;
          if (localTime > lastSavedTime) {
            console.log(`[Firebase REST] Protecting local changes for ${storeId} (Local: ${localTime}, lastSaved: ${lastSavedTime})`);
            return localStore;
          }
        }
        
        storeObj.lastSyncedFromFirestore = Date.now();
        stores.set(storeId, storeObj);
        saveDataLocalOnly();
        return storeObj;
      }
    } else if (res.status === 404) {
      if (storeId === 'master-ceo') {
        const defaultMaster = getDefaultMaster();
        stores.set(storeId, defaultMaster);
        saveDataLocalOnly();
        await saveStoreToFirestore(storeId, defaultMaster);
        return defaultMaster;
      }
      if (stores.has(storeId)) {
        console.log(`[Firebase REST] Store ${storeId} not found in Firestore (404). Removing from local memory.`);
        stores.delete(storeId);
        saveDataLocalOnly();
      }
      return undefined;
    }
  } catch (e) {
    console.error(`[Firebase REST] Error syncing store ${storeId}:`, e);
    if (storeId === 'master-ceo' && !localStore) {
      const defaultMaster = getDefaultMaster();
      stores.set(storeId, defaultMaster);
      saveDataLocalOnly();
      return defaultMaster;
    }
  }
  return localStore;
}

// Query store by email, syncing all matching stores from Firestore to find the correct one
async function queryStoreByEmail(email: string): Promise<StoreData | undefined> {
  const normEmail = (email || '').toLowerCase().trim();
  if (!normEmail) return undefined;

  // We always query Firestore to ensure we have all matching stores synced
  if (firestoreConfig) {
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "stores" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "email" },
            op: "EQUAL",
            value: { stringValue: normEmail }
          }
        }
      }
    };

    try {
      const res = await globalThis.fetch(url, {
      signal: getAbortSignalWithTimeout(4000),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });
      if (res.status === 200) {
        const resData = await res.json() as any;
        if (Array.isArray(resData)) {
          for (const item of resData) {
            if (item.document && item.document.fields) {
              const docName = item.document.name || '';
              const extractedId = docName.split('/').pop() || '';
              const storeObj = fromFirestoreFields(item.document.fields) as StoreData;
              if (extractedId) {
                storeObj.id = extractedId;
              }
              // Only overwrite local memory if we don't have newer unsaved local changes
              const localStore = stores.get(storeObj.id);
              if (localStore) {
                const localTime = localStore.updatedAtLocal || 0;
                const lastSavedTime = localStore.lastSavedToFirestore || 0;
                if (localTime > lastSavedTime) {
                  continue;
                }
              }
              stores.set(storeObj.id, storeObj);
            }
          }
          saveDataLocalOnly();
        }
      } else {
        console.warn(`[Firebase REST] Query email ${normEmail} status: ${res.status}`);
      }
    } catch (e) {
      console.error(`[Firebase REST] Error querying store by email ${normEmail}:`, e);
    }
  }

  // Search locally (which now includes any newly synced stores)
  const localStores = Array.from(stores.values()).filter(s => s.email?.toLowerCase().trim() === normEmail);
  if (localStores.length > 0) {
    // Prefer non-seed store if multiple stores match
    return localStores.find(s => s.id !== 'barraca-do-samuel') || localStores[0];
  }

  return undefined;
}

// Query store by username
async function queryStoreByUsername(username: string): Promise<StoreData | undefined> {
  const normUser = (username || '').toLowerCase().trim();
  if (!normUser) return undefined;

  if (firestoreConfig) {
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "stores" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "username" },
            op: "EQUAL",
            value: { stringValue: normUser }
          }
        }
      }
    };

    try {
      const res = await globalThis.fetch(url, {
      signal: getAbortSignalWithTimeout(4000),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });
      if (res.status === 200) {
        const resData = await res.json() as any;
        if (Array.isArray(resData)) {
          for (const item of resData) {
            if (item.document && item.document.fields) {
              const docName = item.document.name || '';
              const extractedId = docName.split('/').pop() || '';
              const storeObj = fromFirestoreFields(item.document.fields) as StoreData;
              if (extractedId) {
                storeObj.id = extractedId;
              }
              const localStore = stores.get(storeObj.id);
              if (localStore) {
                const localTime = localStore.updatedAtLocal || 0;
                const lastSavedTime = localStore.lastSavedToFirestore || 0;
                if (localTime > lastSavedTime) {
                  continue;
                }
              }
              stores.set(storeObj.id, storeObj);
            }
          }
          saveDataLocalOnly();
        }
      } else {
        console.warn(`[Firebase REST] Query username ${normUser} status: ${res.status}`);
      }
    } catch (e) {
      console.error(`[Firebase REST] Error querying store by username ${normUser}:`, e);
    }
  }

  const localStores = Array.from(stores.values()).filter(s => s.username?.toLowerCase().trim() === normUser);
  if (localStores.length > 0) {
    return localStores.find(s => s.id !== 'barraca-do-samuel') || localStores[0];
  }

  return undefined;
}

// Check if slug is taken by another store in Firestore
async function isStoreSlugTaken(slug: string, currentStoreId: string): Promise<boolean> {
  const norm = slug.toLowerCase().trim();
  const localTaken = Array.from(stores.values()).some(s => s.id !== currentStoreId && (s.settings?.storeSlug?.toLowerCase().trim() === norm || s.id?.toLowerCase().trim() === norm));
  if (localTaken) return true;
  
  if (!firestoreConfig) return false;
  
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "stores" }],
      where: {
        fieldFilter: {
          field: { fieldPath: "settings.storeSlug" },
          op: "EQUAL",
          value: { stringValue: norm }
        }
      },
      limit: 1
    }
  };
  
  try {
    const res = await globalThis.fetch(url, {
      signal: getAbortSignalWithTimeout(4000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });
    
    if (res.status === 200) {
      let resData;
      try {
        resData = await res.json() as any;
      } catch (jsonErr) {
        console.error('[Firebase REST] Failed to parse JSON from Firestore:', jsonErr);
        return false;
      }

      if (Array.isArray(resData)) {
        for (const item of resData) {
          if (item.document && item.document.fields) {
            const storeObj = fromFirestoreFields(item.document.fields) as StoreData;
            if (storeObj.id !== currentStoreId) {
              return true;
            }
          }
        }
      }
    } else {
      try {
        const errText = await res.text();
        console.warn(`[Firebase REST] Query slug status: ${res.status}, body: ${errText}`);
      } catch (e) {}
    }
  } catch (e) {
    console.error(`[Firebase REST] Error checking slug taken for ${norm}:`, e);
  }
  return false;
}

// Saves a store document to Firestore
async function saveStoreToFirestore(storeId: string, data: StoreData): Promise<boolean> {
  data.updatedAtLocal = Date.now();
  data.lastSavedToFirestore = Date.now();
  stores.set(storeId, data);
  saveDataLocalOnly();
  if (!firestoreConfig) return true;
  
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const cleanStoreId = encodeURIComponent(storeId.trim());
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/stores/${cleanStoreId}?key=${apiKey}`;
  
  try {
    // Sanitizes any undefined fields to prevent Firestore write errors
    const cleanData = JSON.parse(JSON.stringify(data));
    const fields = toFirestoreFields(cleanData);
    
    const res = await globalThis.fetch(url, {
      signal: getAbortSignalWithTimeout(4000),
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields })
    });
    
    if (res.status === 200) {
      console.log(`[Firebase REST] Saved store ${storeId} to Firestore.`);
      data.lastSavedToFirestore = Date.now();
      stores.set(storeId, data);
      saveDataLocalOnly();
      return true;
    } else {
      const err = await res.json() as any;
      try {
        fs.appendFileSync('firebase_err.log', JSON.stringify(err) + '\n');
      } catch (fileErr) {
        console.error('[Firebase REST] Could not write to firebase_err.log:', fileErr);
      }
      console.error(`[Firebase REST] Failed to save store ${storeId} to Firestore (Status: ${res.status}):`, JSON.stringify(err));
      return false;
    }
  } catch (e) {
    console.error(`[Firebase REST] Error saving store ${storeId}:`, e);
    return false;
  }
}

// Looks up a store by slug or by ID, syncing from Firestore if available
async function syncStoreBySlugOrId(slugOrId: string): Promise<StoreData | undefined> {
  const norm = slugOrId.toLowerCase().trim();
  
  if (!firestoreConfig) {
    return Array.from(stores.values()).find(s => s.settings?.storeSlug?.toLowerCase().trim() === norm || s.id?.toLowerCase().trim() === norm);
  }
  
  try {
    // 1. Try fetching by ID directly
    const directStore = await syncStore(norm);
    if (directStore) return directStore;
    
    // 2. Try querying by settings.storeSlug
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "stores" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "settings.storeSlug" },
            op: "EQUAL",
            value: { stringValue: norm }
          }
        },
        limit: 1
      }
    };
    
    const res = await globalThis.fetch(url, {
      signal: getAbortSignalWithTimeout(4000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });
    
    if (res.status === 200) {
      const resData = await res.json() as any;
      if (Array.isArray(resData)) {
        for (const item of resData) {
          if (item.document && item.document.fields) {
            const docName = item.document.name || '';
            const extractedId = docName.split('/').pop() || '';
            const storeObj = fromFirestoreFields(item.document.fields) as StoreData;
            if (extractedId) {
              storeObj.id = extractedId;
            }
            
            // Smart Sync Protection: If local store has unsaved local changes (localTime > lastSavedTime),
            // do not overwrite with old data from Firestore.
            const localStore = stores.get(storeObj.id);
            if (localStore) {
              const localTime = localStore.updatedAtLocal || 0;
              const lastSavedTime = localStore.lastSavedToFirestore || 0;
              const lastSyncTime = localStore.lastSyncedFromFirestore || 0;
              const now = Date.now();
              
              // Protect if local changes are pending, or if we just synced/saved recently
              if (localTime > lastSavedTime || (now - lastSyncTime < 5000) || (now - lastSavedTime < 5000)) {
                console.log(`[Firebase REST] Protecting local changes for ${storeObj.id} via slug query`);
                return localStore;
              }
            }
            
            storeObj.lastSyncedFromFirestore = Date.now();
            stores.set(storeObj.id, storeObj);
            saveDataLocalOnly();
            return storeObj;
          }
        }
      }
    }
  } catch (e) {
    console.error(`[Firebase REST] Error fetching store ${norm} by slug/id:`, e);
  }
  
  return Array.from(stores.values()).find(s => s.settings?.storeSlug?.toLowerCase().trim() === norm || s.id?.toLowerCase().trim() === norm);
}

loadData();
if (firestoreConfig) {
  loadDeletedStoresFromFirestore().catch(e => {
    console.error('[Firebase REST] Error loading deleted stores config on startup:', e);
  });
}

// Fetch all stores from Firestore at startup to populate memory
async function initialFirestoreSync() {
  if (!firestoreConfig || !firestoreConfig.projectId || !firestoreConfig.apiKey) {
    console.log('[Firebase REST] Initial memory sync skipped: Missing config.');
    return;
  }
  console.log('[Firebase REST] Initializing memory from Firestore...');
  const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
  const queryBody = {
    structuredQuery: {
      from: [{ collectionId: "stores" }]
    }
  };
  try {
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(queryBody)
    });
    if (fetchRes.status === 200) {
      const resData = await fetchRes.json() as any[];
      if (Array.isArray(resData)) {
        for (const item of resData) {
          if (item.document && item.document.fields) {
            const docName = item.document.name || '';
            const extractedId = docName.split('/').pop() || '';
            const storeObj = fromFirestoreFields(item.document.fields) as StoreData;
            if (extractedId) {
              storeObj.id = extractedId;
            }
            storeObj.lastSyncedFromFirestore = Date.now();
            stores.set(storeObj.id, storeObj);
          }
        }
        console.log(`[Firebase REST] Initialized ${stores.size} stores from Firestore.`);
      }
    }
  } catch (e) {
    console.error('[Firebase REST] Initial sync failed:', e);
  }
}

if (!process.env.VERCEL) {
  initialFirestoreSync();
} else {
  console.log('[Firebase REST] skipping full memory sync on Vercel initialization.');
}

// Background bidirectional sync of stores on startup
async function syncAllLocalStoresToFirestore() {
  if (!firestoreConfig || !firestoreConfig.projectId || !firestoreConfig.apiKey) return;
  console.log('[Firebase REST] Starting background sync of local stores with Firestore...');
  for (const [storeId, storeData] of stores.entries()) {
    if (deletedStoreIds.has(storeId)) {
      console.log(`[Firebase REST] Skipping startup sync for deleted store ${storeId}.`);
      continue;
    }
    try {
      const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/stores/${storeId}?key=${apiKey}`;
      const res = await fetch(url);
      if (res.status === 404) {
        console.log(`[Firebase REST] Local store ${storeId} not found in Firestore. Uploading...`);
        await saveStoreToFirestore(storeId, storeData);
      } else if (res.status === 200) {
        const data = await res.json() as any;
        if (data.fields) {
          const fsStore = fromFirestoreFields(data.fields) as StoreData;
          const localTime = storeData.updatedAtLocal || 0;
          const fsTime = fsStore.updatedAtLocal || 0;
          
          if (localTime > fsTime) {
            console.log(`[Firebase REST] Local store ${storeId} is newer than Firestore. Updating Firestore...`);
            await saveStoreToFirestore(storeId, storeData);
          } else if (fsTime > localTime) {
            // Safety Guard: If local has products but Firestore has none, preserve local products
            if (storeData.products && storeData.products.length > 0 && (!fsStore.products || fsStore.products.length === 0)) {
              console.log(`[Firebase REST] Safety: Local store ${storeId} has products but Firestore has none. Preserving local products.`);
              fsStore.products = storeData.products;
            }
            // Safety Guard: If local has categories but Firestore has none, preserve local categories
            if (storeData.settings?.categories && storeData.settings.categories.length > 0 && (!fsStore.settings?.categories || fsStore.settings.categories.length === 0)) {
              console.log(`[Firebase REST] Safety: Local store ${storeId} has categories but Firestore has none. Preserving local categories.`);
              if (!fsStore.settings) fsStore.settings = { ...storeData.settings };
              fsStore.settings.categories = storeData.settings.categories;
            }
            console.log(`[Firebase REST] Firestore store ${storeId} is newer than Local. Updating Local...`);
            stores.set(storeId, fsStore);
            saveDataLocalOnly();
          }
        }
      }
    } catch (e) {
      console.error(`[Firebase REST] Error syncing store ${storeId} on startup:`, e);
    }
  }
  console.log('[Firebase REST] Background sync of local stores completed.');
}

if (!process.env.VERCEL) {
  setTimeout(() => {
    syncAllLocalStoresToFirestore().catch(err => {
      console.error('[Firebase REST] Error in syncAllLocalStoresToFirestore:', err);
    });
  }, 3000);
}

// Helper to generate 8-char protocol
function generateProtocol(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  // Generate first 5 chars randomly (mix of letters and numbers)
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Generate last 3 chars as letters (for security/verification code)
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Anti-cache middleware for all API routes to guarantee live real-time data
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Global Error Handler for Vercel stability
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Global Server Error]', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err?.message || 'Erro inesperado no servidor',
    path: req.path
  });
});

// Middleware for basic logging on Vercel
app.use((req, res, next) => {
  if (isProd) {
    console.log(`[API Request] ${req.method} ${req.path}`);
  }
  next();
});

// --- CUSTOMER ROUTES ---

app.get('/api/stores/:slugOrId', async (req, res) => {
  try {
    const param = req.params.slugOrId?.toLowerCase().trim();
    if (!param) return res.status(400).json({ error: 'ID da loja é obrigatório' });
    
    const store = await syncStoreBySlugOrId(param);
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });
    
    // Return safe public store data
    res.json({
      id: store.id,
      success: true,
      settings: {
        storeName: store.settings?.storeName || store.id,
        storeSlug: store.settings?.storeSlug || store.id,
        logo: store.settings?.logo || '/logo.png',
        description: store.settings?.description || '',
        planType: store.settings?.planType || '7 Dias Grátis',
        isOpen: store.settings?.isOpen !== false
      }
    });
  } catch (err) {
    console.error('[API Store Route Error]', err);
    res.status(500).json({ error: 'Erro ao buscar dados da loja' });
  }
});

app.get('/api/stores/:slugOrId/settings', async (req, res) => {
  const param = req.params.slugOrId?.toLowerCase().trim();
  const store = await syncStoreBySlugOrId(param);
  if (!store) return res.status(404).json({ error: `Loja não encontrada. (${param})` });
  res.json({ ...store.settings, createdAt: store.createdAt || new Date().toISOString() });
});

app.get('/api/stores/:slugOrId/logo', async (req, res) => {
  const param = req.params.slugOrId?.toLowerCase().trim();
  const store = await syncStoreBySlugOrId(param);
  if (!store || !store.settings?.logo) {
    return res.redirect('/logo.png');
  }

  const logoStr = store.settings.logo;
  if (logoStr.startsWith('data:image/') || logoStr.includes(';base64,')) {
    const parts = logoStr.split(';base64,');
    if (parts.length === 2) {
      const contentType = parts[0].replace('data:', '');
      const base64Data = parts[1];
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
      return res.end(buffer);
    }
  }

  if (logoStr.startsWith('http://') || logoStr.startsWith('https://')) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.redirect(logoStr);
  }

  return res.redirect('/logo.png');
});

app.get('/api/stores/:slugOrId/products', async (req, res) => {
  const param = req.params.slugOrId?.toLowerCase().trim();
  const store = await syncStoreBySlugOrId(param);
  if (!store) return res.status(404).json({ error: `Loja não encontrada. (${param})` });
  res.json(store.products);
});

app.get('/api/stores/:slugOrId/booked-slots', async (req, res) => {
  const param = req.params.slugOrId?.toLowerCase().trim();
  const date = req.query.date as string; // YYYY-MM-DD
  const store = await syncStoreBySlugOrId(param);
  if (!store) return res.status(404).json({ error: `Loja não encontrada. (${param})` });
  
  if (!date) return res.json([]);

  const manuallyBlocked = (store.settings?.manualBlockedSlots && store.settings.manualBlockedSlots[date]) || [];
  
  const bookedSlotsByOrders = store.settings?.blockTakenSlots ? (store.orders || [])
    .filter(o => o.scheduledDate === date && o.scheduledTime && o.status !== 'completed' && o.status !== 'canceled')
    .map(o => o.scheduledTime as string) : [];
    
  res.json([...new Set([...bookedSlotsByOrders, ...manuallyBlocked])]);
});

app.post('/api/stores/:slugOrId/orders', async (req, res) => {
  try {
    const param = req.params.slugOrId?.toLowerCase().trim();
    const store = await syncStoreBySlugOrId(param);
    if (!store) return res.status(404).json({ error: `Loja não encontrada. (${param})` });
    
    const { customerName, customerPhone, deliveryMethod, paymentMethod, changeFor, observation, address, deliveryFee, deliveryZone, items, totalPrice, scheduledDate, scheduledTime } = req.body;

    if (!store.orders) store.orders = [];

    // Check if slot is already taken for scheduled orders
    if (scheduledTime && scheduledDate) {
      const isTakenByOrder = store.settings?.blockTakenSlots && store.orders.some(o => 
        o.scheduledTime === scheduledTime && 
        o.scheduledDate === scheduledDate &&
        o.status !== 'completed' && o.status !== 'canceled'
      );
      const isManuallyBlocked = store.settings?.manualBlockedSlots && store.settings.manualBlockedSlots[scheduledDate]?.includes(scheduledTime);
      
      if (isTakenByOrder || isManuallyBlocked) {
        return res.status(400).json({ error: 'Desculpe, este horário já foi preenchido. Por favor, escolha outro horário.' });
      }
    }

    // Create Order
    const newOrder: Order = {
      id: uuidv4(),
      protocol: generateProtocol(),
      customerName,
      customerPhone: customerPhone || 'Não informado',
      deliveryMethod,
      paymentMethod: paymentMethod || 'pix',
      changeFor: paymentMethod === 'cash' && changeFor ? Number(changeFor) : undefined,
      observation,
      address,
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : undefined,
      deliveryZone,
      items,
      totalPrice: Number(totalPrice),
      status: 'pending',
      createdAt: new Date().toISOString(),
      scheduledDate,
      scheduledTime
    };

    // Auto reduce stock immediately when order is reserved
    newOrder.stockReduced = true;
    if (store.products) {
      for (const item of items) {
        const product = store.products.find(p => p.id === item.productId);
        if (product && product.stockCount !== undefined) {
          product.stockCount = Math.max(0, product.stockCount - item.quantity);
        }
      }
    }
    
    if (!store.orders) store.orders = [];
    store.orders.push(newOrder);
    await saveStoreToFirestore(store.id, store);

    // Send push notifications
    if (store.vapidKeys && store.pushSubscriptions && store.pushSubscriptions.length > 0) {
      try {
        const pushOptions = {
          vapidDetails: {
            subject: 'mailto:admin@cardapp.com',
            publicKey: store.vapidKeys.publicKey,
            privateKey: store.vapidKeys.privateKey
          },
          TTL: 86400, // 24 hours
          headers: {
            'Urgency': 'high'
          }
        };

        // Avoid sending huge base64 files as icon in Web Push payload as it exceeds the 4KB limit and drops notifications
        let pushIcon = '/logo.png';
        if (store.settings?.logo && !store.settings.logo.startsWith('data:')) {
          pushIcon = store.settings.logo;
        } else if (store.settings?.storeSlug) {
          pushIcon = `/api/stores/${store.settings.storeSlug}/logo`;
        }

        const payload = JSON.stringify({
          title: '📦 Novo Pedido Recebido!',
          body: `Pedido #${newOrder.protocol || newOrder.id.substring(0, 5)} - R$ ${Number(newOrder.totalPrice).toFixed(2)}\nCliente: ${newOrder.customerName}`,
          icon: pushIcon,
          url: `/admin`
        });

        console.log(`[Push Notification] Sending to ${store.pushSubscriptions.length} subscriptions for store ${store.id}`);

        store.pushSubscriptions.forEach((subscription: any) => {
          webpush.sendNotification(subscription, payload, pushOptions).catch((error: any) => {
            console.error('[Push Notification] Error sending:', error.statusCode || error);
            if (error.statusCode === 410 || error.statusCode === 404) {
               console.log('[Push Notification] Removing invalid subscription');
               store.pushSubscriptions = store.pushSubscriptions?.filter((s: any) => s.endpoint !== subscription.endpoint);
               saveStoreToFirestore(store.id, store).catch(() => {});
            }
          });
        });
      } catch (pushErr) {
        console.error('Error in push notification setup:', pushErr);
      }
    } else {
      console.log(`[Push Notification] Skiping. Vapid: ${!!store.vapidKeys}, Subs: ${store.pushSubscriptions?.length || 0}`);
    }

    res.json(newOrder);
  
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Erro ao criar pedido.' });
  }
});

app.post('/api/stores/:slugOrId/orders/:orderId/confirm-stock', async (req, res) => {
  const param = req.params.slugOrId?.toLowerCase().trim();
  const store = await syncStoreBySlugOrId(param);
  if (!store) return res.status(404).json({ error: `Loja não encontrada.` });
  
  const orderId = req.params.orderId;
  const order = store.orders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ error: `Pedido não encontrado.` });

  // Only reduce stock if it hasn't been reduced yet for this order (prevent double reduction if double clicked)
  if (order.stockReduced) {
    return res.json({ success: true, message: 'Estoque já reduzido.' });
  }

  // Stock Reduction logic moved here
  for (const item of order.items) {
    const product = store.products.find(p => p.id === item.productId);
    if (product && product.stockCount !== undefined) {
      // Reduce stock, but cap at 0
      product.stockCount = Math.max(0, product.stockCount - item.quantity);
    }
  }

  // Mark order as stock reduced
  order.stockReduced = true;
  
  await saveStoreToFirestore(store.id, store);
  res.json({ success: true });
});

app.get('/api/stores/:slugOrId/orders/:orderId', async (req, res) => {
  const param = req.params.slugOrId?.toLowerCase().trim();
  const store = await syncStoreBySlugOrId(param);
  if (!store) return res.status(404).json({ error: `Loja não encontrada.` });
  
  const order = store.orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ error: `Pedido não encontrado.` });
  
  res.json(order);
});

// --- ADMIN AUTH ROUTES ---

app.post('/api/login', async (req, res) => {
  const { email, username, password, storeId } = req.body;
  const identity = (email || username || '').toLowerCase().trim();
  
  // Super Admin Check (both user mail and default main store owner)
  const isSuperIdentity = identity === 'samuellsilvva02@gmail.com' || identity === 'samuelsilva';
  
  // Sync matching stores to populate local cache safely
  try {
    await queryStoreByEmail(identity);
  } catch (err) {
    console.error('[API Login] queryStoreByEmail error:', err);
  }
  try {
    await queryStoreByUsername(identity);
  } catch (err) {
    console.error('[API Login] queryStoreByUsername error:', err);
  }
  try {
    await syncStoreBySlugOrId(identity);
  } catch (err) {
    console.error('[API Login] syncStoreBySlugOrId error:', err);
  }
  console.log(`[API Login] Identity: "${identity}", stores in map: ${stores.size}`);

  // Find all matching stores by email/username/ID with correct password
  const allMatchingStores = Array.from(stores.values()).filter(s => 
    (s.email?.toLowerCase().trim() === identity || 
     s.username?.toLowerCase().trim() === identity || 
     s.id?.toLowerCase().trim() === identity) &&
    (s.password || '').trim() === (password || '').trim()
  );
  console.log(`[API Login] allMatchingStores count: ${allMatchingStores.length}`);

  const isSuperAdminPassword = password === 'admin123' || password === '86113980' || password === '861139';
  const isValidSuperPassword = isSuperIdentity && isSuperAdminPassword;
  
  // Ensure a Master store exists for Super Admins
  if (isValidSuperPassword) {
    const masterStoreId = 'master-ceo';
    if (!stores.has(masterStoreId)) {
      stores.set(masterStoreId, {
        id: masterStoreId,
        email: identity,
        password: password,
        settings: {
          storeName: 'CEO MASTER PANEL',
          primaryColor: '#fbbf24', // Amber/Gold
          storeSlug: 'master',
          storeTagline: 'Controle Global do Ecossistema Cardapp',
          whatsappNumber: '5584986113980',
          businessType: 'outros'
        },
        products: [],
        orders: [],
        createdAt: new Date().toISOString()
      });
      saveDataLocalOnly();
    }
  }

  // Removed file debug log

  if (isValidSuperPassword) {
    let finalStoreId = 'master-ceo';
    return res.json({ 
      success: true, 
      token: 'super-admin-token', 
      storeId: finalStoreId,
      isSuperAdmin: true,
      ceoProfile: {
        name: 'SAMUEL SILVA',
        role: 'CEO MASTER',
        accessLevel: 'GLOBAL_OVERRIDE'
      },
      debugStoresInMap: stores.size
    });
  }

  if (allMatchingStores.length === 0) {
    return res.status(401).json({ error: 'Credenciais inválidas', debugStoresInMap: stores.size });
  }

  // If a specific store ID is selected, or if there is only 1 matching store
  if (storeId) {
    const selectedStore = allMatchingStores.find(s => s.id === storeId);
    if (selectedStore) {
      return res.json({ success: true, token: selectedStore.id, storeId: selectedStore.id });
    }
  }

  if (allMatchingStores.length === 1) {
    const singleStore = allMatchingStores[0];
    return res.json({ success: true, token: singleStore.id, storeId: singleStore.id });
  }

  // Multiple matching stores! Return list for selector
  const storesList = allMatchingStores.map(s => ({
    id: s.id,
    name: s.settings?.storeName || s.id,
    slug: s.settings?.storeSlug || s.id,
    logo: s.settings?.logo || '/logo.png'
  }));

  return res.json({
    success: true,
    multiple: true,
    stores: storesList
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, storeName, phone, plan } = req.body || {};
    
    if (!email || !username || !password || !storeName || !phone) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios para a criação da loja.' });
    }

    const normEmail = email.toLowerCase().trim();
    const normUsername = username.toLowerCase().trim();

    // 1. Check if email or username is already taken in memory
    const localUserTaken = Array.from(stores.values()).some(s => 
      (s.email?.toLowerCase().trim() === normEmail) || 
      (s.username?.toLowerCase().trim() === normUsername) ||
      (s.id?.toLowerCase().trim() === normUsername)
    );

    if (localUserTaken) {
      return res.status(400).json({ error: 'Este e-mail ou nome de usuário já está cadastrado por outra loja.' });
    }

    // 2. Query Firestore/Supabase to be 100% sure we don't have duplicates
    try {
      const emailMatch = await queryStoreByEmail(normEmail);
      if (emailMatch) {
        return res.status(400).json({ error: 'Este e-mail já está em uso por outra loja.' });
      }
      const userMatch = await queryStoreByUsername(normUsername);
      if (userMatch) {
        return res.status(400).json({ error: 'Este nome de usuário já está em uso por outra loja.' });
      }
    } catch (checkErr) {
      console.warn('[API Register] Pre-registration duplicate check warning:', checkErr);
    }

    // 3. Generate a clean unique store slug/ID from the store name
    const baseSlug = storeName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'loja-' + Math.random().toString(36).substring(2, 7);

    let finalId = baseSlug;
    try {
      const isTaken = await isStoreSlugTaken(baseSlug, '');
      if (isTaken) {
        finalId = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    } catch (slugErr) {
      finalId = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    console.log(`[API Register] Creating store: ID=${finalId}, Name=${storeName}, Email=${normEmail}`);

    // 4. Formulate the clean StoreData
    const newStore: StoreData = {
      id: finalId,
      email: normEmail,
      username: normUsername,
      password: password.trim(),
      settings: {
        storeName: storeName.trim(),
        logo: '/logo.png',
        storeNameFirst: storeName.trim().split(' ')[0],
        storeNameFirstColor: '#1e293b',
        primaryColor: '#fbbf24', // Default warm amber/gold
        whatsappNumber: phone.replace(/\D/g, ''), // Digits only
        storeSlug: finalId,
        businessType: 'outros',
        categories: ['Geral'],
        locationAddress: '',
        isOpen: true,
        fontFamily: 'inter',
        planType: plan || 'free',
        planStartDate: new Date().toISOString()
      },
      products: [],
      orders: [],
      createdAt: new Date().toISOString()
    };

    // 5. Store in local Map cache and write file
    stores.set(finalId, newStore);
    saveDataLocalOnly();

    // 6. Push document to Firestore/Supabase
    try {
      await saveStoreToFirestore(finalId, newStore);
      console.log(`[API Register] Sync for ${finalId} successful.`);
    } catch (syncErr) {
      console.error('[API Register] Firestore save failed (non-blocking):', syncErr);
    }

    // 7. Auto-login by returning credentials
    return res.json({
      success: true,
      message: 'Loja cadastrada com sucesso!',
      token: finalId,
      storeId: finalId
    });

  } catch (err: any) {
    console.error('[API Register] Register error:', err);
    return res.status(500).json({ error: 'Erro interno ao realizar cadastro. Tente novamente mais tarde.' });
  }
});
// --- ADMIN MIDDLEWARE ---
const adminAuth = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autorizado' });
  
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Não autorizado' });
  
  let storeId = token;
  if (token === 'super-admin-token') {
    storeId = 'master-ceo';
    if (!stores.has(storeId)) {
      stores.set(storeId, {
        id: storeId,
        email: 'samuellsilvva02@gmail.com',
        password: '86113980',
        settings: {
          storeName: 'CEO MASTER PANEL',
          primaryColor: '#fbbf24', // Amber/Gold
          storeSlug: 'master',
          storeTagline: 'Controle Global do Ecossistema Cardapp',
          whatsappNumber: '5584986113980',
          businessType: 'outros'
        },
        products: [],
        orders: [],
        createdAt: new Date().toISOString()
      });
      saveDataLocalOnly();
    }
  }
  
  const store = await syncStore(storeId);
  if (!store) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  req.storeId = storeId;
  req.storeData = store;
  next();
};

// --- ADMIN API ROUTES ---

app.get('/api/admin/push/vapid-key', adminAuth, async (req: any, res: any) => {
  const store = req.storeData;
  if (!store.vapidKeys) {
    store.vapidKeys = webpush.generateVAPIDKeys();
    await saveStoreToFirestore(req.storeId, store);
  }
  res.json({ publicKey: store.vapidKeys.publicKey });
});

app.post('/api/admin/push/subscribe', adminAuth, async (req: any, res: any) => {
  const store = req.storeData;
  const subscription = req.body;

  if (!store.pushSubscriptions) {
    store.pushSubscriptions = [];
  }
  
  // Check if already subscribed
  const exists = store.pushSubscriptions.find((sub: any) => sub.endpoint === subscription.endpoint);
  if (!exists) {
    store.pushSubscriptions.push(subscription);
    await saveStoreToFirestore(req.storeId, store);
  }

  res.status(201).json({});
});

app.post('/api/admin/push/unsubscribe', adminAuth, async (req: any, res: any) => {
  const store = req.storeData;
  const { endpoint } = req.body;
  if (store.pushSubscriptions) {
    store.pushSubscriptions = store.pushSubscriptions.filter((sub: any) => sub.endpoint !== endpoint);
    await saveStoreToFirestore(req.storeId, store);
  }
  res.status(200).json({});
});

app.get('/api/admin/settings', adminAuth, (req: any, res: any) => {
  res.json(req.storeData.settings);
});

app.put('/api/admin/settings', adminAuth, async (req: any, res: any) => {
  const { 
    storeName, 
    primaryColor, 
    whatsappNumber, 
    storeSlug, 
    openingHours, 
    logo,
    storeNameFirst,
    storeNameFirstColor,
    businessType,
    categories,
    locationAddress,
    isOpen,
    fontFamily,
    openingTime,
    closingTime,
    is24Hours,
    ceoName,
    description,
    storeTagline,
    acceptedPaymentMethods,
    deliveryTime,
    printMode,
    seoTitle,
    seoDescription,
    seoKeywords
  } = req.body;
  
  if (storeSlug !== undefined) {
    // Check if slug is taken by another store
    const isTaken = await isStoreSlugTaken(storeSlug, req.storeId);
    if (isTaken) {
      return res.status(400).json({ error: 'Este link já está em uso' });
    }
    req.storeData.settings.storeSlug = storeSlug;
  }
  
  if (storeName !== undefined) req.storeData.settings.storeName = storeName;
  if (primaryColor !== undefined) req.storeData.settings.primaryColor = primaryColor;
  if (whatsappNumber !== undefined) req.storeData.settings.whatsappNumber = whatsappNumber;
  if (openingHours !== undefined) req.storeData.settings.openingHours = openingHours;
  if (logo !== undefined) req.storeData.settings.logo = logo;
  if (storeNameFirst !== undefined) req.storeData.settings.storeNameFirst = storeNameFirst;
  if (storeNameFirstColor !== undefined) req.storeData.settings.storeNameFirstColor = storeNameFirstColor;
  if (businessType !== undefined) req.storeData.settings.businessType = businessType;
  if (categories !== undefined) req.storeData.settings.categories = categories;
  if (locationAddress !== undefined) req.storeData.settings.locationAddress = locationAddress;
  if (isOpen !== undefined) req.storeData.settings.isOpen = isOpen;
  if (fontFamily !== undefined) req.storeData.settings.fontFamily = fontFamily;
  if (req.body.customerFontSize !== undefined) req.storeData.settings.customerFontSize = req.body.customerFontSize;
  if (req.body.headerFontSize !== undefined) req.storeData.settings.headerFontSize = req.body.headerFontSize;
  if (req.body.deliveryFees !== undefined) req.storeData.settings.deliveryFees = req.body.deliveryFees;
  if (openingTime !== undefined) req.storeData.settings.openingTime = openingTime;
  if (closingTime !== undefined) req.storeData.settings.closingTime = closingTime;
  if (is24Hours !== undefined) req.storeData.settings.is24Hours = is24Hours;
  if (req.body.blockOutsideDelivery !== undefined) req.storeData.settings.blockOutsideDelivery = req.body.blockOutsideDelivery;
  if (req.body.storeType !== undefined) req.storeData.settings.storeType = req.body.storeType;
  if (req.body.weeklySchedules !== undefined) req.storeData.settings.weeklySchedules = req.body.weeklySchedules;
  if (req.body.coverImage !== undefined) req.storeData.settings.coverImage = req.body.coverImage;
  if (req.body.minimumOrderValue !== undefined) req.storeData.settings.minimumOrderValue = Number(req.body.minimumOrderValue);
  if (req.body.productOrder !== undefined) req.storeData.settings.productOrder = req.body.productOrder;
  if (req.body.instagramUrl !== undefined) req.storeData.settings.instagramUrl = req.body.instagramUrl;
  if (req.body.facebookUrl !== undefined) req.storeData.settings.facebookUrl = req.body.facebookUrl;
  if (req.body.websiteUrl !== undefined) req.storeData.settings.websiteUrl = req.body.websiteUrl;
  if (req.body.allowScheduling !== undefined) req.storeData.settings.allowScheduling = req.body.allowScheduling;
  if (req.body.schedulingDate !== undefined) req.storeData.settings.schedulingDate = req.body.schedulingDate;
  if (req.body.blockTakenSlots !== undefined) req.storeData.settings.blockTakenSlots = req.body.blockTakenSlots;
  if (req.body.customTimeSlots !== undefined) req.storeData.settings.customTimeSlots = req.body.customTimeSlots;
  if (req.body.manualBlockedSlots !== undefined) req.storeData.settings.manualBlockedSlots = req.body.manualBlockedSlots;
  
  if (ceoName !== undefined) req.storeData.settings.ceoName = ceoName;
  if (description !== undefined) req.storeData.settings.description = description;
  if (storeTagline !== undefined) req.storeData.settings.storeTagline = storeTagline;
  if (acceptedPaymentMethods !== undefined) req.storeData.settings.acceptedPaymentMethods = acceptedPaymentMethods;
  if (deliveryTime !== undefined) req.storeData.settings.deliveryTime = deliveryTime;
  if (printMode !== undefined) req.storeData.settings.printMode = printMode;
  
  if (seoTitle !== undefined) req.storeData.settings.seoTitle = seoTitle;
  if (seoDescription !== undefined) req.storeData.settings.seoDescription = seoDescription;
  if (seoKeywords !== undefined) req.storeData.settings.seoKeywords = seoKeywords;
  
  const saved = await saveStoreToFirestore(req.storeId, req.storeData);
  if (!saved) {
    console.warn(`[API] Store settings saved locally for ${req.storeId}, but Firestore sync returned false.`);
  }
  res.json(req.storeData.settings);
});

const parseStockValue = (val: any) => {
  if (val === undefined || val === null || val === '' || isNaN(Number(val))) return undefined;
  return Number(val);
};

app.get('/api/admin/products', adminAuth, (req: any, res: any) => {
  if (!req.storeData.products) req.storeData.products = [];
  res.json(req.storeData.products);
});

app.post('/api/admin/products', adminAuth, async (req: any, res: any) => {
  if (!req.storeData.products) req.storeData.products = [];
  const { name, description, price, unit, image, promotion, category, addons, flavors, unavailableFlavors, isAvailable, stockCount, stockUnit, promoQuantity, promoPrice, promoGroup } = req.body;
  const newProduct: Product = {
    id: req.body.id || uuidv4(),
    name: name || 'Novo Produto',
    description: description || '',
    price: Number(price) || 0,
    unit: unit || 'UN',
    image,
    promotion: Boolean(promotion),
    category: category || 'Geral',
    addons: addons || [],
    flavors: flavors || [],
    unavailableFlavors: unavailableFlavors || [],
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    stockCount: parseStockValue(stockCount),
    stockUnit: stockUnit,
    promoQuantity: parseStockValue(promoQuantity),
    promoPrice: parseStockValue(promoPrice),
    promoGroup: promoGroup
  };
  req.storeData.products.push(newProduct);
  const saved = await saveStoreToFirestore(req.storeId, req.storeData);
  if (!saved) {
    console.warn(`[API] Product created locally for ${req.storeId}, but Firestore sync returned false.`);
  }
  res.json(newProduct);
});

app.put('/api/admin/products/:id', adminAuth, async (req: any, res: any) => {
  if (!req.storeData.products) req.storeData.products = [];
  const targetId = String(req.params.id || '').trim();
  let product = req.storeData.products.find((p: Product) => String(p.id).trim() === targetId);
  
  if (!product) {
    // If product is not found in store's array, upsert/create it if valid payload provided
    if (req.body && (req.body.name || req.body.price !== undefined)) {
      product = {
        id: targetId || uuidv4(),
        name: req.body.name || 'Produto sem nome',
        description: req.body.description || '',
        price: Number(req.body.price) || 0,
        unit: req.body.unit || 'UN',
        category: req.body.category || 'Geral',
        promotion: Boolean(req.body.promotion),
        isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
        addons: req.body.addons || [],
        flavors: req.body.flavors || []
      };
      req.storeData.products.push(product);
    } else {
      return res.status(404).json({ error: 'Produto não encontrado no catálogo.' });
    }
  }
  
  const { name, description, price, unit, image, promotion, category, addons, flavors, unavailableFlavors, isAvailable, stockCount, stockUnit, promoQuantity, promoPrice, promoGroup } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (unit !== undefined) product.unit = unit;
  if (image !== undefined) product.image = image;
  if (promotion !== undefined) product.promotion = Boolean(promotion);
  if (category !== undefined) product.category = category;
  if (addons !== undefined) product.addons = addons;
  if (flavors !== undefined) product.flavors = flavors;
  if (unavailableFlavors !== undefined) product.unavailableFlavors = unavailableFlavors;
  if (isAvailable !== undefined) product.isAvailable = Boolean(isAvailable);
  
  if (stockCount !== undefined) {
    product.stockCount = parseStockValue(stockCount);
  }
  if (stockUnit !== undefined) product.stockUnit = stockUnit;
  if (promoQuantity !== undefined) product.promoQuantity = parseStockValue(promoQuantity);
  if (promoPrice !== undefined) product.promoPrice = parseStockValue(promoPrice);
  if (promoGroup !== undefined) product.promoGroup = promoGroup;
  
  const saved = await saveStoreToFirestore(req.storeId, req.storeData);
  if (!saved) {
    console.warn(`[API] Product updated locally for ${req.storeId}, but Firestore sync returned false.`);
  }
  res.json(product);
});

app.delete('/api/admin/products/:id', adminAuth, async (req: any, res: any) => {
  try {
    req.storeData.products = (req.storeData.products || []).filter((p: Product) => p.id !== req.params.id);
    saveDataLocalOnly();
    const syncSuccess = await saveStoreToFirestore(req.storeId, req.storeData);
    if (!syncSuccess) {
      console.warn(`[Firebase REST] Delete store sync failed for store ${req.storeId}`);
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Erro interno ao excluir produto.' });
  }
});

app.get('/api/admin/orders', adminAuth, (req: any, res: any) => {
  let ordersToReturn = req.storeData.orders || [];
  if (req.storeId === 'master-ceo') {
    const allSuperOrders: Order[] = [];
    for (const [sId, sData] of stores.entries()) {
      if (Array.isArray(sData.orders)) {
        allSuperOrders.push(...sData.orders);
      }
    }
    ordersToReturn = allSuperOrders;
  }
  const sortedOrders = [...ordersToReturn].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sortedOrders);
});

app.post('/api/admin/orders/manual', adminAuth, async (req: any, res: any) => {
  const { description, totalPrice, productId, quantity } = req.body;
  
  const items = [];
  let finalDescription = description || 'Venda registrada manualmente';
  
  if (productId && quantity) {
    const product = req.storeData.products.find((p: Product) => p.id === productId);
    if (product) {
      items.push({
        productId,
        quantity: Number(quantity)
      });
      if (!description) {
        finalDescription = `Venda direta no caixa: ${quantity}x ${product.name}`;
      }
      // Reduce Stock
      if (product.stockCount !== undefined) {
        const oldStock = Number(product.stockCount || 0);
        product.stockCount = Math.max(0, oldStock - Number(quantity));
        console.log(`[Manual Sale] Reduced stock for ${product.name} from ${oldStock} to ${product.stockCount}`);
      }
    }
  }

  const newOrder: Order = {
    id: uuidv4(),
    protocol: generateProtocol(),
    customerName: 'Venda Caixa/Balcão',
    customerPhone: 'N/A',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
    items: items,
    totalPrice: Number(totalPrice) || 0,
    status: 'completed',
    createdAt: new Date().toISOString(),
    observation: finalDescription,
    stockReduced: true,
    scheduledDate: req.body.scheduledDate,
    scheduledTime: req.body.scheduledTime
  };
  req.storeData.orders.push(newOrder);
  await saveStoreToFirestore(req.storeId, req.storeData);
  res.json(newOrder);
});

app.put('/api/admin/orders/:id/status', adminAuth, async (req: any, res: any) => {
  let targetStoreData = req.storeData;
  let targetStoreId = req.storeId;
  let order = targetStoreData.orders?.find((o: Order) => o.id === req.params.id);

  if (!order && req.storeId === 'master-ceo') {
    for (const [sId, sData] of stores.entries()) {
      const foundOrder = sData.orders?.find((o: Order) => o.id === req.params.id);
      if (foundOrder) {
        targetStoreId = sId;
        targetStoreData = sData;
        order = foundOrder;
        break;
      }
    }
  }

  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  const { status } = req.body;
  if (['pending', 'preparing', 'delivery', 'pickup', 'completed', 'canceled'].includes(status)) {
    // If transitioning to canceled: restore stock if it was previously reduced
    if (status === 'canceled' && order.stockReduced) {
      for (const item of order.items) {
        const product = targetStoreData.products.find((p: Product) => p.id === item.productId);
        if (product && product.stockCount !== undefined) {
          const oldStock = Number(product.stockCount || 0);
          product.stockCount = oldStock + Number(item.quantity);
        }
      }
      order.stockReduced = false;
    }

    order.status = status as OrderStatus;
    
    // Auto-reduce stock if it wasn't reduced yet and status progresses to active stages
    if (!order.stockReduced && ['preparing', 'delivery', 'pickup', 'completed'].includes(status)) {
      for (const item of order.items) {
        const product = targetStoreData.products.find((p: Product) => p.id === item.productId);
        if (product && product.stockCount !== undefined) {
          const oldStock = Number(product.stockCount || 0);
          product.stockCount = Math.max(0, oldStock - Number(item.quantity));
        }
      }
      order.stockReduced = true;
    }
    
    await saveStoreToFirestore(targetStoreId, targetStoreData);
    res.json(order);
  } else {
    res.status(400).json({ error: 'Invalid status' });
  }
});

app.put('/api/admin/orders/:id', adminAuth, async (req: any, res: any) => {
  let targetStoreData = req.storeData;
  let targetStoreId = req.storeId;
  let orderIndex = targetStoreData.orders?.findIndex((o: Order) => o.id === req.params.id);

  if ((orderIndex === -1 || orderIndex === undefined) && req.storeId === 'master-ceo') {
    for (const [sId, sData] of stores.entries()) {
      const idx = sData.orders?.findIndex((o: Order) => o.id === req.params.id);
      if (idx !== undefined && idx !== -1) {
        targetStoreId = sId;
        targetStoreData = sData;
        orderIndex = idx;
        break;
      }
    }
  }

  if (orderIndex === -1 || orderIndex === undefined) return res.status(404).json({ error: 'Order not found' });
  
  const updatedOrder = req.body;
  // Deep merge or replace fields. Here we just update what's relevant for the admin edit modal
  if (updatedOrder.totalPrice !== undefined) targetStoreData.orders[orderIndex].totalPrice = Number(updatedOrder.totalPrice);
  if (updatedOrder.items !== undefined) targetStoreData.orders[orderIndex].items = updatedOrder.items;
  
  await saveStoreToFirestore(targetStoreId, targetStoreData);
  res.json(targetStoreData.orders[orderIndex]);
});

app.delete('/api/admin/orders/:id', adminAuth, async (req: any, res: any) => {
  let targetStoreData = req.storeData;
  let targetStoreId = req.storeId;
  let orderIndex = targetStoreData.orders?.findIndex((o: Order) => o.id === req.params.id);

  if ((orderIndex === -1 || orderIndex === undefined) && req.storeId === 'master-ceo') {
    for (const [sId, sData] of stores.entries()) {
      const idx = sData.orders?.findIndex((o: Order) => o.id === req.params.id);
      if (idx !== undefined && idx !== -1) {
        targetStoreId = sId;
        targetStoreData = sData;
        orderIndex = idx;
        break;
      }
    }
  }

  if (orderIndex === -1 || orderIndex === undefined) return res.status(404).json({ error: 'Pedido não encontrado' });
  
  targetStoreData.orders.splice(orderIndex, 1);
  await saveStoreToFirestore(targetStoreId, targetStoreData);
  res.json({ success: true });
});


// --- SUPER ADMIN MIDDLEWARE ---
const superAuth = (req: any, res: any, next: any) => {
  console.log('[API] Checking superAuth');
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('[API] No authorization header');
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== 'super-admin-token') {
    console.log('[API] Invalid token:', token);
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

// --- SUPER ADMIN ENDPOINTS ---

// List all stores
app.get('/api/super/stores', superAuth, async (req: any, res: any) => {
  console.log('[API] Received GET /api/super/stores');
  
  // Ensure the master store is synced/created in memory and Firestore
  try {
    await syncStore('master-ceo');
  } catch (syncErr) {
    console.error('[API] Failed to sync master-ceo store:', syncErr);
  }

  if (firestoreConfig) {
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery?key=${apiKey}`;
    const queryBody = {
      structuredQuery: {
        from: [{ collectionId: "stores" }]
      }
    };
    try {
      const fetchRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryBody)
      });
      if (fetchRes.status === 200) {
        const resData = await fetchRes.json() as any[];
        if (Array.isArray(resData)) {
          for (const item of resData) {
            if (item.document && item.document.fields) {
              const docName = item.document.name || '';
              const extractedId = docName.split('/').pop() || '';
              const storeObj = fromFirestoreFields(item.document.fields) as StoreData;
              if (extractedId) {
                storeObj.id = extractedId;
              }
              if (deletedStoreIds.has(storeObj.id)) {
                continue;
              }
              const localStore = stores.get(storeObj.id);
              if (localStore) {
                const localTime = localStore.updatedAtLocal || 0;
                const fsTime = storeObj.updatedAtLocal || 0;
                if (localTime > fsTime) {
                  continue;
                }
              }
              stores.set(storeObj.id, storeObj);
            }
          }
          saveDataLocalOnly();
        }
      }
    } catch (e) {
      console.error('[Firebase REST] Error fetching all stores for Super Admin:', e);
    }
  }

  for (const delId of deletedStoreIds) {
    stores.delete(delId);
  }
  
  const allStores = Array.from(stores.values())
    .filter(s => !deletedStoreIds.has(s.id))
    .map(s => ({
      id: s.id,
      email: s.email,
      username: s.username,
      password: s.password,
      settings: s.settings || {},
      orders: s.orders || [],
      products: s.products || [],
      createdAt: s.createdAt || new Date().toISOString()
    }));
  res.json(allStores);
});

app.get('/api/super/status', superAuth, (req, res) => {
  const safeConfig = firestoreConfig ? {
    projectId: firestoreConfig.projectId,
    databaseId: firestoreConfig.firestoreDatabaseId,
    hasApiKey: !!firestoreConfig.apiKey,
    hasAppId: !!firestoreConfig.appId
  } : null;

  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    firestore: !!firestoreConfig,
    firestoreConfig: safeConfig,
    isVercel: !!process.env.VERCEL,
    nodeVersion: process.version
  });
});

// Create a new client/merchant store from general administrator panel
app.post('/api/super/stores', superAuth, async (req: any, res: any) => {
  console.log('[API] POST /api/super/stores - Start');
  try {
    const body = req.body || {};
    const { email, username, password, storeName, planType, referredBy } = body;
    console.log('[API] Payload details:', { 
      email: !!email, 
      username: !!username, 
      hasPassword: !!password, 
      storeName, 
      planType 
    });
    
    if ((!email && !username) || !password || !storeName) {
      console.warn('[API] Missing required fields for store creation');
      return res.status(400).json({ error: 'E-mail ou Usuário, senha e nome da loja são obrigatórios' });
    }

    const cleanStoreName = String(storeName).trim();
    const baseSlug = cleanStoreName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'loja-' + Math.random().toString(36).substring(2, 7);
      
    console.log('[API] Generating store:', { baseSlug, username, planType });
    
    // Ensure slug uniqueness
    let finalId = baseSlug;
    try {
      const isTaken = await isStoreSlugTaken(baseSlug, '');
      if (isTaken) {
        finalId = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    } catch (slugErr) {
      console.warn('[API] Slug check failed, using suffix as precaution');
      finalId = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }
    
    console.log('[API] Final Store ID:', finalId);
    
    console.log('[API] Processing store creation for:', { finalId, planType });
    
    const newStore: StoreData = {
      id: finalId,
      email: email ? String(email).toLowerCase().trim() : '',
      username: username ? String(username).toLowerCase().trim() : '',
      password: String(password),
      settings: {
        storeName: cleanStoreName,
        logo: '/logo.png',
        storeNameFirst: cleanStoreName.split(' ')[0],
        storeNameFirstColor: '#1e293b',
        primaryColor: '#fbbf24',
        whatsappNumber: '',
        storeSlug: finalId,
        businessType: 'outros',
        categories: ['Geral'],
        locationAddress: '',
        isOpen: true,
        fontFamily: 'inter',
        planType: planType || 'free',
        planStartDate: new Date().toISOString(),
        referredBy: referredBy ? String(referredBy).trim() : ''
      },
      products: [],
      orders: [],
      createdAt: new Date().toISOString()
    };
    
    console.log('[API] New store object prepared. Syncing...');
    
    // Local memory update
    stores.set(finalId, newStore);
    saveDataLocalOnly();
    
    // Sync to Firestore synchronously before returning, to prevent serverless suspension issues
    try {
      const syncSuccess = await saveStoreToFirestore(finalId, newStore);
      console.log(`[API] Sync for ${finalId} result: ${syncSuccess}`);
    } catch (syncErr) {
      console.error('[API] Sync store to Firestore failed:', syncErr);
    }

    // Automatically record billing transaction if starting on a paid plan
    if (planType && planType !== 'free') {
      try {
        console.log('[API] Recording initial transaction for:', planType);
        let amount = 24.90;
        if (planType === 'quarterly') amount = 59.90;
        else if (planType === 'semiannual') amount = 109.90;
        else if (planType === 'annual') amount = 199.90;

        const txId = 'tx-' + uuidv4().substring(0, 8);
        const initialTx = {
          id: txId,
          storeId: finalId,
          storeName: cleanStoreName,
          planType: planType,
          amount: amount,
          date: new Date().toISOString()
        };
        transactions.push(initialTx);
        saveTransactionToFirestore(initialTx).catch(err => console.error('[API] Async tx sync failed:', err));
      } catch (txErr) {
        console.error('[API] Error during transaction recording (non-fatal):', txErr);
      }
    }

    console.log('[API] Success: Store created:', finalId);
    return res.status(200).json({ success: true, storeId: finalId, storeSlug: finalId });
  
  } catch (err: any) {
    console.error('Error in setup:', err);
    res.status(500).json({ error: err.message || 'Erro no setup.' });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Global Error]', err);
  res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
});

// Delete a store
app.delete('/api/super/stores/:id', superAuth, async (req: any, res: any) => {
  const storeId = req.params.id;
  if (storeId === 'master-ceo') {
    return res.status(400).json({ error: 'A conta Master não pode ser excluída!' });
  }
  
  stores.delete(storeId);
  deletedStoreIds.add(storeId);
  saveDeletedStores();
  saveDataLocalOnly();
  
  if (firestoreConfig) {
    const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/stores/${encodeURIComponent(storeId)}?key=${apiKey}`;
    try {
      await fetch(url, { method: 'DELETE' });
    } catch (e) {
      console.error(`[Firebase REST] Error deleting store document ${storeId}:`, e);
    }
  }
  
  res.json({ success: true });
});

// Wipe and reset all data (Firestore and Local)
app.post('/api/super/reset-all-data', superAuth, async (req: any, res: any) => {
  console.log('[API] CEO triggered COMPLETE DATA RESET...');
  try {
    // 1. Keep only master-ceo in memory
    const masterStore = stores.get('master-ceo');
    stores.clear();
    if (masterStore) {
      stores.set('master-ceo', masterStore);
    }
    transactions.length = 0;
    deletedStoreIds.clear();
    
    // 2. Delete local files
    const filesToDelete = ['app_data.json', 'app_transactions.json', 'super_stores.txt', 'deleted_stores.json'];
    for (const file of filesToDelete) {
      const fp = path.join(process.cwd(), file);
      if (fs.existsSync(fp)) {
        try { fs.unlinkSync(fp); } catch (e) {}
      }
    }
    saveDataLocalOnly();

    // 3. Clear Firestore collections
    if (firestoreConfig) {
      const { projectId, firestoreDatabaseId, apiKey } = firestoreConfig;
      const dbId = firestoreDatabaseId || '(default)';
      const collections = ['stores', 'transactions', 'config'];

      for (const col of collections) {
        const queryUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents:runQuery?key=${apiKey}`;
        const body = { structuredQuery: { from: [{ collectionId: col }], limit: 300 } };
        try {
          const r = await fetch(queryUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (r.status === 200) {
            const rows = await r.json() as any[];
            if (Array.isArray(rows)) {
              for (const row of rows) {
                if (row.document?.name) {
                  const docId = row.document.name.split('/').pop();
                  if (col === 'stores' && docId === 'master-ceo') continue;
                  await fetch(`https://firestore.googleapis.com/v1/${row.document.name}?key=${apiKey}`, { method: 'DELETE' });
                }
              }
            }
          }
        } catch (err) {
          console.error(`[Reset] Error cleaning Firestore collection ${col}:`, err);
        }
      }
    }

    console.log('[API] Complete reset successful.');
    res.json({ success: true, message: 'Todos os dados foram zerados com sucesso.' });
  } catch (err: any) {
    console.error('[API] Reset error:', err);
    res.status(500).json({ error: 'Erro ao resetar os dados.', details: err.message });
  }
});

// Edit store plan or credentials or settings
app.put('/api/super/stores/:id', superAuth, async (req: any, res: any) => {
  const storeId = req.params.id;
  let store = stores.get(storeId) || await syncStore(storeId);
  if (!store) {
    if (storeId === 'master-ceo' || storeId === 'barraca-do-samuel') {
      store = {
        id: storeId,
        email: 'samuellsilvva02@gmail.com',
        password: '86113980',
        settings: { storeName: 'Master CEO', primaryColor: '#f59e0b', logo: '' },
        products: [],
        orders: [],
        createdAt: new Date().toISOString()
      };
      stores.set(storeId, store);
    } else {
      return res.status(404).json({ error: 'Loja não encontrada.' });
    }
  }
  
  const { planType, password, storeName, settings, email, username } = req.body;
  if (!store.settings) store.settings = {} as any;
  
  if (settings !== undefined) {
    store.settings = { ...store.settings, ...settings };
  }
  if (email !== undefined) store.email = email ? String(email).toLowerCase().trim() : '';
  if (username !== undefined) store.username = username ? String(username).toLowerCase().trim() : '';
  if (password !== undefined && password.trim() !== '') {
    store.password = password.trim();
  }
  if (storeName !== undefined && storeName.trim() !== '') {
    store.settings.storeName = storeName;
  }
  if (planType !== undefined) {
    store.settings.planType = planType;
    store.settings.planStartDate = new Date().toISOString();

    if (planType !== 'free') {
      let amount = 24.90;
      if (planType === 'quarterly') amount = 59.90;
      else if (planType === 'semiannual') amount = 109.90;
      else if (planType === 'annual') amount = 199.90;

      const renewalTx = {
        id: 'tx-' + uuidv4().substring(0, 8),
        storeId: storeId,
        storeName: store.settings.storeName || 'Loja ' + storeId,
        planType: planType,
        amount: amount,
        date: new Date().toISOString()
      };
      transactions.push(renewalTx);
      await saveTransactionToFirestore(renewalTx);
    }
  }
  
  stores.set(storeId, store);
  saveDataLocalOnly();
  await saveStoreToFirestore(storeId, store);
  res.json({ success: true, store });
});

// List billing transactions
app.get('/api/super/transactions', superAuth, async (req: any, res: any) => {
  await syncTransactionsFromFirestore();
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json(sorted);
});

// Add a manual billing transaction
app.post('/api/super/transactions', superAuth, async (req: any, res: any) => {
  const { storeId, storeName, planType, amount, date } = req.body;
  if (!amount || !storeName) {
    return res.status(400).json({ error: 'Nome da loja e valor são obrigatórios.' });
  }
  const newTx = {
    id: 'tx-' + uuidv4().substring(0, 8),
    storeId: storeId || 'manual',
    storeName,
    planType: planType || 'custom',
    amount: Number(amount),
    date: date || new Date().toISOString()
  };
  transactions.push(newTx);
  await saveTransactionToFirestore(newTx);
  res.json({ success: true, transaction: newTx });
});

// Delete a billing transaction
app.delete('/api/super/transactions/:id', superAuth, async (req: any, res: any) => {
  const txId = req.params.id;
  transactions = transactions.filter(t => t.id !== txId);
  deletedTransactionIds.add(txId);
  saveTransactionsLocal();
  await deleteTransactionFromFirestore(txId);
  res.json({ success: true });
});


// --- VITE AND ENVIRONMENT SETUP ---
function getStoreIdFromHost(host: string | undefined): string | null {
  if (!host) return null;
  const h = host.toLowerCase().trim();
  if (h.startsWith('localhost') || h.startsWith('127.0.0.1')) {
    return null;
  }
  if (
    h.includes('run.app') || 
    h.includes('aistudio.google') || 
    h.includes('webcontainer') || 
    h.includes('stackblitz') ||
    h === 'cardappio-foodblue.vercel.app' ||
    h === 'foodblue.vercel.app' ||
    h === 'cardapp-officiall.vercel.app'
  ) {
    return null;
  }
  const parts = h.split(':')[0].split('.');
  const EXCLUDED = ['www', 'api', 'admin', 'app', 'dev', 'preview', 'hortifrutiexpres', 'cardapp', 'cardappio-foodblue', 'foodblue', 'cardapp-officiall'];

  if (h.includes('.vercel.app')) {
    if (parts.length > 2) {
      const sub = parts[0];
      if (!EXCLUDED.includes(sub)) {
        return sub;
      }
    }
  } else if (parts.length >= 3) {
    const sub = parts[0];
    if (!EXCLUDED.includes(sub)) {
      return sub;
    }
  }
  return null;
}

function shouldProcessOgTags(req: any): boolean {
  if (req.method !== 'GET') return false;

  const urlPath = req.path;
  
  // Exclude static assets with file extensions (e.g. .js, .css, .png, etc.)
  const ext = path.extname(urlPath).toLowerCase();
  if (ext && ext !== '.html') return false;

  // Exclude specific system-reserved prefixes
  const firstPathPart = urlPath.split('/')[1] || '';
  if (['api', 'assets', 'static', 'node_modules', '@vite', '@fs', '@id', 'pix-payment', 'sw.js'].includes(firstPathPart)) {
    return false;
  }

  // Check if it's a known admin page, terms, etc.
  if (['admin', 'termos-e-privacidade'].includes(firstPathPart)) {
    return false;
  }

  const accept = req.headers.accept || '';
  const userAgent = req.headers['user-agent'] || '';
  
  const isHtml = accept.includes('text/html');
  const isCrawler = /facebookexternalhit|twitterbot|whatsapp|telegrambot|discordbot|linkedinbot|slackbot|googlebot|bingbot|crawler/i.test(userAgent);

  return isHtml || isCrawler || !ext;
}

if (isProd) {
  // In Production (Vercel, Cloud Run, etc.), register routes synchronously so they are immediately available
  app.get('*', async (req, res, next) => {
    if (!shouldProcessOgTags(req)) {
      return next();
    }

    const host = req.get('host') || 'localhost:3000';
    const subdomainSlug = getStoreIdFromHost(host);
    const url = req.originalUrl;
    const match = url.match(/^\/(?:s\/|digimenu\/|cardapp\/)?([^\/\?]+)/);
    let slug = match ? match[1] : null;

    if (subdomainSlug) {
      // Don't treat special system paths as slugs
      const firstPathPart = url.split('/')[1] || '';
      if (!['admin', 'api', 'pix-payment', 'assets', 'order'].includes(firstPathPart)) {
        slug = subdomainSlug;
      }
    }

    if (!slug || ['admin', 'api', 'pix-payment', 'assets', 'termos-e-privacidade'].includes(slug)) {
      return next();
    }

    const store = await syncStoreBySlugOrId(slug);
    if (!store) {
      return next();
    }

    const protocol = (req.headers['x-forwarded-proto'] as string) || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
    const imageUrl = `${protocol}://${host}/api/stores/${store.id}/logo`;
    const shareUrl = `${protocol}://${host}${req.originalUrl}`;

    const title = store.settings.seoTitle || `${store.settings.storeName} | Cardápio Digital`;
    const desc = store.settings.seoDescription || store.settings.description || store.settings.storeTagline || `Acesse o cardápio digital do ${store.settings.storeName} e faça seu pedido de forma rápida e fácil!`;
    const keywordsTag = store.settings.seoKeywords ? `<meta name="keywords" content="${store.settings.seoKeywords}">` : '';

    const ogTags = `
    <title>${title}</title>
    ${keywordsTag}
    <meta name="description" content="${desc}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${shareUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:width" content="400">
    <meta property="og:image:height" content="400">
    <meta property="og:site_name" content="${store.settings.storeName}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${imageUrl}">
    `;

    try {
      const distPath = path.join(process.cwd(), 'dist');
      let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

      // Replace generic title and clean up predefined meta tags to prevent social preview overrides
      html = html.replace(/<title>.*?<\/title>/gi, '');
      html = html.replace(/<meta\s+[^>]*property=["'](?:og|twitter|description):[^"']*["'][^>]*\/?>/gi, '');
      html = html.replace(/<meta\s+[^>]*name=["'](?:og|twitter|description):[^"']*["'][^>]*\/?>/gi, '');
      html = html.replace('</head>', `${ogTags}\n</head>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      console.error('[OG Tag Middleware Error]', e);
      next(e);
    }
  });

  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath, { index: false }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Only start listening if we are not running on serverless Vercel environment
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running in production on http://0.0.0.0:${PORT}`);
    });
  }
} else {
  // In development (AI Studio, local dev), start server with dynamic Vite middleware asynchronously
  async function startDevServer() {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get('*', async (req, res, next) => {
      if (!shouldProcessOgTags(req)) {
        return next();
      }

      const host = req.get('host') || 'localhost:3000';
      const subdomainSlug = getStoreIdFromHost(host);
      const url = req.originalUrl;
      const match = url.match(/^\/(?:s\/|digimenu\/|cardapp\/)?([^\/\?]+)/);
      let slug = match ? match[1] : null;

      if (subdomainSlug) {
        // Don't treat special system paths as slugs
        const firstPathPart = url.split('/')[1] || '';
        if (!['admin', 'api', 'pix-payment', 'assets', 'order'].includes(firstPathPart)) {
          slug = subdomainSlug;
        }
      }

      if (!slug || ['admin', 'api', 'pix-payment', 'assets', 'termos-e-privacidade'].includes(slug)) {
        return next();
      }

      const store = await syncStoreBySlugOrId(slug);
      if (!store) {
        return next();
      }

      const protocol = (req.headers['x-forwarded-proto'] as string) || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https');
      const imageUrl = `${protocol}://${host}/api/stores/${store.id}/logo`;
      const shareUrl = `${protocol}://${host}${req.originalUrl}`;

      const title = store.settings.seoTitle || `${store.settings.storeName} | Cardápio Digital`;
      const desc = store.settings.seoDescription || store.settings.description || store.settings.storeTagline || `Acesse o cardápio digital do ${store.settings.storeName} e faça seu pedido de forma rápida e fácil!`;
      const keywordsTag = store.settings.seoKeywords ? `<meta name="keywords" content="${store.settings.seoKeywords}">` : '';

      const ogTags = `
      <title>${title}</title>
      ${keywordsTag}
      <meta name="description" content="${desc}">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${desc}">
      <meta property="og:type" content="website">
      <meta property="og:url" content="${shareUrl}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:image:secure_url" content="${imageUrl}">
      <meta property="og:image:width" content="400">
      <meta property="og:image:height" content="400">
      <meta property="og:site_name" content="${store.settings.storeName}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${desc}">
      <meta name="twitter:image" content="${imageUrl}">
      `;

      try {
        let html = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        html = await vite.transformIndexHtml(url, html);

        // Replace generic title and clean up predefined meta tags
        html = html.replace(/<title>.*?<\/title>/gi, '');
        html = html.replace(/<meta\s+[^>]*property=["'](?:og|twitter|description):[^"']*["'][^>]*\/?>/gi, '');
        html = html.replace(/<meta\s+[^>]*name=["'](?:og|twitter|description):[^"']*["'][^>]*\/?>/gi, '');
        html = html.replace('</head>', `${ogTags}\n</head>`);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        console.error('[OG Tag Middleware Error]', e);
        next(e);
      }
    });

    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running in development on http://0.0.0.0:${PORT}`);
    });
  }

  startDevServer();
}

export default app;
