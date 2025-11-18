import prettier from '@prettier/sync';
import * as fs from 'fs';
import { globSync } from 'glob';
import * as path from 'path';
import ts from 'typescript';
const prettierConfigFile = prettier.resolveConfigFile();
if (prettierConfigFile == null) {
  throw new Error('Prettier config file not found');
}
const prettierConfiguration = prettier.resolveConfig(prettierConfigFile);

type DeclarationOccurrence = { kind: string; name: string };
type ExtractedExports = Array<{
  file: string;
  exports: DeclarationOccurrence[];
}>;
type ExtractedImports = Array<{ file: string; imports: string[] }>;

type ExportPerModule = Array<{
  moduleName: string;
  exports: ExtractedExports[number]['exports'];
}>;
function findAllExports(directoryPath: string): ExtractedExports {
  const results: ExtractedExports = [];

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
      results.push({
        file,
        exports,
      });
    }
  }

  return results;
}

function findAllImports(directoryPath: string): ExtractedImports {
  const results: ExtractedImports = [];

  const includeIndex = true;
  const files = getTypeScriptFiles(directoryPath, includeIndex);

  for (const file of files) {
    try {
      const sourceFile = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );

      const imports = extractImports(sourceFile);
      if (imports.length > 0) {
        results.push({
          file,
          imports,
        });
      }
    } catch (e) {
      console.log(e);
      console.log('Because of file: ', file);
      throw e;
    }
  }

  return results;
}

