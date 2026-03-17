import { Injectable, Logger } from '@nestjs/common';

import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined, uncapitalize } from 'twenty-shared/utils';

import { ALL_FLAT_ENTITY_MAPS_PROPERTIES } from 'src/engine/metadata-modules/flat-entity/constant/all-flat-entity-maps-properties.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type CollectionHashDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/collection-hash.dto';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type FlatEntityMapsCacheKeyName } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
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
  private readonly logger = new Logger(MinimalMetadataService.name);

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getMinimalMetadata(
    workspaceId: string,
    userWorkspaceId?: string,
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

    const objectMetadataItems: MinimalObjectMetadataDTO[] = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatObjectMetadata) => flatObjectMetadata.isActive === true)
      .map((flatObjectMetadata) => ({
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        namePlural: flatObjectMetadata.namePlural,
        labelSingular: flatObjectMetadata.labelSingular,
        labelPlural: flatObjectMetadata.labelPlural,
        icon: flatObjectMetadata.icon ?? undefined,
        isCustom: flatObjectMetadata.isCustom,
        isActive: flatObjectMetadata.isActive,
        isSystem: flatObjectMetadata.isSystem,
        isRemote: flatObjectMetadata.isRemote,
      }));

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

    // OMNIA-CUSTOM: Fire-and-forget cache priming for missing entity hashes.
    // After a Redis flush, most flat entity caches are empty. Prime them in the
    // background so the *next* minimalMetadata request returns complete hashes.
    const cachedKeys = new Set(Object.keys(cacheHashes));
    const missingCacheKeys = (
      ALL_FLAT_ENTITY_MAPS_PROPERTIES as FlatEntityMapsCacheKeyName[]
    ).filter((key) => !cachedKeys.has(key));

    if (missingCacheKeys.length > 0) {
      this.flatEntityMapsCacheService
        .getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: missingCacheKeys,
        })
        .catch((error) => {
          this.logger.warn(
            `Failed to prime missing entity caches: ${error.message}`,
          );
        });
    }

    return {
      objectMetadataItems,
      views,
      collectionHashes,
    };
  }
}
