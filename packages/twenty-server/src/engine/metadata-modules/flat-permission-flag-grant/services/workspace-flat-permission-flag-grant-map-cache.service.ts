import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPermissionFlagGrantMaps } from 'src/engine/metadata-modules/flat-permission-flag-grant/types/flat-permission-flag-grant-maps.type';
import { fromPermissionFlagGrantEntityToFlatPermissionFlagGrant } from 'src/engine/metadata-modules/flat-permission-flag-grant/utils/from-permission-flag-grant-entity-to-flat-permission-flag-grant.util';
import { PermissionFlagGrantEntity } from 'src/engine/metadata-modules/permission-flag-grant/permission-flag-grant.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPermissionFlagGrantMaps')
export class WorkspaceFlatPermissionFlagGrantMapCacheService extends WorkspaceCacheProvider<FlatPermissionFlagGrantMaps> {
  constructor(
    @InjectRepository(PermissionFlagGrantEntity)
    private readonly permissionFlagGrantRepository: Repository<PermissionFlagGrantEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPermissionFlagGrantMaps> {
    const [permissionFlagGrants, applications, roles] = await Promise.all([
      this.permissionFlagGrantRepository.find({
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
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);

    const flatPermissionFlagGrantMaps = createEmptyFlatEntityMaps();

    for (const permissionFlagGrantEntity of permissionFlagGrants) {
      const flatPermissionFlagGrant = fromPermissionFlagGrantEntityToFlatPermissionFlagGrant({
        entity: permissionFlagGrantEntity,
        applicationIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPermissionFlagGrant,
        flatEntityMapsToMutate: flatPermissionFlagGrantMaps,
      });
    }

    return flatPermissionFlagGrantMaps;
  }
}
