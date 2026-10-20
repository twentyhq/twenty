import * as typescript from 'typescript';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentQuerySchema } from './ai-front-component.schemas';

export const readFrontComponentQuery = (source: string) => {
  const sourceFile = typescript.createSourceFile(
    'component.front-component.tsx',
    source,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TSX,
  );
  const queryExport = sourceFile.statements
    .filter(typescript.isExportDeclaration)
    .flatMap(({ exportClause }) =>
      isDefined(exportClause) && typescript.isNamedExports(exportClause)
        ? exportClause.elements
        : [],
    )
    .find(({ name }) => name.text === 'componentQuery');
  const queryName = queryExport?.propertyName?.text ?? 'componentQuery';
  const initializer = sourceFile.statements
    .filter(typescript.isVariableStatement)
    .flatMap(({ declarationList }) => declarationList.declarations)
    .find(
      ({ name }) => typescript.isIdentifier(name) && name.text === queryName,
    )?.initializer;

  if (
    !isDefined(initializer) ||
    !typescript.isObjectLiteralExpression(initializer)
  ) {
    throw new Error('Component query must be a static object literal.');
  }

  const query = Object.fromEntries(
    initializer.properties.map((property) => {
      if (
        !typescript.isPropertyAssignment(property) ||
        (!typescript.isIdentifier(property.name) &&
          !typescript.isStringLiteral(property.name))
      ) {
        throw new Error(
          'Component query must contain only literal properties.',
        );
      }
      const value = property.initializer;

      if (typescript.isStringLiteral(value)) {
        return [property.name.text, value.text];
      }
      if (typescript.isNumericLiteral(value)) {
        return [property.name.text, Number(value.text)];
      }
      if (typescript.isArrayLiteralExpression(value)) {
        return [
          property.name.text,
          value.elements.map((element) => {
            if (!typescript.isStringLiteral(element)) {
              throw new Error(
                'Component query arrays must contain only strings.',
              );
            }
            return element.text;
          }),
        ];
      }
      throw new Error('Component query must contain only literal values.');
    }),
  );

  return frontComponentQuerySchema.parse(query);
};
