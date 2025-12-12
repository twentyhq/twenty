import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFieldMetadataMaps')
export class WorkspaceFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatFieldMetadata>
> {
  constructor(
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
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatFieldMetadata>> {
    const [fieldMetadatas, viewFields, viewFilters, views] = await Promise.all([
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
      this.viewRepository.find({
        where: { workspaceId },
        select: [
          'id',
          'kanbanAggregateOperationFieldMetadataId',
          'calendarFieldMetadataId',
          'mainGroupByFieldMetadataId',
        ],
        withDeleted: true,
      }),
    ]);

    const [
      viewFieldsByFieldId,
      viewFiltersByFieldId,
      calendarViewsByFieldId,
      kanbanViewsByFieldId,
      mainGroupByFieldMetadataViewsByFieldId,
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
          entities: views,
          foreignKey: 'calendarFieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'kanbanAggregateOperationFieldMetadataId',
        },
        {
          entities: views,
          foreignKey: 'mainGroupByFieldMetadataId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const flatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const flatFieldMetadata = fromFieldMetadataEntityToFlatFieldMetadata({
        ...fieldMetadataEntity,
        viewFields: viewFieldsByFieldId.get(fieldMetadataEntity.id) || [],
        viewFilters: viewFiltersByFieldId.get(fieldMetadataEntity.id) || [],
        kanbanAggregateOperationViews:
          kanbanViewsByFieldId.get(fieldMetadataEntity.id) || [],
        calendarViews: calendarViewsByFieldId.get(fieldMetadataEntity.id) || [],
        mainGroupByFieldMetadataViews:
          mainGroupByFieldMetadataViewsByFieldId.get(fieldMetadataEntity.id) ||
          [],
      } as FieldMetadataEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFieldMetadata,
        flatEntityMapsToMutate: flatFieldMetadataMaps,
      });
    }

    return flatFieldMetadataMaps;
  }
}
