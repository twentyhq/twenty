import { isDefined } from 'twenty-shared/utils';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const computeRoleIdsWithAllRecordsAccess = ({
  flatRoleMaps,
}: {
  flatRoleMaps: {
    byUniversalIdentifier: Partial<
      Record<string, Pick<FlatRole, 'id' | 'canUpdateAllSettings'>>
    >;
  };
}): string[] =>
  Object.values(flatRoleMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((flatRole) => flatRole.canUpdateAllSettings)
    .map((flatRole) => flatRole.id);
