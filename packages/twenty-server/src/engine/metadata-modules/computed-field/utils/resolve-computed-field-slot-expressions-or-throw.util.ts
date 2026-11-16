import { type FieldMetadataComputation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ComputedFieldSchemaField } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-field.type';
import { type ComputedFieldSchemaReader } from 'src/engine/metadata-modules/computed-field/types/computed-field-schema-reader.type';
import { type ComputedFieldSlotExpression } from 'src/engine/metadata-modules/computed-field/types/computed-field-slot-expression.type';
import { getComputedFieldSlotExpressions } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-slot-expressions.util';
import { getComputedFieldSourceRelationFieldName } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-source-relation-field-name.util';
import { resolveComputedFieldSourceRelationOrThrow } from 'src/engine/metadata-modules/computed-field/utils/resolve-computed-field-source-relation-or-throw.util';

// `pathPrefix` roots what an expression reads at the computed field's own object
export const resolveComputedFieldSlotExpressionsOrThrow = <
  TObject,
  TField extends ComputedFieldSchemaField,
>({
  computation,
  object,
  schemaReader,
}: {
  computation: FieldMetadataComputation;
  object: TObject;
  schemaReader: ComputedFieldSchemaReader<TObject, TField>;
}): {
  sourceRelation: { fieldName: string; relationField: TField } | undefined;
  slotExpressions: (ComputedFieldSlotExpression & {
    evaluatedObject: TObject;
    pathPrefix: string[];
  })[];
} => {
  const sourceRelationFieldName =
    getComputedFieldSourceRelationFieldName(computation);
  const sourceRelation = isDefined(sourceRelationFieldName)
    ? {
        fieldName: sourceRelationFieldName,
        ...resolveComputedFieldSourceRelationOrThrow({
          relationFieldName: sourceRelationFieldName,
          object,
          schemaReader,
        }),
      }
    : undefined;

  return {
    sourceRelation,
    slotExpressions: getComputedFieldSlotExpressions(computation).map(
      (slotExpression) =>
        slotExpression.slot.evaluatedOn === 'RELATED_RECORD' &&
        isDefined(sourceRelation)
          ? {
              ...slotExpression,
              evaluatedObject: sourceRelation.relatedObject,
              pathPrefix: [sourceRelation.fieldName],
            }
          : { ...slotExpression, evaluatedObject: object, pathPrefix: [] },
    ),
  };
};
