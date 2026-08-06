const fs = require('fs');
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf-8');

code = code.replace(
  '{(() => { const isValid = formData.storeName.length > 0 && formData.slug.length > 0 && formData.email.length > 0 && formData.password.length > 0 && formData.password === formData.confirmPassword; return <></>; })()}',
  ''
);

code = code.replace(
  '  if (success) {',
  '  const isValid = formData.storeName.length > 0 && formData.slug.length > 0 && formData.email.length > 0 && formData.password.length > 0 && formData.password === formData.confirmPassword;\n\n  if (success) {'
);

fs.writeFileSync('src/pages/RegisterStore.tsx', code);
