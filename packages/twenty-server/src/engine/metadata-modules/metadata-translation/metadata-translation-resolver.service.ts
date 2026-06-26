import { Injectable } from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getTwentyStandardApplicationIdOrThrow } from 'src/engine/metadata-modules/utils/get-twenty-standard-application-id-or-throw.util';

@Injectable()
export class MetadataTranslationResolverService {
  constructor(
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getApplicationCatalog({
    applicationId,
    workspaceId,
    locale,
  }: {
    applicationId: string;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<Record<string, string> | undefined> {
    const { flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatApplicationMaps'],
        },
      );

    const standardApplicationId =
      getTwentyStandardApplicationIdOrThrow(flatApplicationMaps);

    if (applicationId === standardApplicationId) {
      return undefined;
    }

    const applicationRegistrationId =
      flatApplicationMaps.byId[applicationId]?.applicationRegistrationId;

    if (!isDefined(applicationRegistrationId)) {
      return undefined;
    }

    return this.applicationTranslationCacheService.getCatalog({
      applicationRegistrationId,
      locale,
    });
  }
}
