import { Injectable } from '@nestjs/common';

import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export type ObjectRecordPermission = keyof Pick<
  ObjectPermissions,
  'canReadObjectRecords' | 'canUpdateObjectRecords'
>;

@Injectable()
export class ObjectRecordPermissionService {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async assertObjectRecordPermissions({
    workspaceId,
    userWorkspaceId,
    objectUniversalIdentifiers,
    requiredPermissions,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    objectUniversalIdentifiers: string[];
    requiredPermissions: ObjectRecordPermission[];
  }): Promise<void> {
    const [{ objectsPermissions }, { flatObjectMetadataMaps }] =
      await Promise.all([
        this.permissionsService.getUserWorkspacePermissions({
          workspaceId,
          userWorkspaceId,
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]),
      ]);

    for (const objectUniversalIdentifier of objectUniversalIdentifiers) {
      const objectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier];
      const objectPermissions = isDefined(objectMetadata)
        ? objectsPermissions[objectMetadata.id]
        : undefined;

      const hasRequiredPermissions = requiredPermissions.every(
        (requiredPermission) =>
          objectPermissions?.[requiredPermission] === true,
      );

      if (!hasRequiredPermissions) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
  }
}
