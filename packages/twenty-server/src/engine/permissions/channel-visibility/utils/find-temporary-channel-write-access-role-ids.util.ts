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
    'adminRoleId' | 'apiKeysIndividualRoleId'
  >;
}): string[] => {
  const { adminRoleId, apiKeysIndividualRoleId } = temporaryChannelWriteAccess;

  if (
    mainPrincipal.type === 'apiKey' &&
    isDefined(apiKeysIndividualRoleId) &&
    mainPrincipal.roleIds.includes(apiKeysIndividualRoleId)
  ) {
    return mainPrincipal.roleIds.filter(
      (roleId) => roleId !== apiKeysIndividualRoleId,
    );
  }

  return mainPrincipal.roleIds.filter((roleId) => roleId === adminRoleId);
};
