import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { buildIsMorphRelationReferenceVisible } from 'src/engine/metadata-modules/morph-relation-head/utils/build-is-morph-relation-reference-visible.util';

// TODO: drop with IS_MORPH_RELATION_HEAD_ENABLED, after deleting target references
@Injectable()
export class MorphRelationReferenceVisibilityService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getIsMorphRelationReferenceVisible(
    workspaceId: string,
  ): Promise<(fieldMetadataId: string | null | undefined) => boolean> {
    const [{ flatFieldMetadataMaps }, isMorphRelationHeadEnabled] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatFieldMetadataMaps'],
        }),
        this.featureFlagService.isFeatureEnabled(
          FeatureFlagKey.IS_MORPH_RELATION_HEAD_ENABLED,
          workspaceId,
        ),
      ]);

    return buildIsMorphRelationReferenceVisible({
      flatFieldMetadataMaps,
      isMorphRelationHeadEnabled,
    });
  }
}
