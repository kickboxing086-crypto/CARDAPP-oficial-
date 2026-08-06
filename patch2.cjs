const fs = require('fs');
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf-8');

code = code.replace(
  'const isValid = formData.storeName.length > 0 && formData.slug.length > 0 && formData.email.length > 0 && formData.password.length > 0 && formData.password === formData.confirmPassword;\n              disabled={isLoading || !isValid}',
  'disabled={isLoading || !isValid}'
);

code = code.replace(
  '\\\'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-1 active:translate-y-0 cursor-pointer\\\' : \\\'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-70\\\'',
  "'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-1 active:translate-y-0 cursor-pointer' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-70'"
);

code = code.replace(
  '          <form onSubmit={handleSubmit} className="space-y-6">',
  '          <form onSubmit={handleSubmit} className="space-y-6">\n            {(() => { const isValid = formData.storeName.length > 0 && formData.slug.length > 0 && formData.email.length > 0 && formData.password.length > 0 && formData.password === formData.confirmPassword; return <></>; })()}'
);

fs.writeFileSync('src/pages/RegisterStore.tsx', code);
