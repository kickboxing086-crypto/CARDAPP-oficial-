const fs = require('fs');

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && k !== '') {
      fields[k] = toFirestoreValue(v);
    }
  }
  return fields;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') return { mapValue: { fields: toFirestoreFields(val) } };
  return { stringValue: String(val) };
}

const newStore = {
      id: "teste",
      email: '',
      username: '',
      password: "123",
      settings: {
        storeName: "teste",
        logo: '/logo.png',
        storeNameFirst: "teste",
        storeNameFirstColor: '#1e293b',
        primaryColor: '#fbbf24',
        whatsappNumber: '',
        storeSlug: "teste",
        businessType: 'outros',
        categories: ['Geral'],
        locationAddress: '',
        isOpen: true,
        fontFamily: 'inter',
        planType: 'free',
        planStartDate: new Date().toISOString(),
        referredBy: ''
      },
      products: [],
      orders: [],
      createdAt: new Date().toISOString()
};

console.log(JSON.stringify(toFirestoreFields(newStore), null, 2));
