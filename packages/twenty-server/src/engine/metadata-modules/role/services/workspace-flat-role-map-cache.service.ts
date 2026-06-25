import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRoleMaps')
export class WorkspaceFlatRoleMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatRole>
> {
  constructor(
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectWorkspaceScopedRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: WorkspaceScopedRepository<ObjectPermissionEntity>,
    @InjectRepository(RolePermissionFlagEntity)
    private readonly rolePermissionFlagRepository: Repository<RolePermissionFlagEntity>,
    @InjectWorkspaceScopedRepository(FieldPermissionEntity)
    private readonly fieldPermissionRepository: WorkspaceScopedRepository<FieldPermissionEntity>,
    @InjectWorkspaceScopedRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: WorkspaceScopedRepository<RowLevelPermissionPredicateEntity>,
    @InjectWorkspaceScopedRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: WorkspaceScopedRepository<RowLevelPermissionPredicateGroupEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatRole>> {
    const [
      roles,
      applications,
      roleTargets,
      objectPermissions,
      rolePermissionFlags,
      fieldPermissions,
      rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroups,
    ] = await Promise.all([
      this.roleRepository.find(workspaceId, {
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.roleTargetRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'roleId'],
        withDeleted: true,
      }),
      this.objectPermissionRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'roleId'],
        withDeleted: true,
      }),
      this.rolePermissionFlagRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier', 'roleId'],
        withDeleted: true,
      }),
      this.fieldPermissionRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'roleId'],
        withDeleted: true,
      }),
      this.rowLevelPermissionPredicateRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'roleId'],
        withDeleted: true,
      }),
      this.rowLevelPermissionPredicateGroupRepository.find(workspaceId, {
        select: ['id', 'universalIdentifier', 'roleId'],
        withDeleted: true,
      }),
    ]);

    const [
      roleTargetsByRoleId,
      objectPermissionsByRoleId,
      rolePermissionFlagsByRoleId,
      fieldPermissionsByRoleId,
      rowLevelPermissionPredicatesByRoleId,
      rowLevelPermissionPredicateGroupsByRoleId,
    ] = (
      [
        {
          entities: roleTargets,
          foreignKey: 'roleId',
        },
        {
          entities: objectPermissions,
          foreignKey: 'roleId',
        },
        {
          entities: rolePermissionFlags,
          foreignKey: 'roleId',
        },
        {
          entities: fieldPermissions,
          foreignKey: 'roleId',
        },
        {
          entities: rowLevelPermissionPredicates,
          foreignKey: 'roleId',
        },
        {
          entities: rowLevelPermissionPredicateGroups,
          foreignKey: 'roleId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatRoleMaps = createEmptyFlatEntityMaps();

    for (const roleEntity of roles) {
      const flatRole = fromRoleEntityToFlatRole({
        entity: {
          ...roleEntity,
          roleTargets: roleTargetsByRoleId.get(roleEntity.id) || [],
          objectPermissions: objectPermissionsByRoleId.get(roleEntity.id) || [],
          rolePermissionFlags:
            rolePermissionFlagsByRoleId.get(roleEntity.id) || [],
          fieldPermissions: fieldPermissionsByRoleId.get(roleEntity.id) || [],
          rowLevelPermissionPredicates:
            rowLevelPermissionPredicatesByRoleId.get(roleEntity.id) || [],
          rowLevelPermissionPredicateGroups:
            rowLevelPermissionPredicateGroupsByRoleId.get(roleEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRole,
        flatEntityMapsToMutate: flatRoleMaps,
      });
    }

    return flatRoleMaps;
  }
}
