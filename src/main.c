#if !defined(_WIN32)
#ifndef _POSIX_C_SOURCE
#define _POSIX_C_SOURCE 200809L
#endif
#endif

#include "calculator.h"

#include <ctype.h>
#include <errno.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#if defined(_WIN32)
#include <io.h>
#define isatty _isatty
#define fileno _fileno
#else
#include <unistd.h>
#endif

#define APPLICATION_NAME "calculator"
#define APPLICATION_VERSION "1.0.0"
#define DEFAULT_PRECISION 10
#define MIN_PRECISION 1
#define MAX_PRECISION 15

static void print_version(void) {
    printf("%s %s\n", APPLICATION_NAME, APPLICATION_VERSION);
}

static void print_usage(FILE *stream, const char *program_name) {
    fprintf(stream, "Usage: %s [OPTIONS]\n", program_name);
    fputs("\nOptions:\n", stream);
    fputs("  -h, --help           Show this help message and exit.\n", stream);
    fputs("  -v, --version        Display the application version.\n", stream);
    fputs("  -e, --eval <expr>    Evaluate a single expression and exit.\n", stream);
    fprintf(stream,
            "  -p, --precision <n>  Set precision (%d-%d) for results.\n",
            MIN_PRECISION,
            MAX_PRECISION);
    fputs("      --no-prompt      Disable interactive prompt even in a TTY.\n", stream);
    fputs("      --prompt         Force the interactive prompt.\n", stream);
    fputs("      --quiet          Suppress the welcome banner.\n", stream);
    fputs("\nExamples:\n", stream);
    fprintf(stream, "  %s --eval \"3.5 * 2\"\n", program_name);
    fprintf(stream, "  %s\n", program_name);
}

static bool is_exit_command(const char *input) {
    if (input == NULL || *input == '\0') {
        return false;
    }

    char buffer[16];
    size_t index = 0U;

    while (input[index] != '\0' && index < sizeof(buffer) - 1U) {
        buffer[index] = (char)tolower((unsigned char)input[index]);
        index++;
    }

    buffer[index] = '\0';

    return strcmp(buffer, "quit") == 0 || strcmp(buffer, "exit") == 0;
}

static void trim_whitespace(char *text) {
    if (text == NULL) {
        return;
    }

    char *start = text;
    while (*start != '\0' && isspace((unsigned char)*start)) {
        start++;
    }

    char *end = start + strlen(start);
    while (end > start && isspace((unsigned char)*(end - 1))) {
        end--;
    }

    size_t length = (size_t)(end - start);

    if (start != text && length > 0U) {
        memmove(text, start, length);
    }

    text[length] = '\0';
}

static long read_line(FILE *stream, char **buffer, size_t *capacity) {
    if (stream == NULL || buffer == NULL || capacity == NULL) {
        errno = EINVAL;
        return -1;
    }

    if (*buffer == NULL || *capacity == 0U) {
        *capacity = 128U;
        *buffer = (char *)malloc(*capacity);
        if (*buffer == NULL) {
            errno = ENOMEM;
            return -1;
        }
    }

    size_t position = 0U;

    for (;;) {
        int ch = fgetc(stream);

        if (ch == EOF) {
            if (ferror(stream)) {
                return -1;
            }

            if (position == 0U) {
                return -1;
            }

            break;
        }

        if (position + 1U >= *capacity) {
            size_t new_capacity = (*capacity < 1024U) ? (*capacity * 2U) : (*capacity + 1024U);
            char *new_buffer = (char *)realloc(*buffer, new_capacity);
            if (new_buffer == NULL) {
                errno = ENOMEM;
                return -1;
            }
            *buffer = new_buffer;
            *capacity = new_capacity;
        }

        (*buffer)[position++] = (char)ch;

        if (ch == '\n') {
            break;
        }
    }

    (*buffer)[position] = '\0';
    return (long)position;
}

