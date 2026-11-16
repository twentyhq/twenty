import {
  type FieldMetadataComputation,
  type FieldMetadataComputationBindings,
} from 'twenty-shared/types';
import {
  getComputedFieldExpressionFieldPaths,
  isDefined,
} from 'twenty-shared/utils';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type ComputedFieldBindableSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-bindable-schema-field.type';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';

const getFieldPathsOrThrow = (expression: string): string[][] => {
  try {
    return getComputedFieldExpressionFieldPaths(expression);
  } catch {
    throw new ComputedFieldExpressionException('The expression cannot be read');
  }
};

const computeBindingsOrThrow = <
  TObject,
  TField extends ComputedFieldBindableSchemaField,
>({
  computation,
  object,
  schemaReader,
}: {
  computation: FieldMetadataComputation;
  object: TObject;
  schemaReader: ComputedFieldSchemaReader<TObject, TField>;
}): FieldMetadataComputationBindings => {
  const bindPath = ({
    path,
    evaluatedObject,
    pathPrefix,
  }: {
    path: string[];
    evaluatedObject: TObject;
    pathPrefix: string[];
  }): [string, string][] => {
    const { toOneRelationHops, field } = resolveComputedFieldPathOrThrow({
      path,
      object: evaluatedObject,
      schemaReader,
    });

    // A composite sub-field binds its field only, as in a validation rule
    return [
      ...toOneRelationHops.map(({ relationField }) => relationField),
      field,
    ].map((boundField, index): [string, string] => [
      [...pathPrefix, ...path.slice(0, index + 1)].join('.'),
      boundField.universalIdentifier,
    ]);
  };

  const bindExpression = ({
    expression,
    evaluatedObject,
    pathPrefix,
  }: {
    expression: string | undefined;
    evaluatedObject: TObject;
    pathPrefix: string[];
  }): [string, string][] =>
    (isDefined(expression) ? getFieldPathsOrThrow(expression) : []).flatMap(
      (path) => bindPath({ path, evaluatedObject, pathPrefix }),
    );

  if (computation.kind === 'FORMULA') {
    return Object.fromEntries(
      bindExpression({
        expression: computation.expression,
        evaluatedObject: object,
        pathPrefix: [],
      }),
    );
  }

  const { relationFieldName } = computation;
  const { relationField, relatedObject } =
    resolveComputedFieldSourceRelationOrThrow({
      relationFieldName,
      object,
      schemaReader,
    });

  const pathPrefix = [relationFieldName];

  return Object.fromEntries([
    [relationFieldName, relationField.universalIdentifier],
    ...(computation.kind === 'ROLLUP'
      ? bindExpression({
          expression: computation.expression,
          evaluatedObject: relatedObject,
          pathPrefix,
        })
      : []),
    ...bindExpression({
      expression: computation.filter,
      evaluatedObject: relatedObject,
      pathPrefix,
    }),
    ...(computation.kind === 'FILTERED_RELATION'
      ? (computation.orderBy ?? [])
          .flatMap(Object.keys)
          .flatMap((sortedFieldName) =>
            bindPath({
              path: [sortedFieldName],
              evaluatedObject: relatedObject,
              pathPrefix,
            }),
          )
      : []),
  ]);
};

// Every path is rooted at the computed field's own object, so what related records read is prefixed with the source relation.
// Undefined when a path does not resolve: validation reports why.
export const computeComputedFieldBindings = <
  TObject,
  TField extends ComputedFieldBindableSchemaField,
>(args: {
  computation: FieldMetadataComputation;
  object: TObject;
  schemaReader: ComputedFieldSchemaReader<TObject, TField>;
}): FieldMetadataComputationBindings | undefined => {
  try {
    return computeBindingsOrThrow(args);
  } catch (error) {
    if (error instanceof ComputedFieldExpressionException) {
      return undefined;
    }

    throw error;
  }
};
