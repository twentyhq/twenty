import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';
import {
  buildTimelineActivityTypeResolution,
  toResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildDirectRelationTargetShape } from 'src/modules/timeline/utils/build-direct-relation-target-shape.util';
import { buildJunctionTargetShape } from 'src/modules/timeline/utils/build-junction-target-shape.util';
import { buildTimelineActivitySelfRule } from 'src/modules/timeline/utils/build-timeline-activity-self-rule.util';
import { resolveTimelineActivityTypeRouting } from 'src/modules/timeline/utils/resolve-timeline-activity-type-routing.util';

type TimelineActivityRulesForEventBatch = {
  sourceRules: TimelineActivityRule[];
  junctionRules: TimelineActivityRule[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  resolveTimelineActivityType: TimelineActivityTypeResolver;
};

@Injectable()
export class TimelineActivityRuleBuilderService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly timelineActivityMetadataDiagnosticsService: TimelineActivityMetadataDiagnosticsService,
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

    const {
      effectiveTimelineActivityTypes,
      routingConflicts,
      resolverConflicts,
      invalidContracts,
      resolveTimelineActivityType,
    } = buildTimelineActivityTypeResolution({
      ...flatTimelineActivityTypeMaps,
      objectMetadataByUniversalIdentifier:
        flatObjectMetadataMaps.byUniversalIdentifier,
    });

    this.timelineActivityMetadataDiagnosticsService.reportAll({
      workspaceId,
      reason: 'ambiguous-declared-rule',
      issues: routingConflicts,
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

    const activeTimelineActivityTypes = effectiveTimelineActivityTypes.filter(
      (timelineActivityType) => timelineActivityType.isActive,
    );

    const invalidThroughRules: {
      action: string;
      objectUniversalIdentifier: string | null;
    }[] = [];
    const declaredThroughRules = activeTimelineActivityTypes
      .map((timelineActivityType): TimelineActivityRule | undefined => {
        const routing =
          resolveTimelineActivityTypeRouting(timelineActivityType);

        if (
          !isDefined(timelineActivityType.action) ||
          !isDefined(timelineActivityType.objectUniversalIdentifier) ||
          !isDefined(routing)
        ) {
          return undefined;
        }

        const sourceFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: timelineActivityType.objectUniversalIdentifier,
        });
        const relationFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: routing.targetRelationFieldUniversalIdentifier,
        });

        if (
          !isDefined(sourceFlatObjectMetadata) ||
          !isDefined(relationFlatFieldMetadata)
        ) {
          invalidThroughRules.push({
            action: timelineActivityType.action,
            objectUniversalIdentifier:
              timelineActivityType.objectUniversalIdentifier,
          });
          return undefined;
        }

        const targetShape =
          buildDirectRelationTargetShape({
            relationFlatFieldMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }) ??
          buildJunctionTargetShape({
            relationFlatFieldMetadata,
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          });

        if (!isDefined(targetShape)) {
          invalidThroughRules.push({
            action: timelineActivityType.action,
            objectUniversalIdentifier:
              timelineActivityType.objectUniversalIdentifier,
          });
          return undefined;
        }

        return {
          sourceFlatObjectMetadata,
          actions: [timelineActivityType.action],
          timelineActivityType:
            toResolvedTimelineActivityType(timelineActivityType),
          triggerFieldNames:
            routing.triggerFieldUniversalIdentifiers
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

    this.timelineActivityMetadataDiagnosticsService.reportAll({
      workspaceId,
      reason: 'invalid-contract',
      issues: invalidThroughRules,
    });

    const selfRule = buildTimelineActivitySelfRule({
      flatObjectMetadata,
      timelineActivityTypes: activeTimelineActivityTypes,
    });

    const sourceRules = [
      ...(isDefined(selfRule) ? [selfRule] : []),
      ...declaredThroughRules.filter(
        (rule) => rule.sourceFlatObjectMetadata.id === flatObjectMetadata.id,
      ),
    ];

    const junctionRules = declaredThroughRules.filter(
      (rule) =>
        rule.targetShape.kind === 'JUNCTION' &&
        rule.targetShape.junctionObjectMetadataId === flatObjectMetadata.id,
    );

    return {
      sourceRules,
      junctionRules,
      flatFieldMetadataMaps,
      resolveTimelineActivityType,
    };
  }
}
