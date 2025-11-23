import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { RoleTargetExceptionCode } from 'src/engine/metadata-modules/role/exceptions/role-target.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export const validateFlatRoleTargetTargetsOnlyOneEntity = ({
  flatRoleTarget,
}: {
  flatRoleTarget: FlatRoleTarget;
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
