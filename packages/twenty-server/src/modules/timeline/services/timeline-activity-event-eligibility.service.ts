import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveTimelineActivityTypeRouting } from 'src/modules/timeline/utils/resolve-timeline-activity-type-routing.util';

@Injectable()
export class TimelineActivityEventEligibilityService {
  private readonly eligibleNonAuditedObjectIdsByWorkspaceId = new Map<
    string,
    { cacheKey: string; objectIds: Set<string> }
  >();

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

    const { data, hashes } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMapsWithHashes(
        {
          workspaceId,
          flatMapsKeys: [
            'flatFieldMetadataMaps',
            'flatObjectMetadataMaps',
            'flatTimelineActivityTypeMaps',
          ],
        },
      );
    const cacheKey = [
      hashes.flatFieldMetadataMaps,
      hashes.flatObjectMetadataMaps,
      hashes.flatTimelineActivityTypeMaps,
    ].join('|');
    const cachedEligibility =
      this.eligibleNonAuditedObjectIdsByWorkspaceId.get(workspaceId);

    if (cachedEligibility?.cacheKey === cacheKey) {
      return cachedEligibility.objectIds.has(flatObjectMetadata.id);
    }

    const eligibleObjectIds = new Set<string>();
    const {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatTimelineActivityTypeMaps,
    } = data;

    for (const timelineActivityType of Object.values(
      flatTimelineActivityTypeMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (timelineActivityType) =>
          timelineActivityType.isActive &&
          isDefined(timelineActivityType.action),
      )) {
      if (isDefined(timelineActivityType.objectUniversalIdentifier)) {
        const sourceObjectMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: timelineActivityType.objectUniversalIdentifier,
        });

        if (isDefined(sourceObjectMetadata)) {
          eligibleObjectIds.add(sourceObjectMetadata.id);
        }
      }

      const routing = resolveTimelineActivityTypeRouting(timelineActivityType);

      if (!isDefined(routing)) {
        continue;
      }

      const relationFieldMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: routing.targetRelationFieldUniversalIdentifier,
      });

      if (isDefined(relationFieldMetadata?.relationTargetObjectMetadataId)) {
        eligibleObjectIds.add(
          relationFieldMetadata.relationTargetObjectMetadataId,
        );
      }
    }

    this.eligibleNonAuditedObjectIdsByWorkspaceId.set(workspaceId, {
      cacheKey,
      objectIds: eligibleObjectIds,
    });

    return eligibleObjectIds.has(flatObjectMetadata.id);
  }
}
