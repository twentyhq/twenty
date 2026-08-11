import { Injectable } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeUniqueFieldMetadataIdsFromFlatIndexMaps } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-flat-index-maps.util';

@Injectable()
export class UniqueFieldMetadataIdsService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getForWorkspace(workspaceId: string): Promise<ReadonlySet<string>> {
    const { flatIndexMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatIndexMaps'] },
      );

    return computeUniqueFieldMetadataIdsFromFlatIndexMaps(flatIndexMaps);
  }
}
