import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { fromRolePermissionFlagEntityToFlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/utils/from-role-permission-flag-entity-to-flat-role-permission-flag.util';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRolePermissionFlagMaps')
export class WorkspaceFlatRolePermissionFlagMapCacheService extends WorkspaceCacheProvider<FlatRolePermissionFlagMaps> {
  constructor(
    @InjectRepository(RolePermissionFlagEntity)
    private readonly rolePermissionFlagRepository: Repository<RolePermissionFlagEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionFlagEntity)
    private readonly permissionFlagRepository: Repository<PermissionFlagEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRolePermissionFlagMaps> {
    const [rolePermissionFlags, applications, roles, permissionFlags] =
      await Promise.all([
        this.rolePermissionFlagRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.roleRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.permissionFlagRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
      ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const permissionFlagIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(permissionFlags);

    const flatRolePermissionFlagMaps = createEmptyFlatEntityMaps();

    for (const rolePermissionFlagEntity of rolePermissionFlags) {
      const flatRolePermissionFlag =
        fromRolePermissionFlagEntityToFlatRolePermissionFlag({
          entity: rolePermissionFlagEntity,
          applicationIdToUniversalIdentifierMap,
          permissionFlagIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRolePermissionFlag,
        flatEntityMapsToMutate: flatRolePermissionFlagMaps,
      });
    }

    return flatRolePermissionFlagMaps;
  }
}
