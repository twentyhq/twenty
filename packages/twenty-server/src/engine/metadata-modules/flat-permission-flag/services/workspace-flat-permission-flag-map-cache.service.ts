import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { fromPermissionFlagEntityToFlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-permission-flag-entity-to-flat-permission-flag.util';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPermissionFlagMaps')
export class WorkspaceFlatPermissionFlagMapCacheService extends WorkspaceCacheProvider<FlatPermissionFlagMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(PermissionFlagEntity)
    private readonly permissionFlagRepository: WorkspaceScopedRepository<PermissionFlagEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RolePermissionFlagEntity)
    private readonly rolePermissionFlagRepository: Repository<RolePermissionFlagEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPermissionFlagMaps> {
    const [permissionFlags, applications, rolePermissionFlags] =
      await Promise.all([
        this.permissionFlagRepository.find(workspaceId, {
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.rolePermissionFlagRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
      ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const rolePermissionFlagsByPermissionFlagId =
      regroupEntitiesByRelatedEntityId<'rolePermissionFlag'>({
        entities: rolePermissionFlags,
        foreignKey: 'permissionFlagId',
      });

    const flatPermissionFlagMaps = createEmptyFlatEntityMaps();

    for (const definition of permissionFlags) {
      const flatDefinition = fromPermissionFlagEntityToFlatPermissionFlag({
        entity: {
          ...definition,
          rolePermissionFlags:
            rolePermissionFlagsByPermissionFlagId.get(definition.id) ?? [],
        },
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatDefinition,
        flatEntityMapsToMutate: flatPermissionFlagMaps,
      });
    }

    return flatPermissionFlagMaps;
  }
}
