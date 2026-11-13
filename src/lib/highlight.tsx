import type { ReactNode } from "react";

/**
 * Mini "syntax highlighter" para C — suficiente para o estudo de caso.
 * Regras (em ordem de prioridade):
 *  1 pré-processador  2 strings  3 comentários  4 palavras-chave
 *  5 tipos  6 constantes/builtins  7 chamadas de função  8 números
 */
const C_RE =
  /(#[^\n]*)|("(?:[^"\\]|\\.)*")|(\/\/[^\n]*)|(\b(?:struct|enum|union|typedef|static|const|return|if|else|while|for)\b)|(\b(?:int|float|double|void|char|unsigned|signed|long|size_t)\b)|(\b(?:NULL|true|false|sizeof|malloc|free)\b)|(\b[A-Za-z_]\w*(?=\s*\())|(\b\d[\d_]*(?:\.\d+)?f?\b)/g;

const CLS: Record<number, string> = {
  1: "text-[#e06c75]",
  2: "text-[#9ec37a]",
  3: "text-[#5f7086] italic",
  4: "text-[#ffb454]",
  5: "text-[#2dd4bf]",
  6: "text-[#f0c674]",
  7: "text-[#7fb4ff]",
  8: "text-[#f78c6c]",
};

export function highlightC(code: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  C_RE.lastIndex = 0;
  while ((m = C_RE.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    let g = 0;
    for (let i = 1; i < m.length; i++) {
      if (m[i] !== undefined) {
        g = i;
        break;
      }
    }
    out.push(
      <span key={key++} className={CLS[g]}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
