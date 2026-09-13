import { Injectable } from '@nestjs/common';

import { type DerivedFieldMetadataIds } from 'src/engine/metadata-modules/derived-field-metadata-ids/types/derived-field-metadata-ids.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeSearchableFieldMetadataIdsFromFlatSearchFieldMetadataMaps } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/compute-searchable-field-metadata-ids-from-flat-search-field-metadata-maps.util';
import { computeUniqueFieldMetadataIdsFromFlatIndexMaps } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-flat-index-maps.util';

@Injectable()
export class DerivedFieldMetadataIdsService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getForWorkspace(workspaceId: string): Promise<DerivedFieldMetadataIds> {
    const { flatIndexMaps, flatSearchFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatIndexMaps', 'flatSearchFieldMetadataMaps'],
        },
      );

    return {
      uniqueFieldMetadataIds:
        computeUniqueFieldMetadataIdsFromFlatIndexMaps(flatIndexMaps),
      searchableFieldMetadataIds:
        computeSearchableFieldMetadataIdsFromFlatSearchFieldMetadataMaps(
          flatSearchFieldMetadataMaps,
        ),
    };
  }
}
