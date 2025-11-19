#include <ctype.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static bool is_exit_command(const char *input) {
    if (input == NULL) {
        return false;
    }

    while (isspace((unsigned char)*input)) {
        input++;
    }

    if (*input == '\0') {
        return false;
    }

    char buffer[16];
    size_t length = 0;

    while (*input != '\0' && !isspace((unsigned char)*input) && length < sizeof(buffer) - 1) {
        buffer[length++] = (char)tolower((unsigned char)*input++);
    }
    buffer[length] = '\0';

    return strcmp(buffer, "quit") == 0 || strcmp(buffer, "exit") == 0;
}

static bool parse_expression(const char *input, double *lhs, char *op, double *rhs) {
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

static bool calculate(double lhs, char op, double rhs, double *result) {
    if (result == NULL) {
        return false;
    }

    switch (op) {
        case '+':
            *result = lhs + rhs;
            return true;
        case '-':
            *result = lhs - rhs;
            return true;
        case '*':
            *result = lhs * rhs;
            return true;
        case '/':
            if (rhs == 0.0) {
                return false;
            }
            *result = lhs / rhs;
            return true;
        default:
            return false;
    }
}

int main(void) {
    puts("Simple Calculator\n");
    puts("Enter expressions in the form: <number> <operator> <number>");
    puts("Supported operators: +  -  *  /");
    puts("Type 'quit' or 'exit' to leave the program.\n");

    char line[256];

    while (1) {
        fputs("> ", stdout);
        fflush(stdout);

        if (fgets(line, sizeof line, stdin) == NULL) {
            putchar('\n');
            break;
        }

        if (is_exit_command(line)) {
            break;
        }

        double lhs = 0.0;
        double rhs = 0.0;
        char op = '\0';
        if (!parse_expression(line, &lhs, &op, &rhs)) {
            puts("Could not understand that expression. Example: 3.5 * 2");
            continue;
        }

        double result = 0.0;
        if (!calculate(lhs, op, rhs, &result)) {
            puts("Unable to perform that calculation (possible division by zero).");
            continue;
        }

        printf("= %.10g\n", result);
    }

    puts("Goodbye!");
    return EXIT_SUCCESS;
}
