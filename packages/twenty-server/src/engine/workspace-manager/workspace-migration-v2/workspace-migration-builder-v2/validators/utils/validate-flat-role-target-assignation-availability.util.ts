import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'class-validator';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

type ValidateFlatRoleTargetAssignationAvailabilityArgs = {
  flatRole: FlatRole;
  flatRoleTarget: FlatRoleTarget;
};
export const validateFlatRoleTargetAssignationAvailability = ({
  flatRole,
  flatRoleTarget,
}: ValidateFlatRoleTargetAssignationAvailabilityArgs): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const roleLabel = flatRole.label;

  if (isDefined(flatRoleTarget.agentId)) {
    if (!flatRole.canBeAssignedToAgents) {
      errors.push({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
        message: t`Role "${roleLabel}" cannot be assigned to agents`,
        userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to agents`,
      });
    }
  } else if (isDefined(flatRoleTarget.userWorkspaceId)) {
    if (!flatRole.canBeAssignedToUsers) {
      errors.push({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
        message: t`Role "${roleLabel}" cannot be assigned to users`,
        userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to users`,
      });
    }
  } else if (isDefined(flatRoleTarget.apiKeyId)) {
    if (!flatRole.canBeAssignedToApiKeys) {
      errors.push({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
        message: t`Role "${roleLabel}" cannot be assigned to API keys`,
        userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to API keys`,
      });
    }
  }

  return errors;
};
