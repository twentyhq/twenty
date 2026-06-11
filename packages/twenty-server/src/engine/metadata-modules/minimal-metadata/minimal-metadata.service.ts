import { Injectable } from '@nestjs/common';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';
import { resolveObjectMetadataStandardOverride } from 'src/engine/metadata-modules/object-metadata/utils/resolve-object-metadata-standard-override.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { PropelNavFilterService } from 'src/modules/propel-rls/propel-nav-filter.service';

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
    private readonly propelNavFilterService: PropelNavFilterService,
  ) {}

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

    // Propel: `navigationMenuItems` is served ROLE-FILTERED (propel-nav-filter),
    // but these hashes are workspace-global and the frontend's metadata store is
    // persisted (localStorage) and shared per origin — so without this, a client
    // that cached the collection under one identity (e.g. an admin who then
    // impersonates an agent) never refetches and renders the wrong sidebar.
    // Salting the navigationMenuItem hash with the requester's filter outcome
    // makes a role/impersonation switch mismatch the persisted hash → refetch.
    const navHashEntry = collectionHashes.find(
      (entry) => entry.collectionName === 'navigationMenuItem',
    );

    if (isDefined(navHashEntry)) {
      const hiddenNavItemUids =
        await this.propelNavFilterService.hiddenNavItemUids({
          workspaceId,
          userWorkspaceId,
        });

      if (hiddenNavItemUids.size > 0) {
        navHashEntry.hash = `${navHashEntry.hash}:propel-nav-filtered`;
      }
    }

    const safeLocale = (locale as keyof typeof APP_LOCALES) ?? SOURCE_LOCALE;
    const i18nInstance = this.i18nService.getI18nInstance(safeLocale);

    const objectMetadataItems: MinimalObjectMetadataDTO[] = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatObjectMetadata) => flatObjectMetadata.isActive === true)
      .map((flatObjectMetadata) => {
        const objectMetadataForOverride = {
          labelPlural: flatObjectMetadata.labelPlural,
          labelSingular: flatObjectMetadata.labelSingular,
          description: flatObjectMetadata.description ?? undefined,
          icon: flatObjectMetadata.icon ?? undefined,
          color: flatObjectMetadata.color ?? undefined,
          isCustom: flatObjectMetadata.isCustom,
          standardOverrides: flatObjectMetadata.standardOverrides ?? undefined,
        };

        return {
          id: flatObjectMetadata.id,
          nameSingular: flatObjectMetadata.nameSingular,
          namePlural: flatObjectMetadata.namePlural,
          labelSingular: resolveObjectMetadataStandardOverride(
            objectMetadataForOverride,
            'labelSingular',
            safeLocale,
            i18nInstance,
          ),
          labelPlural: resolveObjectMetadataStandardOverride(
            objectMetadataForOverride,
            'labelPlural',
            safeLocale,
            i18nInstance,
          ),
          icon: flatObjectMetadata.icon ?? undefined,
          isCustom: flatObjectMetadata.isCustom,
          isActive: flatObjectMetadata.isActive,
          isSystem: flatObjectMetadata.isSystem,
          isRemote: flatObjectMetadata.isRemote,
        };
      });

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
