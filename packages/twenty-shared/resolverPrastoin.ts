import * as fs from 'fs';
import glob from 'glob';
import * as path from 'path';
import ts from 'typescript';

type DeclarationOccurence = { kind: string; name: string };

function findAllExports(directoryPath: string) {
  const results: Record<string, DeclarationOccurence[]> = {};

  const files = getTypeScriptFiles(directoryPath);

  for (const file of files) {
    const sourceFile = ts.createSourceFile(
      file,
      fs.readFileSync(file, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );

    const exports = extractExports(sourceFile);
    if (exports.length > 0) {
      results[file] = exports;
    }
  }

  return results;
}

function getTypeScriptFiles(directoryPath: string): string[] {
  const pattern = path.join(directoryPath, '**/*.{ts,tsx}');
  const files = glob.sync(pattern);

  return files.filter(
    (file) => !file.endsWith('.d.ts') && !file.endsWith('index.ts'),
  );
}

const getKind = (node: ts.VariableStatement) => {
  const isConst = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;
  if (isConst) {
    return 'const';
  }

  const isLet = (node.declarationList.flags & ts.NodeFlags.Let) !== 0;
  if (isLet) {
    return 'let';
  }

  return 'var';
};

function extractExports(sourceFile: ts.SourceFile) {
  const exports: DeclarationOccurence[] = [];

  function visit(node: ts.Node) {
    if (!ts.canHaveModifiers(node)) {
      return ts.forEachChild(node, visit);
    }
    const modifiers = ts.getModifiers(node);
    const isExport = modifiers?.some(
      (mod) => mod.kind === ts.SyntaxKind.ExportKeyword,
    );

    if (!isExport) {
      return ts.forEachChild(node, visit);
    }

    switch (true) {
      case ts.isTypeAliasDeclaration(node):
        exports.push({
          kind: 'type',
          name: node.name.text,
        });
        break;

      case ts.isInterfaceDeclaration(node):
        exports.push({
          kind: 'interface',
          name: node.name.text,
        });
        break;

      case ts.isEnumDeclaration(node):
        exports.push({
          kind: 'enum',
          name: node.name.text,
        });
        break;

      case ts.isFunctionDeclaration(node) && node.name !== undefined:
        exports.push({
          kind: 'function',
          name: node.name.text,
        });
        break;

      case ts.isVariableStatement(node):
        node.declarationList.declarations.forEach((decl) => {
          if (ts.isIdentifier(decl.name)) {
            const kind = getKind(node);
            exports.push({
              kind,
              name: decl.name.text,
            });
          }
        });
        break;

      case ts.isClassDeclaration(node) && node.name !== undefined:
        exports.push({
          kind: 'class',
          name: node.name.text,
        });
        break;
    }
    return ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return exports;
}

const getSubDirectoryPaths = (directoryPath: string): string[] =>
  fs
    .readdirSync(directoryPath)
    .filter((fileOrDirectoryName) => {
      const isDirectory = fs
        .statSync(path.join(directoryPath, fileOrDirectoryName))
        .isDirectory();
      return isDirectory;
    })
    .map((subDirectoryName) => path.join(directoryPath, subDirectoryName));

const main = () => {
  const srcPath = 'packages/twenty-shared/src';
  const subdirectories = getSubDirectoryPaths(srcPath);
  const allExports = subdirectories.reduce((acc, moduleDirectory) => {
    const moduleExportsPerFile = findAllExports(moduleDirectory);
    const moduleName = moduleDirectory.split('/').pop();
    if (!moduleName) {
      throw new Error(
        `Should never occurs moduleName not found ${moduleDirectory}`,
      );
    }

    const flattenExports = Object.values(moduleExportsPerFile).flatMap(
      (arr) => arr,
    );
    return {
      ...acc,
      [moduleName]: flattenExports,
    };
  }, {});

  console.log(allExports);
};
main();
