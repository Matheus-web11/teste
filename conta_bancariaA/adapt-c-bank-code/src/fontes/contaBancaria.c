#include "contaBancaria.h"
#include "ec_rgb_colors.h"
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#define MAX_OPERACOES 100

enum TipoOperacao
{
    NAO_DEF,
    CRIACAO,
    DEPOSITO,
    SAQUE,
    TRANSFERENCIA,
    EXCLUSAO
};

struct Operacao
{
    int tipo;
    float valor;
    float saldo_antes;
    float saldo_depois;
    int outraConta;
};

struct ContaBancaria // NOVO TIPO DE DADOS: registro de Conta Bancária
{
    int numero;
    float saldo;
    int pos_log;
    struct Operacao log[MAX_OPERACOES];
};

struct ContaBancaria * cb_criar(int num, float saldoInicial)
{
    struct ContaBancaria * conta;
    conta = (struct ContaBancaria *) malloc(sizeof(struct ContaBancaria));
    if (conta == NULL)
    {
        ec_imprimirCor("Memória insuficiente para alocação da conta!\n", "RED");
        return NULL;
    }
    conta->numero = num;
    conta->saldo = saldoInicial;
    return conta;
}
