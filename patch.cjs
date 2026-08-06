const fs = require('fs');
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf-8');

const isFormValid = "const isValid = formData.storeName.length > 0 && formData.slug.length > 0 && formData.email.length > 0 && formData.password.length > 0 && formData.password === formData.confirmPassword;";

code = code.replace(
  'disabled={isLoading}',
  `${isFormValid}\n              disabled={isLoading || !isValid}`
);

code = code.replace(
  'className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-black py-4 rounded-xl shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2 uppercase tracking-tighter disabled:opacity-50"',
  'className={`w-full font-black py-4 rounded-xl shadow-xl transition-all transform flex items-center justify-center gap-2 uppercase tracking-tighter ${isValid && !isLoading ? \\\'bg-emerald-500 hover:bg-emerald-400 text-white hover:-translate-y-1 active:translate-y-0 cursor-pointer\\\' : \\\'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-70\\\'}`}'
);

fs.writeFileSync('src/pages/RegisterStore.tsx', code);
