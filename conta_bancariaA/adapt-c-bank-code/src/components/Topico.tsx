import type { ReactNode } from 'react';
import { PARTES, TOPICOS, pad } from '../dados/roteiro';
import { EmUmaFrase } from './Base';

/* Faixa sólida que abre cada uma das duas partes do roteiro. */
export function Parte({ n, descricao }: { n: 1 | 2; descricao: string }) {
  return (
    <div id={`parte-${n}`} className="bg-forma px-5 py-8 text-white sm:px-10 sm:py-10">
      <p className="rotulo text-faixa-2">Parte {n}</p>
      <h2 className="mt-2 font-cond text-[2.125rem] leading-[1.05] font-semibold sm:text-[2.875rem]">{PARTES[n]}</h2>
      <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.55] text-faixa">{descricao}</p>
    </div>
  );
}

function Ligados({ numeros }: { numeros: number[] }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 border-t border-forma/30 pt-4 text-[0.9375rem]">
      <span className="rotulo text-tinta-2">Ligado a</span>
      {numeros.map((n) => {
        const t = TOPICOS[n - 1];
        return (
          <a key={n} href={`#${t.id}`} className="elo">
            <span className="font-mono text-[0.875rem] font-semibold">{pad(n)}</span> {t.curto}
          </a>
        );
      })}
    </p>
  );
}

/* Um tópico do roteiro: faixa verde com número e título (na redação da atividade),
   a resposta em uma frase e, depois, a explicação apoiada no código. */
export function Topico({ n, children }: { n: number; children: ReactNode }) {
  const t = TOPICOS[n - 1];
  return (
    <section id={t.id} aria-labelledby={`${t.id}-titulo`}>
      <header className="flex items-start gap-4 bg-faixa px-5 py-5 sm:gap-6 sm:px-10 sm:py-7">
        <span
          aria-hidden="true"
          className="font-mono text-[2rem] leading-[1.05] font-semibold tracking-[-0.03em] text-forma-2 tabular-nums sm:text-[2.75rem]"
        >
          {pad(t.n)}
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="rotulo text-forma">{PARTES[t.parte]}</p>
          <h3
            id={`${t.id}-titulo`}
            className="mt-1.5 font-cond text-[1.625rem] leading-[1.12] font-semibold text-balance sm:text-[2.125rem]"
          >
            <span className="sr-only">Tópico {t.n}: </span>
            {t.titulo}
          </h3>
        </div>
      </header>
      <div className="@container px-5 py-8 sm:px-10 sm:py-10">
        <div className="space-y-6">
          <EmUmaFrase>{t.frase}</EmUmaFrase>
          {children}
          <Ligados numeros={t.ligados} />
        </div>
      </div>
    </section>
  );
}
