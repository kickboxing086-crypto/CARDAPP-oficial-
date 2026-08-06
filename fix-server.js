import fs from 'fs';
let lines = fs.readFileSync('server.ts', 'utf8').split('\n');

// Find the first instance of 'AI Image Gen Error' which is at line 1060
// and the second instance which is around line 1445.
let firstIndex = lines.findIndex(l => l.includes('[AI Image Gen Error]'));

if (firstIndex !== -1 && firstIndex < 1100) {
  // Replace lines from firstIndex - 1 (the catch line) up to the extra });
  // The first catch should be:
  //   } catch (error: any) {
  //     console.error('Error creating order:', error);
  //     res.status(500).json({ error: 'Erro ao criar pedido.' });
  //   }
  // });
  lines.splice(firstIndex - 1, 10,
    '  } catch (error: any) {',
    '    console.error(\'Error creating order:\', error);',
    '    res.status(500).json({ error: \'Erro ao criar pedido.\' });',
    '  }',
    '});'
  );
}

// Find second instance
let secondIndex = lines.findIndex((l, i) => i > 1200 && l.includes('[AI Image Gen Error]'));
if (secondIndex !== -1) {
  // Replace the extra `  });` at the end
  let extraIndex = secondIndex + 8;
  if (lines[extraIndex] && lines[extraIndex].trim() === '});' && lines[extraIndex+1] && lines[extraIndex+1].trim() === '});') {
      lines.splice(extraIndex+1, 2);
  }
}

fs.writeFileSync('server.ts', lines.join('\n'));