function getTypeScriptFiles(
  directoryPath: string,
  includeIndex: boolean = false,
): string[] {
  const pattern = path.join(directoryPath, '**/*.{ts,tsx}');
  const files = globSync(pattern);

  return files.filter(
    (file) =>
      !file.endsWith('.d.ts') &&
      (includeIndex ? true : !file.endsWith('index.ts')),
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
  const exports: DeclarationOccurrence[] = [];

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

function extractImports(sourceFile: ts.SourceFile): string[] {
  const imports: string[] = [];

  function visit(node: ts.Node) {
    if (!ts.isImportDeclaration(node)) {
      return ts.forEachChild(node, visit);
    }

    const modulePath = node.moduleSpecifier.getText(sourceFile);
    // Quite static
    if (modulePath !== `'twenty-shared'`) {
      return ts.forEachChild(node, visit);
    }

    if (!node.importClause) {
      return ts.forEachChild(node, visit);
    }

    if (!node.importClause.namedBindings) {
      return ts.forEachChild(node, visit);
    }

    if (ts.isNamedImports(node.importClause.namedBindings)) {
      const namedImports = node.importClause.namedBindings.elements.map(
        (element) => {
          if (element.propertyName) {
            return `${element.propertyName.text} as ${element.name.text}`;
          }

          return element.name.text;
        },
      );

      // imports.push(`import { ${namedImports} } from ${modulePath}`);
      namedImports.forEach((namedImport) => {
        imports.push(namedImport);
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return imports;
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

const retrievePackageExportsPerModule = (srcPath: string) => {
  const subdirectories = getSubDirectoryPaths(srcPath);
  return subdirectories.map<ExportPerModule[number]>((moduleDirectory) => {
    const moduleExportsPerFile = findAllExports(moduleDirectory);
    const moduleName = moduleDirectory.split('/').pop();
    if (!moduleName) {
      throw new Error(
        `Should never occurs moduleName not found ${moduleDirectory}`,
      );
    }

    const flattenExports = Object.values(moduleExportsPerFile).flatMap(
      (arr) => arr.exports,
    );
    return {
      moduleName,
      exports: flattenExports,
    };
  });
};

type NewImport = { barrel: string; modules: string[] };
type MappedResolution = {
  newImports: Record<string, NewImport>;
  file: string;
};
type MapSourceImportToBarrelArgs = {
  importsPerFile: ExtractedImports;
  exportsPerModule: ExportPerModule;
};
const mapSourceImportToBarrel = ({
  exportsPerModule,
  importsPerFile,
}: MapSourceImportToBarrelArgs): MappedResolution[] => {
  const mappedResolution: MappedResolution[] = [];
  for (const fileImport of importsPerFile) {
    const { file, imports } = fileImport;
    let result: MappedResolution = {
      file,
      newImports: {},
    };

    for (const importedDeclaration of imports) {
      const findResult = exportsPerModule.find(({ exports }) =>
        exports.some((el) => el.name === importedDeclaration),
      );

      if (findResult === undefined) {
        throw new Error(
          `Should never occurs no barrel exports ${importedDeclaration}`,
        );
      }

      const { moduleName } = findResult;
      if (result.newImports[moduleName]) {
        result.newImports[moduleName].modules.push(importedDeclaration);
      } else {
        result.newImports[moduleName] = {
          barrel: moduleName,
          modules: [importedDeclaration],
        };
      }
    }

    mappedResolution.push(result);
  }

  return mappedResolution;
};

const retrieveImportFromPackageInSource = (srcPath: string) => {
  return findAllImports(srcPath);
};

/**
 * Inserts a new import statement at the top of a TypeScript file
 * @param filePath Path to the TypeScript file
 * @param importSpecifier The module to import from (e.g., 'twenty-shared/utils')
 * @param namedImports Array of named imports (e.g., ['useQuery', 'useMutation'])
 */
type InsertImportAtTopArgs = {
  filePath: string;
  importSpecifier: string;
  namedImports: string[];
};
function insertImportAtTop({
  filePath,
  importSpecifier,
  namedImports,
}: InsertImportAtTopArgs): void {
  // Read the file content
  const sourceText = fs.readFileSync(filePath, 'utf8');

  // Create a source file
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  // Build the new import statement
  let newImport = `import { ${namedImports.join(', ')} } from '${importSpecifier}';\n`;

  // Find the position to insert the import
  let insertPos = 0;

  // Case 1: File has imports - insert after the last import
  let lastImportEnd = 0;

  ts.forEachChild(sourceFile, (node) => {
    if (
      ts.isImportDeclaration(node) ||
      ts.isImportEqualsDeclaration(node) ||
      (ts.isExpressionStatement(node) &&
        ts.isCallExpression(node.expression) &&
        node.expression.expression.kind === ts.SyntaxKind.ImportKeyword) // Overkill ?
    ) {
      const end = node.getEnd();
      if (end > lastImportEnd) {
        lastImportEnd = end;
      }
    }
  });

  if (lastImportEnd > 0) {
    // Insert after the last import with a newline
    insertPos = lastImportEnd;

    // Check if there's already a newline after the last import
    if (sourceText[insertPos] !== '\n') {
      newImport = '\n' + newImport;
    }
  }

  // Insert the new import
  const updatedSourceText =
    sourceText.substring(0, insertPos) +
    newImport +
    sourceText.substring(insertPos);

  // Write back to file
  fs.writeFileSync(
    filePath,
    prettier.format(updatedSourceText, {
      parser: 'typescript',
      ...prettierConfiguration,
    }),
    'utf8',
  );
}

type RemoveSpecificImports = {
  filePath: string;
  moduleSpecifier: string;
};
function removeSpecificImports({
  filePath,
  moduleSpecifier,
}: RemoveSpecificImports) {
  const sourceText = fs.readFileSync(filePath, 'utf8');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  type Replacement = {
    start: number;
    end: number;
    newText: string;
  };
  let replacement: Replacement | undefined;

  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node)) {
      const importSource = node.moduleSpecifier
        .getText(sourceFile)
        .replace(/^['"]|['"]$/g, '');

      if (importSource === moduleSpecifier && node.importClause) {
        replacement = {
          start: node.getFullStart(),
          end: node.getEnd(),
          newText: '',
        };
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  let updatedSourceText = sourceText;

  if (replacement) {
    const { end, newText, start } = replacement;
    updatedSourceText =
      updatedSourceText.substring(0, start) +
      newText +
      updatedSourceText.substring(end);
    fs.writeFileSync(
      filePath,
      prettier.format(updatedSourceText, {
        parser: 'typescript',
        ...prettierConfiguration,
      }),
      'utf8',
    );
  }
}

const migrateImports = (mappedResolutions: MappedResolution[]) => {
  for (const { file, newImports } of mappedResolutions) {
    for (const { barrel, modules } of Object.values(newImports)) {
      // TODO could refactor to avoid double source file and read
      removeSpecificImports({
        filePath: file,
        moduleSpecifier: 'twenty-shared',
      });
      insertImportAtTop({
        filePath: file,
        importSpecifier: `twenty-shared/${barrel}`,
        namedImports: modules,
      });
    }
  }
};

const main = () => {
  const packageSrcPath = 'packages/twenty-shared/src';
  const exportsPerModule = retrievePackageExportsPerModule(packageSrcPath);

  const packagesToMigrate = [
    'twenty-front',
    'twenty-ui',
    'twenty-server',
    'twenty-emails',
    'twenty-zapier',
  ];
  for (const currPackage of packagesToMigrate) {
    console.log(`About to run over ${currPackage}`);
    const importsPerFile = retrieveImportFromPackageInSource(
      `packages/${currPackage}`,
    );

    const mappedResolutions = mapSourceImportToBarrel({
      exportsPerModule,
      importsPerFile,
    });
    migrateImports(mappedResolutions);
    console.log(`${currPackage} migrated`);
  }
  console.log('SUCCESSFULLY COMPLETED');
};
main();
