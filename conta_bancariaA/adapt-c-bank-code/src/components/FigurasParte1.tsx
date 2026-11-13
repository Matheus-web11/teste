import type { ReactNode } from 'react';
import { FUNCOES } from '../dados/funcoes';
import { cn } from '../utils/cn';
import { C, Caminho, IconeOk, IconeX, Terminal, rico } from './Base';
import { Trecho } from './Listagem';

/* ---------- Tópico 1: os três arquivos e o papel de cada um ---------- */

function Cartao({
  papel,
  caminho,
  texto,
  destaque = false,
}: {
  papel: string;
  caminho: string;
  texto: string;
  destaque?: boolean;
}) {
  return (
    <div className={cn('border px-4 py-3.5', destaque ? 'border-forma bg-faixa' : 'border-forma/45 bg-white')}>
      <p className="rotulo text-forma">{papel}</p>
      <p className="mt-1.5 font-mono text-[0.875rem] leading-snug font-semibold [overflow-wrap:anywhere]">
        <Caminho>{caminho}</Caminho>
      </p>
      <p className="mt-2 text-[0.9375rem] leading-[1.5]">{rico(texto)}</p>
    </div>
  );
}

/* Seta entre dois cartões: vertical quando empilhados, horizontal quando lado a lado.
   "invertida" aponta para o cartão anterior (o contrato, que fica no meio). */
