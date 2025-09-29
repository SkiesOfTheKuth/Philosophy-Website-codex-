CC ?= gcc
CFLAGS ?= -std=c11 -Wall -Wextra -Werror -pedantic -O2
LDFLAGS ?=
PREFIX ?= /usr/local

APP_NAME := calculator
BUILD_DIR := build
DIR_GUARD := $(BUILD_DIR)/.dir
SRC_DIR := src
INCLUDE_DIR := include
TEST_DIR := tests

SOURCES := $(wildcard $(SRC_DIR)/*.c)
OBJECTS := $(patsubst $(SRC_DIR)/%.c,$(BUILD_DIR)/%.o,$(SOURCES))
TARGET := $(BUILD_DIR)/$(APP_NAME)

TEST_SOURCES := $(wildcard $(TEST_DIR)/*.c)
TEST_OBJECTS := $(patsubst $(TEST_DIR)/%.c,$(BUILD_DIR)/test_%.o,$(TEST_SOURCES))
TEST_TARGET := $(BUILD_DIR)/$(APP_NAME)_tests

.PHONY: all build run clean test install uninstall

all: build

build: $(TARGET)

$(TARGET): $(OBJECTS) | $(DIR_GUARD)
	$(CC) $(CFLAGS) $^ $(LDFLAGS) -o $@

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c | $(DIR_GUARD)
	$(CC) $(CFLAGS) -I$(INCLUDE_DIR) -c $< -o $@

$(BUILD_DIR)/test_%.o: $(TEST_DIR)/%.c | $(DIR_GUARD)
	$(CC) $(CFLAGS) -I$(INCLUDE_DIR) -c $< -o $@

$(DIR_GUARD):
	@mkdir -p $(BUILD_DIR)
	@touch $(DIR_GUARD)

run: $(TARGET)
	$(TARGET)

$(TEST_TARGET): $(BUILD_DIR)/calculator.o $(TEST_OBJECTS)
	$(CC) $(CFLAGS) $^ $(LDFLAGS) -lm -o $@

test: $(TEST_TARGET)
	$(TEST_TARGET)

install: $(TARGET)
	install -d $(DESTDIR)$(PREFIX)/bin
	install $(TARGET) $(DESTDIR)$(PREFIX)/bin/$(APP_NAME)

uninstall:
	rm -f $(DESTDIR)$(PREFIX)/bin/$(APP_NAME)

clean:
	rm -rf $(BUILD_DIR)
