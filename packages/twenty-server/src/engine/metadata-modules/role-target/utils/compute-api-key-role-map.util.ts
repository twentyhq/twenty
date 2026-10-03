import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

export const computeApiKeyRoleMap = ({
  flatRoleTargetMaps,
}: {
  flatRoleTargetMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<FlatRoleTarget, 'apiKeyId' | 'roleId'>>
    >;
  };
}): Record<string, string> => {
  const apiKeyRoleMap: Record<string, string> = {};

  for (const flatRoleTarget of Object.values(
    flatRoleTargetMaps.byUniversalIdentifier,
  )) {
    if (isDefined(flatRoleTarget?.apiKeyId)) {
      apiKeyRoleMap[flatRoleTarget.apiKeyId] = flatRoleTarget.roleId;
    }
  }

  return apiKeyRoleMap;
};
