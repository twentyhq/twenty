import { Inject, Injectable } from '@nestjs/common';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/utils/resolve-effective-entity-property.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

const flatMapsKeyToMetadataName = (
  flatMapsKey: string,
): AllMetadataName | undefined => {
  const withoutPrefix = flatMapsKey.replace(/^flat/, '');
  const withoutSuffix = withoutPrefix.replace(/Maps$/, '');
  const metadataName = uncapitalize(withoutSuffix);

  return metadataName in ALL_METADATA_NAME
    ? (metadataName as AllMetadataName)
    : undefined;
};

@Injectable()
export class MinimalMetadataService {
  // SWC strips class fields + constructor when declared separately, and
  // also drops parameter-property assignments in some cases. The reliable
  // cross-compiler pattern is property injection via the @Inject() decorator
  // on a class field with the matching injection token.
  @Inject(WorkspaceManyOrAllFlatEntityMapsCacheService)
  private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(I18nService)
  private readonly i18nService: I18nService;

  async getMinimalMetadata({
    workspaceId,
    userWorkspaceId,
    locale,
    loaders,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    locale?: string;
    loaders: IDataloaders;
  }): Promise<MinimalMetadataDTO> {
    const [{ flatObjectMetadataMaps, flatViewMaps }, cacheHashes] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatViewMaps'],
        }),
        this.workspaceCacheService.getCacheHashes(
          workspaceId,
          ALL_FLAT_ENTITY_MAPS_PROPERTIES as WorkspaceCacheKeyName[],
        ),
      ]);

    const collectionHashes: CollectionHashDTO[] = Object.entries(cacheHashes)
      .map(([cacheKey, hash]) => {
        const metadataName = flatMapsKeyToMetadataName(cacheKey);

        if (!isDefined(metadataName) || !isDefined(hash)) {
          return undefined;
        }

        return { collectionName: metadataName, hash };
      })
      .filter(isDefined);

    const safeLocale = (locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE;
    const i18nInstance = this.i18nService.getI18nInstance(safeLocale);

    // Load the standard application id once so we can decide per object whether
    // the app catalog applies. The minimal path used to skip the app translation
    // catalog entirely, which made every extended-app label fall back to the
    // source string even when `core.applicationTranslation` had the translation.
    // See #23301.
    const standardApplicationId =
      (await loaders.standardApplicationIdLoader.load({ workspaceId })) ?? null;

    const objectMetadataItems: MinimalObjectMetadataDTO[] = await Promise.all(
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter((flatObjectMetadata) => flatObjectMetadata.isActive === true)
        .map(async (flatObjectMetadata) => {
          const isStandardApp =
            standardApplicationId === flatObjectMetadata.applicationId;

          const overrides = flatObjectMetadata.overrides ?? undefined;

          const applicationCatalog = isStandardApp
            ? undefined
            : await loaders.applicationTranslationCatalogLoader.load({
                applicationId: flatObjectMetadata.applicationId,
                workspaceId,
                locale: safeLocale,
              });

          const i18nContext = {
            locale: safeLocale,
            i18nInstance,
            isStandardApp,
            applicationCatalog,
          };

          return {
            id: flatObjectMetadata.id,
            nameSingular: flatObjectMetadata.nameSingular,
            namePlural: flatObjectMetadata.namePlural,
            labelSingular: resolveEffectiveEntityProperty({
              metadataName: 'objectMetadata',
              baseValue: flatObjectMetadata.labelSingular,
              overrides,
              property: 'labelSingular',
              i18nContext,
            }),
            labelPlural: resolveEffectiveEntityProperty({
              metadataName: 'objectMetadata',
              baseValue: flatObjectMetadata.labelPlural,
              overrides,
              property: 'labelPlural',
              i18nContext,
            }),
            icon: flatObjectMetadata.icon ?? undefined,
            isActive: flatObjectMetadata.isActive,
            isSystem: flatObjectMetadata.isSystem,
            isRemote: flatObjectMetadata.isRemote,
          };
        }),
    );

    const views: MinimalViewDTO[] = Object.values(
      flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatView) => flatView.workspaceId === workspaceId)
      .filter((flatView) => flatView.deletedAt === null)
      .filter(
        (flatView) =>
          flatView.visibility === ViewVisibility.WORKSPACE ||
          (flatView.visibility === ViewVisibility.UNLISTED &&
            isDefined(userWorkspaceId) &&
            flatView.createdByUserWorkspaceId === userWorkspaceId),
      )
      .map((flatView) => ({
        id: flatView.id,
        type: flatView.type,
        key: flatView.key,
        objectMetadataId: flatView.objectMetadataId,
      }));

    return {
      objectMetadataItems,
      views,
      collectionHashes,
    };
  }
}
