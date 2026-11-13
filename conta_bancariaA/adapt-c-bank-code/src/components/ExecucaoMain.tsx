import { useRef, useState, type KeyboardEvent } from 'react';
import { FONTES, linhaDe } from '../dados/fontes';
import { PASSOS, PONTEIROS, QUADROS, dinheiro, variacao, type Ponteiro, type Quadro } from '../dados/passos';
import { cn } from '../utils/cn';
import { Esperado, SetaDireita, Visto, rico } from './Base';
import { Listagem, Trecho, intervalo } from './Listagem';

const TOTAL = PASSOS.length;
const CLICAVEIS = PASSOS.flatMap((p) => intervalo(p.linhas[0], p.linhas[1]));
/* linhas em que o main provoca um caso de erro de propósito */
const LINHAS_DE_TESTE = PASSOS.filter((_, i) => QUADROS[i].motivo !== null).map((p) => p.linhas[0]);

function textoDoRetorno(q: Quadro, numero?: number): { texto: string; cor: string } {
  switch (q.retorno) {
    case 'declaracao':
      return { texto: 'nada: é só uma declaração', cor: 'text-tinta-2' };
    case 'endereco':
      return { texto: `o endereço da conta ${numero}`, cor: 'text-forma-2' };
    case 'um':
      return { texto: '1 (conseguiu)', cor: 'text-forma-2' };
    case 'zero':
      return { texto: '0 (não conseguiu)', cor: 'text-erro' };
    default:
      return { texto: 'nada: a função é void', cor: 'text-tinta-2' };
  }
}

function LinhaMemoria({ nome, q }: { nome: Ponteiro; q: Quadro }) {
  const estado = q.ponteiros[nome];
  const delta = q.deltas[nome];
  const liberada = q.liberada[nome];

  return (
    <li className={cn('flex min-h-[3.375rem] flex-col justify-center px-3 py-2', q.mudou.includes(nome) && 'bg-faixa')}>
      <div className="flex items-center gap-2">
        <span className="font-semibold">{nome}</span>
        {estado.tipo === 'conta' && (
          <>
            <SetaDireita className="text-forma" />
            <span>conta {estado.numero}</span>
          </>
        )}
        {estado.tipo === 'null' && <span className="text-tinta-2">= NULL</span>}
        {estado.tipo === 'nao-declarado' && <span className="font-sans text-tinta-3">ainda não declarado</span>}
      </div>
      {estado.tipo === 'conta' && (
        <div className="mt-0.5 flex items-baseline justify-between gap-3">
          <span>
            saldo <span className="font-semibold">{dinheiro(estado.centavos)}</span>
          </span>
          {delta !== undefined && <span className="text-tinta-2">{variacao(delta)}</span>}
        </div>
      )}
      {liberada !== undefined && <div className="mt-0.5 font-sans text-tinta-2">bloco da conta {liberada} liberado</div>}
    </li>
  );
}

