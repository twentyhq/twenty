/* @license Enterprise */

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getFlatValidationRulesAfterPendingOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/get-flat-validation-rules-after-pending-operations.util';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';

const buildFlatValidationRule = ({
  universalIdentifier,
  objectMetadataUniversalIdentifier,
  isActive = true,
}: {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  isActive?: boolean;
}): UniversalFlatValidationRule =>
  ({
    universalIdentifier,
    objectMetadataUniversalIdentifier,
    isActive,
  }) as UniversalFlatValidationRule;

const KEPT_RULE = buildFlatValidationRule({
  universalIdentifier: 'kept-rule',
  objectMetadataUniversalIdentifier: 'kept-object',
});
const DELETED_RULE = buildFlatValidationRule({
  universalIdentifier: 'deleted-rule',
  objectMetadataUniversalIdentifier: 'kept-object',
});
const RULE_ON_DELETED_OBJECT = buildFlatValidationRule({
  universalIdentifier: 'rule-on-deleted-object',
  objectMetadataUniversalIdentifier: 'deleted-object',
});
const UPDATED_RULE = buildFlatValidationRule({
  universalIdentifier: 'updated-rule',
  objectMetadataUniversalIdentifier: 'kept-object',
});
const PENDING_UPDATE_OF_UPDATED_RULE: UniversalFlatValidationRule = {
  ...UPDATED_RULE,
  isActive: false,
};
const DELETED_OBJECT = {
  universalIdentifier: 'deleted-object',
} as MetadataUniversalFlatEntity<'objectMetadata'>;

describe('getFlatValidationRulesAfterPendingOperations', () => {
  it('should drop rules deleted in the same migration or whose object is deleted, and apply pending updates', () => {
    const allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName =
      {
        validationRule: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {
            [UPDATED_RULE.universalIdentifier]: PENDING_UPDATE_OF_UPDATED_RULE,
          },
          flatEntityToDelete: {
            [DELETED_RULE.universalIdentifier]: DELETED_RULE,
          },
        },
        objectMetadata: {
          flatEntityToCreate: {},
          flatEntityToUpdate: {},
          flatEntityToDelete: {
            [DELETED_OBJECT.universalIdentifier]: DELETED_OBJECT,
          },
        },
      };

    expect(
      getFlatValidationRulesAfterPendingOperations({
        allFlatEntityOperationRecordByMetadataName,
        flatValidationRuleByUniversalIdentifier: Object.fromEntries(
          [KEPT_RULE, DELETED_RULE, RULE_ON_DELETED_OBJECT, UPDATED_RULE].map(
            (flatValidationRule) => [
              flatValidationRule.universalIdentifier,
              flatValidationRule,
            ],
          ),
        ),
      }),
    ).toEqual([KEPT_RULE, PENDING_UPDATE_OF_UPDATED_RULE]);
  });
});
