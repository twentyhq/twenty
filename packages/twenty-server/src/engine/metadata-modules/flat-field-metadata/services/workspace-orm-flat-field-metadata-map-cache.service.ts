import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { fromFieldMetadataEntityToOrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-orm-flat-field-metadata.util';
import { computeUniqueFieldMetadataIdsFromIndexes } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-indexes.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const ORM_FLAT_FIELD_METADATA_ROWS_REQUIREMENT = {
  fieldMetadata: true,
  index: {
    columns: ['id', 'isUnique', 'isSystemSideEffect'],
    where: { isUnique: true },
  },
  indexFieldMetadata: {
    columns: ['id', 'fieldMetadataId', 'subFieldName'],
    groupBy: ['indexMetadataId'],
  },
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('flatFieldMetadataMapsOrm', { packingPonderation: 8 })
export class WorkspaceOrmFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<OrmFlatFieldMetadata>
> {
  override readonly rowsRequirement = ORM_FLAT_FIELD_METADATA_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof ORM_FLAT_FIELD_METADATA_ROWS_REQUIREMENT
  >): FlatEntityMaps<OrmFlatFieldMetadata> {
    const {
      fieldMetadata: fieldMetadatas,
      index: indexMetadatas,
      indexFieldMetadata: indexFieldMetadatas,
    } = rows;

    const uniqueFieldMetadataIds = computeUniqueFieldMetadataIdsFromIndexes(
      indexMetadatas.map((indexMetadata) => ({
        ...indexMetadata,
        indexFieldMetadatas:
          indexFieldMetadatas.byIndexMetadataId.get(indexMetadata.id) ?? [],
      })),
    );

    const ormFlatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const ormFlatFieldMetadata =
        fromFieldMetadataEntityToOrmFlatFieldMetadata({
          entity: fieldMetadataEntity,
          isUnique: uniqueFieldMetadataIds.has(fieldMetadataEntity.id),
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: ormFlatFieldMetadata,
        flatEntityMapsToMutate: ormFlatFieldMetadataMaps,
      });
    }

    return ormFlatFieldMetadataMaps;
  }
}
