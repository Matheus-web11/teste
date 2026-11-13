/* Realce mínimo de C, linha a linha: comentário, string, palavra-chave,
   diretiva de pré-processador e funções das duas bibliotecas (cb_, ec_). */

export type Classe = 'com' | 'str' | 'pal' | 'pre' | 'fn';
export type Token = { texto: string; classe?: Classe };

const PALAVRAS = new Set([
  'struct',
  'enum',
  'int',
  'float',
  'void',
  'char',
  'unsigned',
  'const',
  'if',
  'return',
  'sizeof',
  'NULL',
]);

const PADRAO = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(<[\w./]+>)|([A-Za-z_]\w*)/g;

export function realcar(linha: string): Token[] {
  const tokens: Token[] = [];
  let resto = linha;

  const diretiva = /^(\s*#\s*[a-z]+)(.*)$/.exec(linha);
  if (diretiva) {
    tokens.push({ texto: diretiva[1], classe: 'pre' });
    resto = diretiva[2];
  }

  PADRAO.lastIndex = 0;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = PADRAO.exec(resto)) !== null) {
    if (m.index > cursor) tokens.push({ texto: resto.slice(cursor, m.index) });
    if (m[1]) {
      tokens.push({ texto: m[1], classe: 'com' });
    } else if (m[2]) {
      tokens.push({ texto: m[2], classe: 'str' });
    } else if (m[3]) {
      tokens.push({ texto: m[3], classe: diretiva ? 'str' : undefined });
    } else {
      const palavra = m[4];
      tokens.push({
        texto: palavra,
        classe: PALAVRAS.has(palavra) ? 'pal' : /^(cb|ec)_/.test(palavra) ? 'fn' : undefined,
      });
    }
    cursor = m.index + m[0].length;
  }
  if (cursor < resto.length) tokens.push({ texto: resto.slice(cursor) });
  return tokens;
}
