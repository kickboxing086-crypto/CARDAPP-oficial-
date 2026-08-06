const fs = require('fs');
let code = fs.readFileSync('src/pages/RegisterStore.tsx', 'utf-8');

code = code.replace(
  "import { useNavigate, Link } from 'react-router-dom';",
  "import { useNavigate, Link, useSearchParams } from 'react-router-dom';"
);

code = code.replace(
  "const navigate = useNavigate();\n  const [isLoading, setIsLoading] = useState(false);",
  "const navigate = useNavigate();\n  const [searchParams] = useSearchParams();\n  const [isLoading, setIsLoading] = useState(false);"
);

code = code.replace(
  "plan: '7 Dias Grátis'",
  "plan: searchParams.get('plan') || '7 Dias Grátis'"
);

fs.writeFileSync('src/pages/RegisterStore.tsx', code);
