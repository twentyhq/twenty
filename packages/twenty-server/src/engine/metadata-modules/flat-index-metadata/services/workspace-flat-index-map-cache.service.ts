import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { fromIndexMetadataEntityToFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/from-index-metadata-entity-to-flat-index-metadata.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatIndexMaps', { packingPonderation: 8 })
export class WorkspaceFlatIndexMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatIndexMetadata>
> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatEntityMaps<FlatIndexMetadata>> {
    const [
      indexes,
      indexFieldMetadatas,
      applications,
      objectMetadatas,
      fieldMetadatas,
    ] = await Promise.all([
      recomputeContext.findAll(IndexMetadataEntity),
      recomputeContext.findAll(IndexFieldMetadataEntity),
      recomputeContext.findAll(ApplicationEntity, [
        'id',
        'universalIdentifier',
        'deletedAt',
      ]),
      recomputeContext.findAll(ObjectMetadataEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(FieldMetadataEntity, [
        'id',
        'universalIdentifier',
      ]),
    ]);

    const indexFieldMetadatasByIndexMetadataId = new Map<
      string,
      IndexFieldMetadataEntity[]
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