/* O main executado instrução por instrução: o que entra, o que volta e como ficam as contas. */
export function ExecucaoMain() {
  const [i, setI] = useState(0);
  const painel = useRef<HTMLDivElement>(null);

  const p = PASSOS[i];
  const q = QUADROS[i];
  const codigo = linhaDe(FONTES.principal, p.linhas[0]).trim();
  const retorno = textoDoRetorno(q, p.numero);
  const ultimo = i === TOTAL - 1;

  const ir = (n: number) => setI(Math.min(TOTAL - 1, Math.max(0, n)));

  function aoClicarLinha(n: number) {
    const alvo = PASSOS.findIndex((passo) => n >= passo.linhas[0] && n <= passo.linhas[1]);
    if (alvo < 0) return;
    setI(alvo);
    /* em tela estreita o painel fica acima da listagem: traz ele de volta à vista */
    const caixa = painel.current?.getBoundingClientRect();
    if (caixa && (caixa.top < 0 || caixa.top > window.innerHeight * 0.5)) {
      painel.current?.scrollIntoView({ block: 'start' });
    }
  }

  function aoTeclar(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      ir(i + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ir(i - 1);
    }
  }

  const botao =
    'h-11 min-w-[5.25rem] border px-2.5 font-cond text-[0.9375rem] font-semibold tracking-[0.02em] sm:min-w-[6.25rem] sm:px-3';

  return (
    <div id="execucao" className="grid gap-5 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] @3xl:items-start">
      <div
        ref={painel}
        onKeyDown={aoTeclar}
        className="border border-forma/55 bg-white @3xl:sticky @3xl:top-5 @3xl:order-2"
      >
        <div className="flex items-center gap-2 border-b border-forma/30 bg-papel p-2">
          <button
            type="button"
            onClick={() => ir(i - 1)}
            disabled={i === 0}
            className={cn(botao, 'border-forma/60 text-forma-2 hover:bg-faixa disabled:opacity-40 disabled:hover:bg-transparent')}
          >
            Anterior
          </button>
          <p className="min-w-0 flex-1 text-center leading-tight whitespace-nowrap">
            <span className="rotulo block text-tinta-2">Passo</span>
            <span className="font-mono text-[0.875rem] font-semibold">
              {i + 1} <span className="font-normal text-tinta-2">de {TOTAL}</span>
            </span>
          </p>
          <button
            type="button"
            onClick={() => ir(ultimo ? 0 : i + 1)}
            className={cn(botao, 'border-forma bg-forma text-white hover:bg-forma-2')}
          >
            {ultimo ? 'Recomeçar' : 'Próximo'}
          </button>
        </div>
        <div className="border-b border-forma/20 px-3 py-1">
          <input
            type="range"
            min={1}
            max={TOTAL}
            step={1}
            value={i + 1}
            onChange={(e) => ir(Number(e.target.value) - 1)}
            aria-label="Passo da execução do main"
            aria-valuetext={`Passo ${i + 1} de ${TOTAL}`}
            className="block h-9 w-full accent-forma"
          />
        </div>
        <p className="sr-only" aria-live="polite">
          Passo {i + 1} de {TOTAL}, linha {p.linhas[0]}: {codigo} Devolve {retorno.texto}.
        </p>

        <div className="space-y-4 px-3.5 py-4 sm:px-4">
          <div>
            <p className="rotulo text-forma">
              main.c · linha {p.linhas[0]}
              {p.linhas[1] > p.linhas[0] ? ` a ${p.linhas[1]}` : ''}
            </p>
            <p className="mt-1.5 text-[0.9375rem] leading-snug font-semibold [overflow-wrap:anywhere]">
              <Trecho>{codigo}</Trecho>
            </p>
          </div>

          <dl className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-px border border-forma/35 bg-forma/35">
            <div className="bg-white px-3 py-2">
              <dt className="rotulo text-tinta-2">Devolve</dt>
              <dd className={cn('mt-1 font-mono text-[0.8125rem] leading-snug font-semibold', retorno.cor)}>
                {retorno.texto}
              </dd>
            </div>
            <div className="bg-white px-3 py-2">
              <dt className="rotulo text-tinta-2">Base</dt>
              <dd className="mt-1 leading-none">{q.visto ? <Visto /> : <Esperado />}</dd>
            </div>
          </dl>

          {q.args.length > 0 && (
            <div>
              <p className="rotulo text-tinta-2">Argumento e parâmetro que o recebe</p>
              <ul className="mt-1.5 grid grid-cols-[auto_1rem_minmax(0,1fr)] items-baseline gap-x-2 gap-y-1 font-mono text-[0.8125rem] leading-snug">
                {q.args.map((a) => (
                  <li key={a.param} className="contents">
                    <span className="font-semibold">{a.arg}</span>
                    <SetaDireita className="mt-1 self-start text-forma" />
                    <span>
                      {a.param} <span className="font-sans text-tinta-2">· {a.nota}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className="rotulo text-tinta-2">O que acontece</p>
            <p className="mt-1.5 text-[0.9375rem] leading-[1.55]">{rico(p.nota)}</p>
            {q.motivo && (
              <p className="mt-2 text-[0.9375rem] leading-[1.55]">
                <span className={cn('font-semibold', q.retorno === 'zero' && 'text-erro')}>
                  {q.retorno === 'zero' ? 'Motivo da recusa: ' : 'Por que nada muda: '}
                </span>
                {rico(q.motivo)}
              </p>
            )}
          </div>

          <div>
            <p className="rotulo text-tinta-2">Memória depois desta linha</p>
            <ul className="mt-1.5 divide-y divide-forma/20 border border-forma/35 font-mono text-[0.8125rem] leading-snug">
              {PONTEIROS.map((nome) => (
                <LinhaMemoria key={nome} nome={nome} q={q} />
              ))}
            </ul>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-tinta-2">Faixa verde: o que esta linha alterou.</p>
          </div>
        </div>
      </div>

      <Listagem
        className="@3xl:order-1"
        arquivo={FONTES.principal.caminho}
        papel="cliente"
        texto={FONTES.principal.texto}
        faixas={intervalo(p.linhas[0], p.linhas[1])}
        testes={LINHAS_DE_TESTE}
        clicaveis={CLICAVEIS}
        aoClicar={aoClicarLinha}
        rodape={
          <>
            <p>Toque em uma linha para ir direto a ela.</p>
            <p>
              <span className="mr-1.5 inline-block h-3 w-[3px] bg-erro align-[-0.1em]" aria-hidden="true" />
              Barra vermelha na margem: linha que provoca um caso de erro de propósito.
            </p>
            <p>{rico('O trecho enviado termina na linha 42: faltam o `return 0;` e a chave que fecha o `main`.')}</p>
          </>
        }
      />
    </div>
  );
}
