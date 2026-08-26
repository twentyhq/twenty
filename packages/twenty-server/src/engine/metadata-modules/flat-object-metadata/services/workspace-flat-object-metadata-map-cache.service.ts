import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatObjectMetadataMaps', { packingPonderation: 6 })
export class WorkspaceFlatObjectMetadataMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatObjectMetadata>
> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectWorkspaceScopedRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: WorkspaceScopedRepository<IndexMetadataEntity>,
    @InjectWorkspaceScopedRepository(ViewEntity)
    private readonly viewRepository: WorkspaceScopedRepository<ViewEntity>,
    @InjectWorkspaceScopedRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: WorkspaceScopedRepository<ObjectPermissionEntity>,
    @InjectWorkspaceScopedRepository(SearchFieldMetadataEntity)
    private readonly searchFieldMetadataRepository: WorkspaceScopedRepository<SearchFieldMetadataEntity>,
    @InjectWorkspaceScopedRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: WorkspaceScopedRepository<PageLayoutEntity>,
    @InjectWorkspaceScopedRepository(CommandMenuItemEntity)
    private readonly commandMenuItemRepository: WorkspaceScopedRepository<CommandMenuItemEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatObjectMetadata>> {
    const [
      objectMetadatas,
      applications,
      fields,
      indexMetadatas,
      views,
      objectPermissions,
      searchFieldMetadatas,
      pageLayouts,
      commandMenuItems,
    ] = await Promise.all([
      this.objectMetadataRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
        withDeleted: true,
      }),
      this.indexMetadataRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
        withDeleted: true,
      }),
      this.viewRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
        withDeleted: true,
      }),
      this.objectPermissionRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
        withDeleted: true,
      }),
      this.searchFieldMetadataRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
      }),
      this.pageLayoutRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'objectMetadataId'],
        withDeleted: true,
      }),
      this.commandMenuItemRepository.find(workspaceId, {
        select: [
          'id',
          'universalIdentifier',
          'navigationTargetObjectMetadataId',
        ],
        withDeleted: true,
      }),
    ]);

    const [
      fieldsByObjectId,
      indexesByObjectId,
      viewsByObjectId,
      objectPermissionsByObjectId,
      searchFieldMetadatasByObjectId,
      pageLayoutsByObjectId,
      commandMenuItemsByObjectId,
    ] = (
      [
        {
          entities: fields,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: indexMetadatas,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: views,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: objectPermissions,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: searchFieldMetadatas,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: pageLayouts,
          foreignKey: 'objectMetadataId',
        },
        {
          entities: commandMenuItems,
          foreignKey: 'navigationTargetObjectMetadataId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fields);

    const flatObjectMetadataMaps = createEmptyFlatEntityMaps();

    for (const objectMetadataEntity of objectMetadatas) {
      const flatObjectMetadata = fromObjectMetadataEntityToFlatObjectMetadata({
        entity: {
          ...objectMetadataEntity,
          fields: fieldsByObjectId.get(objectMetadataEntity.id) || [],
          indexMetadatas: indexesByObjectId.get(objectMetadataEntity.id) || [],
          views: viewsByObjectId.get(objectMetadataEntity.id) || [],
          objectPermissions:
            objectPermissionsByObjectId.get(objectMetadataEntity.id) || [],
          searchFieldMetadatas:
            searchFieldMetadatasByObjectId.get(objectMetadataEntity.id) || [],
          pageLayouts: pageLayoutsByObjectId.get(objectMetadataEntity.id) || [],
          commandMenuItems:
            commandMenuItemsByObjectId.get(objectMetadataEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatObjectMetadata,
        flatEntityMapsToMutate: flatObjectMetadataMaps,
      });
    }

    return flatObjectMetadataMaps;
  }
}
