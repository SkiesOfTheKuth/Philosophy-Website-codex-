#ifndef CALCULATOR_H
#define CALCULATOR_H

#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    CALC_OK = 0,
    CALC_ERR_INVALID_ARGUMENT,
    CALC_ERR_INVALID_EXPRESSION,
    CALC_ERR_DIVIDE_BY_ZERO
} calc_error_t;

bool calculator_parse(const char *input, double *lhs, char *op, double *rhs);
calc_error_t calculator_compute(double lhs, char op, double rhs, double *result);
calc_error_t calculator_evaluate(const char *input, double *result);
const char *calculator_error_string(calc_error_t error);

#ifdef __cplusplus
}
#endif

#endif // CALCULATOR_H
