#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targets = ['server', 'public'];
let hasErrors = false;

const collectFiles = (root) => {
    const absoluteRoot = path.resolve(process.cwd(), root);
    if (!fs.existsSync(absoluteRoot)) {
        return [];
    }

    const stack = [absoluteRoot];
    const files = [];

    while (stack.length > 0) {
        const current = stack.pop();
        const stat = fs.statSync(current);

        if (stat.isDirectory()) {
            const entries = fs.readdirSync(current);
            for (const entry of entries) {
                if (entry === 'node_modules' || entry.startsWith('.')) {
                    continue;
                }
                stack.push(path.join(current, entry));
            }
        } else if (current.endsWith('.js')) {
            files.push(current);
        }
    }

    return files;
};

const filesToCheck = targets.flatMap(collectFiles);

for (const file of filesToCheck) {
    const source = fs.readFileSync(file, 'utf8');
    try {
        new vm.Script(source, { filename: file });
    } catch (error) {
        hasErrors = true;
        console.error(`Syntax error in ${path.relative(process.cwd(), file)}:\n${error.message}`);
    }
}

if (hasErrors) {
    process.exit(1);
}

console.log(`Checked ${filesToCheck.length} JavaScript files.`);