int main(int argc, char **argv) {
    const char *program_name = (argc > 0 && argv[0] != NULL) ? argv[0] : APPLICATION_NAME;
    int precision = DEFAULT_PRECISION;
    const char *expression = NULL;
    bool prompt_requested = false;
    bool prompt_disabled = false;
    bool quiet_mode = false;

    for (int i = 1; i < argc; ++i) {
        const char *arg = argv[i];

        if (strcmp(arg, "--help") == 0 || strcmp(arg, "-h") == 0) {
            print_usage(stdout, program_name);
            return EXIT_SUCCESS;
        }

        if (strcmp(arg, "--version") == 0 || strcmp(arg, "-v") == 0) {
            print_version();
            return EXIT_SUCCESS;
        }

        if (strcmp(arg, "--eval") == 0 || strcmp(arg, "-e") == 0) {
            if (i + 1 >= argc) {
                fprintf(stderr, "Error: missing expression for %s.\n", arg);
                return EXIT_FAILURE;
            }
            expression = argv[++i];
            continue;
        }

        if (strcmp(arg, "--precision") == 0 || strcmp(arg, "-p") == 0) {
            if (i + 1 >= argc) {
                fprintf(stderr, "Error: missing precision value for %s.\n", arg);
                return EXIT_FAILURE;
            }

            char *end = NULL;
            long value = strtol(argv[++i], &end, 10);
            if (end == argv[i] || *end != '\0') {
                fprintf(stderr, "Error: precision must be an integer.\n");
                return EXIT_FAILURE;
            }
            if (value < MIN_PRECISION || value > MAX_PRECISION) {
                fprintf(stderr, "Error: precision must be between %d and %d.\n", MIN_PRECISION, MAX_PRECISION);
                return EXIT_FAILURE;
            }
            precision = (int)value;
            continue;
        }

        if (strcmp(arg, "--no-prompt") == 0) {
            prompt_disabled = true;
            continue;
        }

        if (strcmp(arg, "--prompt") == 0) {
            prompt_requested = true;
            continue;
        }

        if (strcmp(arg, "--quiet") == 0) {
            quiet_mode = true;
            continue;
        }

        fprintf(stderr, "Error: unrecognised option '%s'.\n", arg);
        print_usage(stderr, program_name);
        return EXIT_FAILURE;
    }

    bool stdin_is_tty = isatty(fileno(stdin)) != 0;
    bool stdout_is_tty = isatty(fileno(stdout)) != 0;
    bool interactive = (expression == NULL);

    bool show_prompt = false;
    if (prompt_disabled) {
        show_prompt = false;
    } else if (prompt_requested) {
        show_prompt = true;
    } else {
        show_prompt = stdin_is_tty && stdout_is_tty;
    }

    if (expression != NULL) {
        double result = 0.0;
        calc_error_t status = calculator_evaluate(expression, &result);
        if (status != CALC_OK) {
            fprintf(stderr, "Error: %s.\n", calculator_error_string(status));
            return EXIT_FAILURE;
        }

        printf("%.*g\n", precision, result);
        return EXIT_SUCCESS;
    }

    if (!quiet_mode && show_prompt) {
        puts("Simple Calculator\n");
        puts("Enter expressions in the form: <number> <operator> <number>");
        puts("Supported operators: +  -  *  /");
        puts("Type 'quit' or 'exit' to leave the program.\n");
    }

    char *line = NULL;
    size_t capacity = 0U;

    while (interactive) {
        if (show_prompt) {
            fputs("> ", stdout);
            fflush(stdout);
        }

        long line_length = read_line(stdin, &line, &capacity);
        if (line_length < 0) {
            if (feof(stdin)) {
                break;
            }

            perror("Failed to read input");
            free(line);
            return EXIT_FAILURE;
        }

        trim_whitespace(line);
        if (line[0] == '\0') {
            continue;
        }

        if (is_exit_command(line)) {
            break;
        }

        double result = 0.0;
        calc_error_t status = calculator_evaluate(line, &result);
        if (status != CALC_OK) {
            fprintf(stderr, "Error: %s.\n", calculator_error_string(status));
            if (status == CALC_ERR_INVALID_EXPRESSION) {
                fprintf(stderr, "Hint: try expressions such as '3 + 4' or '-2.5 * 8'.\n");
            }
            continue;
        }

        printf("= %.*g\n", precision, result);
    }

    free(line);

    if (interactive && show_prompt && stdout_is_tty) {
        puts("Goodbye!");
    }

    return EXIT_SUCCESS;
}
