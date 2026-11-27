import { isDefined } from 'twenty-shared/utils';

import { type TemporaryChannelWriteAccess } from 'src/engine/permissions/channel-visibility/types/temporary-channel-write-access.type';
import { type PermissionsMainPrincipalWithRole } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

// TODO(@charlesBochet): remove after 2026-12-27. Temporary channel write access for admins and API keys, only to unblock customers who reported broken links, merges and deletes
export const findTemporaryChannelWriteAccessRoleIds = ({
  mainPrincipal,
  temporaryChannelWriteAccess,
}: {
  mainPrincipal: PermissionsMainPrincipalWithRole;
  temporaryChannelWriteAccess: Pick<
    TemporaryChannelWriteAccess,
    'adminRoleId' | 'isRestoredForAdminMembers' | 'apiKeysIndividualRoleId'
  >;
}): string[] => {
  const { adminRoleId, isRestoredForAdminMembers, apiKeysIndividualRoleId } =
    temporaryChannelWriteAccess;

  const isRestored =
    mainPrincipal.type === 'apiKey'
      ? isDefined(apiKeysIndividualRoleId) &&
        mainPrincipal.roleIds.includes(apiKeysIndividualRoleId)
      : isRestoredForAdminMembers;

  return isRestored && mainPrincipal.roleIds.includes(adminRoleId)
    ? [adminRoleId]
    : [];
};
