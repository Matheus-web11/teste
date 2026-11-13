import { FUNCOES, FUNCOES_EC } from '../dados/funcoes';
import { PASSOS, type Op } from '../dados/passos';
import { cn } from '../utils/cn';
import { C, Esperado, Etiqueta, SetaDireita, Visto, rico } from './Base';
import { Trecho } from './Listagem';

/* ---------- Tópico 8: o que o usuário enxerga e o que fica dentro da biblioteca ---------- */

const VISIVEIS = [
  { nome: 'struct ContaBancaria', texto: 'Só o nome. O `main` usa sempre como ponteiro: `struct ContaBancaria *`.' },
  {
    nome: 'int · float',
    texto: 'Tipos primitivos das assinaturas: número da conta e retorno 1 ou 0 em `int`, valores em dinheiro em `float`.',
  },
  { nome: 'const char * · unsigned int', texto: 'Usados por `ec_rgb_colors.h`, que não cria tipo novo.' },
];

const INTERNOS = [
  { nome: 'campos de struct ContaBancaria', texto: '`numero`, `saldo`, `pos_log` e `log`.' },
  { nome: 'struct Operacao', texto: 'O registro de uma operação no histórico.' },
  { nome: 'enum TipoOperacao', texto: 'O código do tipo de operação.' },
  { nome: 'MAX_OPERACOES', texto: 'O tamanho do histórico: 100.' },
];

function ItensDeTipo({ itens }: { itens: { nome: string; texto: string }[] }) {
  return (
    <ul className="divide-y divide-forma/20">
      {itens.map((item) => (
        <li key={item.nome} className="px-4 py-3">
          <p className="font-mono text-[0.875rem] leading-snug font-semibold [overflow-wrap:anywhere]">{item.nome}</p>
          <p className="mt-1 text-[0.9375rem] leading-[1.5]">{rico(item.texto)}</p>
        </li>
      ))}
    </ul>
  );
}

export function TiposVisiveis() {
  return (
    <div className="grid gap-4 @2xl:grid-cols-2 @2xl:items-start">
      <div className="border border-forma/55 bg-white">
        <div className="bg-faixa px-4 py-3">
          <p className="font-cond text-[1.1875rem] leading-tight font-semibold">Disponibilizado ao usuário</p>
          <p className="mt-1 font-mono text-[0.8125rem] leading-tight text-forma-2">está em include/</p>
        </div>
        <ItensDeTipo itens={VISIVEIS} />
      </div>
      <div className="border border-mesa bg-white">
        <div className="bg-mesa px-4 py-3 text-claro">
          <p className="font-cond text-[1.1875rem] leading-tight font-semibold">Interno à biblioteca</p>
          <p className="mt-1 font-mono text-[0.8125rem] leading-tight text-claro-2">só em src/contaBancaria.c</p>
        </div>
        <ItensDeTipo itens={INTERNOS} />
      </div>
    </div>
  );
}

/* ---------- Tópico 9: ponteiros na pilha, contas no heap ---------- */

function Variavel({ nome, guarda }: { nome: string; guarda: string }) {
  return (
    <div className="border border-tinta/70 px-2.5 py-2">
      <p className="font-mono text-[0.875rem] leading-tight font-semibold">{nome}</p>
      <p className="mt-1 text-[0.8125rem] leading-tight text-tinta-2">{guarda}</p>
    </div>
  );
}

function Bloco({ numero, saldo }: { numero: number; saldo: string }) {
  return (
    <div className="border border-forma bg-faixa px-3 py-2 font-mono text-[0.8125rem] leading-snug">
      <p className="font-semibold">conta {numero}</p>
      <p>saldo {saldo}</p>
      <p className="font-sans text-tinta-2">bloco de 2012 bytes</p>
    </div>
  );
}

function Fio() {
  return (
    <div className="flex items-center text-forma" aria-hidden="true">
      <span className="h-px flex-1 bg-current" />
      <svg viewBox="0 0 8 10" className="h-2.5 w-2 shrink-0" fill="currentColor">
        <path d="M0 0l8 5-8 5z" />
      </svg>
    </div>
  );
}

