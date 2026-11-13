/* As 27 instruções do main, uma a uma, e uma simulação do que cada uma faz.

   cb_criar está no código enviado. Para as outras funções, a simulação usa as
   regras que o cabeçalho e o próprio main deixam esperar:
   conta NULL falha, valor não positivo falha, saque maior que o saldo falha.
   Os saldos são somados em centavos inteiros e batem com o que o programa
   imprime com duas casas (conferido compilando o código com gcc). */

export type Ponteiro = 'c1' | 'c2' | 'cNULL';
export type Op = 'declarar' | 'criar' | 'imprimir' | 'depositar' | 'sacar' | 'transferir' | 'excluir';

export type Passo = {
  linhas: [number, number];
  op: Op;
  alvo: Ponteiro;
  destino?: Ponteiro;
  numero?: number;
  /* o valor como está escrito no main.c */
  valor?: string;
  nota: string;
};

export const PASSOS: Passo[] = [
  {
    linhas: [7, 7],
    op: 'declarar',
    alvo: 'c1',
    nota: 'Cria no `main` uma variável ponteiro, ainda sem conta. É tudo o que o `main` consegue declarar: ponteiros para o tipo, nunca a struct em si.',
  },
  {
    linhas: [9, 9],
    op: 'criar',
    alvo: 'c1',
    numero: 521,
    valor: '100',
    nota: '`cb_criar` reserva 2012 bytes no heap, grava o número 521 e o saldo 100.00 e devolve o endereço do bloco, que fica guardado em `c1`.',
  },
  {
    linhas: [10, 10],
    op: 'imprimir',
    alvo: 'c1',
    nota: 'Mostra a conta 521 na tela. O formato do texto está no corpo da função, que não veio; o saldo neste ponto é 100.00.',
  },
  {
    linhas: [11, 11],
    op: 'criar',
    alvo: 'c2',
    numero: 1023,
    valor: '30000',
    nota: 'Segunda conta, declarada e criada na mesma linha: número 1023, saldo 30000.00, em outro bloco do heap.',
  },
  {
    linhas: [12, 12],
    op: 'declarar',
    alvo: 'cNULL',
    nota: 'Um ponteiro que fica em `NULL` de propósito. Serve para testar como cada função reage ao receber uma conta que não existe.',
  },
  {
    linhas: [14, 14],
    op: 'depositar',
    alvo: 'c1',
    valor: '100',
    nota: 'Depósito comum: soma 100.00 ao saldo da conta 521.',
  },
  {
    linhas: [15, 15],
    op: 'depositar',
    alvo: 'c2',
    valor: '3000',
    nota: 'Outro depósito válido, agora na conta 1023.',
  },
  {
    linhas: [16, 16],
    op: 'depositar',
    alvo: 'cNULL',
    valor: '10',
    nota: 'Teste de conta inexistente. A função precisa perceber o `NULL` antes de tocar em `conta->saldo`; sem esse cuidado o programa cai.',
  },
  {
    linhas: [17, 17],
    op: 'depositar',
    alvo: 'c2',
    valor: '-30',
    nota: 'Teste de valor negativo. Aceitar seria fazer um saque disfarçado de depósito, então o saldo de `c2` fica como estava.',
  },
  {
    linhas: [18, 18],
    op: 'sacar',
    alvo: 'c2',
    valor: '200',
    nota: 'Saque comum: 200.00 saem da conta 1023.',
  },
  {
    linhas: [19, 19],
    op: 'sacar',
    alvo: 'c2',
    valor: '50000',
    nota: 'Teste de saldo insuficiente: a conta tem 32800.00 e o pedido é de 50000.00. Nada é retirado.',
  },
  {
    linhas: [20, 20],
    op: 'transferir',
    alvo: 'c1',
    destino: 'c2',
    valor: '50',
    nota: 'Transferência válida: 50.00 saem da conta 521 (origem) e entram na 1023 (destino). É a única função que altera duas contas de uma vez.',
  },
  {
    linhas: [21, 24],
    op: 'transferir',
    alvo: 'c2',
    destino: 'c1',
    valor: '-100',
    nota: 'Teste de valor negativo na transferência. A função devolve 0; `!0` é verdadeiro, então o `main` entra no `if` e imprime em vermelho “não foi possível efetuar a transferência!”. É o único ponto em que o `main` usa o valor devolvido.',
  },
  {
    linhas: [26, 26],
    op: 'sacar',
    alvo: 'c2',
    valor: '14351.89',
    nota: 'Primeiro valor com centavos. O literal é `double`, mas o parâmetro é `float`: o valor entra como 14351.8896484375, o `float` mais próximo de 14351.89.',
  },
  {
    linhas: [27, 27],
    op: 'depositar',
    alvo: 'c2',
    valor: '100000',
    nota: 'Depósito grande: o saldo de `c2` passa dos cem mil.',
  },
  {
    linhas: [28, 28],
    op: 'depositar',
    alvo: 'c2',
    valor: '33333.87',
    nota: 'Mais um valor com centavos somado a um saldo alto, combinação que encosta no limite de precisão do `float`.',
  },
  {
    linhas: [29, 29],
    op: 'depositar',
    alvo: 'c2',
    valor: '88111.66',
    nota: 'O saldo chega a 239943.64. Dentro do `float` o valor guardado é 239943.640625; impresso com duas casas, aparece certo.',
  },
  {
    linhas: [30, 30],
    op: 'sacar',
    alvo: 'c2',
    valor: '200000',
    nota: 'Saque grande, mas dentro do saldo: é aceito.',
  },
  {
    linhas: [32, 32],
    op: 'transferir',
    alvo: 'c2',
    destino: 'c1',
    valor: '100',
    nota: 'Transferência no sentido contrário: agora `c2` é a origem e `c1` o destino.',
  },
  {
    linhas: [33, 33],
    op: 'transferir',
    alvo: 'cNULL',
    destino: 'c1',
    valor: '100',
    nota: 'Teste de origem inexistente: não há conta de onde o dinheiro possa sair, então a conta 521 não recebe nada.',
  },
  {
    linhas: [35, 35],
    op: 'imprimir',
    alvo: 'c1',
    nota: 'Mostra a conta 521 com o saldo final, 250.00.',
  },
  {
    linhas: [36, 36],
    op: 'imprimir',
    alvo: 'c2',
    nota: 'Mostra a conta 1023 com o saldo final, 39843.64.',
  },
  {
    linhas: [37, 37],
    op: 'imprimir',
    alvo: 'cNULL',
    nota: 'Teste de impressão sem conta. A função precisa avisar em vez de tentar ler campos de um endereço nulo.',
  },
  {
    linhas: [39, 39],
    op: 'excluir',
    alvo: 'c1',
    nota: 'Passa o endereço do ponteiro `c1`. A função libera o bloco da conta 521 e grava `NULL` em `c1`.',
  },
  {
    linhas: [40, 40],
    op: 'excluir',
    alvo: 'c2',
    nota: 'O mesmo para a conta 1023. Daqui em diante não sobra nenhum bloco de conta no heap.',
  },
  {
    linhas: [41, 41],
    op: 'excluir',
    alvo: 'cNULL',
    nota: 'Teste de exclusão sem conta: `cNULL` sempre foi `NULL`.',
  },
  {
    linhas: [42, 42],
    op: 'excluir',
    alvo: 'c1',
    nota: 'Teste de exclusão repetida. Só é inofensiva porque a linha 39 deixou `c1` em `NULL`; sem isso, seria um segundo `free` no mesmo bloco.',
  },
];

