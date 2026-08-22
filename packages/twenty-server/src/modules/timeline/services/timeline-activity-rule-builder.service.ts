import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import {
  toResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildJunctionTargetShape } from 'src/modules/timeline/utils/build-junction-target-shape.util';
import { deriveDefaultTimelineActivityRule } from 'src/modules/timeline/utils/derive-default-timeline-activity-rule.util';

type TimelineActivityRulesForEventBatch = {
  // Rules triggered by events on the batch object itself
  sourceRules: TimelineActivityRule[];
  // Rules whose junction object is the batch object, so events on it are link
  // or unlink events for the rule
  junctionRules: TimelineActivityRule[];
  // Returned so callers reading field metadata do not fetch the cache again
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  // Picks the timeline activity type stamped on the rows a rule produces
  resolveTimelineActivityType: TimelineActivityTypeResolver;
};

@Injectable()
export class TimelineActivityRuleBuilderService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly timelineActivityTypeCacheService: TimelineActivityTypeCacheService,
  ) {}

  async getRulesForEventBatch({
    workspaceId,
    flatObjectMetadata,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
  }): Promise<TimelineActivityRulesForEventBatch> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatTimelineActivityTypeMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatTimelineActivityTypeMaps',
          ],
        },
      );

    const declaredRules = Object.values(
      flatTimelineActivityTypeMaps.byUniversalIdentifier,
    )
      .map((timelineActivityType): TimelineActivityRule | undefined => {
        if (
          !isDefined(timelineActivityType) ||
          !isDefined(timelineActivityType.action) ||
          !isDefined(timelineActivityType.objectUniversalIdentifier) ||
          !isDefined(
            timelineActivityType.targetRelationFieldUniversalIdentifier,
          )
        ) {
          return undefined;
        }

        const sourceFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: timelineActivityType.objectUniversalIdentifier,
        });
        const relationFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier:
            timelineActivityType.targetRelationFieldUniversalIdentifier,
        });

        if (
          !isDefined(sourceFlatObjectMetadata) ||
          !isDefined(relationFlatFieldMetadata)
        ) {
          return undefined;
        }

        const targetShape = buildJunctionTargetShape({
          relationFlatFieldMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });

        if (!isDefined(targetShape)) {
          return undefined;
        }

        return {
          sourceFlatObjectMetadata,
          actions: [timelineActivityType.action],
          timelineActivityType:
            toResolvedTimelineActivityType(timelineActivityType),
          triggerFieldNames:
            timelineActivityType.triggerFieldUniversalIdentifiers
              ?.map(
                (universalIdentifier) =>
                  findFlatEntityByUniversalIdentifier({
                    flatEntityMaps: flatFieldMetadataMaps,
                    universalIdentifier,
                  })?.name,
              )
              .filter(isDefined) ?? null,
          targetShape,
        };
      })
      .filter(isDefined);

    const derivedSelfRule =
      deriveDefaultTimelineActivityRule(flatObjectMetadata);

    const sourceRules = [
      ...(isDefined(derivedSelfRule) ? [derivedSelfRule] : []),
      ...declaredRules.filter(
        (rule) => rule.sourceFlatObjectMetadata.id === flatObjectMetadata.id,
      ),
    ];

    const junctionRules = declaredRules.filter(
      (rule) =>
        rule.targetShape.kind === 'JUNCTION' &&
        rule.targetShape.junctionObjectMetadataId === flatObjectMetadata.id,
    );

    return {
      sourceRules,
      junctionRules,
      flatFieldMetadataMaps,
      resolveTimelineActivityType:
        await this.timelineActivityTypeCacheService.getTimelineActivityTypeResolver(
          workspaceId,
        ),
    };
  }
}
