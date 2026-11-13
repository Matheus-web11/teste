import type { ReactNode } from 'react';
import { Esperado, Visto, rico } from '../components/Base';
import { PARTES, TOPICOS, pad } from '../dados/roteiro';

const FICHA = [
  { rotulo: 'Interface · o que faz', caminho: 'include/contaBancaria.h', situacao: 'veio inteiro' },
  { rotulo: 'Implementação · como faz', caminho: 'src/contaBancaria.c', situacao: 'veio até o fim de cb_criar' },
  { rotulo: 'Cliente · quem usa', caminho: 'apps/main.c', situacao: 'veio sem o fechamento do main' },
  { rotulo: 'Biblioteca de apoio', caminho: 'include/ec_rgb_colors.h', situacao: 'veio inteiro' },
];

function LinhaSobre({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="grid gap-x-6 gap-y-1 px-4 py-3 sm:px-5 @xl:grid-cols-[8.5rem_minmax(0,1fr)]">
      <dt className="rotulo text-forma @xl:pt-[0.35em]">{rotulo}</dt>
      <dd className="max-w-[62ch] text-[0.9375rem] leading-[1.55]">{children}</dd>
    </div>
  );
}

export function Abertura() {
  return (
    <>
      <header id="topo" className="@container">
        <p className="rotulo px-5 pt-9 text-forma sm:px-10 sm:pt-12">Roteiro comentado · linguagem C</p>
        <h1 className="mt-7 sm:mt-9">
          <span className="block px-5 font-cond text-[1.375rem] leading-tight font-semibold text-forma sm:px-10 sm:text-[1.75rem]">
            Tipo abstrato de dados
          </span>
          {/* o nome do tipo sobre uma faixa verde, como a linha em destaque de uma listagem */}
          <span className="mt-2 block bg-faixa px-5 py-2 sm:px-10 sm:py-3">
            <span className="datilografar block w-fit font-mono text-[length:clamp(2.125rem,10.6cqi,5.25rem)] leading-[1.1] font-semibold tracking-[-0.02em]">
              ContaBancaria
            </span>
          </span>
        </h1>

        <div className="px-5 pt-7 pb-9 sm:px-10 sm:pt-9 sm:pb-12">
          <p className="max-w-[58ch] text-[1.125rem] leading-[1.6] text-pretty sm:text-[1.25rem]">
            {rico(
              'Os 13 tópicos do roteiro da atividade, respondidos em cima do código que você enviou. Cada resposta aponta as linhas de `contaBancaria.h`, `contaBancaria.c` e `main.c` em que se apoia.',
            )}
          </p>

          <dl className="mt-8 grid gap-px border border-forma/45 bg-forma/45 @xl:grid-cols-2">
            {FICHA.map((f) => (
              <div key={f.caminho} className="bg-papel px-4 py-3">
                <dt className="rotulo text-forma">{f.rotulo}</dt>
                <dd className="mt-1.5 font-mono text-[0.9375rem] leading-snug font-semibold [overflow-wrap:anywhere]">
                  {f.caminho}
                </dd>
                <dd className="mt-0.5 text-[0.875rem] text-tinta-2">{f.situacao}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section
        id="roteiro"
        aria-labelledby="roteiro-titulo"
        className="@container border-t border-forma/35 px-5 py-9 sm:px-10 sm:py-12"
      >
        <h2 id="roteiro-titulo" className="font-cond text-[1.75rem] leading-[1.1] font-semibold sm:text-[2.125rem]">
          O roteiro, na ordem da atividade
        </h2>

        <div className="mt-6 grid gap-x-10 gap-y-8 @2xl:grid-cols-2">
          {([1, 2] as const).map((parte) => (
            <div key={parte}>
              <p className="rotulo text-forma">Parte {parte}</p>
              <p className="mt-1 font-cond text-[1.3125rem] leading-tight font-semibold">{PARTES[parte]}</p>
              <ol className="mt-3 border-t border-forma/45">
                {TOPICOS.filter((t) => t.parte === parte).map((t) => (
                  <li key={t.id} className="border-b border-forma/25">
                    <a href={`#${t.id}`} className="-mx-2 flex items-baseline gap-3 px-2 py-3 leading-snug hover:bg-faixa sm:py-2.5">
                      <span className="font-mono text-[0.875rem] font-semibold text-forma-2 tabular-nums">{pad(t.n)}</span>
                      <span>{t.titulo}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <p className="mt-7 max-w-[66ch] text-pretty">
          As duas listas olham o mesmo código por ângulos diferentes. No fim de cada tópico, “Ligado a” aponta os que
          tratam do mesmo trecho, caso você prefira apresentá-los juntos.
        </p>

        <div className="mt-9 border border-forma/45">
          <h3 className="bg-faixa px-4 py-2.5 font-cond text-[1.25rem] leading-tight font-semibold sm:px-5">
            Sobre o código enviado
          </h3>
          <dl className="divide-y divide-forma/25">
            <LinhaSobre rotulo="Veio inteiro">{rico('`include/contaBancaria.h` e `include/ec_rgb_colors.h`.')}</LinhaSobre>
            <LinhaSobre rotulo="Veio em parte">
              {rico(
                '`src/contaBancaria.c` para logo depois de `cb_criar`; `apps/main.c` termina sem o `return 0;` e sem a chave que fecha o `main`.',
              )}
            </LinhaSobre>
            <LinhaSobre rotulo="Não veio">
              {rico(
                'O corpo de `cb_excluir`, `cb_depositar`, `cb_sacar`, `cb_transferir` e `cb_imprimir`; o arquivo `ec_rgb_colors.c`; o Makefile.',
              )}
            </LinhaSobre>
            <LinhaSobre rotulo="Como marquei">
              <span className="block">
                <Visto /> Afirmação que dá para apontar numa linha enviada.
              </span>
              <span className="mt-2 block">
                <Esperado />{' '}
                {rico(
                  'Comportamento deduzido do cabeçalho e do jeito como o `main` chama a função, porque o corpo dela não veio.',
                )}
              </span>
            </LinhaSobre>
            <LinhaSobre rotulo="Como conferi">
              {rico(
                'Compilei os quatro arquivos com gcc 12.2 em Linux x86-64, completando o que não veio (as cinco funções e o `ec_rgb_colors.c`) com versões de teste. Tamanhos em bytes, mensagens do compilador e saldos citados aqui saíram dessa compilação. A numeração de linhas é a das listagens desta página.',
              )}
            </LinhaSobre>
          </dl>
        </div>
      </section>
    </>
  );
}
