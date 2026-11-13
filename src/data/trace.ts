export type ContaState =
  | { status: "inexistente" }
  | { status: "nula" }
  | { status: "liberada" }
  | { status: "ativa"; num: number; saldo: number; ops: number };

export type Tone = "pub" | "priv" | "enc" | "mem" | "ret";

export interface ConsoleLine {
  text: string;
  kind: "ok" | "err" | "info" | "warn";
}

export interface Step {
  code: string;
  action: string;
  concept: string;
  tone: Tone;
  ret: "1" | "0" | "ptr" | "vazio";
  console?: ConsoleLine[];
  snap: { c1: ContaState; c2: ContaState; cNULL: ContaState };
}

const at = (num: number, saldo: number, ops: number): ContaState => ({
  status: "ativa",
  num,
  saldo,
  ops,
});
const NU: ContaState = { status: "nula" };
const XX: ContaState = { status: "inexistente" };
const LI: ContaState = { status: "liberada" };

export const INITIAL_SNAP = { c1: NU, c2: XX, cNULL: XX };

export const BOOT_LINES: ConsoleLine[] = [
  { text: "$ gcc -g -Wall apps.c contaBancaria.c ec_rgb_colors.c -o app", kind: "info" },
  { text: "$ ./app", kind: "info" },
];

