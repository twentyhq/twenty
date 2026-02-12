import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'class-validator';

import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ValidateFlatRoleTargetAssignationAvailabilityArgs = {
  flatRole: UniversalFlatRole;
  flatRoleTarget: UniversalFlatRoleTarget;
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