export type EstadoPonteiro =
  | { tipo: 'nao-declarado' }
  | { tipo: 'null' }
  | { tipo: 'conta'; numero: number; centavos: number };

export type Retorno = 'declaracao' | 'endereco' | 'void' | 'um' | 'zero';

export type Quadro = {
  retorno: Retorno;
  /* por que a função recusou ou não fez nada; null quando fez o trabalho normal */
  motivo: string | null;
  /* true: o comportamento está no código enviado; false: é o esperado pelo .h */
  visto: boolean;
  args: { arg: string; param: string; nota: string }[];
  ponteiros: Record<Ponteiro, EstadoPonteiro>;
  mudou: Ponteiro[];
  deltas: Partial<Record<Ponteiro, number>>;
  liberada: Partial<Record<Ponteiro, number>>;
};

export const PONTEIROS: Ponteiro[] = ['c1', 'c2', 'cNULL'];

export const dinheiro = (centavos: number) => (centavos / 100).toFixed(2);
export const variacao = (centavos: number) => (centavos > 0 ? '+' : '') + dinheiro(centavos);

const emCentavos = (literal?: string) => Math.round(parseFloat(literal ?? '0') * 100);
const conversao = (literal: string) =>
  literal.includes('.') ? 'double convertido para float' : 'int convertido para float';

