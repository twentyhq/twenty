/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { listValidationRuleReadFieldUniversalIdentifiers } from 'src/engine/metadata-modules/validation-rule/utils/list-validation-rule-read-field-universal-identifiers.util';

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
      ({ isActive, tree }) =>
        isActive &&
        listValidationRuleReadFieldUniversalIdentifiers({ tree }).some(
          (readFieldUniversalIdentifier) =>
            fieldUniversalIdentifiers.includes(readFieldUniversalIdentifier),
        ),
    );
