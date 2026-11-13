import { useEffect, useRef, useState } from 'react';
import { PARTES, TOPICOS, pad } from '../dados/roteiro';
import { cn } from '../utils/cn';

const IDS = [...TOPICOS.map((t) => t.id), 'resumo'];

/* Qual seção está sendo lida: a última cujo topo já passou do terço superior da tela. */
export function useSecaoAtiva(): string | null {
  const [ativa, setAtiva] = useState<string | null>(null);

  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const limite = window.innerHeight * 0.3;
      let atual: string | null = null;
      for (const id of IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= limite) atual = id;
        else break;
      }
      setAtiva(atual);
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar);
    return () => {
      window.removeEventListener('scroll', agendar);
      window.removeEventListener('resize', agendar);
      if (quadro) cancelAnimationFrame(quadro);
    };
  }, []);

  return ativa;
}

function Lista({ ativa, aoIr, folgada = false }: { ativa: string | null; aoIr?: () => void; folgada?: boolean }) {
  const linha = cn(
    'flex items-baseline gap-3 px-3 text-[0.9375rem] leading-snug',
    folgada ? 'py-3' : 'py-[0.4375rem]',
  );
  const estado = (atual: boolean) => (atual ? 'bg-faixa text-tinta' : 'text-claro hover:bg-mesa-2');
  const numero = (atual: boolean) =>
    cn('w-5 shrink-0 font-mono text-[0.8125rem] tabular-nums', atual ? 'font-semibold text-forma-2' : 'text-claro-2');

  return (
    <nav aria-label="Roteiro">
      {([1, 2] as const).map((parte) => (
        <div key={parte} className="mt-6 first:mt-0">
          <p className="rotulo px-3 text-claro-2">
            Parte {parte} · {PARTES[parte]}
          </p>
          <ol className="mt-2">
            {TOPICOS.filter((t) => t.parte === parte).map((t) => {
              const atual = ativa === t.id;
              return (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    onClick={aoIr}
                    aria-current={atual ? 'location' : undefined}
                    className={cn(linha, estado(atual))}
                  >
                    <span className={numero(atual)}>{pad(t.n)}</span>
                    <span>{t.curto}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
      <div className="mt-5 border-t border-white/15 pt-4">
        <a
          href="#resumo"
          onClick={aoIr}
          aria-current={ativa === 'resumo' ? 'location' : undefined}
          className={cn(linha, estado(ativa === 'resumo'))}
        >
          <span className={numero(ativa === 'resumo')} aria-hidden="true">
            =
          </span>
          <span>Resumo: as 13 respostas</span>
        </a>
      </div>
    </nav>
  );
}

/* Telas largas: índice fixo ao lado da folha. */
export function Lateral({ ativa }: { ativa: string | null }) {
  return (
    <aside className="sobre-mesa sticky top-0 hidden h-dvh w-[15.5rem] shrink-0 overflow-y-auto py-8 text-claro lg:block print:hidden">
      <a href="#topo" className="block px-3 py-1">
        <span className="rotulo block text-claro-2">Tipo abstrato de dados</span>
        <span className="mt-1 block font-mono text-[1.0625rem] font-semibold">ContaBancaria</span>
      </a>
      <div className="mt-7">
        <Lista ativa={ativa} />
      </div>
    </aside>
  );
}

/* Telas estreitas: barra fixa no topo, com o tópico atual e o botão que abre o roteiro. */
export function BarraTopo({ ativa }: { ativa: string | null }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const atual = TOPICOS.find((t) => t.id === ativa);

  return (
    <>
      <div className="sobre-mesa sticky top-0 z-40 flex h-13 items-center gap-2 border-b border-white/15 bg-mesa pr-4 pl-1.5 text-claro lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => dialogo.current?.showModal()}
          aria-haspopup="dialog"
          className="flex h-11 items-center gap-2.5 px-2.5 font-cond text-[0.9375rem] font-semibold tracking-[0.06em] uppercase"
        >
          <svg viewBox="0 0 18 14" className="h-3.5 w-[1.125rem]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            <path d="M0 1h18M0 7h18M0 13h18" />
          </svg>
          Roteiro
        </button>
        <span className="h-5 w-px bg-white/20" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate pl-1.5 text-[0.875rem] text-claro-2">
          {atual ? (
            <>
              <span className="font-mono text-claro">{pad(atual.n)}</span> {atual.curto}
            </>
          ) : ativa === 'resumo' ? (
            'Resumo: as 13 respostas'
          ) : (
            <>
              TAD <span className="font-mono text-claro">ContaBancaria</span>
            </>
          )}
        </p>
      </div>

      <dialog
        ref={dialogo}
        aria-label="Roteiro"
        className="indice sobre-mesa"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="min-h-full px-3 pt-2 pb-10">
          <div className="flex items-center justify-between pl-3">
            <p className="font-mono text-[1rem] font-semibold">ContaBancaria</p>
            <button
              type="button"
              onClick={() => dialogo.current?.close()}
              aria-label="Fechar o roteiro"
              className="grid size-11 place-items-center"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <path d="M2 2l12 12M14 2 2 14" />
              </svg>
            </button>
          </div>
          <div className="mt-4">
            <Lista ativa={ativa} aoIr={() => dialogo.current?.close()} folgada />
          </div>
        </div>
      </dialog>
    </>
  );
}
