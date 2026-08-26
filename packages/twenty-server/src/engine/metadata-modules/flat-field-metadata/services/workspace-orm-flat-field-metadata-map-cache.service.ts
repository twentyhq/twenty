import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { fromFieldMetadataEntityToOrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-orm-flat-field-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { computeUniqueFieldMetadataIdsFromIndexEntities } from 'src/engine/metadata-modules/index-metadata/utils/compute-unique-field-metadata-ids-from-index-entities.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFieldMetadataMapsOrm', { packingPonderation: 8 })
export class WorkspaceOrmFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<OrmFlatFieldMetadata>
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
  ): Promise<FlatEntityMaps<OrmFlatFieldMetadata>> {
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