export const STEPS: Step[] = [
  {
    code: "struct ContaBancaria *c1 = NULL;",
    action:
      "main declara um ponteiro para o TAD. Repare: não existe nenhum struct com campos aqui — o apps.c só sabe que *ContaBancaria existe, porque o contaBancaria.h fez a declaração incompleta. O cliente nunca vê o layout, só a promessa das funções.",
    concept: "Interface pública",
    tone: "pub",
    ret: "vazio",
    console: [{ text: "main() iniciado — ponteiro c1 vive na pilha, heap ainda vazio", kind: "info" }],
    snap: { c1: NU, c2: XX, cNULL: XX },
  },
  {
    code: "c1 = cb_criar(521, 100);",
    action:
      "cb_criar pede ao heap: malloc(sizeof(struct ContaBancaria)) — o bloco inteiro, com numero, saldo e o log[100]. O resultado é testado: se falhasse, a mensagem em vermelho ('Memória insuficiente…') saía por ec_imprimirCor e ela devolveria NULL. Com sucesso: numero = 521, saldo = 100.",
    concept: "Alocação · malloc",
    tone: "mem",
    ret: "ptr",
    console: [{ text: "malloc → conta 521 alocada no heap (saldo inicial 100,00)", kind: "ok" }],
    snap: { c1: at(521, 100, 0), c2: XX, cNULL: XX },
  },
  {
    code: "cb_imprimir(c1);",
    action:
      "Leitura pura. A função abre a porta do TAD para relatar numero e saldo — apps.c jamais faz c1->saldo (nem poderia: o layout é secreto). É o TAD em sua forma mais literal: os dados só são acessados pelo comportamento.",
    concept: "Leitura via interface",
    tone: "pub",
    ret: "vazio",
    console: [{ text: "Conta nº 521 · saldo 100,00 · 0 operações", kind: "info" }],
    snap: { c1: at(521, 100, 0), c2: XX, cNULL: XX },
  },
  {
    code: "c2 = cb_criar(1023, 30000);",
    action:
      "Segundo bloco no heap: número 1023, saldo 30.000,00. A partir daqui, main manipula dois ponteiros válidos e um 'envenenado' — o cenário perfeito para testar as defesas da interface.",
    concept: "Alocação · malloc",
    tone: "mem",
    ret: "ptr",
    console: [{ text: "malloc → conta 1023 alocada no heap (saldo inicial 30.000,00)", kind: "ok" }],
    snap: { c1: at(521, 100, 0), c2: at(1023, 30000, 0), cNULL: XX },
  },
  {
    code: "struct ContaBancaria *cNULL = NULL;",
    action:
      "Um ponteiro que não aponta para nada — o 'cabo de teste' da aula. Nenhuma memória foi alocada; ele existe para provar que as funções se defendem de NULL sem estourar. É com ele que o encapsulamento se mostra na prática.",
    concept: "Defesa da interface",
    tone: "enc",
    ret: "vazio",
    snap: { c1: at(521, 100, 0), c2: at(1023, 30000, 0), cNULL: NU },
  },
  {
    code: "cb_depositar(c1, 100);",
    action:
      "O contrato em ação: ponteiro válido? Sim. Valor > 0? Sim. Então o saldo é atualizado, uma Operacao{DEPOSITO, 100, antes 100, depois 200} é gravada em log[pos_log] e a função devolve 1. O usuário nunca viu o log — mas ele existe.",
    concept: "Contrato · retorna 1",
    tone: "ret",
    ret: "1",
    console: [{ text: "depósito 100,00 na 521 → saldo 200,00 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 200, 1), c2: at(1023, 30000, 0), cNULL: NU },
  },
  {
    code: "cb_depositar(c2, 3000);",
    action:
      "Segundo depósito válido: 30.000,00 + 3.000,00 = 33.000,00. A cada operação, pos_log avança um lugar no log[100] — o histórico cresce junto com a conta, dentro do mesmo bloco do heap.",
    concept: "Contrato · retorna 1",
    tone: "ret",
    ret: "1",
    console: [{ text: "depósito 3.000,00 na 1023 → saldo 33.000,00 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 200, 1), c2: at(1023, 33000, 1), cNULL: NU },
  },
  {
    code: "cb_depositar(cNULL, 10);",
    action:
      "Primeiro guardião da função: conta == NULL → a operação aborta e ela devolve 0. Sem segfault, sem corrupção silenciosa: o erro vira um valor. É a interface privada defendendo o contrato público — e main sobrevive para o próximo passo.",
    concept: "Defesa da interface",
    tone: "enc",
    ret: "0",
    console: [{ text: "depósito recusado: conta NULL (retorna 0)", kind: "err" }],
    snap: { c1: at(521, 200, 1), c2: at(1023, 33000, 1), cNULL: NU },
  },
  {
    code: "cb_depositar(c2, -30);",
    action:
      "Segundo guardião: valor negativo é absurdo para um depósito → 0, saldo intacto. A regra de negócio mora na implementação (privado); o cliente só enviou um argumento e recebeu o veredito (público).",
    concept: "Regra de negócio",
    tone: "priv",
    ret: "0",
    console: [{ text: "depósito recusado: valor negativo (retorna 0)", kind: "err" }],
    snap: { c1: at(521, 200, 1), c2: at(1023, 33000, 1), cNULL: NU },
  },
  {
    code: "cb_sacar(c2, 200);",
    action:
      "Saque válido: 33.000,00 − 200,00 = 32.800,00. A Operacao SAQUE registra saldo_antes e saldo_depois — os 'antes e depois' que o slide chama de dados organizados. Devolve 1.",
    concept: "Contrato · retorna 1",
    tone: "ret",
    ret: "1",
    console: [{ text: "saque 200,00 na 1023 → saldo 32.800,00 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 200, 1), c2: at(1023, 32800, 2), cNULL: NU },
  },
  {
    code: "cb_sacar(c2, 50000);",
    action:
      "Pedir 50.000 com 32.800 no bolso: a regra saldo < valor dispara → 0, saldo intacto. O veredito 'saldo insuficiente' é da biblioteca, não do main — o cliente jamais precisou comparar float para chegar a esse ponto.",
    concept: "Regra de negócio",
    tone: "priv",
    ret: "0",
    console: [{ text: "saque recusado: saldo insuficiente (retorna 0)", kind: "err" }],
    snap: { c1: at(521, 200, 1), c2: at(1023, 32800, 2), cNULL: NU },
  },
  {
    code: "cb_transferir(c1, c2, 50);",
    action:
      "Duas contas, uma operação: 50 saem de 521 (restam 150,00) e entram em 1023 (32.850,00). São dois registros TRANSFERENCIA, e em outraConta fica o número da conta contraparte — os dados são armazenados com contexto, como a struct Operacao permite.",
    concept: "Composição de operações",
    tone: "priv",
    ret: "1",
    console: [{ text: "transferência 50,00: 521 → 1023 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 32850, 3), cNULL: NU },
  },
  {
    code: "if (!cb_transferir(c2, c1, -100)) { … }",
    action:
      "Valor negativo → 0. O ! inverte o veredito: !0 é verdadeiro, então o bloco executa — 'não foi possível efetuar a transferência!' sai em vermelho ('R') via ec_imprimirCor. O cliente reage ao contrato (1/0), nunca ao 'como'.",
    concept: "Contrato · retorna 0",
    tone: "ret",
    ret: "0",
    console: [{ text: "não foi possível efetuar a transferência! (impresso em 'R' — vermelho)", kind: "err" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 32850, 3), cNULL: NU },
  },
  {
    code: "cb_sacar(c2, 14351.89);",
    action:
      "Saque com centavos — float no mundo real: 32.850,00 − 14.351,89 = 18.498,11. Registrado no log, devolve 1. É por isso que o TAD usa float para dinheiro aqui: a essência da conta comporta valores fracionários.",
    concept: "Aritmética float",
    tone: "priv",
    ret: "1",
    console: [{ text: "saque 14.351,89 na 1023 → saldo 18.498,11 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 18498.11, 4), cNULL: NU },
  },
  {
    code: "cb_depositar(c2, 100000);",
    action:
      "O 'stresse' do float começa: 18.498,11 + 100.000,00 = 118.498,11. Cada depósito é validado, somado e logado — o log[100] comporta de sobra (MAX_OPERACOES é folga, não gargalo).",
    concept: "Aritmética float",
    tone: "priv",
    ret: "1",
    console: [{ text: "depósito 100.000,00 na 1023 → saldo 118.498,11 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 118498.11, 5), cNULL: NU },
  },
  {
    code: "cb_depositar(c2, 33333.87);",
    action: "118.498,11 + 33.333,87 = 151.831,98. Mais um registro DEPOSITO, devolve 1.",
    concept: "Aritmética float",
    tone: "priv",
    ret: "1",
    console: [{ text: "depósito 33.333,87 na 1023 → saldo 151.831,98 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 151831.98, 6), cNULL: NU },
  },
  {
    code: "cb_depositar(c2, 88111.66);",
    action: "151.831,98 + 88.111,66 = 239.943,64. A conta se aproxima do valor que o próximo saque vai exigir.",
    concept: "Aritmética float",
    tone: "priv",
    ret: "1",
    console: [{ text: "depósito 88.111,66 na 1023 → saldo 239.943,64 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 239943.64, 7), cNULL: NU },
  },
  {
    code: "cb_sacar(c2, 200000);",
    action:
      "Agora o saldo aguenta: 239.943,64 − 200.000,00 = 39.943,64. Detalhe de ouro: a MESMA chamada que falhou no passo 10 (cb_sacar(c2, 50000)) agora seria aprovada — o TAD tem estado, e o estado mudou.",
    concept: "Contrato · retorna 1",
    tone: "ret",
    ret: "1",
    console: [{ text: "saque 200.000,00 na 1023 → saldo 39.943,64 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 150, 2), c2: at(1023, 39943.64, 8), cNULL: NU },
  },
  {
    code: "cb_transferir(c2, c1, 100);",
    action:
      "100 de 1023 para 521: 39.843,64 e 250,00. Repare o saldo de c1 que ficou 'esquecido' no meio do main e reapareceu intacto: o estado vive no heap, fora do alcance (e do conhecimento) de main.",
    concept: "Composição de operações",
    tone: "priv",
    ret: "1",
    console: [{ text: "transferência 100,00: 1023 → 521 (retorna 1)", kind: "ok" }],
    snap: { c1: at(521, 250, 3), c2: at(1023, 39843.64, 9), cNULL: NU },
  },
  {
    code: "cb_transferir(cNULL, c1, 100);",
    action:
      "O ponteiro envenenado de novo: origem NULL → 0, nada se move. main ignora o retorno aqui, mas o TAD continua imune — a defesa não depende de o cliente ser cuidadoso.",
    concept: "Defesa da interface",
    tone: "enc",
    ret: "0",
    console: [{ text: "transferência ignorada: origem NULL (retorna 0)", kind: "err" }],
    snap: { c1: at(521, 250, 3), c2: at(1023, 39843.64, 9), cNULL: NU },
  },
  {
    code: "cb_imprimir(c1);",
    action:
      "Primeiro relatório final: a 521 chegou a 250,00 após 3 operações registradas (1 depósito, 1 transferência de saída, 1 de entrada). O log cumpriu seu papel em silêncio — os dados organizados do slide.",
    concept: "Leitura via interface",
    tone: "pub",
    ret: "vazio",
    console: [{ text: "Conta nº 521 · saldo 250,00 · 3 operações", kind: "info" }],
    snap: { c1: at(521, 250, 3), c2: at(1023, 39843.64, 9), cNULL: NU },
  },
  {
    code: "cb_imprimir(c2);",
    action:
      "Nove operações no log da 1023: 4 depósitos, 3 saques, 2 transferências. A essência se reporta; a implementação guarda os recibos. Nada disso seria possível se o usuário acessasse saldo diretamente.",
    concept: "Leitura via interface",
    tone: "pub",
    ret: "vazio",
    console: [{ text: "Conta nº 1023 · saldo 39.843,64 · 9 operações", kind: "info" }],
    snap: { c1: at(521, 250, 3), c2: at(1023, 39843.64, 9), cNULL: NU },
  },
  {
    code: "cb_imprimir(cNULL);",
    action:
      "A função de leitura também se defende: NULL → aviso amigável em vez de segfault. Ler não está isento do contrato — todas as portas do TAD inspecionam quem bate nelas.",
    concept: "Defesa da interface",
    tone: "enc",
    ret: "vazio",
    console: [{ text: "imprimir(NULL) → 'nada a imprimir' (sem estourar)", kind: "warn" }],
    snap: { c1: at(521, 250, 3), c2: at(1023, 39843.64, 9), cNULL: NU },
  },
  {
    code: "cb_excluir(&c1);",
    action:
      "Aí entra o ponteiro duplo: cb_excluir recebe &c1 — o endereço do ponteiro — para poder zerar o ponteiro do chamador: free(conta); *p = NULL;. O bloco inteiro (numero, saldo e log[100]) vai com um único free, porque foi alocado contíguo em cb_criar.",
    concept: "Liberação · free",
    tone: "mem",
    ret: "vazio",
    console: [{ text: "free → conta 521 liberada do heap; c1 = NULL", kind: "warn" }],
    snap: { c1: LI, c2: at(1023, 39843.64, 9), cNULL: NU },
  },
  {
    code: "cb_excluir(&c2);",
    action:
      "Mesmo ritual para a 1023: free + ponteiro zerado. Com isto o heap fica limpo — nenhum vazamento, nenhuma conta fantasma. Alocação (passos 1 e 3) e liberação (passos 23 e 24) se pareiam um a um.",
    concept: "Liberação · free",
    tone: "mem",
    ret: "vazio",
    console: [{ text: "free → conta 1023 liberada do heap; c2 = NULL", kind: "warn" }],
    snap: { c1: LI, c2: LI, cNULL: NU },
  },
  {
    code: "cb_excluir(&cNULL);",
    action:
      "cNULL nunca apontou para nada. Uma implementação cuidadosa testa *p != NULL antes do free: não há bloco a devolver, nada acontece. Excluir é idempotente — chamar 'excluir' sobre 'nada' é seguro.",
    concept: "Liberação idempotente",
    tone: "mem",
    ret: "vazio",
    console: [{ text: "cNULL já é NULL → nada a liberar", kind: "info" }],
    snap: { c1: LI, c2: LI, cNULL: NU },
  },
  {
    code: "cb_excluir(&c1);",
    action:
      "c1 já foi zerado no passo 23. O teste *p != NULL é o que impede o temido double free — corrupção de heap que um sanitizer (ASan) denunciaria na hora. main terminou como começou: sem vazamento, sem dano.",
    concept: "double free evitado",
    tone: "mem",
    ret: "vazio",
    console: [{ text: "c1 já é NULL → double free evitado", kind: "info" }],
    snap: { c1: LI, c2: LI, cNULL: NU },
  },
];

export interface MainLine {
  text: string;
  step?: number;
}

export const MAIN_LINES: MainLine[] = [
  { text: "int main()" },
  { text: "{" },
  { text: "  struct ContaBancaria *c1 = NULL;", step: 0 },
  { text: "  //ec_imprimirTodasAsCores(100);" },
  { text: "  c1 = cb_criar(521, 100);", step: 1 },
  { text: "  cb_imprimir(c1);", step: 2 },
  { text: "  struct ContaBancaria *c2 = cb_criar(1023, 30000);", step: 3 },
  { text: "  struct ContaBancaria *cNULL = NULL;", step: 4 },
  { text: "" },
  { text: "  cb_depositar(c1, 100);", step: 5 },
  { text: "  cb_depositar(c2, 3000);", step: 6 },
  { text: "  cb_depositar(cNULL, 10);", step: 7 },
  { text: "  cb_depositar(c2, -30);", step: 8 },
  { text: "  cb_sacar(c2, 200);", step: 9 },
  { text: "  cb_sacar(c2, 50000);", step: 10 },
  { text: "  cb_transferir(c1, c2, 50);", step: 11 },
  { text: "  if (!cb_transferir(c2, c1, -100))", step: 12 },
  { text: "  {" },
  { text: "    ec_imprimirCor(\"\nnão foi possível efetuar a transferência!\n\n\", \"R\");" },
  { text: "  }" },
  { text: "  cb_sacar(c2, 14351.89);", step: 13 },
  { text: "  cb_depositar(c2, 100000);", step: 14 },
  { text: "  cb_depositar(c2, 33333.87);", step: 15 },
  { text: "  cb_depositar(c2, 88111.66);", step: 16 },
  { text: "  cb_sacar(c2, 200000);", step: 17 },
  { text: "" },
  { text: "  cb_transferir(c2, c1, 100);", step: 18 },
  { text: "  cb_transferir(cNULL, c1, 100);", step: 19 },
  { text: "" },
  { text: "  cb_imprimir(c1);", step: 20 },
  { text: "  cb_imprimir(c2);", step: 21 },
  { text: "  cb_imprimir(cNULL);", step: 22 },
  { text: "" },
  { text: "  cb_excluir(&c1);", step: 23 },
  { text: "  cb_excluir(&c2);", step: 24 },
  { text: "  cb_excluir(&cNULL);", step: 25 },
  { text: "  cb_excluir(&c1);", step: 26 },
  { text: "}" },
];