export function simular(passos: Passo[]): Quadro[] {
  /* undefined: ainda não declarado · null: NULL · número: aponta para a conta com esse número */
  const ptr: Record<Ponteiro, number | null | undefined> = { c1: undefined, c2: undefined, cNULL: undefined };
  const saldos = new Map<number, number>();

  const apontaPara = (nome: Ponteiro) => {
    const v = ptr[nome];
    return typeof v === 'number' ? `endereço da conta ${v}` : 'NULL, nenhuma conta';
  };

  const retrato = (): Record<Ponteiro, EstadoPonteiro> => {
    const r = {} as Record<Ponteiro, EstadoPonteiro>;
    for (const nome of PONTEIROS) {
      const v = ptr[nome];
      if (v === undefined) r[nome] = { tipo: 'nao-declarado' };
      else if (v === null) r[nome] = { tipo: 'null' };
      else r[nome] = { tipo: 'conta', numero: v, centavos: saldos.get(v) ?? 0 };
    }
    return r;
  };

  return passos.map((p) => {
    const q: Quadro = {
      retorno: 'void',
      motivo: null,
      visto: false,
      args: [],
      ponteiros: retrato(),
      mudou: [],
      deltas: {},
      liberada: {},
    };
    const v = emCentavos(p.valor);
    const conta = ptr[p.alvo];
    const argValor = (param: string) => ({
      arg: p.valor ?? '',
      param,
      nota: `${dinheiro(v)}, ${conversao(p.valor ?? '')}`,
    });

    switch (p.op) {
      case 'declarar': {
        ptr[p.alvo] = null;
        q.retorno = 'declaracao';
        q.visto = true;
        q.mudou.push(p.alvo);
        break;
      }
      case 'criar': {
        const numero = p.numero ?? 0;
        saldos.set(numero, v);
        ptr[p.alvo] = numero;
        q.retorno = 'endereco';
        q.visto = true;
        q.mudou.push(p.alvo);
        q.args = [{ arg: String(numero), param: 'num', nota: 'número da conta' }, argValor('saldoInicial')];
        break;
      }
      case 'imprimir': {
        q.args = [{ arg: p.alvo, param: 'conta', nota: apontaPara(p.alvo) }];
        if (typeof conta !== 'number') q.motivo = 'Não há conta para mostrar.';
        break;
      }
      case 'depositar':
      case 'sacar': {
        q.args = [{ arg: p.alvo, param: 'conta', nota: apontaPara(p.alvo) }, argValor('valor')];
        q.retorno = 'zero';
        if (typeof conta !== 'number') {
          q.motivo = 'A conta não existe: o ponteiro recebido é `NULL`.';
          break;
        }
        if (v <= 0) {
          q.motivo = 'O valor não é positivo.';
          break;
        }
        const atual = saldos.get(conta) ?? 0;
        if (p.op === 'sacar' && v > atual) {
          q.motivo = `O saldo, ${dinheiro(atual)}, é menor que o valor pedido.`;
          break;
        }
        const delta = p.op === 'depositar' ? v : -v;
        saldos.set(conta, atual + delta);
        q.retorno = 'um';
        q.mudou.push(p.alvo);
        q.deltas[p.alvo] = delta;
        break;
      }
      case 'transferir': {
        const nomeDestino = p.destino ?? p.alvo;
        const destino = ptr[nomeDestino];
        q.args = [
          { arg: p.alvo, param: 'origem', nota: apontaPara(p.alvo) },
          { arg: nomeDestino, param: 'destino', nota: apontaPara(nomeDestino) },
          argValor('valor'),
        ];
        q.retorno = 'zero';
        if (typeof conta !== 'number') {
          q.motivo = 'A conta de origem não existe: o ponteiro recebido é `NULL`.';
          break;
        }
        if (typeof destino !== 'number') {
          q.motivo = 'A conta de destino não existe: o ponteiro recebido é `NULL`.';
          break;
        }
        if (v <= 0) {
          q.motivo = 'O valor não é positivo.';
          break;
        }
        const atual = saldos.get(conta) ?? 0;
        if (v > atual) {
          q.motivo = `O saldo da origem, ${dinheiro(atual)}, é menor que o valor pedido.`;
          break;
        }
        saldos.set(conta, atual - v);
        saldos.set(destino, (saldos.get(destino) ?? 0) + v);
        q.retorno = 'um';
        q.mudou.push(p.alvo, nomeDestino);
        q.deltas[p.alvo] = -v;
        q.deltas[nomeDestino] = v;
        break;
      }
      case 'excluir': {
        q.args = [{ arg: `&${p.alvo}`, param: 'conta', nota: `endereço da variável ${p.alvo}` }];
        if (typeof conta !== 'number') {
          q.motivo = 'O ponteiro já vale `NULL`: não há bloco para liberar.';
          break;
        }
        saldos.delete(conta);
        ptr[p.alvo] = null;
        q.mudou.push(p.alvo);
        q.liberada[p.alvo] = conta;
        break;
      }
    }

    q.ponteiros = retrato();
    return q;
  });
}

export const QUADROS = simular(PASSOS);
