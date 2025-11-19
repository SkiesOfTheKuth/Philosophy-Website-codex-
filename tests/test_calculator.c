#include "calculator.h"

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define EPSILON 1e-9

static int failures = 0;
static int tests_run = 0;

#define ASSERT_TRUE(condition, message)                                                      \
    do {                                                                                      \
        ++tests_run;                                                                          \
        if (!(condition)) {                                                                   \
            fprintf(stderr, "[FAILED] %s:%d: %s\n", __FILE__, __LINE__, message);             \
            ++failures;                                                                       \
            return;                                                                           \
        } else {                                                                              \
            fprintf(stdout, "[PASS] %s\n", message);                                         \
        }                                                                                     \
    } while (0)

#define ASSERT_STATUS(actual, expected, message)                                              \
    do {                                                                                      \
        ++tests_run;                                                                          \
        if ((actual) != (expected)) {                                                         \
            fprintf(stderr,                                                                   \
                    "[FAILED] %s:%d: %s (expected status %d, got %d)\n",                     \
                    __FILE__,                                                                 \
                    __LINE__,                                                                 \
                    message,                                                                  \
                    (int)(expected),                                                          \
                    (int)(actual));                                                           \
            ++failures;                                                                       \
            return;                                                                           \
        } else {                                                                              \
            fprintf(stdout, "[PASS] %s\n", message);                                         \
        }                                                                                     \
    } while (0)

#define ASSERT_DOUBLE_NEAR(actual, expected, message)                                         \
    do {                                                                                      \
        ++tests_run;                                                                          \
        double difference = fabs((actual) - (expected));                                      \
        if (difference > EPSILON) {                                                           \
            fprintf(stderr,                                                                   \
                    "[FAILED] %s:%d: %s (expected %.9f, got %.9f)\n",                        \
                    __FILE__,                                                                 \
                    __LINE__,                                                                 \
                    message,                                                                  \
                    (expected),                                                               \
                    (actual));                                                                \
            ++failures;                                                                       \
            return;                                                                           \
        } else {                                                                              \
            fprintf(stdout, "[PASS] %s\n", message);                                         \
        }                                                                                     \
    } while (0)

static void test_parse_valid(void) {
    double lhs = 0.0;
    double rhs = 0.0;
    char op = '\0';

    bool parsed = calculator_parse(" 7 * -2 ", &lhs, &op, &rhs);
    ASSERT_TRUE(parsed, "calculator_parse recognises valid expressions");
    ASSERT_DOUBLE_NEAR(lhs, 7.0, "calculator_parse extracts left operand");
    ASSERT_DOUBLE_NEAR(rhs, -2.0, "calculator_parse extracts right operand");
    ASSERT_TRUE(op == '*', "calculator_parse extracts operator");
}

static void test_parse_rejects_extra_tokens(void) {
    double lhs = 0.0;
    double rhs = 0.0;
    char op = '\0';

    bool parsed = calculator_parse("1 + 2 + 3", &lhs, &op, &rhs);
    ASSERT_TRUE(!parsed, "calculator_parse rejects expressions with extra tokens");
}

static void test_compute_operations(void) {
    double result = 0.0;

    ASSERT_STATUS(calculator_compute(4.0, '+', 6.0, &result),
                  CALC_OK,
                  "calculator_compute adds numbers");
    ASSERT_DOUBLE_NEAR(result, 10.0, "calculator_compute addition result");

    ASSERT_STATUS(calculator_compute(4.0, '-', 6.0, &result),
                  CALC_OK,
                  "calculator_compute subtracts numbers");
    ASSERT_DOUBLE_NEAR(result, -2.0, "calculator_compute subtraction result");

    ASSERT_STATUS(calculator_compute(4.0, '*', 6.0, &result),
                  CALC_OK,
                  "calculator_compute multiplies numbers");
    ASSERT_DOUBLE_NEAR(result, 24.0, "calculator_compute multiplication result");

    ASSERT_STATUS(calculator_compute(12.0, '/', 4.0, &result),
                  CALC_OK,
                  "calculator_compute divides numbers");
    ASSERT_DOUBLE_NEAR(result, 3.0, "calculator_compute division result");
}

static void test_compute_errors(void) {
    double result = 0.0;
    ASSERT_STATUS(calculator_compute(1.0, '/', 0.0, &result),
                  CALC_ERR_DIVIDE_BY_ZERO,
                  "calculator_compute detects division by zero");
    ASSERT_STATUS(calculator_compute(1.0, '^', 2.0, &result),
                  CALC_ERR_INVALID_EXPRESSION,
                  "calculator_compute rejects unsupported operators");
}

static void test_evaluate_valid_expression(void) {
    double result = 0.0;
    ASSERT_STATUS(calculator_evaluate("3 + 9", &result),
                  CALC_OK,
                  "calculator_evaluate accepts valid expressions");
    ASSERT_DOUBLE_NEAR(result, 12.0, "calculator_evaluate computes results");
}

static void test_evaluate_invalid_inputs(void) {
    double result = 0.0;
    ASSERT_STATUS(calculator_evaluate(NULL, &result),
                  CALC_ERR_INVALID_ARGUMENT,
                  "calculator_evaluate handles null expressions");
    ASSERT_STATUS(calculator_evaluate("2 ^ 3", &result),
                  CALC_ERR_INVALID_EXPRESSION,
                  "calculator_evaluate rejects unsupported operators");
    ASSERT_STATUS(calculator_evaluate("", &result),
                  CALC_ERR_INVALID_EXPRESSION,
                  "calculator_evaluate rejects empty expressions");
}

int main(void) {
    test_parse_valid();
    test_parse_rejects_extra_tokens();
    test_compute_operations();
    test_compute_errors();
    test_evaluate_valid_expression();
    test_evaluate_invalid_inputs();

    if (failures > 0) {
        fprintf(stderr, "\n%d of %d tests failed.\n", failures, tests_run);
        return EXIT_FAILURE;
    }

    fprintf(stdout, "\nAll %d tests passed.\n", tests_run);
    return EXIT_SUCCESS;
}
