import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFieldMetadataMaps')
export class WorkspaceFlatFieldMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatFieldMetadata>
> {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
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
    const [
      fieldMetadatas,
      objectMetadatas,
      applications,
      viewFields,
      viewFilters,
      views,
    ] = await Promise.all([
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.objectMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.viewFieldRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'fieldMetadataId'],
        withDeleted: true,
      }),
      this.viewFilterRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'fieldMetadataId'],
        withDeleted: true,
      }),
      this.viewRepository.find({
        where: { workspaceId },
        select: [
          'id',
          'universalIdentifier',
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

    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const fieldMetadataEntity of fieldMetadatas) {
      const flatFieldMetadata = fromFieldMetadataEntityToFlatFieldMetadata({
        entity: {
          ...fieldMetadataEntity,
          viewFields: viewFieldsByFieldId.get(fieldMetadataEntity.id) || [],
          viewFilters: viewFiltersByFieldId.get(fieldMetadataEntity.id) || [],
          kanbanAggregateOperationViews:
            kanbanViewsByFieldId.get(fieldMetadataEntity.id) || [],
          calendarViews:
            calendarViewsByFieldId.get(fieldMetadataEntity.id) || [],
          mainGroupByFieldMetadataViews:
            mainGroupByFieldMetadataViewsByFieldId.get(
              fieldMetadataEntity.id,
            ) || [],
        },
        fieldMetadataIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFieldMetadata,
        flatEntityMapsToMutate: flatFieldMetadataMaps,
      });
    }

    return flatFieldMetadataMaps;
  }
}
