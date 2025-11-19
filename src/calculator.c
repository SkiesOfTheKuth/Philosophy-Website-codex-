#include "calculator.h"

#include <ctype.h>
#include <stddef.h>
#include <stdio.h>

bool calculator_parse(const char *input, double *lhs, char *op, double *rhs) {
    if (input == NULL || lhs == NULL || op == NULL || rhs == NULL) {
        return false;
    }

    char extra;
    int consumed = sscanf(input, " %lf %c %lf %c", lhs, op, rhs, &extra);

    if (consumed != 3) {
        return false;
    }

    switch (*op) {
        case '+':
        case '-':
        case '*':
        case '/':
            return true;
        default:
            return false;
    }
}

calc_error_t calculator_compute(double lhs, char op, double rhs, double *result) {
    if (result == NULL) {
        return CALC_ERR_INVALID_ARGUMENT;
    }

    switch (op) {
        case '+':
            *result = lhs + rhs;
            return CALC_OK;
        case '-':
            *result = lhs - rhs;
            return CALC_OK;
        case '*':
            *result = lhs * rhs;
            return CALC_OK;
        case '/':
            if (rhs == 0.0) {
                return CALC_ERR_DIVIDE_BY_ZERO;
            }
            *result = lhs / rhs;
            return CALC_OK;
        default:
            return CALC_ERR_INVALID_EXPRESSION;
    }
}

calc_error_t calculator_evaluate(const char *input, double *result) {
    if (input == NULL || result == NULL) {
        return CALC_ERR_INVALID_ARGUMENT;
    }

    double lhs = 0.0;
    double rhs = 0.0;
    char op = '\0';

    if (!calculator_parse(input, &lhs, &op, &rhs)) {
        return CALC_ERR_INVALID_EXPRESSION;
    }

    return calculator_compute(lhs, op, rhs, result);
}

const char *calculator_error_string(calc_error_t error) {
    switch (error) {
        case CALC_OK:
            return "success";
        case CALC_ERR_INVALID_ARGUMENT:
            return "invalid argument";
        case CALC_ERR_INVALID_EXPRESSION:
            return "invalid expression";
        case CALC_ERR_DIVIDE_BY_ZERO:
            return "division by zero";
        default:
            return "unknown error";
    }
}
