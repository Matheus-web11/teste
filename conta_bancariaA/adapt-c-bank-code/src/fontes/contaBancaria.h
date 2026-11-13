#ifndef CONTA_BANCARIA_H
#define CONTA_BANCARIA_H

struct ContaBancaria;

struct ContaBancaria * cb_criar(int num, float saldoInicial);

void cb_excluir(struct ContaBancaria **conta);

int cb_depositar(struct ContaBancaria *conta, float valor);
// retorna 1 se conseguiu depositar ou zero caso contrario

int cb_sacar(struct ContaBancaria *conta, float valor);
// retorna 1 se conseguiu sacar ou zero caso contrario

int cb_transferir(struct ContaBancaria *origem, struct ContaBancaria *destino, float valor);
// retorna 1 se conseguiu transferir ou zero caso contrario

void cb_imprimir (struct ContaBancaria *conta);

#endif
