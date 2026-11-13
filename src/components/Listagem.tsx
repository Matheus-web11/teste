import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { realcar } from '../lib/realce';
import { cn } from '../utils/cn';

export const intervalo = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, k) => a + k);

export function pintar(linha: string): ReactNode[] {
  return realcar(linha).map((token, i) =>
    token.classe ? (
      <span key={i} className={`tk-${token.classe}`}>
        {token.texto}
      </span>
    ) : (
      token.texto
    ),
  );
}

/* Uma linha de C solta, com o mesmo realce das listagens. */
export function Trecho({ children, className }: { children: string; className?: string }) {
  return <code className={cn('font-mono [font-variant-ligatures:none]', className)}>{pintar(children)}</code>;
}

type Props = {
  arquivo: string;
  papel?: string;
  texto: string;
  /* recorte, com a numeração original do arquivo */
  de?: number;
  ate?: number;
  /* linhas com faixa verde: as que o texto ao lado comenta */
  faixas?: number[];
  /* linha -> número da nota correspondente */
  marcas?: Record<number, number>;
  /* linhas com barra vermelha na margem */
  testes?: number[];
  clicaveis?: number[];
  aoClicar?: (linha: number) => void;
  rodape?: ReactNode;
  className?: string;
};

export function Listagem({
  arquivo,
  papel,
  texto,
  de,
  ate,
  faixas = [],
  marcas = {},
  testes = [],
  clicaveis = [],
  aoClicar,
  rodape,
  className,
}: Props) {
  const todas = useMemo(() => texto.split('\n'), [texto]);
  const inicio = de ?? 1;
  const fim = ate ?? todas.length;
  const recorte = inicio > 1 || fim < todas.length;

  return (
    <figure className={cn('border border-forma/45 bg-white', className)}>
      <figcaption className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-forma/30 bg-papel px-3 py-2 sm:px-4">
        <span className="font-mono text-[0.8125rem] font-semibold [overflow-wrap:anywhere]">{arquivo}</span>
        {papel && <span className="rotulo text-forma">{papel}</span>}
        {recorte && (
          <span className="ml-auto font-mono text-[0.75rem] text-tinta-3">
            linhas {inicio}–{fim}
          </span>
        )}
      </figcaption>
      <div className="lst">
        {todas.slice(inicio - 1, fim).map((linha, i) => {
          const n = inicio + i;
          const corpo = linha.trimStart();
          const recuo = linha.length - corpo.length;
          const marca = marcas[n];
          const clicavel = aoClicar !== undefined && clicaveis.includes(n);
          return (
            <div
              key={n}
              className="lst-linha"
              data-faixa={faixas.includes(n) ? 'verde' : undefined}
              data-teste={testes.includes(n) ? '' : undefined}
              data-marca={marca !== undefined ? '' : undefined}
              data-clicavel={clicavel ? '' : undefined}
              onClick={clicavel ? () => aoClicar(n) : undefined}
            >
              <span className="lst-num" aria-hidden="true">
                {n}
              </span>
              <code className="lst-cod" style={{ '--n': recuo } as CSSProperties}>
                {pintar(corpo)}
              </code>
              {marca !== undefined && (
                <span className="marca mt-[0.22em]">
                  <span className="sr-only">nota </span>
                  {marca}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {rodape && (
        <div className="space-y-1 border-t border-dashed border-forma/45 px-3 py-2.5 text-[0.8125rem] leading-[1.5] text-tinta-2 sm:px-4">
          {rodape}
        </div>
      )}
    </figure>
  );
}
