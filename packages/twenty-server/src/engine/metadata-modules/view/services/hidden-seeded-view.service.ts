import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeSeededObjectViewUniversalIdentifiers } from 'src/engine/metadata-modules/view/utils/compute-seeded-object-view-universal-identifiers.util';

@Injectable()
export class HiddenSeededViewService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly applicationService: ApplicationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getHiddenSeededViewUniversalIdentifiers(
    workspaceId: string,
  ): Promise<Set<string>> {
    const isSeededDefaultViewEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_SEEDED_DEFAULT_VIEW_ENABLED,
        workspaceId,
      );

    if (isSeededDefaultViewEnabled) {
      return new Set();
    }

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return computeSeededObjectViewUniversalIdentifiers({
      flatObjectMetadataMaps,
      seededViewApplicationUniversalIdentifier:
        workspaceCustomFlatApplication.universalIdentifier,
    });
  }
}
