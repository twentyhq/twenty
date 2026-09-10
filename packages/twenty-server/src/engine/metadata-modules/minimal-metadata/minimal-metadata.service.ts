import { Injectable } from '@nestjs/common';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { FeatureFlagKey, ViewVisibility } from 'twenty-shared/types';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';
import { computeSeededObjectViewUniversalIdentifiers } from 'src/engine/metadata-modules/view/utils/compute-seeded-object-view-universal-identifiers.util';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';
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
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly i18nService: I18nService,
    private readonly applicationService: ApplicationService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  private async getHiddenSeededViewUniversalIdentifiers(
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

  async getMinimalMetadata(
    workspaceId: string,
    userWorkspaceId?: string,
    locale?: string,
  ): Promise<MinimalMetadataDTO> {
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

    const objectMetadataItems: MinimalObjectMetadataDTO[] = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatObjectMetadata) => flatObjectMetadata.isActive === true)
      .map((flatObjectMetadata) => {
        const isStandardApp = belongsToTwentyStandardApp(flatObjectMetadata);

        const overrides = flatObjectMetadata.overrides ?? undefined;
        const i18nContext = {
          locale: safeLocale,
          i18nInstance,
          isStandardApp,
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
      });

    const hiddenSeededViewUniversalIdentifiers =
      await this.getHiddenSeededViewUniversalIdentifiers(workspaceId);

    const views: MinimalViewDTO[] = Object.values(
      flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatView) =>
          !hiddenSeededViewUniversalIdentifiers.has(
            flatView.universalIdentifier,
          ),
      )
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
