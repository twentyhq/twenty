import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { isFieldMetadataSettingsOfType } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-settings-of-type.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';
import { findSelfOverrideFlatTimelineActivityRule } from 'src/engine/metadata-modules/timeline-activity-rule/utils/find-self-override-flat-timeline-activity-rule.util';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { buildRelationTargetShape } from 'src/modules/timeline/utils/build-relation-target-shape.util';
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
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatTimelineActivityRuleMaps,
    } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatObjectMetadataMaps',
            'flatFieldMetadataMaps',
            'flatTimelineActivityRuleMaps',
          ],
        },
      );

    const persistedFlatRules = Object.values(
      flatTimelineActivityRuleMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const relationRules = persistedFlatRules
      .filter(
        (flatRule) =>
          flatRule.isActive &&
          flatRule.resolution === 'MATERIALIZED' &&
          isDefined(flatRule.relationFieldMetadataId),
      )
      // Only rules whose source or junction is the batch object can match, so
      // the target shape of every other rule is never built.
      .filter((flatRule) => {
        if (flatRule.objectMetadataId === flatObjectMetadata.id) {
          return true;
        }

        const relationFlatFieldMetadata = isDefined(
          flatRule.relationFieldMetadataId,
        )
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: flatRule.relationFieldMetadataId,
              flatEntityMaps: flatFieldMetadataMaps,
            })
          : undefined;

        // Only a junction rule can match a batch on its relation target: a
        // many-to-one rule fires from its source object alone.
        return (
          isDefined(relationFlatFieldMetadata) &&
          isFieldMetadataSettingsOfType(
            relationFlatFieldMetadata.settings,
            FieldMetadataType.RELATION,
          ) &&
          isDefined(relationFlatFieldMetadata.settings.junctionTargetFieldId) &&
          relationFlatFieldMetadata.relationTargetObjectMetadataId ===
            flatObjectMetadata.id
        );
      })
      .map((flatRule) =>
        this.buildRelationRule({
          flatRule,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined);

    const selfRule = this.buildSelfRule({
      flatObjectMetadata,
      persistedFlatRules,
      flatFieldMetadataMaps,
    });

    const sourceRules = [
      ...(isDefined(selfRule) ? [selfRule] : []),
      ...relationRules.filter(
        (rule) => rule.sourceFlatObjectMetadata.id === flatObjectMetadata.id,
      ),
    ];

    const junctionRules = relationRules.filter(
      (rule) =>
        rule.targetShape.kind === 'JUNCTION' &&
        rule.targetShape.junctionObjectMetadataId === flatObjectMetadata.id,
    );

    return { sourceRules, junctionRules, flatFieldMetadataMaps };
  }

  // The self rule is derived, not materialized: a row only exists where someone
  // changed something, and an inactive row is how a timeline is turned off.
  private buildSelfRule({
    flatObjectMetadata,
    persistedFlatRules,
    flatFieldMetadataMaps,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    persistedFlatRules: FlatTimelineActivityRule[];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): TimelineActivityRule | undefined {
    const derivedSelfRule =
      deriveDefaultTimelineActivityRule(flatObjectMetadata);

    if (!isDefined(derivedSelfRule)) {
      return undefined;
    }

    const selfOverrideFlatRule = findSelfOverrideFlatTimelineActivityRule({
      persistedFlatRules,
      objectMetadataId: flatObjectMetadata.id,
    });

    if (!isDefined(selfOverrideFlatRule)) {
      return derivedSelfRule;
    }

    if (!selfOverrideFlatRule.isActive) {
      return undefined;
    }

    return {
      ...derivedSelfRule,
      actions:
        selfOverrideFlatRule.actions.length > 0
          ? selfOverrideFlatRule.actions
          : derivedSelfRule.actions,
      triggerFieldNames: this.resolveTriggerFieldNames({
        triggerFieldMetadataIds: selfOverrideFlatRule.triggerFieldMetadataIds,
        flatFieldMetadataMaps,
      }),
    };
  }

  private buildRelationRule({
    flatRule,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    flatRule: FlatTimelineActivityRule;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): TimelineActivityRule | undefined {
    const sourceFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatRule.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });
    const relationFlatFieldMetadata = isDefined(
      flatRule.relationFieldMetadataId,
    )
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatRule.relationFieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        })
      : undefined;

    if (
      !isDefined(sourceFlatObjectMetadata) ||
      !isDefined(relationFlatFieldMetadata)
    ) {
      return undefined;
    }

    const targetShape = buildRelationTargetShape({
      relationFlatFieldMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (!isDefined(targetShape)) {
      return undefined;
    }

    return {
      sourceFlatObjectMetadata,
      actions: flatRule.actions,
      triggerFieldNames: this.resolveTriggerFieldNames({
        triggerFieldMetadataIds: flatRule.triggerFieldMetadataIds,
        flatFieldMetadataMaps,
      }),
      targetShape,
    };
  }

  private resolveTriggerFieldNames({
    triggerFieldMetadataIds,
    flatFieldMetadataMaps,
  }: {
    triggerFieldMetadataIds: string[] | null;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): string[] | null {
    if (!isDefined(triggerFieldMetadataIds)) {
      return null;
    }

    const triggerFieldNames = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: triggerFieldMetadataIds,
      flatEntityMaps: flatFieldMetadataMaps,
    }).map((flatFieldMetadata) => flatFieldMetadata.name);

    // An empty list gates every update out, so a rule whose trigger fields have
    // all been deleted would go silently dead. Fall back to emitting on any
    // field instead.
    if (!isNonEmptyArray(triggerFieldNames)) {
      return null;
    }

    return triggerFieldNames;
  }
}