export function PilhaHeap() {
  return (
    <figure>
      <div className="grid grid-cols-[minmax(0,6rem)_1.75rem_minmax(0,1fr)] items-center gap-y-3 border border-forma/45 bg-white px-3.5 py-4 sm:grid-cols-[minmax(0,10.5rem)_3.5rem_minmax(0,1fr)] sm:px-5">
        <p className="self-end">
          <span className="rotulo block text-forma">Pilha</span>
          <span className="block text-[0.8125rem] leading-tight text-tinta-2">variáveis do main</span>
        </p>
        <span />
        <p className="self-end">
          <span className="rotulo block text-forma">Heap</span>
          <span className="block text-[0.8125rem] leading-tight text-tinta-2">blocos pedidos com malloc</span>
        </p>

        <Variavel nome="c1" guarda="um endereço" />
        <Fio />
        <Bloco numero={521} saldo="100.00" />

        <Variavel nome="c2" guarda="um endereço" />
        <Fio />
        <Bloco numero={1023} saldo="30000.00" />

        <Variavel nome="cNULL" guarda="NULL" />
        <span />
        <p className="border border-dashed border-tinta-3/70 px-3 py-2 text-[0.8125rem] leading-snug text-tinta-2">
          não aponta para nenhum bloco
        </p>
      </div>
      <figcaption className="mt-2.5 max-w-[66ch] text-[0.9375rem] leading-[1.55] text-tinta-2">
        {rico(
          'A memória depois da linha 12 do `main`. Os três ponteiros somem sozinhos quando o `main` termina; os dois blocos só somem se alguém chamar `free`.',
        )}
      </figcaption>
    </figure>
  );
}

/* ---------- Tópico 10: os campos, o tamanho de cada um e o histórico ---------- */

type Campo = { nome: string; tipo: string; bytes: number; desc: string };

const CAMPOS_CONTA: Campo[] = [
  { nome: 'numero', tipo: 'int', bytes: 4, desc: 'Número da conta: 521, 1023.' },
  { nome: 'saldo', tipo: 'float', bytes: 4, desc: 'Saldo atual.' },
  { nome: 'pos_log', tipo: 'int', bytes: 4, desc: 'Posição no histórico; pelo nome, a próxima vaga livre de `log`.' },
  {
    nome: 'log',
    tipo: 'struct Operacao [100]',
    bytes: 2000,
    desc: 'O histórico: 100 registros de 20 bytes, um por operação.',
  },
];

const CAMPOS_OPERACAO: Campo[] = [
  { nome: 'tipo', tipo: 'int', bytes: 4, desc: 'Um valor de `enum TipoOperacao`, de 0 a 5.' },
  { nome: 'valor', tipo: 'float', bytes: 4, desc: 'Quanto foi movimentado.' },
  { nome: 'saldo_antes', tipo: 'float', bytes: 4, desc: 'Saldo antes da operação.' },
  { nome: 'saldo_depois', tipo: 'float', bytes: 4, desc: 'Saldo depois da operação.' },
  { nome: 'outraConta', tipo: 'int', bytes: 4, desc: 'Número da outra conta; pelo nome, usado em transferências.' },
];

