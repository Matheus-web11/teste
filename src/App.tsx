import { useEffect, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";
import CodeCard from "./components/CodeCard";
import Stepper from "./components/Stepper";

/* ------------------------------------------------------------------ */
/*  Constantes de conteúdo (código enviado)                            */
/* ------------------------------------------------------------------ */

const HEADER_CODE = `#ifndef CONTA_BANCARIA_H
#define CONTA_BANCARIA_H

struct ContaBancaria;   // decl. incompleta: o tipo existe, o layout é segredo

struct ContaBancaria * cb_criar(int num, float saldoInicial);
void cb_excluir(struct ContaBancaria **conta);
int cb_depositar(struct ContaBancaria *conta, float valor);
// retorna 1 se conseguiu depositar ou zero caso contrario
int cb_sacar(struct ContaBancaria *conta, float valor);
// retorna 1 se conseguiu sacar ou zero caso contrario
int cb_transferir(struct ContaBancaria *origem, struct ContaBancaria *destino, float valor);
// retorna 1 se conseguiu transferir ou zero caso contrario
void cb_imprimir(struct ContaBancaria *conta);

#endif`;

const SRC_CODE = `#include "contaBancaria.h"
#include "ec_rgb_colors.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#define MAX_OPERACOES 100

// tipos 100% internos — o apps.c nunca os ouve falar
enum TipoOperacao {
  NAO_DEF, CRIACAO, DEPOSITO, SAQUE, TRANSFERENCIA, EXCLUSAO
};

struct Operacao {                  // o "recibo" gravado no log
  int tipo;
  float valor;
  float saldo_antes;
  float saldo_depois;
  int outraConta;                  // em TRANSFERENCIA: a contraparte
};

// NOVO TIPO DE DADOS: a essência "conta" ganha representação
struct ContaBancaria {
  int numero;
  float saldo;
  int pos_log;
  struct Operacao log[MAX_OPERACOES];
};

// IMPLEMENTAÇÃO — o "como faz"
struct ContaBancaria * cb_criar(int num, float saldoInicial)
{
  struct ContaBancaria *conta;
  conta = (struct ContaBancaria *) malloc(sizeof(struct ContaBancaria));
  if (conta == NULL) {
    ec_imprimirCor("Memória insuficiente para alocação da conta!\\n", "RED");
    return NULL;                   // falha vira NULL, nunca estouro
  }
  conta->numero = num;
  conta->saldo = saldoInicial;
  return conta;
}`;

const BAD_CODE = `// no apps.c, alguém tenta atalho direto no "privado":
c1->saldo += 100;`;

const DIAGRAM = `pilha (main)                       heap
┌────────────┐
│ c1 ─────┐  │              ┌──────────────────────────────┐
└────────────  │              │ numero   = 521              │
                └───────────►  │ saldo    = 250,00           │
                               │ pos_log  = 3                │
                               │ log[100]= [Op|Op|Op|…]      │
                               └──────────────────────────────┘

cb_excluir(&c1):    free(conta);   *p = NULL;

┌────────────
│ c1 ······· │ ┈┈┈► (nada — bloco devolvido ao heap)
└────────────┘`;

const COMPILE_CODE = `# ── 1) Depuração — tudo junto, com símbolos para o gdb ──
gcc -g -Wall -O0 -o app apps.c contaBancaria.c ec_rgb_colors.c
gdb ./app
(gdb) break cb_sacar
(gdb) run
(gdb) print conta->saldo        # espiona o "privado" na hora do 0

# ── 2) Objetos separados — recompila só o que mudou ──
gcc -c -O0 contaBancaria.c      # gera contaBancaria.o
gcc -c -O0 ec_rgb_colors.c      # gera ec_rgb_colors.o
gcc -o app apps.c contaBancaria.o ec_rgb_colors.o

# ── 3) Biblioteca estática — o cliente vê só .h + .a ──
ar rcs libconta.a contaBancaria.o ec_rgb_colors.o
gcc -O2 -o app apps.c -L. -lconta

# ── 4) Sanitizer — caça double free e vazamentos ──
gcc -g -fsanitize=address -o app apps.c contaBancaria.c ec_rgb_colors.c
./app                           # ASan denuncia o que você deixou escapar`;

/* ------------------------------------------------------------------ */
/*  Navegação                                                          */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: "visao", num: "00", label: "Visão geral" },
  { id: "essencia", num: "01", label: "Essência" },
  { id: "publica", num: "02", label: "Interface pública" },
  { id: "privada", num: "03", label: "Interface privada" },
  { id: "encapsulamento", num: "04", label: "Encapsulamento" },
  { id: "execucao", num: "05", label: "Execução passo a passo" },
  { id: "tipos", num: "06", label: "Tipos: públicos × internos" },
  { id: "memoria", num: "07", label: "Alocar e liberar" },
  { id: "funcoes", num: "08", label: "Funções e retornos" },
  { id: "compilacao", num: "09", label: "Compilar para depurar" },
  { id: "mapa", num: "10", label: "Mapa slide → código" },
] as const;