function Ligacao({ texto, invertida = false }: { texto: string; invertida?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-1.5 pl-6 text-forma @2xl:w-[5.75rem] @2xl:flex-col @2xl:justify-center @2xl:gap-2 @2xl:px-1.5 @2xl:py-0">
      <svg
        viewBox="0 0 12 34"
        className={cn('h-[2.125rem] w-3 shrink-0 @2xl:hidden', invertida && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M6 0v32M1.5 27 6 32.5 10.5 27" />
      </svg>
      <span className="rotulo @2xl:text-center">{texto}</span>
      <svg
        viewBox="0 0 60 12"
        className={cn('hidden h-3 w-[3.75rem] shrink-0 @2xl:block', invertida && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M0 6h58M53 1.5 58.5 6 53 10.5" />
      </svg>
    </div>
  );
}

export function MapaArquivos() {
  return (
    <figure>
      <div className="grid @2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.12fr)_auto_minmax(0,1fr)]">
        <Cartao
          papel="O cliente"
          caminho="apps/main.c"
          texto="Inclui só os cabeçalhos. Cria contas e pede operações; nunca escreve `saldo` nem `numero`."
        />
        <Ligacao texto="inclui e usa" />
        <Cartao
          destaque
          papel="O contrato"
          caminho="include/contaBancaria.h"
          texto="Anuncia que existe uma `struct ContaBancaria` e lista as seis funções `cb_`. Nenhum campo aparece aqui."
        />
        <Ligacao texto="inclui e implementa" invertida />
        <Cartao
          papel="A máquina"
          caminho="src/contaBancaria.c"
          texto="Define os campos da conta, o histórico de operações e o corpo das funções."
        />
      </div>
      <figcaption className="mt-3 max-w-[66ch] text-[0.9375rem] leading-[1.55] text-tinta-2">
        {rico(
          'As duas pontas incluem o mesmo cabeçalho: é por ele que cliente e biblioteca combinam o que existe. `include/ec_rgb_colors.h` entra do mesmo jeito, como contrato da biblioteca de cores que os dois usam.',
        )}
      </figcaption>
    </figure>
  );
}

/* ---------- Tópico 4: o contrato de cada função ---------- */

const COLUNAS_CONTRATO = '@2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.85fr)]';

export function ContratoFuncoes() {
  return (
    <div className="border-t border-forma/45">
      <div className={cn('hidden gap-x-6 border-b border-forma/45 py-2 text-forma @2xl:grid', COLUNAS_CONTRATO)} aria-hidden="true">
        <span className="rotulo">Protótipo</span>
        <span className="rotulo">O que faz</span>
        <span className="rotulo">Devolve</span>
      </div>
      <ul>
        {FUNCOES.map((f) => (
          <li key={f.nome} className={cn('grid gap-x-6 gap-y-2.5 border-b border-forma/25 py-4', COLUNAS_CONTRATO)}>
            <p className="text-[0.8125rem] leading-[1.6] [overflow-wrap:anywhere]">
              <Trecho>{f.assinatura}</Trecho>
            </p>
            <div>
              <p className="rotulo mb-0.5 text-forma @2xl:hidden">O que faz</p>
              <p className="text-[0.9375rem] leading-[1.5]">{rico(f.oQueFaz)}</p>
            </div>
            <div>
              <p className="rotulo mb-0.5 text-forma @2xl:hidden">Devolve</p>
              <p className="text-[0.9375rem] leading-[1.5]">{rico(f.devolve)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CASOS = [
  {
    situacao: 'Conta que não existe',
    onde: 'ponteiro `NULL`, linhas 16, 33, 37 e 41',
    chamadas: ['cb_depositar(cNULL, 10)', 'cb_transferir(cNULL, c1, 100)', 'cb_imprimir(cNULL)', 'cb_excluir(&cNULL)'],
  },
  {
    situacao: 'Valor negativo',
    onde: 'linhas 17 e 21',
    chamadas: ['cb_depositar(c2, -30)', 'cb_transferir(c2, c1, -100)'],
  },
  {
    situacao: 'Saque maior que o saldo',
    onde: 'linha 19, quando `c2` tem 32800.00',
    chamadas: ['cb_sacar(c2, 50000)'],
  },
  {
    situacao: 'Mesma conta excluída duas vezes',
    onde: 'linhas 39 e 42',
    chamadas: ['cb_excluir(&c1)'],
  },
];

export function CasosDeFalha() {
  return (
    <ul className="border-t border-forma/45">
      {CASOS.map((c) => (
        <li
          key={c.situacao}
          className="grid gap-x-6 gap-y-2 border-b border-forma/25 py-3.5 @2xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
        >
          <div>
            <p className="leading-snug font-semibold">{c.situacao}</p>
            <p className="mt-0.5 text-[0.875rem] leading-snug text-tinta-2">{rico(c.onde)}</p>
          </div>
          <p className="flex flex-wrap content-start items-start gap-x-2 gap-y-1.5 text-[0.9375rem] leading-[1.5]">
            {c.chamadas.map((chamada) => (
              <C key={chamada}>{chamada}</C>
            ))}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Tópico 6: o que o main consegue e o que o compilador recusa ---------- */

const TENTATIVAS = [
  {
    codigo: 'c1->saldo = 1000000;',
    erro: "error: invalid use of undefined type 'struct ContaBancaria'",
    texto: 'Fora do `.c` os campos não existem: o compilador não sabe o que é `saldo`.',
  },
  {
    codigo: 'struct ContaBancaria c;',
    erro: "error: storage size of 'c' isn't known",
    texto: 'Sem conhecer os campos, não dá para saber o tamanho. Por isso o `main` só declara ponteiros.',
  },
  {
    codigo: 'malloc(sizeof(struct ContaBancaria))',
    erro: "error: invalid application of 'sizeof' to incomplete type 'struct ContaBancaria'",
    texto: 'Nem alocar por conta própria o `main` consegue. Criar conta, só com `cb_criar`.',
  },
];

const linhaDeCodigo = 'text-[0.8125rem] leading-[1.65] [overflow-wrap:anywhere]';

export function CompilaNaoCompila() {
  return (
    <div className="grid gap-4 @2xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @2xl:items-start">
      <div className="border border-forma/55 bg-white">
        <p className="flex items-center gap-2 bg-faixa px-4 py-2 text-forma-2">
          <IconeOk />
          <span className="rotulo">Compila</span>
        </p>
        <div className="space-y-2 px-4 py-3.5">
          <p className={linhaDeCodigo}>
            <Trecho>{'struct ContaBancaria *c1 = cb_criar(521, 100);'}</Trecho>
          </p>
          <p className={linhaDeCodigo}>
            <Trecho>{'cb_depositar(c1, 100);'}</Trecho>
          </p>
          <p className="pt-1 text-[0.9375rem] leading-[1.5]">
            {rico('Guardar um ponteiro para o tipo e chamar as funções do `.h`: é só isso que o cabeçalho permite.')}
          </p>
        </div>
      </div>

      <div className="border border-erro/55 bg-white">
        <p className="flex items-center gap-2 bg-erro-faixa px-4 py-2 text-erro">
          <IconeX />
          <span className="rotulo">Não compila</span>
        </p>
        <ul className="divide-y divide-erro/20">
          {TENTATIVAS.map((t) => (
            <li key={t.codigo} className="space-y-1.5 px-4 py-3.5">
              <p className={linhaDeCodigo}>
                <Trecho>{t.codigo}</Trecho>
              </p>
              <p className="font-mono text-[0.75rem] leading-[1.55] text-erro [overflow-wrap:anywhere]">{t.erro}</p>
              <p className="text-[0.9375rem] leading-[1.5]">{rico(t.texto)}</p>
            </li>
          ))}
        </ul>
        <p className="border-t border-erro/20 px-4 py-2 text-[0.8125rem] text-tinta-2">Mensagens do gcc 12.2.</p>
      </div>
    </div>
  );
}

/* ---------- Tópico 7: um cenário de compilação ---------- */

export function Cenario({
  titulo,
  opcoes,
  quando,
  marca,
  children,
}: {
  titulo: string;
  opcoes: string;
  quando: string;
  marca?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-forma/35 pt-5">
      <p className="rotulo text-tinta-2">{quando}</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h4 className="font-cond text-[1.3125rem] leading-tight font-semibold sm:text-[1.5rem]">{titulo}</h4>
        <span className="font-mono text-[0.8125rem] font-semibold text-forma-2 [word-spacing:0.3em]">{opcoes}</span>
        {marca}
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/* Uma das situações que o main já deixa prontas para o sanitizer flagrar. */
export function Armadilha({
  titulo,
  texto,
  saida,
  depois,
}: {
  titulo: string;
  texto: string;
  saida: string[];
  depois?: string;
}) {
  return (
    <div className="border border-forma/40 bg-white">
      <p className="border-b border-forma/25 bg-papel px-4 py-2 leading-snug font-semibold">{titulo}</p>
      <div className="space-y-3 px-4 py-3.5">
        <p className="max-w-[66ch] text-[0.9375rem] leading-[1.55]">{rico(texto)}</p>
        <Terminal rotulo="Saída resumida" linhas={saida} />
        {depois && <p className="max-w-[66ch] text-[0.9375rem] leading-[1.55]">{rico(depois)}</p>}
      </div>
    </div>
  );
}