function ListaDeCampos({ titulo, tamanho, campos }: { titulo: string; tamanho: string; campos: Campo[] }) {
  return (
    <div className="border border-forma/45 bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-forma/35 bg-faixa px-3.5 py-2 sm:px-4">
        <span className="font-mono text-[0.875rem] font-semibold">{titulo}</span>
        <span className="font-mono text-[0.8125rem] text-forma-2">{tamanho}</span>
      </div>
      <ul className="divide-y divide-forma/20">
        {campos.map((campo) => (
          <li
            key={campo.nome}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-3.5 py-2.5 sm:px-4 @xl:grid-cols-[7.5rem_11.5rem_minmax(0,1fr)_auto] @xl:items-baseline"
          >
            <span className="order-1 font-mono text-[0.875rem] font-semibold @xl:order-none">{campo.nome}</span>
            <span className="order-3 col-span-2 font-mono text-[0.8125rem] text-tinta-2 @xl:order-none @xl:col-span-1">
              {campo.tipo}
            </span>
            <span className="order-4 col-span-2 text-[0.9375rem] leading-[1.5] @xl:order-none @xl:col-span-1">
              {rico(campo.desc)}
            </span>
            <span className="order-2 font-mono text-[0.8125rem] text-tinta-2 tabular-nums @xl:order-none">
              {campo.bytes} bytes
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CamposDaConta() {
  return (
    <div className="space-y-5">
      <ListaDeCampos titulo="struct ContaBancaria" tamanho="2012 bytes" campos={CAMPOS_CONTA} />

      <figure>
        <div
          className="flex h-8 border border-forma/60"
          role="img"
          aria-label="Barra em escala: 12 bytes para numero, saldo e pos_log; 2000 bytes para o vetor log."
        >
          <span className="w-[0.6%] min-w-[3px] bg-forma-2" />
          <span className="flex min-w-0 flex-1 items-center bg-faixa-2 px-3 font-mono text-[0.75rem] text-forma-2">
            log · 2000 bytes
          </span>
        </div>
        <figcaption className="mt-2 max-w-[66ch] text-[0.9375rem] leading-[1.5] text-tinta-2">
          Em escala: a lasca escura à esquerda são número, saldo e contador, 12 bytes. Todo o resto do bloco é o
          histórico.
        </figcaption>
      </figure>

      <ListaDeCampos titulo="struct Operacao" tamanho="20 bytes · uma vaga de log" campos={CAMPOS_OPERACAO} />

      <p className="max-w-[66ch] text-[0.875rem] leading-[1.5] text-tinta-2">
        {rico('Tamanhos medidos com `sizeof` no gcc 12.2, Linux x86-64, onde `int` e `float` têm 4 bytes.')}
      </p>
    </div>
  );
}

const OCUPADAS = 4;

export function GradeLog() {
  return (
    <figure className="border border-forma/45 bg-white px-3.5 py-4 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="font-mono text-[0.875rem] font-semibold">log[0] … log[99]</p>
        <Etiqueta>ilustração</Etiqueta>
      </div>
      <div
        className="mt-3 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-[2px]"
        role="img"
        aria-label="Grade com as 100 posições do vetor log: as 4 primeiras ocupadas, a quinta marcada como próxima vaga, 95 livres."
      >
        {Array.from({ length: 100 }, (_, k) => (
          <span
            key={k}
            className={cn(
              'aspect-square',
              k < OCUPADAS ? 'bg-forma' : k === OCUPADAS ? 'border-2 border-forma bg-white' : 'bg-faixa',
            )}
          />
        ))}
      </div>
      <figcaption className="mt-3 text-[0.9375rem] leading-[1.5]">
        {rico(
          'Cada quadrado é uma vaga de 20 bytes. Leitura provável, pelo nome do campo: com 4 operações registradas, as posições 0 a 3 estão ocupadas e `pos_log` vale 4, a vaga de contorno. As outras 95 continuam reservadas, mesmo vazias.',
        )}
      </figcaption>
    </figure>
  );
}

const REGISTRO = [
  ['tipo', 'TRANSFERENCIA (4)'],
  ['valor', '50.00'],
  ['saldo_antes', '200.00'],
  ['saldo_depois', '150.00'],
  ['outraConta', '1023'],
];

export function RegistroExemplo() {
  return (
    <figure className="border border-forma/45 bg-white px-3.5 py-4 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p className="font-mono text-[0.875rem] font-semibold">uma vaga preenchida</p>
        <Etiqueta>ilustração</Etiqueta>
      </div>
      <dl className="mt-3 divide-y divide-forma/20 border-y border-forma/35 font-mono text-[0.8125rem]">
        {REGISTRO.map(([campo, valor]) => (
          <div key={campo} className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className="text-tinta-2">{campo}</dt>
            <dd className="text-right font-semibold">{valor}</dd>
          </div>
        ))}
      </dl>
      <figcaption className="mt-3 text-[0.9375rem] leading-[1.5]">
        {rico(
          'Como a linha 20 do `main`, `cb_transferir(c1, c2, 50)`, caberia no histórico da conta 521. O código que grava em `log` não veio; os valores seguem o nome de cada campo.',
        )}
      </figcaption>
    </figure>
  );
}

/* ---------- Tópico 11: quem cria, quem altera, quem mostra, quem destrói ---------- */

const chamadas = (op: Op) => PASSOS.filter((p) => p.op === op).length;

const FASES = [
  {
    fase: 'Nasce',
    papel: 'Construtora',
    texto: 'Faz a conta existir.',
    funcoes: [{ nome: 'cb_criar', vezes: chamadas('criar') }],
  },
  {
    fase: 'Vive',
    papel: 'Modificadoras e consulta',
    texto: 'As três primeiras mudam o saldo; `cb_imprimir` só lê e mostra.',
    funcoes: [
      { nome: 'cb_depositar', vezes: chamadas('depositar') },
      { nome: 'cb_sacar', vezes: chamadas('sacar') },
      { nome: 'cb_transferir', vezes: chamadas('transferir') },
      { nome: 'cb_imprimir', vezes: chamadas('imprimir') },
    ],
  },
  {
    fase: 'Termina',
    papel: 'Destrutora',
    texto: 'Encerra a conta e devolve a memória.',
    funcoes: [{ nome: 'cb_excluir', vezes: chamadas('excluir') }],
  },
];

function Avanco() {
  return (
    <div className="flex justify-center py-1.5 text-forma @2xl:items-center @2xl:px-2 @2xl:py-0" aria-hidden="true">
      <svg viewBox="0 0 12 22" className="h-[1.375rem] w-3 @2xl:hidden" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 0v20M1.5 15 6 20.5 10.5 15" />
      </svg>
      <svg viewBox="0 0 28 12" className="hidden h-3 w-7 @2xl:block" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M0 6h26M21 1.5 26.5 6 21 10.5" />
      </svg>
    </div>
  );
}

export function CicloDeVida() {
  return (
    <figure>
      <div className="grid @2xl:grid-cols-[minmax(0,0.85fr)_auto_minmax(0,1.25fr)_auto_minmax(0,0.85fr)]">
        {FASES.map((f, i) => (
          <div key={f.fase} className="contents">
            {i > 0 && <Avanco />}
            <div className="border border-forma/45 bg-white">
              <div className="border-b border-forma/30 bg-faixa px-4 py-2.5">
                <p className="font-cond text-[1.3125rem] leading-tight font-semibold">{f.fase}</p>
                <p className="rotulo mt-0.5 text-forma">{f.papel}</p>
              </div>
              <ul className="divide-y divide-forma/20 font-mono text-[0.875rem]">
                {f.funcoes.map((fn) => (
                  <li key={fn.nome} className="flex items-baseline justify-between gap-3 px-4 py-2">
                    <span className="font-semibold">{fn.nome}</span>
                    <span className="text-tinta-2 tabular-nums">{fn.vezes}×</span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-forma/20 px-4 py-2.5 text-[0.9375rem] leading-[1.5]">{rico(f.texto)}</p>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2.5 max-w-[66ch] text-[0.9375rem] leading-[1.55] text-tinta-2">
        {rico('O número ao lado de cada função é quantas vezes o `main` enviado a chama.')}
      </figcaption>
    </figure>
  );
}

/* ---------- Tópico 12: o efeito real de cada função ---------- */

export function EfeitosDasFuncoes() {
  return (
    <ul className="border-t border-forma/45">
      {FUNCOES.map((f) => (
        <li
          key={f.nome}
          className="grid gap-x-6 gap-y-2 border-b border-forma/25 py-3.5 @2xl:grid-cols-[11rem_minmax(0,1fr)]"
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 @2xl:flex-col @2xl:items-start">
            <span className="font-mono text-[0.9375rem] font-semibold">{f.nome}</span>
            {f.visto ? <Visto /> : <Esperado />}
          </div>
          <p className="max-w-[60ch] text-[0.9375rem] leading-[1.55]">{rico(f.efeito)}</p>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Tópico 13: uma chamada desmontada, e a ficha de cada função ---------- */

function Par({
  rotuloMain,
  noMain,
  rotuloFuncao,
  naFuncao,
  nota,
  volta = false,
}: {
  rotuloMain: string;
  noMain: string;
  rotuloFuncao: string;
  naFuncao: string;
  nota: string;
  volta?: boolean;
}) {
  return (
    <li className="px-4 py-3">
      <div className="grid grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,1fr)] items-center gap-x-3">
        <div>
          <p className="rotulo text-tinta-2">{rotuloMain}</p>
          <p className="mt-0.5 font-mono text-[0.9375rem] leading-snug font-semibold [overflow-wrap:anywhere]">{noMain}</p>
        </div>
        <SetaDireita className={cn('text-forma', volta && 'rotate-180')} />
        <div>
          <p className="rotulo text-tinta-2">{rotuloFuncao}</p>
          <p className="mt-0.5 font-mono text-[0.9375rem] leading-snug font-semibold [overflow-wrap:anywhere]">
            {naFuncao}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[0.875rem] leading-snug text-tinta-2">{rico(nota)}</p>
    </li>
  );
}

export function AnatomiaChamada() {
  return (
    <figure className="border border-forma/45 bg-white">
      <div className="grid gap-px bg-forma/30 @2xl:grid-cols-2">
        <div className="bg-faixa px-4 py-3">
          <p className="rotulo text-forma">A chamada · apps/main.c, linha 9</p>
          <p className="mt-1.5 text-[0.875rem] leading-[1.6] font-semibold [overflow-wrap:anywhere]">
            <Trecho>{'c1 = cb_criar(521, 100);'}</Trecho>
          </p>
        </div>
        <div className="bg-faixa px-4 py-3">
          <p className="rotulo text-forma">A definição · src/contaBancaria.c, linha 36</p>
          <p className="mt-1.5 text-[0.875rem] leading-[1.6] font-semibold [overflow-wrap:anywhere]">
            <Trecho>{'struct ContaBancaria * cb_criar(int num, float saldoInicial)'}</Trecho>
          </p>
        </div>
      </div>
      <ul className="divide-y divide-forma/20 border-t border-forma/30">
        <Par
          rotuloMain="Argumento"
          noMain="521"
          rotuloFuncao="Parâmetro"
          naFuncao="int num"
          nota="Copiado como está: inteiro para inteiro."
        />
        <Par
          rotuloMain="Argumento"
          noMain="100"
          rotuloFuncao="Parâmetro"
          naFuncao="float saldoInicial"
          nota="O inteiro `100` é convertido para `float` na chamada e chega como 100.0."
        />
        <Par
          volta
          rotuloMain="Quem recebe"
          noMain="c1"
          rotuloFuncao="Valor devolvido"
          naFuncao="return conta;"
          nota="O endereço do bloco, do tipo `struct ContaBancaria *`, sai da função e é guardado em `c1`."
        />
      </ul>
    </figure>
  );
}

type Ficha = {
  nome: string;
  assinatura: string;
  parametros: { decl: string; desc: string }[];
  exemplo: string;
  retorno: string;
};

function FichaDeFuncao({ f }: { f: Ficha }) {
  const rotulo = 'rotulo text-forma @xl:pt-[0.35em]';
  return (
    <li className="border-b border-forma/25 py-4">
      <p className="text-[0.8125rem] leading-[1.6] [overflow-wrap:anywhere]">
        <Trecho>{f.assinatura}</Trecho>
      </p>
      <dl className="mt-3 grid gap-x-5 gap-y-1 text-[0.9375rem] leading-[1.5] @xl:grid-cols-[6.75rem_minmax(0,1fr)] @xl:gap-y-2.5">
        <dt className={rotulo}>Parâmetros</dt>
        <dd className="mb-2 @xl:mb-0">
          <ul className="space-y-1.5">
            {f.parametros.map((p) => (
              <li key={p.decl}>
                <C>{p.decl}</C> <span className="text-tinta-2">· {p.desc}</span>
              </li>
            ))}
          </ul>
        </dd>
        <dt className={rotulo}>Chamada</dt>
        <dd className="mb-2 @xl:mb-0">
          <C>{f.exemplo}</C>
        </dd>
        <dt className={rotulo}>Devolve</dt>
        <dd>{rico(f.retorno)}</dd>
      </dl>
    </li>
  );
}

export function TabelaParametros() {
  return (
    <div>
      <ul className="border-t border-forma/45">
        {FUNCOES.map((f) => (
          <FichaDeFuncao key={f.nome} f={f} />
        ))}
      </ul>
      <p className="rotulo mt-6 text-tinta-2">Biblioteca de apoio · ec_rgb_colors.h</p>
      <ul className="mt-2 border-t border-forma/45">
        {FUNCOES_EC.map((f) => (
          <FichaDeFuncao key={f.nome} f={f} />
        ))}
      </ul>
    </div>
  );
}
