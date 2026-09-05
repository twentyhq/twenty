import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FLAT_SHARING_RULE_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-sharing-rule/constants/flat-sharing-rule-editable-properties.constant';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { resolveSharingRuleGranteeRoleUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-sharing-rule/utils/resolve-sharing-rule-grantee-role-universal-identifier-or-throw.util';
import { type UpdateSharingRuleInput } from 'src/engine/metadata-modules/sharing-rule/dtos/update-sharing-rule.input';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export const fromUpdateSharingRuleInputToFlatSharingRuleOrThrow = ({
  updateSharingRuleInput,
  existingFlatSharingRule,
  flatRoleMaps,
}: {
  updateSharingRuleInput: UpdateSharingRuleInput;
  existingFlatSharingRule: FlatSharingRule;
} & Pick<AllFlatEntityMaps, 'flatRoleMaps'>): FlatSharingRule => {
  const { id: _id, ...update } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      updateSharingRuleInput,
      ['name'],
    );

  const updatedFlatSharingRule = mergeUpdateInExistingRecord({
    existing: existingFlatSharingRule,
    properties: [...FLAT_SHARING_RULE_EDITABLE_PROPERTIES],
    update,
  });

  return {
    ...updatedFlatSharingRule,
    granteeRoleUniversalIdentifier:
      resolveSharingRuleGranteeRoleUniversalIdentifierOrThrow({
        granteeRoleId: updatedFlatSharingRule.granteeRoleId,
        flatRoleMaps,
      }),
    updatedAt: new Date().toISOString(),
  };
};
