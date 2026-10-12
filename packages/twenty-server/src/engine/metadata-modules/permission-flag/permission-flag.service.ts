import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { fromFlatPermissionFlagToPermissionFlagDto } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-flat-permission-flag-to-permission-flag-dto.util';
import { type PermissionFlagDTO } from 'src/engine/metadata-modules/permission-flag/dtos/permission-flag.dto';

@Injectable()
export class PermissionFlagService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async findAll(workspaceId: string): Promise<PermissionFlagDTO[]> {
    const { flatPermissionFlagMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatPermissionFlagMaps'],
        },
      );

    return Object.values(flatPermissionFlagMaps.byUniversalIdentifier)
      .filter(isDefined)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(fromFlatPermissionFlagToPermissionFlagDto);
  }
}
