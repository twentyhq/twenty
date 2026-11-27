import { Injectable } from '@nestjs/common';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { hasObjectMetadataLabelPlaceholder } from 'twenty-shared/i18n';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';
import { VIEW_CONTENT_HASH_BY_VIEW_ID_CACHE_KEY_NAMES } from 'src/engine/metadata-modules/minimal-metadata/constants/view-content-hash-by-view-id-cache-key-names.constant';
import { computeObjectViewsHashes } from 'src/engine/metadata-modules/minimal-metadata/utils/compute-object-views-hashes.util';
import { getWorkspaceCustomApplicationUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/overrides/utils/get-workspace-custom-application-universal-identifier-or-throw.util';
import { resolveEffectiveEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-entity-property.util';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
import { buildViewNameObjectLabels } from 'src/engine/metadata-modules/view/utils/build-view-name-object-labels.util';
import { fromFlatViewToViewDto } from 'src/engine/metadata-modules/view/utils/from-flat-view-to-view-dto.util';
import { isViewVisibleToCaller } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-caller.util';
import { resolveViewName } from 'src/engine/metadata-modules/view/utils/resolve-view-name.util';
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
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly i18nService: I18nService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  async getMinimalMetadata({
    workspaceId,
    workspaceCustomApplicationId,
    locale,
  }: {
    workspaceId: string;
    workspaceCustomApplicationId: string;
    locale?: string;
  }): Promise<MinimalMetadataDTO> {
    const [
      {
        flatObjectMetadataMaps,
        flatApplicationMaps,
        flatViewMaps,
        ...viewContentHashByViewIdMapsByCacheKeyName
      },
      cacheHashes,
    ] = await Promise.all([
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
        'flatObjectMetadataMaps',
        'flatViewMaps',
        ...VIEW_CONTENT_HASH_BY_VIEW_ID_CACHE_KEY_NAMES,
      ]),
      this.workspaceCacheService.getCacheHashes(
        workspaceId,
        ALL_FLAT_ENTITY_MAPS_PROPERTIES as WorkspaceCacheKeyName[],
      ),
    ]);

    const workspaceCustomApplicationUniversalIdentifier =
      getWorkspaceCustomApplicationUniversalIdentifierOrThrow({
        workspaceCustomApplicationId,
        flatApplicationMaps,
      });

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

    const objectMetadataItems: MinimalObjectMetadataDTO[] = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatObjectMetadata) =>
        resolveEffectiveFlatEntityProperty({
          metadataName: 'objectMetadata',
          flatEntity: flatObjectMetadata,
          property: 'isActive',
          authorContext: {
            workspaceCustomApplicationUniversalIdentifier,
          },
        }),
      )
      .map((flatObjectMetadata) => {
        const isStandardApp = belongsToTwentyStandardApp(flatObjectMetadata);

        const overrides = flatObjectMetadata.overrides ?? undefined;
        const i18nContext = {
          locale: safeLocale,
          i18nInstance,
          isStandardApp,
          workspaceCustomApplicationUniversalIdentifier,
          ownerApplicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
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
          isActive: true,
          isSystem: flatObjectMetadata.isSystem,
          isRemote: flatObjectMetadata.isRemote,
        };
      });

    const availableFlatViews = Object.values(flatViewMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((flatView) => flatView.workspaceId === workspaceId)
      .filter((flatView) => isViewVisibleToCaller({ view: flatView }));

    const views = await this.buildMinimalViews({
      flatViews: availableFlatViews,
      flatObjectMetadataMaps,
      workspaceId,
      locale: safeLocale,
    });

    const objectViewsHashes = computeObjectViewsHashes({
      flatViews: availableFlatViews,
      viewContentHashByViewIdMaps:
        VIEW_CONTENT_HASH_BY_VIEW_ID_CACHE_KEY_NAMES.map(
          (cacheKeyName) =>
            viewContentHashByViewIdMapsByCacheKeyName[cacheKeyName],
        ),
    });

    return {
      objectMetadataItems,
      views,
      objectViewsHashes,
      collectionHashes,
    };
  }

  private async buildMinimalViews({
    flatViews,
    flatObjectMetadataMaps,
    workspaceId,
    locale,
  }: {
    flatViews: FlatView[];
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
    workspaceId: string;
    locale: keyof typeof APP_LOCALES;
  }): Promise<MinimalViewDTO[]> {
    const viewDtos = flatViews.map(fromFlatViewToViewDto);

    const placeholderObjectMetadataById = new Map(
      viewDtos
        .filter((viewDto) => hasObjectMetadataLabelPlaceholder(viewDto.name))
        .map((viewDto) =>
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: viewDto.objectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          }),
        )
        .filter(isDefined)
        .map((flatObjectMetadata) => [
          flatObjectMetadata.id,
          flatObjectMetadata,
        ]),
    );

    const getI18nContext =
      await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
        {
          applicationIds: [
            ...new Set([
              ...viewDtos.map((viewDto) => viewDto.applicationId),
              ...[...placeholderObjectMetadataById.values()].map(
                (flatObjectMetadata) => flatObjectMetadata.applicationId,
              ),
            ]),
          ],
          locale,
          workspaceId,
        },
      );

    return viewDtos.map((viewDto) => {
      const placeholderObjectMetadata = placeholderObjectMetadataById.get(
        viewDto.objectMetadataId,
      );

      return {
        id: viewDto.id,
        universalIdentifier: viewDto.universalIdentifier,
        name: resolveViewName({
          view: viewDto,
          objectLabelPlaceholderValues: isDefined(placeholderObjectMetadata)
            ? buildViewNameObjectLabels({
                viewName: viewDto.name,
                objectMetadata: placeholderObjectMetadata,
                i18nContext: getI18nContext(
                  placeholderObjectMetadata.applicationId,
                ),
              })
            : undefined,
          i18nContext: getI18nContext(viewDto.applicationId),
        }),
        icon: viewDto.icon,
        type: viewDto.type,
        key: viewDto.key,
        objectMetadataId: viewDto.objectMetadataId,
        position: viewDto.position,
        isPrivate: viewDto.isPrivate,
        isActive: viewDto.isActive,
      };
    });
  }
}
