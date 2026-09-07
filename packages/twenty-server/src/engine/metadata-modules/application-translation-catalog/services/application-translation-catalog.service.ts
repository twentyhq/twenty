import { Injectable } from '@nestjs/common';

import { type TranslatableMetadataName } from 'twenty-shared/i18n';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { resolveRegistrationIdByApplicationId } from 'src/engine/metadata-modules/application-translation-catalog/utils/resolve-registration-id-by-application-id.util';
import { resolveTranslatableProperties } from 'src/engine/metadata-modules/application-translation-catalog/utils/resolve-translatable-properties.util';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
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
    private readonly i18nService: I18nService,
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

  // The single-entity context. GraphQL resolves labels in per-entity
  // ResolveFields, so it passes its request dataloaders to coalesce the N
  // calls one page produces; REST resolves a whole page in one call and has
  // nothing to coalesce, so it passes none. Same resolution either way.
  async buildEffectiveEntityI18nContext({
    applicationId,
    loaders,
    locale,
    workspaceId,
  }: {
    applicationId: string | undefined;
    loaders?: IDataloaders;
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<EffectiveEntityI18nContext> {
    const safeLocale = locale ?? SOURCE_LOCALE;

    if (!isDefined(loaders)) {
      const getI18nContext = await this.getI18nContextByApplicationId({
        applicationIds: [applicationId],
        locale,
        workspaceId,
      });

      return getI18nContext(applicationId);
    }

    const getI18nContext = this.toI18nContextResolver({
      standardApplicationId: await loaders.standardApplicationIdLoader.load({
        workspaceId,
      }),
      catalogByApplicationId: new Map(
        isDefined(applicationId)
          ? [
              [
                applicationId,
                await loaders.applicationTranslationCatalogLoader.load({
                  applicationId,
                  workspaceId,
                  locale: safeLocale,
                }),
              ],
            ]
          : [],
      ),
      locale,
    });

    return getI18nContext(applicationId);
  }

  async getI18nContextByApplicationId({
    applicationIds,
    locale,
    workspaceId,
  }: {
    applicationIds: (string | undefined)[];
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<
    (applicationId: string | undefined) => EffectiveEntityI18nContext
  > {
    const { standardApplicationId, catalogByApplicationId } =
      await this.getCatalogs({
        applicationIds,
        locale: locale ?? SOURCE_LOCALE,
        workspaceId,
      });

    return this.toI18nContextResolver({
      standardApplicationId,
      catalogByApplicationId,
      locale,
    });
  }

  // The one place the context shape is built, so the loader-backed and
  // batched sources cannot drift apart.
  private toI18nContextResolver({
    standardApplicationId,
    catalogByApplicationId,
    locale,
  }: {
    standardApplicationId: string;
    catalogByApplicationId: Map<string, Record<string, string> | undefined>;
    locale: keyof typeof APP_LOCALES | undefined;
  }): (applicationId: string | undefined) => EffectiveEntityI18nContext {
    const i18nInstance = this.i18nService.getI18nInstance(
      locale ?? SOURCE_LOCALE,
    );

    return (applicationId) => ({
      locale,
      i18nInstance,
      isStandardApp: applicationId === standardApplicationId,
      applicationCatalog: isDefined(applicationId)
        ? catalogByApplicationId.get(applicationId)
        : undefined,
    });
  }

  // The common case: merge every resolved translatable property back onto the
  // entity it came from. Callers that present several metadata names in one
  // payload use getI18nContextByApplicationId directly instead.
  async resolveTranslatablePropertiesForEntities<
    TEntity extends { applicationId?: string | null },
  >({
    metadataName,
    entities,
    locale,
    workspaceId,
  }: {
    metadataName: TranslatableMetadataName;
    entities: TEntity[];
    locale: keyof typeof APP_LOCALES | undefined;
    workspaceId: string;
  }): Promise<TEntity[]> {
    const getI18nContext = await this.getI18nContextByApplicationId({
      applicationIds: entities.map(
        (entity) => entity.applicationId ?? undefined,
      ),
      locale,
      workspaceId,
    });

    return entities.map((entity) => ({
      ...entity,
      ...resolveTranslatableProperties({
        metadataName,
        entity,
        i18nContext: getI18nContext(entity.applicationId ?? undefined),
      }),
    }));
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