const NAV_IDS = NAV.map((n) => n.id);

function useScrollSpy() {
  const [active, setActive] = useState<string>("visao");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return active;
}

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function TopProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setP(max > 0 ? h.scrollTop / max : 0);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-pub via-pub to-priv"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Peças de UI                                                        */
/* ------------------------------------------------------------------ */

function Section({
  id,
  num,
  title,
  slide,
  children,
}: {
  id: string;
  num: string;
  title: string;
  slide?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="reveal">
        <div className="mb-4 flex items-baseline gap-3">
          <span className="font-mono text-[13px] tabular-nums text-pub/80">{num}</span>
          <h2 className="font-display text-[24px] font-semibold tracking-tight text-fog md:text-[28px]">
            {title}
          </h2>
        </div>
        {slide && (
          <p className="mb-6 max-w-3xl rounded-lg border-l-2 border-steel/40 bg-steel/[0.04] px-4 py-2.5 text-[13px] leading-relaxed text-steel/90">
            <span className="mr-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-steel/55">
              no slide
            </span>
            {slide}
          </p>
        )}
        <div className="space-y-6">{children}</div>
      </div>
    </section>
  );
}

const CALLOUT_TONES = {
  pub: "border-pub/30 bg-pub/[0.05]",
  priv: "border-priv/30 bg-priv/[0.05]",
  mem: "border-mem/30 bg-mem/[0.05]",
  ok: "border-ok/30 bg-ok/[0.05]",
  err: "border-err/35 bg-err/[0.05]",
  steel: "border-steel/25 bg-steel/[0.04]",
} as const;

const CALLOUT_TITLE = {
  pub: "text-pub",
  priv: "text-priv",
  mem: "text-mem",
  ok: "text-ok",
  err: "text-err",
  steel: "text-steel",
} as const;

function Callout({
  tone = "steel",
  title,
  children,
}: {
  tone?: keyof typeof CALLOUT_TONES;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border p-4", CALLOUT_TONES[tone])}>
      <p className={cn("mb-1.5 font-display text-[13.5px] font-semibold", CALLOUT_TITLE[tone])}>
        {title}
      </p>
      <div className="text-[13.5px] leading-relaxed text-fog/85">{children}</div>
    </div>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-[14.5px] leading-relaxed text-fog/85">{children}</p>;
}

function Em({ children }: { children: ReactNode }) {
  return <span className="text-fog">{children}</span>;
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-ink-750 px-1.5 py-0.5 font-mono text-[12.5px] text-pub">
      {children}
    </code>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[14px] leading-relaxed text-fog/85">
      <span className="mt-[9px] h-1 w-3 shrink-0 rounded-full bg-pub/60" />
      <span>{children}</span>
    </li>
  );
}

function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-line px-3.5 py-2.5 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-dim",
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-line-soft px-3.5 py-2.5 align-top text-[13px] text-fog/85", className)}>
      {children}
    </td>
  );
}

