import fetch from 'node-fetch';

async function testCreate() {
  const payload = {
    email: "test-new-merchant@example.com",
    username: "",
    password: "securepassword123",
    storeName: "Test New Merchant Store",
    planType: "monthly"
  };

  try {
    const res = await fetch('http://localhost:3000/api/super/stores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer super-admin-token'
      },
      body: JSON.stringify(payload)
    });
    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (e) {
    console.error("Request failed:", e);
  }
}

testCreate();
