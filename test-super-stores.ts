import fetch from 'node-fetch';
async function testSuperStores() {
  try {
    const res = await fetch('http://localhost:3000/api/super/stores', {
        headers: { 'Authorization': 'Bearer super-admin-token' }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (err) {
    console.error(err);
  }
}
testSuperStores();