function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-ink-900/60">
      <table className="min-w-[640px] w-full border-collapse">{children}</table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export default function App() {
  const active = useScrollSpy();
  useReveal();

  return (
    <div className="dotgrid min-h-screen">
      <TopProgress />

      {/* brilho ambiente sutil */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(560px 300px at 12% -4%, rgba(45,212,191,0.07), transparent 70%), radial-gradient(620px 340px at 96% 12%, rgba(255,180,84,0.05), transparent 70%)",
        }}
      />

      {/* topo */}
      <header className="sticky top-0 z-40 border-b border-line-soft bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-6">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-pub/40 bg-pub/10 text-pub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="font-display text-[15px] font-semibold tracking-tight text-fog">
              ContaBancaria
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">TAD em C</p>
          </div>
          <span className="ml-auto hidden rounded-full border border-line bg-ink-850 px-3 py-1 font-mono text-[11px] text-mist sm:block">
            aula · tipos abstratos de dados
          </span>
        </div>
      </header>

      <div className="relative mx-auto flex max-w-6xl gap-8 px-4 md:px-6">
        {/* navegação lateral */}
        <nav className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 self-start overflow-y-auto py-10 lg:block">
          <ul className="space-y-0.5">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
                    active === n.id
                      ? "bg-pub/10 text-pub"
                      : "text-mist hover:bg-ink-800 hover:text-fog"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10.5px] tabular-nums",
                      active === n.id ? "text-pub/80" : "text-dim group-hover:text-mist"
                    )}
                  >
                    {n.num}
                  </span>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* conteúdo */}
        <main className="min-w-0 flex-1 space-y-20 pb-24 pt-10 lg:pt-14">
          {/* ============ 00 · HERO ============ */}
          <section id="visao" className="scroll-mt-24">
            <div className="reveal">
              <p className="mb-3 font-mono text-[11.5px] uppercase tracking-[0.2em] text-pub">
                estudo de caso · código enviado × slide da aula
              </p>
              <h1 className="max-w-3xl font-display text-[34px] font-bold leading-[1.08] tracking-tight text-fog md:text-[44px]">
                O TAD <span className="text-pub">ContaBancaria</span>, lido pelos olhos do slide
              </h1>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-mist">
                Você mandou o código em C (<Code>apps.c</Code>, <Code>contaBancaria.h</Code> e{" "}
                <Code>contaBancaria.c</Code>) e a imagem da aula. Esta página cruza os dois: cada
                tópico do slide vira uma seção explicada <Em>sobre o seu código</Em> — passo a passo,
                do conceito à compilação.
              </p>

              {/* citação do slide */}
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-line bg-ink-900/70 p-4">
                  <p className="mb-2 font-display text-[14px] font-semibold text-fog">
                    Tipos abstratos de dados
                  </p>
                  <ul className="space-y-1 text-[13px] text-mist">
                    {[
                      "Essência",
                      "Interface pública",
                      "Interface privada",
                      "Especificação: o que faz?",
                      "Implementação: como faz?",
                      "Encapsulamento",
                      "Diferentes formas de compilação para diferentes cenários de depuração",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-pub/70">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-line bg-ink-900/70 p-4">
                  <p className="mb-2 font-display text-[14px] font-semibold text-fog">
                    Tipos de dados / Dados
                  </p>
                  <ul className="space-y-1 text-[13px] text-mist">
                    {[
                      "Quais tipos são públicos para o usuário e quais são internos à biblioteca?",
                      "Como ocorre a alocacao e a liberao de memoria?",
                      "Como os dados são armazenados e organizados?",
                      "Quais funções manipulam esses tipos? O que fazem?",
                      "Parâmetros, argumentos e valores retornados pelas funções?",
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="text-priv/70">•</span> {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 rounded-lg border border-steel/25 bg-steel/[0.05] px-3 py-2 text-[12px] text-steel/85">
                    <strong>Importante (como no slide):</strong> os assuntos TADs e tipos de
                    dados/dados não precisam ser apresentados de forma genérica — este estudo de caso
                    é exatamente o exemplo concreto.
                  </p>
                </div>
              </div>

              {/* os três arquivos */}
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  {
                    file: "apps.c",
                    role: "Quem usa",
                    desc: "O cliente. Sabe apenas de ponteiros e de verbos (cb_*). Nunca vê um campo da struct.",
                    cls: "border-steel/25",
                    chip: "border-steel/30 bg-steel/10 text-steel",
                  },
                  {
                    file: "contaBancaria.h",
                    role: "Interface pública",
                    desc: "A especificação — o que faz. Declara as 6 funções e o contrato de retorno 1/0.",
                    cls: "border-pub/30",
                    chip: "border-pub/30 bg-pub/10 text-pub",
                  },
                  {
                    file: "contaBancaria.c",
                    role: "Interface privada",
                    desc: "A implementação — o como faz. Layout da struct, log[100], malloc e as regras.",
                    cls: "border-priv/30",
                    chip: "border-priv/30 bg-priv/10 text-priv",
                  },
                ].map((f) => (
                  <div key={f.file} className={cn("rounded-xl border bg-ink-900/70 p-4", f.cls)}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-[13px] text-fog">{f.file}</p>
                      <span className={cn("rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", f.chip)}>
                        {f.role}
                      </span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-mist">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* legenda + números */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {[
                  ["bg-pub", "público / especificação"],
                  ["bg-priv", "privado / implementação"],
                  ["bg-mem", "memória · heap"],
                  ["bg-ok", "contrato de retorno"],
                  ["bg-steel", "encapsulamento"],
                ].map(([c, l]) => (
                  <span
                    key={l}
                    className="flex items-center gap-1.5 rounded-full border border-line bg-ink-850 px-2.5 py-1 text-[11px] text-mist"
                  >
                    <i className={cn("h-1.5 w-1.5 rounded-full", c)} /> {l}
                  </span>
                ))}
                <span className="ml-auto flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
                  <span>6 funções públicas</span>
                  <span>1 struct TAD</span>
                  <span>log c/ 100 vagas</span>
                  <span className="text-pub/80">27 passos no main</span>
                </span>
              </div>
            </div>
          </section>

          {/* ============ 01 · ESSÊNCIA ============ */}
          <Section
            id="essencia"
            num="01"
            title="Essência"
            slide="“Tipos abstratos de dados — Essência.” A essência é o conceito que o TAD representa, independente de como ele é guardado na máquina."
          >
            <P>
              A essência deste TAD é o conceito <Em>conta bancária</Em>: ela tem um{" "}
              <Code>numero</Code>, um <Code>saldo</Code> e um histórico de operações. No{" "}
              <Code>apps.c</Code>, main trata a conta exatamente assim — nunca como "um struct com
              4 membros", mas como uma entidade que <Em>aceita depósitos, sacos e transferências</Em>.
            </P>
            <Callout tone="ok" title="O teste da essência">
              Troque a <Code>struct</Code> por uma lista ligada, um vetor global ou um arquivo{" "}
              <Code>.bin</Code>: o <Code>apps.c</Code> continua idêntico, linha por linha. O que é
              público é <Em>comportamento</Em> (verbo), nunca <Em>estrutura</Em> (substantivo) — e o
              <Code> main()</Code> que você mandou é a prova: ele só empilha verbos{" "}
              <Code>cb_*</Code>.
            </Callout>
          </Section>

          {/* ============ 02 · INTERFACE PÚBLICA ============ */}
          <Section
            id="publica"
            num="02"
            title="Interface pública — especificação: o que faz?"
            slide="“Interface pública” e “Especificação: o que faz?”. O .h é o único papel que o usuário precisa: ele descreve as funções e o que cada uma promete."
          >
            <CodeCard file="contaBancaria.h" tone="pub" tag="o que faz" code={HEADER_CODE} />
            <ul className="max-w-3xl space-y-2.5">
              <Bullet>
                <Em>Linhas 1–3 e 20:</Em> o guarda de inclusão (<Code>#ifndef / #define / #endif</Code>)
                evita que o header seja processado duas vezes na mesma compilação.
              </Bullet>
              <Bullet>
                <Em>Linhas 5 — o coração do TAD:</Em> <Code>struct ContaBancaria;</Code> é uma{" "}
                <Em>declaração incompleta</Em>. O tipo existe para o compilador, mas os membros não
                — por isso <Code>sizeof</Code>, <Code>&#8658;</Code> e atribuições diretas não
                compilam no apps.c.
              </Bullet>
              <Bullet>
                Cada função é um <Em>verbo da essência</Em>. Os comentários <Code>// retorna 1 se
                conseguiu … ou zero caso contrario</Code> são a <Em>especificação</Em>: o contrato
                que o cliente pode confiar sem olhar o .c.
              </Bullet>
              <Bullet>
                <Em>Único detalhe de ponteiro na porta:</Em> <Code>cb_excluir(struct
                ContaBancaria **conta)</Code> recebe ponteiro duplo porque precisa <Em>modificar o
                próprio ponteiro do chamador</Em> (zerá-lo). As demais funções só precisam olhar
                o bloco — um ponteiro basta.
              </Bullet>
            </ul>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Função</Th>
                  <Th>Verbo da essência</Th>
                  <Th>Contrato (retorno)</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["cb_criar", "abre uma conta", "ponteiro para a conta; NULL se o malloc falhar"],
                  ["cb_excluir", "encerra a conta", "void; também zera o ponteiro do chamador (idempotente)"],
                  ["cb_depositar", "deposita", "1 se ok · 0 se conta NULL ou valor inválido"],
                  ["cb_sacar", "saca", "1 se ok · 0 se conta NULL, valor inválido ou saldo insuficiente"],
                  ["cb_transferir", "transfere", "1 se ok · 0 se origem/destino NULL, valor inválido ou saldo insuficiente"],
                  ["cb_imprimir", "relata o estado", "void; conta NULL → aviso, sem estourar"],
                ].map(([f, v, c]) => (
                  <tr key={f} className="transition-colors hover:bg-ink-850/60">
                    <Td className="font-mono text-pub">{f}</Td>
                    <Td>{v}</Td>
                    <Td>{c}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <Callout tone="pub" title="E o ec_rgb_colors.h?">
              É a <Em>segunda interface pública</Em> do projeto: uma mini-biblioteca de cores ANSI
              que expõe o verbo <Code>ec_imprimirCor(const char *texto, const char *identificador,
              ...)</Code> — uma função <Em>variádica</Em> (veja a seção 08). Mesmo raciocínio de TAD:
              só verbos no header, nenhum detalhe interno.
            </Callout>
          </Section>

          {/* ============ 03 · INTERFACE PRIVADA ============ */}
          <Section
            id="privada"
            num="03"
            title="Interface privada — implementação: como faz?"
            slide="“Interface privada” e “Implementação: como faz?”. O .c esconde o layout da struct, os tipos auxiliares e as regras de negócio."
          >
            <CodeCard file="contaBancaria.c" tone="priv" tag="como faz" code={SRC_CODE} />
            <ul className="max-w-3xl space-y-2.5">
              <Bullet>
                <Em>enum TipoOperacao + struct Operacao:</Em> tipos <Em>100% internos</Em> — o
                usuário jamais sabe que "depósito" vira <Code>DEPOSITO = 2</Code>. A struct Operacao
                é o recibo de cada movimento: valor, <Em>saldo antes, saldo depois</Em> e — no caso
                de transferência — a <Code>outraConta</Code> (a contraparte).
              </Bullet>
              <Bullet>
                <Em>struct ContaBancaria:</Em> a essência ganha corpo. <Code>numero</Code> e{" "}
                <Code>saldo</Code> (os dados) + <Code>pos_log</Code> e <Code>log[100]</Code> (o
                histórico). Tudo em <Em>um único bloco contíguo do heap</Em> — é por isso que um
                único <Code>free</Code> resolve na exclusão.
              </Bullet>
              <Bullet>
                <Em>cb_criar (o único corpo que você enviou):</Em> <Code>malloc(sizeof(struct
                ContaBancaria))</Code> → testa <Code>NULL</Code> (falha vira mensagem em vermelho
                via <Code>ec_imprimirCor(…, "RED")</Code> + retorno NULL, nunca estouro) →
                inicializa <Code>numero</Code> e <Code>saldo</Code> → devolve o ponteiro.
              </Bullet>
            </ul>
            <Callout tone="priv" title="A receita das funções de mutação">
              Reconstruída do contrato 1/0 e dos testes que o próprio <Code>main()</Code> realiza
              (pois <Code>cb_criar</Code> é o único corpo enviado): <Em>(1)</Em> checar ponteiros e
              valores; <Em>(2)</Em> aplicar a regra de negócio; <Em>(3)</Em> atualizar{" "}
              <Code>saldo</Code>; <Em>(4)</Em> gravar a <Code>Operacao</Code> em{" "}
              <Code>log[pos_log]</Code> e avançar; <Em>(5)</Em> devolver <Code>1</Code> ou{" "}
              <Code>0</Code>.
            </Callout>
          </Section>

          {/* ============ 04 · ENCAPSULAMENTO ============ */}
          <Section
            id="encapsulamento"
            num="04"
            title="Encapsulamento"
            slide="“Encapsulamento”. Os dados ficam protegidos: só as funções da interface podem tocá-los — e todas verificam antes."
          >
            <P>
              Como o apps.c <Em>não conhece os membros</Em> da struct (lembre da declaração
              incompleta na seção 02), qualquer atalho é barrado <Em>no compilador</Em> — muito
              antes de executar:
            </P>
            <div className="grid gap-4 lg:grid-cols-2">
              <CodeCard file="apps.c — tentativa de atalho" tone="app" code={BAD_CODE} />
              <Callout tone="err" title="O que o gcc responde">
                <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-err/90">
{`apps.c:7:6: error: incomplete definition of type
  'struct ContaBancaria'
c1->saldo += 100;
     ^`}
                </pre>
                <p className="mt-2 text-[12.5px] text-fog/75">
                  <Em>incomplete type</Em> — o layout é segredo de compilação. A única porta é a
                  função.
                </p>
              </Callout>
            </div>
            <P>
              Por isso o <Code>main()</Code> que você mandou é um <Em>banco de testes do
              encapsulamento</Em>: ele abre cada porta com péssimos argumentos —{" "}
              <Code>cb_depositar(cNULL, 10)</Code>, <Code>cb_depositar(c2, -30)</Code>,{" "}
              <Code>cb_sacar(c2, 50000)</Code>, <Code>cb_transferir(c2, c1, -100)</Code> — e nenhuma
              derruba o programa. O saldo nunca fica inconsistente, todo movimento vira registro no
              log, e as falhas viram <Em>valores de retorno</Em>, não exceções.
            </P>
          </Section>

          {/* ============ 05 · EXECUÇÃO ============ */}
          <Section
            id="execucao"
            num="05"
            title="Execução passo a passo do main()"
            slide="Cenário prático da aula: os dados armazenados, as funções manipulando e os retornos 1/0 — agora em tempo real. Aperte Iniciar (ou use ← → no teclado)."
          >
            <Stepper />
          </Section>

          {/* ============ 06 · TIPOS ============ */}
          <Section
            id="tipos"
            num="06"
            title="Tipos de dados: públicos × internos"
            slide="“Quais são os tipos de dados disponibilizados ao usuário e quais são internos à biblioteca?” e “Como os dados são armazenados e organizados?”"
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-pub/25 bg-pub/[0.04] p-4">
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-pub">
                  públicos · o que o apps.c enxerga
                </p>
                <ul className="space-y-2 text-[13.5px] text-fog/85">
                  <li>
                    <Code>struct ContaBancaria *</Code> — o TAD, <Em>opaco</Em> (só verbos)
                  </li>
                  <li>
                    <Code>int</Code> — número da conta (<Code>521</Code>, <Code>1023</Code>)
                  </li>
                  <li>
                    <Code>float</Code> — saldos e valores (<Code>100</Code>, <Code>30000</Code>,{" "}
                    <Code>14351.89</Code>)
                  </li>
                  <li>
                    <Code>const char *</Code> — mensagens e identificadores de cor do ec
                  </li>
                  <li>
                    <Code>unsigned int</Code> — milisegundos do{" "}
                    <Code>ec_imprimirTodasAsCores(100)</Code>
                  </li>
                </ul>
              </div>
              <div className="rounded-xl border border-priv/25 bg-priv/[0.04] p-4">
                <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-priv">
                  internos · só o contaBancaria.c conhece
                </p>
                <ul className="space-y-2 text-[13.5px] text-fog/85">
                  <li>
                    <Code>struct ContaBancaria</Code> <Em>completa</Em> — numero, saldo, pos_log, log
                  </li>
                  <li>
                    <Code>struct Operacao</Code> — o recibo (valor, antes/depois, outraConta)
                  </li>
                  <li>
                    <Code>enum TipoOperacao</Code> — CRIACAO…EXCLUSAO como inteiros
                  </li>
                  <li>
                    <Code>#define MAX_OPERACOES 100</Code> — a capacidade do histórico
                  </li>
                </ul>
              </div>
            </div>
            <P>
              <Em>Como os dados são armazenados e organizados?</Em> A conta é{" "}
              <Em>um bloco único e contíguo no heap</Em>: os dados da essência na frente e o
              histórico logo atrás, num vetor fixo de 100 recibos. <Code>pos_log</Code> avança a
              cada operação aprovada — o histórico <Em>viaja junto com a conta</Em> (um{" "}
              <Code>free</Code> devolve tudo) e cada recibo guarda o saldo antes e depois: snapshots
              perfeitamente organizados para auditoria.
            </P>
            <Callout tone="steel" title="Regra de ouro da aula">
              O usuário enxerga os tipos <Em>pelos verbos que aceitam</Em> (ponteiro opaco, int,
              float), nunca pelos substantivos internos (Operacao, TipoOperacao). Se um dia o log
              vira lista ligada, nenhum argumento do apps.c muda.
            </Callout>
          </Section>

          {/* ============ 07 · MEMÓRIA ============ */}
          <Section
            id="memoria"
            num="07"
            title="Alocacao e liberao de memoria"
            slide="“Como ocorre a alocacao e a liberao de memoria para as variaveis desses tipos?” malloc em cb_criar, free em cb_excluir — e o famoso ponteiro duplo."
          >
            <ul className="max-w-3xl space-y-2.5">
              <Bullet>
                <Em>Alocar (cb_criar):</Em> <Code>malloc(sizeof(struct ContaBancaria))</Code>
                reserva <Em>todo o bloco de uma vez</Em> — numero, saldo, pos_log e as 100 Operacoes.
                Falhou? <Code>if (conta == NULL)</Code> → mensagem em <Em>vermelho</Em>{" "}
                (<Code>"RED"</Code>) e retorno <Code>NULL</Code>: o contrato avisa o cliente ao
                invés de estourar.
              </Bullet>
              <Bullet>
                <Em>Liberar (cb_excluir):</Em> <Code>free(conta)</Code> devolve o bloco inteiro.
                Como <Code>**conta</Code>, a função ainda executa <Code>*p = NULL</Code> — zerando o
                ponteiro <Em>dentro do main</Em>, que é o dono dele. Sem isso, <Code>c1</Code>{" "}
                continuaria apontando para memória morta (<Em>dangling pointer</Em>).
              </Bullet>
              <Bullet>
                <Em>O par perfeito do seu main:</Em> 2 <Code>malloc</Code> (passos 1 e 3 do
                simulador) ↔ 2 <Code>free</Code> (passos 23 e 24). As chamadas 25 e 26 são
                inócuas por causa do teste <Code>*p != NULL</Code> — é isso que impede o{" "}
                <Em>double free</Em>.
              </Bullet>
            </ul>
            <CodeCard file="diagrama — pilha × heap" tone="mem" tag="memória" code={DIAGRAM} plain />
          </Section>

          {/* ============ 08 · FUNÇÕES ============ */}
          <Section
            id="funcoes"
            num="08"
            title="Funções: parâmetros, argumentos e retornos"
            slide="“Quais funções manipulam esses tipos de dados? O que essas funções realmente fazem? Parâmetros, argumentos e valores retornados pelas funções?”"
          >
            <TableWrap>
              <thead>
                <tr>
                  <Th>Função</Th>
                  <Th>Parâmetros (assinatura)</Th>
                  <Th>Argumentos no main</Th>
                  <Th>Retorna</Th>
                  <Th>Quando falha (0 / NULL)</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "cb_criar",
                    "int num, float saldoInicial",
                    "(521, 100) · (1023, 30000)",
                    "struct ContaBancaria *",
                    "malloc == NULL",
                  ],
                  [
                    "cb_excluir",
                    "struct ContaBancaria **conta",
                    "(&c1) · (&c2) · (&cNULL)",
                    "void",
                    "já NULL → não faz nada",
                  ],
                  [
                    "cb_depositar",
                    "struct ContaBancaria *conta, float valor",
                    "(c1, 100) · (cNULL, 10) · (c2, -30)",
                    "int (1/0)",
                    "conta NULL · valor ≤ 0",
                  ],
                  [
                    "cb_sacar",
                    "struct ContaBancaria *conta, float valor",
                    "(c2, 200) · (c2, 50000) · (c2, 200000)",
                    "int (1/0)",
                    "NULL · valor ≤ 0 · saldo < valor",
                  ],
                  [
                    "cb_transferir",
                    "*origem, *destino, float valor",
                    "(c1, c2, 50) · (c2, c1, -100) · (cNULL, c1, 100)",
                    "int (1/0)",
                    "qualquer NULL · valor ≤ 0 · saldo insuficiente",
                  ],
                  [
                    "cb_imprimir",
                    "struct ContaBancaria *conta",
                    "(c1) · (c2) · (cNULL)",
                    "void",
                    "NULL → aviso",
                  ],
                ].map((r) => (
                  <tr key={r[0] as string} className="transition-colors hover:bg-ink-850/60">
                    <Td className="whitespace-nowrap font-mono text-pub">{r[0]}</Td>
                    <Td className="font-mono text-[12px] text-priv/90">{r[1]}</Td>
                    <Td className="font-mono text-[12px]">{r[2]}</Td>
                    <Td className="font-mono text-[12px] text-steel">{r[3]}</Td>
                    <Td>{r[4]}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div className="grid gap-4 lg:grid-cols-2">
              <Callout tone="ok" title="O ! que decide a mensagem">
                <p>
                  <Code>if (!cb_transferir(c2, c1, -100))</Code>: a função devolve{" "}
                  <Code>0</Code>; o <Code>!</Code> inverte (<Code>!0 == 1</Code>); o bloco executa
                  e o texto sai em vermelho (<Code>"R"</Code>). O contrato 1/0 é o{" "}
                  <Em>protocolo de comunicação</Em> entre cliente e TAD — main não precisa saber{" "}
                  <Em>por que</Em> falhou, só <Em>que</Em> falhou.
                </p>
              </Callout>
              <Callout tone="pub" title="Variádica no ec_rgb_colors">
                <p>
                  <Code>ec_imprimirCor(const char *texto, const char *identificador, ...)</Code>{" "}
                  aceita um <Em>número indefinido de argumentos</Em>, como <Code>printf</Code>: os
                  extras dependem do identificador (formato da cor). No seu main aparecem os
                  identidores <Code>"R"</Code> e <Code>"RED"</Code> — mesma porta, rótulos
                  equivalentes.
                </p>
              </Callout>
            </div>
          </Section>

          {/* ============ 09 · COMPILAÇÃO ============ */}
          <Section
            id="compilacao"
            num="09"
            title="Diferentes formas de compilação, diferentes depurações"
            slide="“Diferentes formas de compilação para diferentes cenários de depuração.” Do gdb ao sanitizer — cada cenário pede uma bandeira."
          >
            <CodeCard file="terminal — 4 cenários" tone="sh" tag="build" code={COMPILE_CODE} plain />
            <ul className="max-w-3xl space-y-2.5">
              <Bullet>
                <Em>Cenário 1 (debug):</Em> <Code>-g -O0</Code> mantém símbolos e o código sem
                otimização — o <Code>gdb</Code> para dentro do <Code>cb_sacar</Code> e{" "}
                <Code>print conta-&gt;saldo</Code> deixa você <Em>espionar o privado</Em> na hora
                exata em que o retorno vira 0.
              </Bullet>
              <Bullet>
                <Em>Cenário 2 (incremental):</Em> <Code>gcc -c</Code> gera objetos; se você só
                mudou o <Code>contaBancaria.c</Code>, recompila-se só ele e religa. É a separação
                física da interface: cada .c é uma unidade.
              </Bullet>
              <Bullet>
                <Em>Cenário 3 (biblioteca):</Em> o cliente entrega apenas <Code>contaBancaria.h</Code>{" "}
                + <Code>libconta.a</Code>. Compilar o apps.c usa <Em>só a especificação</Em>; a
                implementação entra no link (<Code>-lconta</Code>). Em produção, <Code>-O2</Code>{" "}
                troca o conforto do debug por velocidade.
              </Bullet>
              <Bullet>
                <Em>Cenário 4 (ASan):</Em> <Code>-fsanitize=address</Code> é a rede de segurança do
                TAD em C — denunciaria na hora um <Em>double free</Em> (passo 26) ou uma conta
                criada sem <Code>cb_excluir</Code> (vazamento).
              </Bullet>
            </ul>
          </Section>

          {/* ============ 10 · MAPA ============ */}
          <Section
            id="mapa"
            num="10"
            title="Mapa: cada linha do slide, no seu código"
            slide="Fechamento — onde cada tópico da imagem mora no projeto que você enviou."
          >
            <TableWrap>
              <thead>
                <tr>
                  <Th>Tópico do slide</Th>
                  <Th>Onde está no código</Th>
                  <Th>Seção</Th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Essência",
                    "O conceito 'conta' manipulado apenas por verbos cb_* no apps.c",
                    "01",
                  ],
                  [
                    "Interface pública",
                    "contaBancaria.h — 6 declarações + guarda de inclusão",
                    "02",
                  ],
                  [
                    "Interface privada",
                    "contaBancaria.c — struct completa, Operacao, enum, corpo de cb_criar",
                    "03",
                  ],
                  [
                    "Especificação: o que faz?",
                    "Os comentários 'retorna 1 se conseguiu … ou zero caso contrario'",
                    "02",
                  ],
                  [
                    "Implementação: como faz?",
                    "malloc → teste NULL → inicialização, dentro de cb_criar",
                    "03",
                  ],
                  [
                    "Encapsulamento",
                    "Declaração incompleta 'struct ContaBancaria;' — atalhos nem compilam",
                    "04",
                  ],
                  [
                    "Tipos públicos × internos",
                    "Público: *ContaBancaria opaco, int, float · Interno: Operacao, TipoOperacao, MAX_OPERACOES",
                    "06",
                  ],
                  [
                    "Alocacao e liberao de memória",
                    "malloc em cb_criar · free + *p = NULL em cb_excluir (**)",
                    "07",
                  ],
                  [
                    "Dados armazenados e organizados",
                    "Bloco contíguo no heap; log[100] com pos_log e saldo antes/depois",
                    "06",
                  ],
                  [
                    "Funções, parâmetros, argumentos, retornos",
                    "As 6 cb_* com contrato 1/0 — tabela completa + main como banco de testes",
                    "05 e 08",
                  ],
                  [
                    "Compilação p/ cenários de depuração",
                    "gcc -g + gdb · -c objetos · ar rcs + -lconta · -fsanitize=address",
                    "09",
                  ],
                  [
                    "“Importante: os assuntos TADs e tipos de dados/dados não precisam ser apresentados… (sic, texto cortado no slide)”",
                    "Esta página: a apresentação feita sobre código real, sem teoria genérica",
                    "tudo",
                  ],
                ].map((r) => (
                  <tr key={r[1] as string} className="transition-colors hover:bg-ink-850/60">
                    <Td className="min-w-[220px] font-medium text-fog">{r[0]}</Td>
                    <Td>{r[1]}</Td>
                    <Td className="font-mono text-pub/80">{r[2]}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Section>

          {/* rodapé */}
          <footer className="reveal border-t border-line-soft pt-8">
            <div className="flex flex-col gap-3 text-[12.5px] text-dim sm:flex-row sm:items-center">
              <p className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-pub/40 bg-pub/10 text-pub">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6" />
                  </svg>
                </span>
                Estudo de caso montado sobre o código enviado — C, ponteiros, heap e TADs.
              </p>
              <p className="sm:ml-auto font-mono text-[11px]">
                dica: <span className="text-mist">←</span> <span className="text-mist">→</span>{" "}
                navegam no simulador · console é ilustrativo
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
