import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-flat-map-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatRoleMaps')
export class WorkspaceFlatRoleMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatRole>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    @InjectRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(PermissionFlagEntity)
    private readonly permissionFlagRepository: Repository<PermissionFlagEntity>,
    @InjectRepository(FieldPermissionEntity)
    private readonly fieldPermissionRepository: Repository<FieldPermissionEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatRole>> {
    const [
      roles,
      roleTargets,
      objectPermissions,
      permissionFlags,
      fieldPermissions,
    ] = await Promise.all([
      this.roleRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.roleTargetsRepository.find({
        where: { workspaceId },
        select: ['id', 'roleId'],
        withDeleted: true,
      }),
      this.objectPermissionRepository.find({
        where: { workspaceId },
        select: ['id', 'roleId'],
        withDeleted: true,
      }),
      this.permissionFlagRepository.find({
        where: { workspaceId },
        select: ['id', 'roleId'],
        withDeleted: true,
      }),
      this.fieldPermissionRepository.find({
        where: { workspaceId },
        select: ['id', 'roleId'],
        withDeleted: true,
      }),
    ]);

    const [
      roleTargetsByRoleId,
      objectPermissionsByRoleId,
      permissionFlagsByRoleId,
      fieldPermissionsByRoleId,
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
          entities: permissionFlags,
          foreignKey: 'roleId',
        },
        {
          entities: fieldPermissions,
          foreignKey: 'roleId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const flatRoleMaps = createEmptyFlatEntityMaps();

    for (const roleEntity of roles) {
      const flatRole = fromRoleEntityToFlatRole({
        ...roleEntity,
        roleTargets: roleTargetsByRoleId.get(roleEntity.id) || [],
        objectPermissions: objectPermissionsByRoleId.get(roleEntity.id) || [],
        permissionFlags: permissionFlagsByRoleId.get(roleEntity.id) || [],
        fieldPermissions: fieldPermissionsByRoleId.get(roleEntity.id) || [],
      } as RoleEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRole,
        flatEntityMapsToMutate: flatRoleMaps,
      });
    }

    return flatRoleMaps;
  }
}
