/* As seis funções do TAD, descritas uma vez e usadas nos tópicos 4, 11, 12 e 13.
   "visto" indica se o corpo da função estava no código enviado. */

export type Papel = 'construtora' | 'modificadora' | 'consulta' | 'destrutora';

export type Funcao = {
  nome: string;
  assinatura: string;
  papel: Papel;
  visto: boolean;
  /* tópico 4: o que o .h promete */
  oQueFaz: string;
  devolve: string;
  /* tópico 12: o efeito real sobre os dados */
  efeito: string;
  /* tópico 13 */
  parametros: { decl: string; desc: string }[];
  exemplo: string;
  retorno: string;
};

const CONTA = 'struct ContaBancaria *conta';

export const FUNCOES: Funcao[] = [
  {
    nome: 'cb_criar',
    assinatura: 'struct ContaBancaria * cb_criar(int num, float saldoInicial);',
    papel: 'construtora',
    visto: true,
    oQueFaz: 'Cria uma conta com o número e o saldo inicial informados.',
    devolve: 'Um ponteiro para a conta criada.',
    efeito:
      'Reserva um bloco de 2012 bytes no heap, grava `numero` e `saldo` e devolve o endereço — ou avisa em vermelho e devolve `NULL` se faltar memória.',
    parametros: [
      { decl: 'int num', desc: 'número da conta' },
      { decl: 'float saldoInicial', desc: 'saldo com que a conta nasce' },
    ],
    exemplo: 'c1 = cb_criar(521, 100);',
    retorno: '`struct ContaBancaria *`: o endereço da conta nova, ou `NULL` se `malloc` falhar.',
  },
  {
    nome: 'cb_depositar',
    assinatura: 'int cb_depositar(struct ContaBancaria *conta, float valor);',
    papel: 'modificadora',
    visto: false,
    oQueFaz: 'Deposita o valor na conta.',
    devolve: '1 se conseguiu depositar, 0 caso contrário.',
    efeito:
      'Confere se a conta existe e se o valor é positivo; soma o valor ao saldo e devolve 1. Se algo não confere, não altera nada e devolve 0.',
    parametros: [
      { decl: CONTA, desc: 'conta que recebe o depósito' },
      { decl: 'float valor', desc: 'quanto depositar' },
    ],
    exemplo: 'cb_depositar(c2, 3000);',
    retorno: '`int`: 1 se depositou, 0 se não.',
  },
  {
    nome: 'cb_sacar',
    assinatura: 'int cb_sacar(struct ContaBancaria *conta, float valor);',
    papel: 'modificadora',
    visto: false,
    oQueFaz: 'Saca o valor da conta.',
    devolve: '1 se conseguiu sacar, 0 caso contrário.',
    efeito: 'Mesmo roteiro do depósito, subtraindo — e recusando também o saque maior que o saldo.',
    parametros: [
      { decl: CONTA, desc: 'conta de onde o dinheiro sai' },
      { decl: 'float valor', desc: 'quanto sacar' },
    ],
    exemplo: 'cb_sacar(c2, 200);',
    retorno: '`int`: 1 se sacou, 0 se não.',
  },
  {
    nome: 'cb_transferir',
    assinatura: 'int cb_transferir(struct ContaBancaria *origem, struct ContaBancaria *destino, float valor);',
    papel: 'modificadora',
    visto: false,
    oQueFaz: 'Transfere o valor da conta de origem para a de destino.',
    devolve: '1 se conseguiu transferir, 0 caso contrário.',
    efeito:
      'Tira o valor da origem e põe no destino. Só vale se as duas contas existem, o valor é positivo e a origem tem saldo; caso contrário, nenhuma das duas muda.',
    parametros: [
      { decl: 'struct ContaBancaria *origem', desc: 'conta que perde o valor' },
      { decl: 'struct ContaBancaria *destino', desc: 'conta que recebe o valor' },
      { decl: 'float valor', desc: 'quanto transferir' },
    ],
    exemplo: 'cb_transferir(c1, c2, 50);',
    retorno: '`int`: 1 se transferiu, 0 se não.',
  },
  {
    nome: 'cb_imprimir',
    assinatura: 'void cb_imprimir (struct ContaBancaria *conta);',
    papel: 'consulta',
    visto: false,
    oQueFaz: 'Imprime a conta.',
    devolve: 'Nada: a função é `void`.',
    efeito:
      'Mostra a conta na tela sem alterar nada. Precisa tratar conta `NULL`, caso que a linha 37 do `main` testa.',
    parametros: [{ decl: CONTA, desc: 'conta a mostrar' }],
    exemplo: 'cb_imprimir(c1);',
    retorno: '`void`: o resultado é o texto na tela.',
  },
  {
    nome: 'cb_excluir',
    assinatura: 'void cb_excluir(struct ContaBancaria **conta);',
    papel: 'destrutora',
    visto: false,
    oQueFaz: 'Exclui a conta.',
    devolve: 'Nada: a função é `void`.',
    efeito:
      'Libera o bloco com `free` e grava `NULL` no ponteiro do `main`, para que ele não fique guardando um endereço morto.',
    parametros: [{ decl: 'struct ContaBancaria **conta', desc: 'endereço do ponteiro que guarda a conta' }],
    exemplo: 'cb_excluir(&c1);',
    retorno: '`void`: o efeito aparece no próprio ponteiro, que volta `NULL`.',
  },
];

/* As duas funções da biblioteca de apoio, só para o tópico 13. */
export const FUNCOES_EC = [
  {
    nome: 'ec_imprimirCor',
    assinatura: 'void ec_imprimirCor(const char *texto, const char *identificador, ...);',
    parametros: [
      { decl: 'const char *texto', desc: 'o texto a imprimir' },
      { decl: 'const char *identificador', desc: 'a cor; o código usa "RED" e "R"' },
      { decl: '...', desc: 'argumentos extras, em número variável' },
    ],
    exemplo: 'ec_imprimirCor("Memória insuficiente para alocação da conta!\\n", "RED");',
    retorno: '`void`. Quais identificadores de cor valem está em `ec_rgb_colors.c`, que não veio.',
  },
  {
    nome: 'ec_imprimirTodasAsCores',
    assinatura: 'void ec_imprimirTodasAsCores(unsigned int milisegundos);',
    parametros: [{ decl: 'unsigned int milisegundos', desc: 'um tempo em milissegundos; o cabeçalho não detalha' }],
    exemplo: '//ec_imprimirTodasAsCores(100);',
    retorno: '`void`. No `main` a chamada está comentada (linha 8).',
  },
];
