import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_ALLOWED_IMPORTS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-allowed-imports.constant';
import { FrontComponentBuildException } from 'src/engine/metadata-modules/ai/ai-front-component/exceptions/front-component-build.exception';

export const validateFrontComponentSourceOrThrow = (source: string): void => {
  const sourceFile = typescript.createSourceFile(
    'component.front-component.tsx',
    source,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TSX,
  );
  let hasComponent = false;

  for (const statement of sourceFile.statements) {
    const modifiers = typescript.canHaveModifiers(statement)
      ? (typescript.getModifiers(statement) ?? [])
      : [];
    const isDefaultExport =
      typescript.isExportAssignment(statement) ||
      modifiers.some(
        (modifier) => modifier.kind === typescript.SyntaxKind.DefaultKeyword,
      ) ||
      (typescript.isExportDeclaration(statement) &&
        isDefined(statement.exportClause) &&
        typescript.isNamedExports(statement.exportClause) &&
        statement.exportClause.elements.some(
          (element) => element.name.text === 'default',
        ));

    if (isDefaultExport) {
      throw new FrontComponentBuildException(
        'Export a named Component without a default export. Twenty adds the SDK registration.',
        'INVALID_INPUT',
      );
    }

    if (
      modifiers.some(
        (modifier) => modifier.kind === typescript.SyntaxKind.ExportKeyword,
      )
    ) {
      hasComponent ||=
        (typescript.isFunctionDeclaration(statement) &&
          statement.name?.text === 'Component') ||
        (typescript.isVariableStatement(statement) &&
          statement.declarationList.declarations.some(
            (declaration) =>
              typescript.isIdentifier(declaration.name) &&
              declaration.name.text === 'Component',
          ));
    }

    // esbuild removes unused imports before running the resolver.
    if (
      (typescript.isImportDeclaration(statement) ||
        typescript.isExportDeclaration(statement)) &&
      isDefined(statement.moduleSpecifier) &&
      typescript.isStringLiteral(statement.moduleSpecifier) &&
      !FRONT_COMPONENT_ALLOWED_IMPORTS.includes(statement.moduleSpecifier.text)
    ) {
      throw new FrontComponentBuildException(
        `Unsupported import: ${statement.moduleSpecifier.text}. Use React and the supported twenty-ui imports.`,
        'INVALID_INPUT',
      );
    }
  }

  if (!hasComponent) {
    throw new FrontComponentBuildException(
      'Export a named Component function or const.',
      'INVALID_INPUT',
    );
  }
};
