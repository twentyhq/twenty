import { isDefined } from 'twenty-shared/utils';

import { type ChannelWriteAccess } from 'src/engine/permissions/channel-visibility/types/channel-write-access.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const restoreChannelWriteAccess = ({
  recordsPermissions,
  objectMetadataIds,
  writeAccess,
}: {
  recordsPermissions: RoleRecordsPermissions;
  objectMetadataIds: string[];
  writeAccess: ChannelWriteAccess;
}): RoleRecordsPermissions => ({
  ...recordsPermissions,
  objects: {
    ...recordsPermissions.objects,
    ...Object.fromEntries(
      objectMetadataIds.flatMap((objectMetadataId) => {
        const objectRecordsPermissions =
          recordsPermissions.objects[objectMetadataId];

        return isDefined(objectRecordsPermissions)
          ? [
              [
                objectMetadataId,
                { ...objectRecordsPermissions, ...writeAccess },
              ],
            ]
          : [];
      }),
    ),
  },
});
