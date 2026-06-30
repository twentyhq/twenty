import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type UniversalFlatRoleTarget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-target.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatRoleTargetTargetsOnlyOneEntity = ({
  flatRoleTarget,
}: {
  flatRoleTarget: UniversalFlatRoleTarget;
}) => {
  const errors: FlatEntityValidationError[] = [];

  const definedIdentifiersCount = [
    isDefined(flatRoleTarget.apiKeyId),
    isDefined(flatRoleTarget.userWorkspaceId),
    isDefined(flatRoleTarget.agentId),
  ].filter(Boolean).length;

  if (definedIdentifiersCount !== 1) {
    errors.push({
      code: RoleTargetExceptionCode.ROLE_TARGET_MISSING_IDENTIFIER,
      message: t`Role target must have exactly one of: apiKeyId, userWorkspaceId, or agentId`,
      userFriendlyMessage: msg`Role target must have exactly one of: apiKeyId, userWorkspaceId, or agentId`,
    });
  }

  return errors;
};
