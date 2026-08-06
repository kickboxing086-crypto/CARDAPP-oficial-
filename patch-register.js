import fs from 'fs';
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf8');

if (!code.includes('useSearchParams')) {
    code = code.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';\nimport { useSearchParams } from 'react-router-dom';");
}

code = code.replace("export default function RegisterStore() {", "export default function RegisterStore() {\n  const [searchParams] = useSearchParams();\n  const refCode = searchParams.get('ref') || '';");

let target = "`*Plano Desejado:* ${formData.plan}\\n\\n` +";
let replacement = "`*Plano Desejado:* ${formData.plan}\\n` +\n      (refCode ? `*Indicado por (Código):* ${refCode}\\n\\n` : '\\n') +";

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/RegisterStore.tsx', code);
