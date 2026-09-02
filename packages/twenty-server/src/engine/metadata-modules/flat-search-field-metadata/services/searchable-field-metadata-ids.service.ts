import { Injectable } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeSearchableFieldMetadataIdsFromFlatSearchFieldMetadataMaps } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-searchable-field-metadata-ids-from-flat-search-field-metadata-maps.util';

@Injectable()
export class SearchableFieldMetadataIdsService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getForWorkspace(workspaceId: string): Promise<ReadonlySet<string>> {
    const { flatSearchFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatSearchFieldMetadataMaps'] },
      );

    return computeSearchableFieldMetadataIdsFromFlatSearchFieldMetadataMaps(
      flatSearchFieldMetadataMaps,
    );
  }
}
