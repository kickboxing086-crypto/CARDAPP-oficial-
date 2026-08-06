import fs from 'fs';

let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Remove state variables
code = code.replace(/  \/\/ AI Generator State\n[\s\S]*?const \[aiError, setAiError\] = useState\(''\);\n/, '');

// 2. Remove handleGenerateAiImage
code = code.replace(/  const handleGenerateAiImage = async \(\) => \{[\s\S]*?  \};\n/, '');

// 3. Remove tab from activeTab state
code = code.replace(/ \| 'ai-generator'/g, '');

// 4. Remove AI Generator button from sidebar
code = code.replace(/                  \{\/\* AI Generator Tab \*\/\}\n[\s\S]*?<\/button>\n/g, '');

// 5. Remove 'Gerar IA' button in product edit
code = code.replace(/                  <button type="button" onClick=\{[\s\S]*?Gerar IA\s*<\/button>\n/g, '');

// 6. Remove the entire AI GENERATOR TAB
code = code.replace(/        \{\/\* AI GENERATOR TAB \*\/\}\n        \{activeTab === 'ai-generator' && \([\s\S]*?        \)\}\n/g, '');

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
