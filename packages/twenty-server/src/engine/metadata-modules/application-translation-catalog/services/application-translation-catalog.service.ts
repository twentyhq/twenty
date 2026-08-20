import { Injectable } from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { resolveRegistrationIdByApplicationId } from 'src/engine/metadata-modules/application-translation-catalog/utils/resolve-registration-id-by-application-id.util';
import { getTwentyStandardApplicationIdOrThrow } from 'src/engine/metadata-modules/utils/get-twenty-standard-application-id-or-throw.util';

export type ApplicationCatalogs = {
  standardApplicationId: string;
  catalogByApplicationId: Map<string, Record<string, string> | undefined>;
};

@Injectable()
export class ApplicationTranslationCatalogService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCacheService: ApplicationTranslationCacheService,
  ) {}

  async getStandardApplicationId({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string> {
    return getTwentyStandardApplicationIdOrThrow(
      await this.getFlatApplicationMaps({ workspaceId }),
    );
  }

  // Batched on purpose: one flat-maps read and one fetch per distinct
  // application, however many entities the caller is resolving.
  async getCatalogs({
    applicationIds,
    locale,
    workspaceId,
  }: {
    applicationIds: (string | undefined)[];
    locale: keyof typeof APP_LOCALES;
    workspaceId: string;
  }): Promise<ApplicationCatalogs> {
    const flatApplicationMaps = await this.getFlatApplicationMaps({
      workspaceId,
    });

    const standardApplicationId =
      getTwentyStandardApplicationIdOrThrow(flatApplicationMaps);

    const registrationIdByApplicationId = resolveRegistrationIdByApplicationId({
      applicationIds,
      flatApplicationMaps,
      standardApplicationId,
    });

    const catalogByRegistrationId = new Map(
      await Promise.all(
        [...new Set(registrationIdByApplicationId.values())].map(
          async (applicationRegistrationId) =>
            [
              applicationRegistrationId,
              await this.applicationTranslationCacheService.getCatalog({
                applicationRegistrationId,
                locale,
              }),
            ] as const,
        ),
      ),
    );

    const catalogByApplicationId = new Map<
      string,
      Record<string, string> | undefined
    >();

    for (const [
      applicationId,
      applicationRegistrationId,
    ] of registrationIdByApplicationId) {
      catalogByApplicationId.set(
        applicationId,
        catalogByRegistrationId.get(applicationRegistrationId),
      );
    }

    return { standardApplicationId, catalogByApplicationId };
  }

  private async getFlatApplicationMaps({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatApplicationCacheMaps> {
    const { flatApplicationMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatApplicationMaps'],
        },
      );

    return flatApplicationMaps;
  }
}
