import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityTypeMaps } from 'src/engine/metadata-modules/flat-timeline-activity-type/types/flat-timeline-activity-type-maps.type';
import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildDirectRelationTargetShape } from 'src/modules/timeline/utils/build-direct-relation-target-shape.util';
import { buildJunctionTargetShape } from 'src/modules/timeline/utils/build-junction-target-shape.util';
import { buildTimelineActivitySelfRule } from 'src/modules/timeline/utils/build-timeline-activity-self-rule.util';
import { resolveTimelineActivityTypeRouting } from 'src/modules/timeline/utils/resolve-timeline-activity-type-routing.util';
import {
  buildTimelineActivityTypeResolution,
  toResolvedTimelineActivityType,
  type ResolvableTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';

type TimelineActivityRulesForEventBatch = {
  sourceRules: TimelineActivityRule[];
  junctionRules: TimelineActivityRule[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  resolveTimelineActivityType: TimelineActivityTypeResolver;
};

type TimelineActivityRoutingPlan = {
  activeTimelineActivityTypes: ResolvableTimelineActivityType[];
  throughRules: TimelineActivityRule[];
  eligibleNonAuditedObjectMetadataIds: Set<string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  resolveTimelineActivityType: TimelineActivityTypeResolver;
};

@Injectable()
export class TimelineActivityRoutingPlanService {
  private readonly routingPlanByWorkspaceId = new Map<
    string,
    { cacheKey: string; routingPlan: TimelineActivityRoutingPlan }
  >();

  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly timelineActivityMetadataDiagnosticsService: TimelineActivityMetadataDiagnosticsService,
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

    const routingPlan = await this.getRoutingPlan(workspaceId);

    return routingPlan.eligibleNonAuditedObjectMetadataIds.has(
      flatObjectMetadata.id,
    );
  }

  async getRulesForEventBatch({
    workspaceId,
    flatObjectMetadata,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
  }): Promise<TimelineActivityRulesForEventBatch> {
    const routingPlan = await this.getRoutingPlan(workspaceId);
    const selfRule = buildTimelineActivitySelfRule({
      flatObjectMetadata,
      timelineActivityTypes: routingPlan.activeTimelineActivityTypes,
    });

    return {
      sourceRules: [
        ...(isDefined(selfRule) ? [selfRule] : []),
        ...routingPlan.throughRules.filter(
          (rule) => rule.sourceFlatObjectMetadata.id === flatObjectMetadata.id,
        ),
      ],
      junctionRules: routingPlan.throughRules.filter(
        (rule) =>
          rule.targetShape.kind === 'JUNCTION' &&
          rule.targetShape.junctionObjectMetadataId === flatObjectMetadata.id,
      ),
      flatFieldMetadataMaps: routingPlan.flatFieldMetadataMaps,
      resolveTimelineActivityType: routingPlan.resolveTimelineActivityType,
    };
  }

  private async getRoutingPlan(
    workspaceId: string,
  ): Promise<TimelineActivityRoutingPlan> {
    const { data, hashes } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMapsWithHashes(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatTimelineActivityTypeMaps',
          ],
        },
      );
    const cacheKey = [
      hashes.flatObjectMetadataMaps,
      hashes.flatFieldMetadataMaps,
      hashes.flatTimelineActivityTypeMaps,
    ].join('|');
    const cachedRoutingPlan = this.routingPlanByWorkspaceId.get(workspaceId);

    if (cachedRoutingPlan?.cacheKey === cacheKey) {
      return cachedRoutingPlan.routingPlan;
    }

    const routingPlan = this.buildRoutingPlan({ workspaceId, ...data });

    this.routingPlanByWorkspaceId.set(workspaceId, {
      cacheKey,
      routingPlan,
    });

    return routingPlan;
  }

  private buildRoutingPlan({
    workspaceId,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatTimelineActivityTypeMaps,
  }: {
    workspaceId: string;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatTimelineActivityTypeMaps: FlatTimelineActivityTypeMaps;
  }): TimelineActivityRoutingPlan {
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
    const throughRules = activeTimelineActivityTypes
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

    const eligibleNonAuditedObjectMetadataIds = new Set(
      throughRules.flatMap((rule) => [
        rule.sourceFlatObjectMetadata.id,
        ...(rule.targetShape.kind === 'JUNCTION'
          ? [rule.targetShape.junctionObjectMetadataId]
          : []),
      ]),
    );

    for (const timelineActivityType of activeTimelineActivityTypes) {
      if (
        !isDefined(timelineActivityType.action) ||
        !isDefined(timelineActivityType.objectUniversalIdentifier) ||
        isDefined(resolveTimelineActivityTypeRouting(timelineActivityType))
      ) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: timelineActivityType.objectUniversalIdentifier,
      });

      if (isDefined(flatObjectMetadata)) {
        eligibleNonAuditedObjectMetadataIds.add(flatObjectMetadata.id);
      }
    }

    return {
      activeTimelineActivityTypes,
      throughRules,
      eligibleNonAuditedObjectMetadataIds,
      flatFieldMetadataMaps,
      resolveTimelineActivityType,
    };
  }
}
