import { isDefined } from 'twenty-shared/utils';

import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type FlatValidationRuleMaps } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule-maps.type';

const activeRulesByObjectIdCache = new WeakMap<
  FlatValidationRuleMaps,
  Map<string, FlatValidationRule[]>
>();

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

  let activeRulesByObjectId = activeRulesByObjectIdCache.get(
    flatValidationRuleMaps,
  );

  if (!isDefined(activeRulesByObjectId)) {
    activeRulesByObjectId = new Map<string, FlatValidationRule[]>();

    for (const rule of Object.values(
      flatValidationRuleMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(rule) || !rule.isActive) {
        continue;
      }

      const objectRules =
        activeRulesByObjectId.get(rule.objectMetadataId) ?? [];

      objectRules.push(rule);
      activeRulesByObjectId.set(rule.objectMetadataId, objectRules);
    }

    activeRulesByObjectIdCache.set(
      flatValidationRuleMaps,
      activeRulesByObjectId,
    );
  }

  return activeRulesByObjectId.get(objectMetadataId) ?? [];
};
