import { isDefined } from 'twenty-shared/utils';

import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type FlatValidationRuleMaps } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule-maps.type';

export const getActiveValidationRules = ({
  flatValidationRuleMaps,
  objectMetadataId,
}: {
  flatValidationRuleMaps?: FlatValidationRuleMaps;
  objectMetadataId: string;
}): FlatValidationRule[] => {
  if (!isDefined(flatValidationRuleMaps)) {
    return [];
  }

  return Object.values(flatValidationRuleMaps.byUniversalIdentifier).filter(
    (flatValidationRule): flatValidationRule is FlatValidationRule =>
      isDefined(flatValidationRule) &&
      flatValidationRule.isActive &&
      flatValidationRule.objectMetadataId === objectMetadataId,
  );
};
