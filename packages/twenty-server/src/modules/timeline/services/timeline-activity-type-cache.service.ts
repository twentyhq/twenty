import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { TimelineException } from 'src/modules/timeline/exceptions/timeline.exception';
import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';
import {
  buildTimelineActivityTypeResolution,
  toResolvedTimelineActivityType,
  type ResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

@Injectable()
export class TimelineActivityTypeCacheService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly timelineActivityMetadataDiagnosticsService: TimelineActivityMetadataDiagnosticsService,
  ) {}

  async getTimelineActivityTypeResolver(
    workspaceId: string,
  ): Promise<TimelineActivityTypeResolver> {
    const { flatTimelineActivityTypeMaps, flatObjectMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatTimelineActivityTypeMaps',
            'flatObjectMetadataMaps',
          ],
        },
      );

    const { resolveTimelineActivityType, resolverConflicts, invalidContracts } =
      buildTimelineActivityTypeResolution({
        ...flatTimelineActivityTypeMaps,
        objectMetadataByUniversalIdentifier:
          flatObjectMetadataMaps.byUniversalIdentifier,
      });

    this.timelineActivityMetadataDiagnosticsService.reportAll({
      workspaceId,
      reason: 'ambiguous-resolver',
      issues: resolverConflicts,
    });
    this.timelineActivityMetadataDiagnosticsService.reportAll({
      workspaceId,
      reason: 'invalid-contract',
      issues: invalidContracts,
    });

    return resolveTimelineActivityType;
  }

  async getTimelineActivityTypeByIdOrThrow({
    workspaceId,
    timelineActivityTypeId,
  }: {
    workspaceId: string;
    timelineActivityTypeId: string;
  }): Promise<ResolvedTimelineActivityType> {
    const { flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatTimelineActivityTypeMaps'] },
      );

    const timelineActivityType = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: timelineActivityTypeId,
      flatEntityMaps: flatTimelineActivityTypeMaps,
    });

    if (!isDefined(timelineActivityType) || !timelineActivityType.isActive) {
      throw new TimelineException(
        `Active timeline activity type ${timelineActivityTypeId} was not found in workspace ${workspaceId}`,
      );
    }

    return toResolvedTimelineActivityType(timelineActivityType);
  }
}
