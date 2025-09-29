# Calculator CLI

A production-ready, deployable command-line calculator written in C. The
application evaluates simple binary arithmetic expressions interactively or via
command-line flags, with comprehensive error handling and automated tests.

## Features

- Evaluate addition, subtraction, multiplication, and division.
- Interactive REPL with prompts, exit commands, and helpful error messages.
- Non-interactive `--eval` mode for scripting and automation.
- Configurable output precision and optional quiet mode for cleaner pipelines.
- Cross-platform friendly build using a simple `Makefile`.
- Automated unit tests covering parsing, computation, and error scenarios.

## Requirements

- POSIX-like environment (macOS, Linux, or Windows with a POSIX toolchain).
- A C11 compatible compiler (e.g. `gcc`, `clang`).
- Standard development utilities: `make`, `install`.

## Building

```bash
make build
```

The compiled binary is placed in `build/calculator`.

## Testing

Run the test suite with:

```bash
make test
```

All tests must pass before deploying.

## Usage

Start the interactive shell:

```bash
./build/calculator
```

Evaluate a single expression:

```bash
./build/calculator --eval "12 / 4"
```

Adjust the displayed precision (between 1 and 15 significant digits):

```bash
./build/calculator --precision 6 --eval "10 / 3"
```

Disable the interactive prompt to better support pipelines:

```bash
echo "3 + 4" | ./build/calculator --no-prompt
```

Show all available flags:

```bash
./build/calculator --help
```

## Installation

Install the binary into `/usr/local/bin` (override `PREFIX` or `DESTDIR` as
needed):

```bash
sudo make install
```

Uninstall:

```bash
sudo make uninstall
```

## Deployment Checklist

1. Run `make clean && make build` to ensure a fresh build succeeds.
2. Run `make test` and confirm all tests pass.
3. Package and distribute `build/calculator`, or deploy via `make install`.
4. Provide this README to operators for runbook reference.

## License

This project is provided as-is without any specific license; adapt it to your
organisation's licensing requirements as needed.
