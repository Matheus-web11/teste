import { rico } from '../components/Base';
import { TOPICOS, pad } from '../dados/roteiro';

/* As 13 frases-resposta reunidas, para repassar antes de apresentar. */
export function Resumo() {
  return (
    <section id="resumo" aria-labelledby="resumo-titulo">
      <div className="bg-forma px-5 py-8 text-white sm:px-10 sm:py-10">
        <p className="rotulo text-faixa-2">Resumo</p>
        <h2 id="resumo-titulo" className="mt-2 font-cond text-[2.125rem] leading-[1.05] font-semibold sm:text-[2.875rem]">
          As 13 respostas, uma frase cada
        </h2>
        <p className="mt-3 max-w-[52ch] text-[1.0625rem] leading-[1.55] text-faixa">
          Para repassar antes de apresentar. Cada título leva de volta ao tópico completo.
        </p>
      </div>
      <ol className="px-5 py-3 sm:px-10 sm:py-5">
        {TOPICOS.map((t) => (
          <li
            key={t.id}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 border-b border-forma/25 py-4 last:border-b-0 sm:grid-cols-[2.75rem_minmax(0,1fr)]"
          >
            <span className="pt-[0.15em] font-mono text-[0.9375rem] font-semibold text-forma-2 tabular-nums" aria-hidden="true">
              {pad(t.n)}
            </span>
            <div>
              <a
                href={`#${t.id}`}
                className="font-cond text-[1.1875rem] leading-tight font-semibold underline decoration-forma/40 underline-offset-4 hover:decoration-forma"
              >
                {t.curto}
              </a>
              <p className="mt-1.5 max-w-[66ch] text-[0.9688rem] leading-[1.55]">{rico(t.frase)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
