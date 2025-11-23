import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { fromRoleTargetsEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/transform-role-target-entity-to-flat-role-target.util';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatRoleTargetMaps')
export class WorkspaceFlatRoleTargetMapCacheService extends WorkspaceFlatMapCacheService<FlatRoleTargetMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatRoleTargetMaps> {
    const roleTargets = await this.roleTargetsRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatRoleTargetMaps = createEmptyFlatEntityMaps();

    for (const roleTargetEntity of roleTargets) {
      const flatRoleTarget =
        fromRoleTargetsEntityToFlatRoleTarget(roleTargetEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRoleTarget,
        flatEntityMapsToMutate: flatRoleTargetMaps,
      });
    }

    return flatRoleTargetMaps;
  }
}
