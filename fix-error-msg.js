import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
  } catch (error: any) {
    console.error('[AI Image Gen Error]', error);
    let errMsg = error.message || 'Erro ao gerar a imagem.';
    if (errMsg.includes('429') || errMsg.includes('Quota') || errMsg.includes('exceeded')) {
      errMsg = 'Cota excedida. A geração de imagens requer uma chave de API com faturamento ativado.';
    }
    res.status(500).json({ error: errMsg });
  }
`;

code = code.replace(/\} catch \(error: any\) \{[\s\S]*?\}\);/g, replacement + '});');
fs.writeFileSync('server.ts', code);
