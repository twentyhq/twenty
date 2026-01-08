/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-group-entity-to-flat-row-level-permission-predicate-group.util';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateGroupMaps')
export class WorkspaceFlatRowLevelPermissionPredicateGroupMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateGroupMaps> {
  constructor(
    @InjectRepository(RowLevelPermissionPredicateGroupEntity)
    private readonly rowLevelPermissionPredicateGroupRepository: Repository<RowLevelPermissionPredicateGroupEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRowLevelPermissionPredicateGroupMaps> {
    const rowLevelPermissionPredicateGroups =
      await this.rowLevelPermissionPredicateGroupRepository.find({
        where: {
          workspaceId,
        },
        withDeleted: true,
      });

    const flatRowLevelPermissionPredicateGroupMaps =
      createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateGroupEntity of rowLevelPermissionPredicateGroups) {
      const flatRowLevelPermissionPredicateGroup =
        fromRowLevelPermissionPredicateGroupEntityToFlatRowLevelPermissionPredicateGroup(
          rowLevelPermissionPredicateGroupEntity,
        );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicateGroup,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateGroupMaps,
      });
    }

    return flatRowLevelPermissionPredicateGroupMaps;
  }
}
