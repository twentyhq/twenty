import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { fromPermissionFlagEntityToFlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-permission-flag-entity-to-flat-permission-flag.util';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPermissionFlagMaps')
export class WorkspaceFlatPermissionFlagMapCacheService extends WorkspaceCacheProvider<FlatPermissionFlagMaps> {
  constructor(
    @InjectRepository(PermissionFlagEntity)
    private readonly permissionFlagRepository: Repository<PermissionFlagEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPermissionFlagMaps> {
    const [permissionFlags, applications, roles] = await Promise.all([
      this.permissionFlagRepository.find({
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

    const flatPermissionFlagMaps = createEmptyFlatEntityMaps();

    for (const permissionFlagEntity of permissionFlags) {
      const flatPermissionFlag = fromPermissionFlagEntityToFlatPermissionFlag({
        entity: permissionFlagEntity,
        applicationIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPermissionFlag,
        flatEntityMapsToMutate: flatPermissionFlagMaps,
      });
    }

    return flatPermissionFlagMaps;
  }
}
