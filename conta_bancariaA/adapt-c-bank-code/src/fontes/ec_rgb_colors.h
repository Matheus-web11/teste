#ifndef EC_RGB_COLORS_H
#define EC_RGB_COLORS_H

#include <stdarg.h>

// Função para imprimir o texto com a cor da frente desejada
// Aceita um número indefinido de argumentos
void ec_imprimirCor(const char *texto, const char *identificador, ...);

// Função para imprimir tabela com todas as cores disponíveis
void ec_imprimirTodasAsCores(unsigned int milisegundos);

#endif // EC_RGB_COLORS_H
