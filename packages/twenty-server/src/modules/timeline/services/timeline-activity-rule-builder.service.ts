import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { partitionTimelineActivityTypesByValidity } from 'src/engine/metadata-modules/timeline-activity-type/utils/is-valid-timeline-activity-type-override.util';
import { resolveTimelineActivityTypeOverride } from 'src/engine/metadata-modules/timeline-activity-type/utils/resolve-timeline-activity-type-override.util';
import { TimelineActivityTypeCacheService } from 'src/modules/timeline/services/timeline-activity-type-cache.service';
import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';
import {
  toResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildJunctionTargetShape } from 'src/modules/timeline/utils/build-junction-target-shape.util';
import { buildTimelineActivitySelfRule } from 'src/modules/timeline/utils/build-timeline-activity-self-rule.util';

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
    private readonly timelineActivityTypeCacheService: TimelineActivityTypeCacheService,
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

    const unvalidatedTimelineActivityTypes = Object.values(
      flatTimelineActivityTypeMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const { validTimelineActivityTypes: timelineActivityTypes } =
      partitionTimelineActivityTypesByValidity({
        timelineActivityTypes: unvalidatedTimelineActivityTypes,
        objectMetadataByUniversalIdentifier:
          flatObjectMetadataMaps.byUniversalIdentifier,
        timelineActivityTypeByUniversalIdentifier:
          flatTimelineActivityTypeMaps.byUniversalIdentifier,
      });
    const allTimelineActivityTypeUniversalIdentifiers = new Set(
      timelineActivityTypes.map(
        (timelineActivityType) => timelineActivityType.universalIdentifier,
      ),
    );
    const declaredCandidatesByEmitKey = new Map<
      string,
      typeof timelineActivityTypes
    >();

    for (const timelineActivityType of timelineActivityTypes) {
      if (
        !isDefined(timelineActivityType.action) ||
        !isDefined(timelineActivityType.objectUniversalIdentifier)
      ) {
        continue;
      }

      const emitKey = [
        timelineActivityType.action,
        timelineActivityType.objectUniversalIdentifier,
        timelineActivityType.targetRelationFieldUniversalIdentifier ?? 'SELF',
      ].join('|');

      declaredCandidatesByEmitKey.set(emitKey, [
        ...(declaredCandidatesByEmitKey.get(emitKey) ?? []),
        timelineActivityType,
      ]);
    }

    const effectiveDeclaredTimelineActivityTypes: typeof timelineActivityTypes =
      [];

    for (const candidates of declaredCandidatesByEmitKey.values()) {
      const effectiveTimelineActivityType = resolveTimelineActivityTypeOverride(
        candidates,
        allTimelineActivityTypeUniversalIdentifiers,
      );

      if (!isDefined(effectiveTimelineActivityType)) {
        const [candidate] = candidates;

        this.timelineActivityMetadataDiagnosticsService.report({
          workspaceId,
          reason: 'ambiguous-declared-rule',
          action: candidate.action ?? 'unknown',
          objectUniversalIdentifier: candidate.objectUniversalIdentifier,
        });

        continue;
      }

      if (effectiveTimelineActivityType.isActive) {
        effectiveDeclaredTimelineActivityTypes.push(
          effectiveTimelineActivityType,
        );
      }
    }

    const declaredThroughRules = effectiveDeclaredTimelineActivityTypes
      .map((timelineActivityType): TimelineActivityRule | undefined => {
        if (
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

    const selfRule = buildTimelineActivitySelfRule({
      flatObjectMetadata,
      timelineActivityTypes: effectiveDeclaredTimelineActivityTypes,
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
      resolveTimelineActivityType:
        await this.timelineActivityTypeCacheService.getTimelineActivityTypeResolver(
          workspaceId,
        ),
    };
  }
}
