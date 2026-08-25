import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { fromTimelineActivityTypeEntityToFlatTimelineActivityType } from 'src/engine/metadata-modules/flat-timeline-activity-type/utils/from-timeline-activity-type-entity-to-flat-timeline-activity-type.util';
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatTimelineActivityTypeMaps', { packingPonderation: 1 })
export class WorkspaceFlatTimelineActivityTypeMapCacheService extends WorkspaceCacheProvider<FlatTimelineActivityTypeMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(TimelineActivityTypeEntity)
    private readonly timelineActivityTypeRepository: WorkspaceScopedRepository<TimelineActivityTypeEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatTimelineActivityTypeMaps> {
    const [timelineActivityTypes, applications] = await Promise.all([
      this.timelineActivityTypeRepository.find(workspaceId),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatTimelineActivityTypeMaps = createEmptyFlatEntityMaps();

    for (const timelineActivityTypeEntity of timelineActivityTypes) {
      const flatTimelineActivityType =
        fromTimelineActivityTypeEntityToFlatTimelineActivityType({
          entity: timelineActivityTypeEntity,
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatTimelineActivityType,
        flatEntityMapsToMutate: flatTimelineActivityTypeMaps,
      });
    }

    return flatTimelineActivityTypeMaps;
  }
}
