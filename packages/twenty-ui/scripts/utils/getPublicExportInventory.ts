import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { isDefined } from '../../src/utilities/utils/isDefined';
import { type PublicExportInventory } from '../types/PublicExportInventory';

const PRIVATE_SOURCE_PATTERN =
  /\/(internal|internals|parts|__tests__|__stories__|__mocks__)\//;
const PRIVATE_FILE_PATTERN = /\.(stories|test|spec)(\.tsx?)?$/;

export const getPublicExportInventory = ({
  sourceRoot,
  entryPoints,
}: {
  sourceRoot: string;
  entryPoints: string[];
}): PublicExportInventory => {
  const inventory: PublicExportInventory = {};

  for (const entryPoint of [...entryPoints].sort()) {
    const filePath = path.join(sourceRoot, entryPoint, 'index.ts');
    const source = ts.createSourceFile(
      filePath,
      readFileSync(filePath, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
    );
    const entry: PublicExportInventory[string] = {
      reExports: [],
      values: {},
      types: {},
    };

    for (const statement of source.statements) {
      const hasExportModifier =
        ts.canHaveModifiers(statement) &&
        ts
          .getModifiers(statement)
          ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

      if (
        ts.isExportAssignment(statement) ||
        (!ts.isExportDeclaration(statement) && hasExportModifier)
      ) {
        throw new Error(`${filePath} must re-export named declarations`);
      }

      if (!ts.isExportDeclaration(statement)) {
        continue;
      }

      const isEmptyExport =
        !isDefined(statement.moduleSpecifier) &&
        isDefined(statement.exportClause) &&
        ts.isNamedExports(statement.exportClause) &&
        !isNonEmptyArray(statement.exportClause.elements);

      if (isEmptyExport) {
        continue;
      }

      if (!isDefined(statement.moduleSpecifier)) {
        throw new Error(`${filePath} has an export without a source`);
      }

      if (!ts.isStringLiteral(statement.moduleSpecifier)) {
        throw new Error(`${filePath} has an invalid export source`);
      }

      const moduleName = statement.moduleSpecifier.text;
      const target = path.resolve(path.dirname(filePath), moduleName);
      const relativeTarget = path.relative(sourceRoot, target);

      if (
        !moduleName.startsWith('./') ||
        relativeTarget.startsWith('..') ||
        PRIVATE_SOURCE_PATTERN.test(`${target}/`) ||
        PRIVATE_FILE_PATTERN.test(target)
      ) {
        throw new Error(
          `${filePath} exports a private or external source: ${moduleName}`,
        );
      }

      if (!isDefined(statement.exportClause)) {
        if (statement.isTypeOnly) {
          throw new Error(
            `${filePath} must name its type exports: ${moduleName}`,
          );
        }
        if (!entryPoints.includes(relativeTarget)) {
          throw new Error(
            `${filePath} re-exports an undeclared entry point: ${moduleName}`,
          );
        }
        entry.reExports.push(relativeTarget);
        continue;
      }

      if (!ts.isNamedExports(statement.exportClause)) {
        throw new Error(`${filePath} must name its exports: ${moduleName}`);
      }

      for (const element of statement.exportClause.elements) {
        const name = element.name.text;
        const declarations =
          statement.isTypeOnly || element.isTypeOnly
            ? entry.types
            : entry.values;

        if (isDefined(declarations[name])) {
          throw new Error(`${filePath} exports ${name} more than once`);
        }

        const sourceName = element.propertyName?.text;
        declarations[name] = isNonEmptyString(sourceName)
          ? `${relativeTarget}#${sourceName}`
          : relativeTarget;
      }
    }

    entry.reExports.sort();
    entry.values = Object.fromEntries(
      Object.entries(entry.values).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    );
    entry.types = Object.fromEntries(
      Object.entries(entry.types).sort(([first], [second]) =>
        first.localeCompare(second),
      ),
    );
    inventory[entryPoint] = entry;
  }

  return inventory;
};
