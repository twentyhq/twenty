import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewEntityToFlatView } from 'src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewMaps')
export class WorkspaceFlatViewMapCacheService extends WorkspaceCacheProvider<FlatViewMaps> {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
    @InjectRepository(ViewFieldGroupEntity)
    private readonly viewFieldGroupRepository: Repository<ViewFieldGroupEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewMaps> {
    const [
      views,
      applications,
      objectMetadatas,
      fieldMetadatas,
      viewFields,
      viewFilters,
      viewGroups,
      viewFilterGroups,
      viewFieldGroups,
    ] = await Promise.all([
      this.viewRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.objectMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.viewFieldRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'viewId'],
        withDeleted: true,
      }),
      this.viewFilterRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'viewId'],
        withDeleted: true,
      }),
      this.viewGroupRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'viewId'],
        withDeleted: true,
      }),
      this.viewFilterGroupRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'viewId'],
        withDeleted: true,
      }),
      this.viewFieldGroupRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'viewId'],
        withDeleted: true,
      }),
    ]);

    const [
      viewFieldsByViewId,
      viewFiltersByViewId,
      viewGroupsByViewId,
      viewFilterGroupsByViewId,
      viewFieldGroupsByViewId,
    ] = (
      [
        {
          entities: viewFields,
          foreignKey: 'viewId',
        },
        {
          entities: viewFilters,
          foreignKey: 'viewId',
        },
        {
          entities: viewGroups,
          foreignKey: 'viewId',
        },
        {
          entities: viewFilterGroups,
          foreignKey: 'viewId',
        },
        {
          entities: viewFieldGroups,
          foreignKey: 'viewId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatViewMaps = createEmptyFlatEntityMaps();

    for (const viewEntity of views) {
      const flatView = fromViewEntityToFlatView({
        entity: {
          ...viewEntity,
          viewFields: viewFieldsByViewId.get(viewEntity.id) || [],
          viewFilters: viewFiltersByViewId.get(viewEntity.id) || [],
          viewGroups: viewGroupsByViewId.get(viewEntity.id) || [],
          viewFilterGroups: viewFilterGroupsByViewId.get(viewEntity.id) || [],
          viewFieldGroups: viewFieldGroupsByViewId.get(viewEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatView,
        flatEntityMapsToMutate: flatViewMaps,
      });
    }

    return flatViewMaps;
  }
}
