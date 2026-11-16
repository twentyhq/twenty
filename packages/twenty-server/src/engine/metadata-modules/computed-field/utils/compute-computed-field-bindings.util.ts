import {
  type FieldMetadataComputation,
  type FieldMetadataComputationBindings,
} from 'twenty-shared/types';
import {
  ComputedFieldExpressionError,
  getComputedFieldExpressionFieldPaths,
  isDefined,
} from 'twenty-shared/utils';

import { type ComputedFieldBindableSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-bindable-schema-field.type';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { resolveComputedFieldPathOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-path-or-throw.util';
import { resolveComputedFieldSlotExpressionsOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-slot-expressions-or-throw.util';

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
  const { sourceRelation, slotExpressions } =
    resolveComputedFieldSlotExpressionsOrThrow({
      computation,
      object,
      schemaReader,
    });

  return Object.fromEntries([
    ...(isDefined(sourceRelation)
      ? [
          [
            sourceRelation.fieldName,
            sourceRelation.relationField.universalIdentifier,
          ],
        ]
      : []),
    ...slotExpressions.flatMap(({ expression, evaluatedObject, pathPrefix }) =>
      getComputedFieldExpressionFieldPaths(expression).flatMap((path) => {
        const { toOneRelationHops, field } = resolveComputedFieldPathOrThrow({
          path,
          object: evaluatedObject,
          schemaReader,
        });

        // A composite sub-field binds its field only, as in a validation rule
        return [
          ...toOneRelationHops.map(({ relationField }) => relationField),
          field,
        ].map((boundField, index) => [
          [...pathPrefix, ...path.slice(0, index + 1)].join('.'),
          boundField.universalIdentifier,
        ]);
      }),
    ),
  ]);
};

// Every path is rooted at the computed field's own object, so what related records read is prefixed with the relation.
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
    if (error instanceof ComputedFieldExpressionError) {
      return undefined;
    }

    throw error;
  }
};
