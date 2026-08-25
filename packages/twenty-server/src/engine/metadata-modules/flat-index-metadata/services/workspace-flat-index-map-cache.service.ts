import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { fromIndexMetadataEntityToFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/from-index-metadata-entity-to-flat-index-metadata.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheFetchableEntity } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatIndexMaps', { packingPonderation: 8 })
export class WorkspaceFlatIndexMapCacheService extends FlatEntityMapCacheProvider<'index'> {
  override readonly fetchRequirements = {
    index: true,
    indexFieldMetadata: true,
    application: ['id', 'universalIdentifier', 'deletedAt'],
    objectMetadata: ['id', 'universalIdentifier'],
    fieldMetadata: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatIndexMetadata> {
    const {
      index: indexes,
      indexFieldMetadata: indexFieldMetadatas,
      application: applications,
      objectMetadata: objectMetadatas,
      fieldMetadata: fieldMetadatas,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const indexFieldMetadatasByIndexMetadataId = new Map<
      string,
      CacheFetchableEntity<'indexFieldMetadata'>[]
    >();

    for (const indexFieldMetadata of indexFieldMetadatas) {
      const existingIndexFieldMetadatas =
        indexFieldMetadatasByIndexMetadataId.get(
          indexFieldMetadata.indexMetadataId,
        );

      if (isDefined(existingIndexFieldMetadatas)) {
        existingIndexFieldMetadatas.push(indexFieldMetadata);
      } else {
        indexFieldMetadatasByIndexMetadataId.set(
          indexFieldMetadata.indexMetadataId,
          [indexFieldMetadata],
        );
      }
    }

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(
        // the previous application fetch excluded soft-deleted rows
        applications.filter((application) => !isDefined(application.deletedAt)),
      );
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatIndexMaps = createEmptyFlatEntityMaps();

    for (const indexEntity of indexes) {
      const flatIndex = fromIndexMetadataEntityToFlatIndexMetadata({
        entity: {
          ...indexEntity,
          indexFieldMetadatas:
            indexFieldMetadatasByIndexMetadataId.get(indexEntity.id) ?? [],
        },
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatIndex,
        flatEntityMapsToMutate: flatIndexMaps,
      });
    }

    return flatIndexMaps;
  }
}
