import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'class-validator';

import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type ValidateFlatRoleTargetAssignationAvailabilityArgs = {
  flatRole: UniversalFlatRole;
  flatRoleTarget: UniversalFlatRoleTarget;
  buildOptions: WorkspaceMigrationValidationBuildOptions;
};
export const validateFlatRoleTargetAssignationAvailability = ({
  flatRole,
  flatRoleTarget,
  buildOptions,
}: ValidateFlatRoleTargetAssignationAvailabilityArgs): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const roleLabel = flatRole.label;

  if (isDefined(flatRoleTarget.agentUniversalIdentifier)) {
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
  } else if (isDefined(flatRoleTarget.webhookUniversalIdentifier)) {
    if (!flatRole.canBeAssignedToApiKeys) {
      errors.push({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
        message: t`Role "${roleLabel}" cannot be assigned to webhooks`,
        userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to webhooks`,
      });
    }
  } else if (isDefined(flatRoleTarget.targetApplicationId)) {
    if (!flatRole.canBeAssignedToApplications) {
      errors.push({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
        message: t`Role "${roleLabel}" cannot be assigned to applications`,
        userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to applications`,
      });
    }

    const isOwnedByWorkspaceCustomApplication =
      buildOptions.applicationUniversalIdentifier ===
        buildOptions.workspaceCustomApplicationUniversalIdentifier &&
      flatRoleTarget.applicationUniversalIdentifier ===
        buildOptions.workspaceCustomApplicationUniversalIdentifier &&
      flatRole.applicationUniversalIdentifier ===
        buildOptions.workspaceCustomApplicationUniversalIdentifier;

    if (!isOwnedByWorkspaceCustomApplication) {
      errors.push({
        code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
        message: t`Only the workspace custom application can assign its own roles to applications`,
        userFriendlyMessage: msg`Only the workspace can assign a role to an application`,
      });
    }
  }

  return errors;
};
