import * as fs from 'fs';
import glob from 'glob';
import * as path from 'path';
import ts from 'typescript';

type DeclarationOccurence = { kind: string; name: string };
type ExtractedExports = Array<{
  file: string;
  exports: DeclarationOccurence[];
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

  const files = getTypeScriptFiles(directoryPath);

  for (const file of files) {
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
        console.log({ importedDeclaration });
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

const main = () => {
  const packageSrcPath = 'packages/twenty-shared/src';
  const exportsPerModule = retrievePackageExportsPerModule(packageSrcPath);
  console.log(exportsPerModule);

  const sourceSrcPath = 'packages/twenty-front/src';
  const importsPerFile = retrieveImportFromPackageInSource(sourceSrcPath);
  console.log(importsPerFile);

  const mappedResolution = mapSourceImportToBarrel({
    exportsPerModule,
    importsPerFile,
  });
  console.log(JSON.stringify(mappedResolution));
};
main();
