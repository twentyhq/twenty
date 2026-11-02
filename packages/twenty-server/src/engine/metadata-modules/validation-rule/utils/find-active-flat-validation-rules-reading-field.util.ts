/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';

export const findActiveFlatValidationRulesReadingField = ({
  fieldUniversalIdentifiers,
  flatValidationRuleMaps,
}: {
  fieldUniversalIdentifiers: string[];
  flatValidationRuleMaps: Pick<
    FlatEntityMaps<FlatValidationRule>,
    'byUniversalIdentifier'
  >;
}): FlatValidationRule[] =>
  Object.values(flatValidationRuleMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(
      ({ isActive, bindings }) =>
        isActive &&
        Object.values(bindings).some((boundUniversalIdentifier) =>
          fieldUniversalIdentifiers.includes(boundUniversalIdentifier),
        ),
    );
