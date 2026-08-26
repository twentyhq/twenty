import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';
import { fromFieldMetadataEntityToLiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-lite-flat-field-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { computeUniqueFieldMetadataIdsFromIndexEntities } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-index-entities.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

// Lite projection of flatFieldMetadataMaps for the record query/execution path (held live in
// ORMWorkspaceContext on every request). Drops the view/permission relation arrays, their
// universal-identifier twins and universalSettings, so the hot per-workspace working set is a
// fraction of the full map and the collector traces far less. Recompute needs only field rows +
// unique indexes (2 queries) instead of the full builder's 9 joins.
@Injectable()
@WorkspaceCache('flatFieldMetadataMapsLite', { packingPonderation: 8 })
export class WorkspaceLiteFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<LiteFlatFieldMetadata>
> {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectWorkspaceScopedRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: WorkspaceScopedRepository<IndexMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<LiteFlatFieldMetadata>> {
    const [fieldMetadatas, indexMetadatas] = await Promise.all([
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.indexMetadataRepository.find(workspaceId, {
        where: { isUnique: true },
        relations: ['indexFieldMetadatas'],
        withDeleted: true,
      }),
    ]);

    const uniqueFieldMetadataIds =
      computeUniqueFieldMetadataIdsFromIndexEntities(indexMetadatas);

    const liteFlatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const liteFlatFieldMetadata =
        fromFieldMetadataEntityToLiteFlatFieldMetadata({
          entity: fieldMetadataEntity,
          isUnique: uniqueFieldMetadataIds.has(fieldMetadataEntity.id),
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: liteFlatFieldMetadata,
        flatEntityMapsToMutate: liteFlatFieldMetadataMaps,
      });
    }

    return liteFlatFieldMetadataMaps;
  }
}
