import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationValidationBuildOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type ValidateFlatRoleTargetAgentTargetArgs = {
  flatRole: Pick<UniversalFlatRole, 'label' | 'applicationUniversalIdentifier'>;
  flatRoleTarget: Pick<UniversalFlatRoleTarget, 'agentUniversalIdentifier'>;
  buildOptions: Pick<
    WorkspaceMigrationValidationBuildOptions,
    | 'applicationUniversalIdentifier'
    | 'workspaceCustomApplicationUniversalIdentifier'
  >;
};

export const validateFlatRoleTargetAgentTarget = ({
  flatRole,
  flatRoleTarget,
  buildOptions: {
    applicationUniversalIdentifier,
    workspaceCustomApplicationUniversalIdentifier,
  },
}: ValidateFlatRoleTargetAgentTargetArgs): FlatEntityValidationError[] => {
  if (
    !isDefined(flatRoleTarget.agentUniversalIdentifier) ||
    applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier ||
    flatRole.applicationUniversalIdentifier === applicationUniversalIdentifier
  ) {
    return [];
  }

  const roleLabel = flatRole.label;

  return [
    {
      code: RoleTargetExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_ENTITY,
      message: t`Role "${roleLabel}" must be owned by the application to be assigned to its agents`,
      userFriendlyMessage: msg`Role "${roleLabel}" cannot be assigned to this agent`,
    },
  ];
};
