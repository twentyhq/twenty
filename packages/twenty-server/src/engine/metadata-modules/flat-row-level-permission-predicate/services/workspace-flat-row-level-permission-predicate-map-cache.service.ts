/* @license Enterprise */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/from-row-level-permission-predicate-entity-to-flat-row-level-permission-predicate.util';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRowLevelPermissionPredicateMaps')
export class WorkspaceFlatRowLevelPermissionPredicateMapCacheService extends WorkspaceCacheProvider<FlatRowLevelPermissionPredicateMaps> {
  constructor(
    @InjectRepository(RowLevelPermissionPredicateEntity)
    private readonly rowLevelPermissionPredicateRepository: Repository<RowLevelPermissionPredicateEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatRowLevelPermissionPredicateMaps> {
    const rowLevelPermissionPredicates =
      await this.rowLevelPermissionPredicateRepository.find({
        where: {
          workspaceId,
        },
        withDeleted: true,
      });

    const flatRowLevelPermissionPredicateMaps = createEmptyFlatEntityMaps();

    for (const rowLevelPermissionPredicateEntity of rowLevelPermissionPredicates) {
      const flatRowLevelPermissionPredicate =
        fromRowLevelPermissionPredicateEntityToFlatRowLevelPermissionPredicate(
          rowLevelPermissionPredicateEntity,
        );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRowLevelPermissionPredicate,
        flatEntityMapsToMutate: flatRowLevelPermissionPredicateMaps,
      });
    }

    return flatRowLevelPermissionPredicateMaps;
  }
}
