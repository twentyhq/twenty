import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatObjectPermissionMaps } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission-maps.type';
import { fromObjectPermissionEntityToFlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/utils/from-object-permission-entity-to-flat-object-permission.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatObjectPermissionMaps')
export class WorkspaceFlatObjectPermissionMapCacheService extends WorkspaceCacheProvider<FlatObjectPermissionMaps> {
  constructor(
    @InjectRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatObjectPermissionMaps> {
    const [objectPermissions, applications, roles, objectMetadatas] =
      await Promise.all([
        this.objectPermissionRepository.find({
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
        this.objectMetadataRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
      ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);

    const flatObjectPermissionMaps = createEmptyFlatEntityMaps();

    for (const objectPermissionEntity of objectPermissions) {
      const flatObjectPermission =
        fromObjectPermissionEntityToFlatObjectPermission({
          entity: objectPermissionEntity,
          applicationIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatObjectPermission,
        flatEntityMapsToMutate: flatObjectPermissionMaps,
      });
    }

    return flatObjectPermissionMaps;
  }
}
