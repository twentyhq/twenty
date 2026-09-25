import { type ValidationRuleBindings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_VALIDATION_RULE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-validation-rule/constants/flat-validation-rule-editable-properties.constant';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type UpdateValidationRuleInputUpdates } from 'src/engine/metadata-modules/validation-rule/dtos/update-validation-rule.input';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateValidationRuleInputToFlatValidationRuleToUpdate = ({
  existingFlatValidationRule,
  update,
  bindings,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  existingFlatValidationRule: FlatValidationRule;
  update: UpdateValidationRuleInputUpdates;
  bindings: ValidationRuleBindings;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): FlatValidationRule => {
  const mergedFlatValidationRule = mergeUpdateInExistingRecord({
    existing: existingFlatValidationRule,
    properties: [...FLAT_VALIDATION_RULE_EDITABLE_PROPERTIES],
    update: {
      ...update,
      ...(isDefined(update.message) && { message: update.message.trim() }),
      bindings,
    },
  });

  const { errorFieldMetadataUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'validationRule',
      foreignKeyValues: {
        objectMetadataId: mergedFlatValidationRule.objectMetadataId,
        errorFieldMetadataId: mergedFlatValidationRule.errorFieldMetadataId,
      },
      flatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
    });

  return {
    ...mergedFlatValidationRule,
    errorFieldMetadataUniversalIdentifier,
    updatedAt: new Date().toISOString(),
  };
};
