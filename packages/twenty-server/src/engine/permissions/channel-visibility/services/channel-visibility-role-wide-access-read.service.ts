import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type RolesReadingAllRecordsDTO } from 'src/engine/permissions/channel-visibility/dtos/roles-reading-all-records.dto';
import { computeRolesReadingAllRecords } from 'src/engine/permissions/channel-visibility/utils/compute-roles-reading-all-records.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ChannelVisibilityRoleWideAccessReadService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findRolesReadingAllRecords({
    workspaceId,
    objectUniversalIdentifier,
  }: {
    workspaceId: string;
    objectUniversalIdentifier: string;
  }): Promise<RolesReadingAllRecordsDTO> {
    const { flatRoleMaps, flatObjectMetadataMaps, rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'flatObjectMetadataMaps',
        'rolesPermissions',
      ]);
    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier];

    if (!isDefined(objectMetadata)) {
      return { isAdminRoleIncluded: false, otherRoleCount: 0 };
    }

    return computeRolesReadingAllRecords({
      flatRoles: Object.values(flatRoleMaps.byUniversalIdentifier).filter(
        isDefined,
      ),
      rolesPermissions,
      objectMetadataId: objectMetadata.id,
    });
  }
}
