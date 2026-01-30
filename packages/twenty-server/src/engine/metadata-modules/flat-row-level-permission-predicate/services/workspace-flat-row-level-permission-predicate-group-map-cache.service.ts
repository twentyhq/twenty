/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-group-entity-to-flat-row-level-permission-predicate-group.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateGroupMaps')
export class WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateGroupMaps> {
  constructor(
    @InjectRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: Repository<RowLevelPermissionPredicateGroupEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: Repository<RowLevelPermissionPredicateEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRowLevelPermissionPredicateGroupMaps> {
    const [
      rowLevelPermissionPredicateGroups,
      applications,
      objectMetadatas,
      roles,
      rowLevelPermissionPredicates,
    ] = await Promise.all([
      this.rowLevelPermissionPredicateGroupRepository.find({
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
      this.roleRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.rowLevelPermissionPredicateRepository.find({
        where: { workspaceId },
        select: [
          'id',
          'universalIdentifier',
          'rowLevelPermissionPredicateGroupId',
        ],
        withDeleted: true,
      }),
    ]);

    const [
      childRowLevelPermissionPredicateGroupsByParentId,
      rowLevelPermissionPredicatesByGroupId,
    ] = (
      [
        {
          entities: rowLevelPermissionPredicateGroups,
          foreignKey: 'parentRowLevelPermissionPredicateGroupId',
        },
        {
          entities: rowLevelPermissionPredicates,
          foreignKey: 'rowLevelPermissionPredicateGroupId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(rowLevelPermissionPredicateGroups);

    const flatRowLevelPermissionPredicateGroupMaps =
      createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateGroupEntity of rowLevelPermissionPredicateGroups) {
      const flatRowLevelPermissionPredicateGroup =
        fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup(
          {
            entity: {
              ...rowLevelPermissionPredicateGroupEntity,
              childRowLevelPermissionPredicateGroups:
                childRowLevelPermissionPredicateGroupsByParentId.get(
                  rowLevelPermissionPredicateGroupEntity.id,
                ) || [],
              rowLevelPermissionPredicates:
                rowLevelPermissionPredicatesByGroupId.get(
                  rowLevelPermissionPredicateGroupEntity.id,
                ) || [],
            },
            applicationIdToUniversalIdentifierMap,
            objectMetadataIdToUniversalIdentifierMap,
            roleIdToUniversalIdentifierMap,
            rowLevelPermissionPredicateGroupIdToUniversalIdentifierMap,
          },
        );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicateGroup,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateGroupMaps,
      });
    }

    return flatRowLevelPermissionPredicateGroupMaps;
  }
}
