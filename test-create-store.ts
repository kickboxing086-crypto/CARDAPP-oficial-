import fetch from 'node-fetch';
async function testCreateStore() {
  try {
    const res = await fetch('http://localhost:3000/api/super/stores', {
        method: 'POST',
        headers: { 
            'Authorization': 'Bearer super-admin-token',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: "novocliente",
            password: "123",
            storeName: "Novo Cliente Store"
        })
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error(err);
  }
}
testCreateStore();
