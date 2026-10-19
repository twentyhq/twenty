import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/permissions/constants/member-role-universal-identifier.constants';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

type ValidateRoleTargetsRebindToDefaultRoleOrThrowArgs = {
  flatRolesToDelete: Pick<FlatRole, 'isEditable' | 'universalIdentifier'>[];
  defaultFlatRole: Pick<
    FlatRole,
    'label' | 'canBeAssignedToApiKeys' | 'canBeAssignedToAgents'
  >;
  flatRoleTargetsToCreate: Pick<FlatRoleTarget, 'apiKeyId' | 'agentId'>[];
};

export const validateRoleTargetsRebindToDefaultRoleOrThrow = ({
  flatRolesToDelete,
  defaultFlatRole,
  flatRoleTargetsToCreate,
}: ValidateRoleTargetsRebindToDefaultRoleOrThrowArgs): void => {
  if (
    flatRolesToDelete.some(
      ({ isEditable, universalIdentifier }) =>
        !isEditable || universalIdentifier === MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
    )
  ) {
    return;
  }

  if (
    !defaultFlatRole.canBeAssignedToApiKeys &&
    flatRoleTargetsToCreate.some(({ apiKeyId }) => isDefined(apiKeyId))
  ) {
    throw new PermissionsException(
      `Cannot delete role: the workspace default role "${defaultFlatRole.label}" cannot be assigned to API keys.`,
      PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
      {
        userFriendlyMessage: msg`Cannot delete this role: it is still assigned to one or more API keys, and the workspace default role cannot be assigned to API keys. Please reassign these API keys to another role first.`,
      },
    );
  }

  if (
    !defaultFlatRole.canBeAssignedToAgents &&
    flatRoleTargetsToCreate.some(({ agentId }) => isDefined(agentId))
  ) {
    throw new PermissionsException(
      `Cannot delete role: the workspace default role "${defaultFlatRole.label}" cannot be assigned to agents.`,
      PermissionsExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
      {
        userFriendlyMessage: msg`Cannot delete this role: it is still assigned to one or more agents, and the workspace default role cannot be assigned to agents. Please reassign these agents to another role first.`,
      },
    );
  }
};
