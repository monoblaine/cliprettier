#!/usr/bin/env node
'use strict';

(async function main () {
    const clipboard = (await import('clipboardy')).default;
    const prettier = require('prettier');
    const rawCode = clipboard.readSync().trim();
    const fileExtension = process.argv[2];
    const formattedCode = prettier.format(rawCode, { filepath: `foo.${fileExtension}` });

    process.stdout.write(formattedCode);
})();
