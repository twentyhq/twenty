import {
  type FieldMetadataComputation,
  type FieldMetadataComputationBindings,
} from 'twenty-shared/types';
import {
  isDefined,
  renameValidationRuleExpressionFields,
  renameValidationRulePath,
} from 'twenty-shared/utils';

import { COMPUTED_FIELD_KIND_DESCRIPTIONS } from 'src/engine/metadata-modules/computed-field/constants/computed-field-kind-descriptions.constant';
import { getComputedFieldSlotExpressions } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-slot-expressions.util';
import { getComputedFieldSourceRelationFieldName } from 'src/engine/metadata-modules/computed-field/utils/get-computed-field-source-relation-field-name.util';

export const renameComputedFieldComputationFields = ({
  computation,
  fieldNameByUniversalIdentifier,
}: {
  computation: FieldMetadataComputation;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): FieldMetadataComputation => {
  const { bindings } = computation;

  if (!isDefined(bindings)) {
    return computation;
  }

  const renamePath = (path: string): string =>
    renameValidationRulePath({
      path,
      bindings,
      fieldNameByUniversalIdentifier,
    });
  const renamedBindings: FieldMetadataComputationBindings = Object.fromEntries(
    Object.entries(bindings).map(([path, boundUniversalIdentifier]) => [
      renamePath(path),
      boundUniversalIdentifier,
    ]),
  );

  const { sourceRelationProperty } =
    COMPUTED_FIELD_KIND_DESCRIPTIONS[computation.kind];
  const sourceRelationFieldName =
    getComputedFieldSourceRelationFieldName(computation);

  // A related record's expressions are written from the related object, the bindings from the field's own object
  let relatedRecordBindings: FieldMetadataComputationBindings = {};

  if (isDefined(sourceRelationFieldName)) {
    const prefix = `${sourceRelationFieldName}.`;

    relatedRecordBindings = Object.fromEntries(
      Object.entries(bindings)
        .filter(([path]) => path.startsWith(prefix))
        .map(([path, boundUniversalIdentifier]) => [
          path.slice(prefix.length),
          boundUniversalIdentifier,
        ]),
    );
  }

  return {
    ...computation,
    ...(isDefined(sourceRelationProperty) && isDefined(sourceRelationFieldName)
      ? { [sourceRelationProperty]: renamePath(sourceRelationFieldName) }
      : {}),
    ...Object.fromEntries(
      getComputedFieldSlotExpressions(computation).map(
        ({ slot, expression }) => [
          slot.property,
          renameValidationRuleExpressionFields({
            expression,
            bindings:
              slot.evaluatedOn === 'RELATED_RECORD'
                ? relatedRecordBindings
                : bindings,
            fieldNameByUniversalIdentifier,
          }),
        ],
      ),
    ),
    bindings: renamedBindings,
  };
};
