import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveTimelineActivityTypeRouting } from 'src/modules/timeline/utils/resolve-timeline-activity-type-routing.util';

@Injectable()
export class TimelineActivityEventEligibilityService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async shouldProcessEvent({
    flatObjectMetadata,
    workspaceId,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    workspaceId: string;
  }): Promise<boolean> {
    if (flatObjectMetadata.isAuditLogged) {
      return true;
    }

    const { flatFieldMetadataMaps, flatTimelineActivityTypeMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatTimelineActivityTypeMaps',
          ],
        },
      );

    return Object.values(flatTimelineActivityTypeMaps.byUniversalIdentifier)
      .filter(isDefined)
      .some((timelineActivityType) => {
        if (
          !timelineActivityType.isActive ||
          !isDefined(timelineActivityType.action)
        ) {
          return false;
        }

        if (
          timelineActivityType.objectUniversalIdentifier ===
          flatObjectMetadata.universalIdentifier
        ) {
          return true;
        }

        const routing =
          resolveTimelineActivityTypeRouting(timelineActivityType);

        if (!isDefined(routing)) {
          return false;
        }

        const relationFieldMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: routing.targetRelationFieldUniversalIdentifier,
        });

        return (
          relationFieldMetadata?.relationTargetObjectMetadataId ===
          flatObjectMetadata.id
        );
      });
  }
}
