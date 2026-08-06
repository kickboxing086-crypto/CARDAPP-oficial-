const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "    setTimeout(() => {",
  "    const t = setTimeout(() => {"
).replace(
  "    }, ms);\n    return controller.signal;",
  "    }, ms);\n    if (t.unref) t.unref();\n    return controller.signal;"
);

code = code.replace(/getAbortSignalWithTimeout\(\d+\)/g, 'getAbortSignalWithTimeout(8000)');

fs.writeFileSync('server.ts', code);
