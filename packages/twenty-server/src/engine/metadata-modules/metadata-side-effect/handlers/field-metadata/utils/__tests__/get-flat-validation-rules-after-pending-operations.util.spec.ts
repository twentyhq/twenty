/* @license Enterprise */

import { getFlatValidationRulesAfterPendingOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/get-flat-validation-rules-after-pending-operations.util';

const KEPT_RULE = {
  universalIdentifier: 'kept-rule',
  objectMetadataUniversalIdentifier: 'kept-object',
  isActive: true,
};
const DELETED_RULE = {
  universalIdentifier: 'deleted-rule',
  objectMetadataUniversalIdentifier: 'kept-object',
  isActive: true,
};
const RULE_ON_DELETED_OBJECT = {
  universalIdentifier: 'rule-on-deleted-object',
  objectMetadataUniversalIdentifier: 'deleted-object',
  isActive: true,
};
const UPDATED_RULE = {
  universalIdentifier: 'updated-rule',
  objectMetadataUniversalIdentifier: 'kept-object',
  isActive: true,
};
const PENDING_UPDATE_OF_UPDATED_RULE = { ...UPDATED_RULE, isActive: false };

describe('getFlatValidationRulesAfterPendingOperations', () => {
  it('should drop rules deleted in the same migration or whose object is deleted, and apply pending updates', () => {
    expect(
      getFlatValidationRulesAfterPendingOperations({
        flatValidationRuleByUniversalIdentifier: Object.fromEntries(
          [KEPT_RULE, DELETED_RULE, RULE_ON_DELETED_OBJECT, UPDATED_RULE].map(
            (validationRule) => [
              validationRule.universalIdentifier,
              validationRule,
            ],
          ),
        ),
        flatValidationRuleToUpdateByUniversalIdentifier: {
          [UPDATED_RULE.universalIdentifier]: PENDING_UPDATE_OF_UPDATED_RULE,
        },
        flatValidationRuleToDeleteByUniversalIdentifier: {
          [DELETED_RULE.universalIdentifier]: DELETED_RULE,
        },
        flatObjectMetadataToDeleteByUniversalIdentifier: {
          'deleted-object': { universalIdentifier: 'deleted-object' },
        },
      }),
    ).toEqual([KEPT_RULE, PENDING_UPDATE_OF_UPDATED_RULE]);
  });
});
