/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule.type';
import { type FlatRecordInheritanceRuleMaps } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule-maps.type';

export const findFlatRecordInheritanceRulesOfObject = ({
  objectMetadataId,
  flatRecordInheritanceRuleMaps,
}: {
  objectMetadataId: string;
  flatRecordInheritanceRuleMaps:
    | Pick<FlatRecordInheritanceRuleMaps, 'byUniversalIdentifier'>
    | undefined;
}): FlatRecordInheritanceRule[] => {
  if (!isDefined(flatRecordInheritanceRuleMaps)) {
    return [];
  }

  return Object.values(flatRecordInheritanceRuleMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      (flatRecordInheritanceRule) =>
        flatRecordInheritanceRule.objectMetadataId === objectMetadataId,
    );
};
