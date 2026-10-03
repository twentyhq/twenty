import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';

export const computeUserWorkspaceRoleMap = ({
  flatRoleTargetMaps,
}: {
  flatRoleTargetMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<FlatRoleTarget, 'userWorkspaceId' | 'roleId'>>
    >;
  };
}): UserWorkspaceRoleMap => {
  const userWorkspaceRoleMap: UserWorkspaceRoleMap = {};

  for (const flatRoleTarget of Object.values(
    flatRoleTargetMaps.byUniversalIdentifier,
  )) {
    if (isDefined(flatRoleTarget?.userWorkspaceId)) {
      userWorkspaceRoleMap[flatRoleTarget.userWorkspaceId] =
        flatRoleTarget.roleId;
    }
  }

  return userWorkspaceRoleMap;
};
