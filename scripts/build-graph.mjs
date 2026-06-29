import { Project } from "ts-morph";
import { writeFileSync } from "fs";
import { relative } from "path";

const ROOT = process.cwd();

const project = new Project({
  tsConfigFilePath: `${ROOT}/tsconfig.json`,
  skipAddingFilesFromTsConfig: false,
});

const files = {};
const symbols = {};

for (const sourceFile of project.getSourceFiles()) {
  const absPath = sourceFile.getFilePath();
  if (
    absPath.includes("node_modules") ||
    absPath.includes("src/generated") ||
    absPath.includes(".next")
  ) continue;

  const filePath = relative(ROOT, absPath);

  const imports = [];
  for (const decl of sourceFile.getImportDeclarations()) {
    const specifier = decl.getModuleSpecifierValue();
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;

    const resolvedFile = decl.getModuleSpecifierSourceFile();
    if (!resolvedFile) continue;

    const resolvedPath = relative(ROOT, resolvedFile.getFilePath());
    if (resolvedPath.includes("node_modules") || resolvedPath.includes("src/generated")) continue;

    const named = decl.getNamedImports().map((n) => n.getName());
    const def = decl.getDefaultImport()?.getText();

    imports.push({
      file: resolvedPath,
      symbols: named,
      ...(def ? { default: def } : {}),
    });
  }

  const exports = [...sourceFile.getExportedDeclarations().keys()];

  files[filePath] = { imports, exports, importedBy: [] };

  for (const name of exports) {
    if (!symbols[name]) {
      symbols[name] = { exportedFrom: filePath, importedBy: [] };
    }
  }
}

// reverse index: importedBy + symbol usage
for (const [filePath, data] of Object.entries(files)) {
  for (const imp of data.imports) {
    if (files[imp.file] && !files[imp.file].importedBy.includes(filePath)) {
      files[imp.file].importedBy.push(filePath);
    }
    for (const sym of imp.symbols) {
      if (symbols[sym] && !symbols[sym].importedBy.includes(filePath)) {
        symbols[sym].importedBy.push(filePath);
      }
    }
  }
}

// Mermaid diagram
function buildMermaid(files) {
  const ids = {};
  let n = 0;
  const id = (p) => (ids[p] ??= `N${n++}`);
  const label = (p) => p.split("/").at(-1).replace(/\.(tsx?|mjs)$/, "");

  const lines = ["graph LR"];
  for (const [fp, data] of Object.entries(files)) {
    lines.push(`  ${id(fp)}["${label(fp)}"]`);
    for (const imp of data.imports) {
      const syms = imp.symbols.length ? `|"${imp.symbols.join(", ")}"|` : "";
      lines.push(`  ${id(fp)} -->${syms} ${id(imp.file)}`);
    }
  }
  return lines.join("\n");
}

writeFileSync(`${ROOT}/dep-graph.json`, JSON.stringify({ files, symbols }, null, 2));
writeFileSync(`${ROOT}/dep-graph.mmd`, buildMermaid(files));

console.log(`files:   ${Object.keys(files).length}`);
console.log(`symbols: ${Object.keys(symbols).length}`);
console.log(`→ dep-graph.json`);
console.log(`→ dep-graph.mmd`);
