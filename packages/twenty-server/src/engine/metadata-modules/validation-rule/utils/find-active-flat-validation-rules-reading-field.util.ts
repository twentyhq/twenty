/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';

export const findActiveFlatValidationRulesReadingField = ({
  fieldUniversalIdentifier,
  flatValidationRuleMaps,
}: {
  fieldUniversalIdentifier: string;
  flatValidationRuleMaps: FlatEntityMaps<FlatValidationRule>;
}): FlatValidationRule[] =>
  Object.values(flatValidationRuleMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      ({ isActive, bindings }) =>
        isActive && Object.values(bindings).includes(fieldUniversalIdentifier),
    );
