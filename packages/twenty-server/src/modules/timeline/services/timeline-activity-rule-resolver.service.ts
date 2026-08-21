import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_TIMELINE_ACTIVITY_RULES } from 'src/modules/timeline/constants/standard-timeline-activity-rules.constant';
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
};

@Injectable()
export class TimelineActivityRuleResolverService {
  constructor(
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getRulesForEventBatch({
    workspaceId,
    flatObjectMetadata,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
  }): Promise<TimelineActivityRulesForEventBatch> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const standardRules = this.buildStandardRules({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    const derivedSelfRule =
      deriveDefaultTimelineActivityRule(flatObjectMetadata);

    const sourceRules = [
      ...(isDefined(derivedSelfRule) ? [derivedSelfRule] : []),
      ...standardRules.filter(
        (rule) => rule.sourceFlatObjectMetadata.id === flatObjectMetadata.id,
      ),
    ];

    const junctionRules = standardRules.filter(
      (rule) =>
        rule.targetShape.kind === 'JUNCTION' &&
        rule.targetShape.junctionObjectMetadataId === flatObjectMetadata.id,
    );

    return { sourceRules, junctionRules, flatFieldMetadataMaps };
  }

  private buildStandardRules({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): TimelineActivityRule[] {
    return STANDARD_TIMELINE_ACTIVITY_RULES.map(
      (standardRule): TimelineActivityRule | undefined => {
        const sourceFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatObjectMetadataMaps,
          universalIdentifier: standardRule.objectUniversalIdentifier,
        });

        const relationFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: standardRule.relationFieldUniversalIdentifier,
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
          relationFieldMetadataId: relationFlatFieldMetadata.id,
          actions: standardRule.actions,
          triggerFieldNames:
            standardRule.triggerFieldUniversalIdentifiers
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
      },
    ).filter(isDefined);
  }
}
