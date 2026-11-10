import { Injectable } from '@nestjs/common';

import { type ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { VIEW_FAMILY_CACHE_KEY_NAMES } from 'src/engine/metadata-modules/view/constants/view-family-cache-key-names.constant';
import { type ViewFamilyDTO } from 'src/engine/metadata-modules/view/dtos/view-family.dto';
import { type ViewFamilyAudience } from 'src/engine/metadata-modules/view/types/view-family-audience.type';
import { computeViewFamilyVersion } from 'src/engine/metadata-modules/view/utils/compute-view-family-version.util';
import { fromFlatViewToViewDto } from 'src/engine/metadata-modules/view/utils/from-flat-view-to-view-dto.util';
import { MetadataReadPermissionsService } from 'src/engine/permissions/metadata-permissions/services/metadata-read-permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getActiveWorkspaceCachePins } from 'src/engine/workspace-cache/storage/workspace-cache-request-pins.storage';

@Injectable()
export class ViewFamilyReadService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metadataReadPermissionsService: MetadataReadPermissionsService,
  ) {}

  async findViewFamily({
    workspaceId,
    viewTypes,
    audience,
  }: {
    workspaceId: string;
    viewTypes?: ViewType[];
    audience: ViewFamilyAudience;
  }): Promise<ViewFamilyDTO> {
    if (!isDefined(getActiveWorkspaceCachePins(workspaceId))) {
      throw new Error(
        'View family reads must run inside a workspace cache pin scope',
      );
    }

    const {
      data: { flatViewMaps },
      hashes,
    } = await this.workspaceCacheService.getOrRecomputeWithHashes(workspaceId, [
      ...VIEW_FAMILY_CACHE_KEY_NAMES,
    ]);

    const readContext = {
      workspaceId,
      authContext: workspaceAuthContextStorage.getStore(),
    };
    const isInAudience =
      audience === 'shared'
        ? await this.metadataReadPermissionsService.getSharedViewReadPredicate(
            readContext,
          )
        : await this.metadataReadPermissionsService.getOwnPrivateViewReadPredicate(
            readContext,
          );

    const views = Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatView) => flatView.workspaceId === workspaceId)
      .filter(
        (flatView) =>
          !isDefined(viewTypes) ||
          viewTypes.length === 0 ||
          viewTypes.includes(flatView.type),
      )
      .filter(isInAudience)
      .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))
      .map(fromFlatViewToViewDto);

    return {
      familyVersion: computeViewFamilyVersion(hashes),
      views,
    };
  }
}
