/**
 * CLI navigation tool over dep-graph.json.
 *
 * Usage:
 *   node scripts/agent-tools.mjs lookupSymbol <name>
 *   node scripts/agent-tools.mjs getContext <file>
 *   node scripts/agent-tools.mjs traverse <file> [depth=2]
 */

import { readFileSync } from "fs";

const { files, symbols } = JSON.parse(readFileSync("./graph/dep-graph.json", "utf-8"));

function lookupSymbol(name) {
  const sym = symbols[name];
  if (!sym) return { error: `symbol "${name}" not found` };

  const deps = files[sym.exportedFrom]?.imports.map((i) => i.file) ?? [];

  return {
    definedIn: sym.exportedFrom,
    usedIn: sym.importedBy,
    readThese: [...new Set([sym.exportedFrom, ...sym.importedBy, ...deps])],
  };
}

function getContext(filePath) {
  const file = files[filePath];
  if (!file) return { error: `file "${filePath}" not found` };

  return {
    imports: file.imports.map((i) => ({ file: i.file, symbols: i.symbols })),
    importedBy: file.importedBy,
    exports: file.exports,
  };
}

function traverse(startFile, depth = 2) {
  if (!files[startFile]) return { error: `file "${startFile}" not found` };

  const visited = new Set();
  const queue = [{ file: startFile, d: 0 }];

  while (queue.length > 0) {
    const { file, d } = queue.shift();
    if (visited.has(file) || d > depth) continue;
    visited.add(file);

    const node = files[file];
    if (!node) continue;

    for (const imp of node.imports) queue.push({ file: imp.file, d: d + 1 });
    for (const importer of node.importedBy) queue.push({ file: importer, d: d + 1 });
  }

  return [...visited];
}

const commands = { lookupSymbol, getContext, traverse };
const [, , cmd, arg1, arg2] = process.argv;

if (!cmd || !commands[cmd]) {
  console.error(`Usage: node scripts/agent-tools.mjs <${Object.keys(commands).join("|")}> [args...]`);
  process.exit(1);
}

if (!arg1) {
  console.error(`"${cmd}" requires at least one argument`);
  process.exit(1);
}

const result = cmd === "traverse"
  ? traverse(arg1, arg2 ? Number(arg2) : 2)
  : commands[cmd](arg1);

console.log(JSON.stringify(result, null, 2));
