import { isNonEmptyArray } from '@sniptt/guards';
import { globSync } from 'glob';
import path from 'node:path';
import ts from 'typescript';

import { isDefined } from '../src/utilities/utils/isDefined';

const IMPLEMENTATION_ONLY_PATTERN =
  /(?:^|[/\\])(internal|internals|parts)(?:[/\\]|$)/;
const TABLER_ICONS_SOURCE = 'icon/components/TablerIcons.ts';
const TABLER_ICON_NAME_PATTERN = /^Icon[A-Z0-9]/;
const TABLER_ICONS_PACKAGE = '@tabler/icons-react';

export const getPublicExportSnapshot = ({
  sourceRoot,
  entryPoints,
}: {
  sourceRoot: string;
  entryPoints: Record<string, string>;
}) => {
  const compilerOptions: ts.CompilerOptions = {
    noResolve: true,
    noLib: true,
    types: [],
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    baseUrl: sourceRoot,
    paths: { '@ui/*': ['./*'] },
  };
  const program = ts.createProgram(
    globSync('**/*.{ts,tsx}', {
      cwd: sourceRoot,
      absolute: true,
      ignore: ['**/__tests__/**', '**/__stories__/**', '**/*.stories.tsx'],
    }),
    compilerOptions,
  );
  const checker = program.getTypeChecker();
  const errors = new Set<string>();
  const snapshot: Record<string, string[]> = {};
  const visitedFiles = new Set<string>();
  const entryNames = new Map(
    Object.entries(entryPoints).map(([name, filePath]) => [filePath, name]),
  );

  const getExports = (filePath: string) => {
    const source = program.getSourceFile(filePath);
    const symbol = isDefined(source)
      ? checker.getSymbolAtLocation(source)
      : undefined;

    return isDefined(symbol) ? checker.getExportsOfModule(symbol) : [];
  };

  const resolveExport = (statement: ts.ExportDeclaration) => {
    if (
      !isDefined(statement.moduleSpecifier) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      return undefined;
    }

    return ts.resolveModuleName(
      statement.moduleSpecifier.text,
      statement.getSourceFile().fileName,
      compilerOptions,
      ts.sys,
    ).resolvedModule?.resolvedFileName;
  };

  const checkImplementationExports = (filePath: string) => {
    if (visitedFiles.has(filePath)) {
      return;
    }

    visitedFiles.add(filePath);
    const source = program.getSourceFile(filePath);

    if (!isDefined(source)) {
      errors.add(`Public export source is missing: ${filePath}`);
      return;
    }

    for (const symbol of getExports(filePath)) {
      const declarationSymbol =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;

      for (const declaration of declarationSymbol.declarations ?? []) {
        const declarationPath = declaration.getSourceFile().fileName;

        if (
          IMPLEMENTATION_ONLY_PATTERN.test(
            path.relative(sourceRoot, declarationPath),
          )
        ) {
          errors.add(
            `${path.relative(sourceRoot, filePath)} exports an implementation part: ${symbol.name} from ${path.relative(sourceRoot, declarationPath)}`,
          );
        }
      }
    }

    for (const statement of source.statements) {
      if (!ts.isExportDeclaration(statement)) {
        continue;
      }

      const target = resolveExport(statement);
      const moduleSpecifier = statement.moduleSpecifier;
      const isLocalExport =
        isDefined(moduleSpecifier) &&
        ts.isStringLiteral(moduleSpecifier) &&
        (moduleSpecifier.text.startsWith('.') ||
          moduleSpecifier.text.startsWith('@ui/'));

      if (!isDefined(target) && isLocalExport) {
        errors.add(
          `${path.relative(sourceRoot, filePath)} has an unresolved public export: ${moduleSpecifier.getText()}`,
        );
        continue;
      }

      const isInspectableSource =
        isDefined(target) && target.startsWith(`${sourceRoot}${path.sep}`);

      if (!isInspectableSource && !isDefined(statement.exportClause)) {
        errors.add(
          `${path.relative(sourceRoot, filePath)} has a star export without inspectable package source: ${moduleSpecifier?.getText()}`,
        );
      }

      if (!isDefined(target) || !isInspectableSource) {
        continue;
      }

      if (IMPLEMENTATION_ONLY_PATTERN.test(path.relative(sourceRoot, target))) {
        errors.add(
          `${path.relative(sourceRoot, filePath)} exports an implementation part: ${path.relative(sourceRoot, target)}`,
        );
      }

      checkImplementationExports(target);
    }
  };

  const getExportName = (symbol: ts.Symbol) => {
    let currentSymbol: ts.Symbol | undefined = symbol;
    let isTypeOnly = false;
    let isTablerIcon = false;
    const visitedSymbols = new Set<ts.Symbol>();

    while (isDefined(currentSymbol) && !visitedSymbols.has(currentSymbol)) {
      visitedSymbols.add(currentSymbol);

      for (const declaration of currentSymbol.declarations ?? []) {
        isTypeOnly ||= ts.isTypeOnlyImportOrExportDeclaration(declaration);

        if (
          !TABLER_ICON_NAME_PATTERN.test(symbol.name) ||
          declaration.getSourceFile().fileName !==
            path.join(sourceRoot, TABLER_ICONS_SOURCE) ||
          !ts.isExportSpecifier(declaration)
        ) {
          continue;
        }

        const moduleSpecifier = declaration.parent.parent.moduleSpecifier;

        isTablerIcon ||=
          isDefined(moduleSpecifier) &&
          ts.isStringLiteral(moduleSpecifier) &&
          moduleSpecifier.text === TABLER_ICONS_PACKAGE;
      }

      if (!(currentSymbol.flags & ts.SymbolFlags.Alias)) {
        isTypeOnly ||= !(currentSymbol.flags & ts.SymbolFlags.Value);
        break;
      }

      currentSymbol = checker.getImmediateAliasedSymbol(currentSymbol);
    }

    if (isTypeOnly) {
      return `type ${symbol.name}`;
    }

    return isTablerIcon ? `Icon* from ${TABLER_ICONS_SOURCE}` : symbol.name;
  };

  for (const [entryName, filePath] of Object.entries(entryPoints).sort()) {
    checkImplementationExports(filePath);
    const source = program.getSourceFile(filePath);

    if (!isDefined(source)) {
      continue;
    }

    const inheritedNames = new Set<string>();
    const typeOnlyStarNames = new Set<string>();
    const runtimeStarNames = new Set<string>();
    const exports = new Set<string>();

    for (const statement of source.statements) {
      if (
        !ts.isExportDeclaration(statement) ||
        isDefined(statement.exportClause)
      ) {
        continue;
      }

      const target = resolveExport(statement);
      const inheritedEntryName = isDefined(target)
        ? entryNames.get(target)
        : undefined;

      if (!isDefined(target)) {
        continue;
      }

      const starExportNames = statement.isTypeOnly
        ? typeOnlyStarNames
        : runtimeStarNames;

      for (const symbol of getExports(target)) {
        starExportNames.add(symbol.name);
      }

      if (!isDefined(inheritedEntryName)) {
        continue;
      }

      exports.add(
        `${statement.isTypeOnly ? 'type ' : ''}* from ${inheritedEntryName}`,
      );

      for (const symbol of getExports(target)) {
        inheritedNames.add(symbol.name);
      }
    }

    for (const symbol of getExports(filePath)) {
      if (inheritedNames.has(symbol.name)) {
        continue;
      }

      const isTypeOnlyStarExport =
        typeOnlyStarNames.has(symbol.name) &&
        !runtimeStarNames.has(symbol.name) &&
        !symbol.declarations?.some(
          (declaration) => declaration.getSourceFile().fileName === filePath,
        );

      exports.add(
        isTypeOnlyStarExport ? `type ${symbol.name}` : getExportName(symbol),
      );
    }

    snapshot[entryName] = [...exports].sort();
  }

  const exportErrors = [...errors];

  if (isNonEmptyArray(exportErrors)) {
    throw new Error(exportErrors.join('\n'));
  }

  return snapshot;
};
