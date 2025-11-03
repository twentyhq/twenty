import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-flat-map-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatFieldMetadataMaps')
export class WorkspaceFlatFieldMetadataMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatFieldMetadata>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatFieldMetadata>> {
    const [fieldMetadatas, viewFields, viewFilters, viewGroups, views] =
      await Promise.all([
        this.fieldMetadataRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.viewFieldRepository.find({
          where: { workspaceId },
          select: ['id', 'fieldMetadataId'],
          withDeleted: true,
        }),
        this.viewFilterRepository.find({
          where: { workspaceId },
          select: ['id', 'fieldMetadataId'],
          withDeleted: true,
        }),
        this.viewGroupRepository.find({
          where: { workspaceId },
          select: ['id', 'fieldMetadataId'],
          withDeleted: true,
        }),
        this.viewRepository.find({
          where: { workspaceId },
          select: [
            'id',
            'kanbanAggregateOperationFieldMetadataId',
            'calendarFieldMetadataId',
          ],
          withDeleted: true,
        }),
      ]);

    const [
      viewFieldsByFieldId,
      viewFiltersByFieldId,
      viewGroupsByFieldId,
      calendarViewsByFieldId,
      kanbanViewsByFieldId,
    ] = (
      [
        {
          entities: viewFields,
          foreignKey: 'fieldMetadataId',
        },
        {
          entities: viewFilters,
          foreignKey: 'fieldMetadataId',
        },
        {
          entities: viewGroups,
          foreignKey: 'fieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'calendarFieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const flatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const flatFieldMetadata = fromFieldMetadataEntityToFlatFieldMetadata({
        ...fieldMetadataEntity,
        viewFields: viewFieldsByFieldId.get(fieldMetadataEntity.id) || [],
        viewFilters: viewFiltersByFieldId.get(fieldMetadataEntity.id) || [],
        viewGroups: viewGroupsByFieldId.get(fieldMetadataEntity.id) || [],
        kanbanAggregateOperationViews:
          kanbanViewsByFieldId.get(fieldMetadataEntity.id) || [],
        calendarViews: calendarViewsByFieldId.get(fieldMetadataEntity.id) || [],
      } as FieldMetadataEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFieldMetadata,
        flatEntityMapsToMutate: flatFieldMetadataMaps,
      });
    }

    return flatFieldMetadataMaps;
  }
}
