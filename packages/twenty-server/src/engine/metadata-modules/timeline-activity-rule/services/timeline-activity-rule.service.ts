import { Injectable } from '@nestjs/common';

import { getTimelineActivityRuleUniversalIdentifier } from 'twenty-shared/application';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';
import { SELF_TIMELINE_ACTIVITY_RULE_ACTIONS } from 'src/engine/metadata-modules/timeline-activity-rule/constants/self-timeline-activity-rule-actions.constant';
import { findSelfOverrideFlatTimelineActivityRule } from 'src/engine/metadata-modules/timeline-activity-rule/utils/find-self-override-flat-timeline-activity-rule.util';
import { isCallerOverridingEntity } from 'src/engine/metadata-modules/utils/is-caller-overriding-entity.util';
import { resolveEffectiveEntity } from 'src/engine/metadata-modules/utils/resolve-effective-entity.util';
import { sanitizeOverridableEntityInput } from 'src/engine/metadata-modules/utils/sanitize-overridable-entity-input.util';
import { type ResetTimelineActivityRuleInput } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/reset-timeline-activity-rule.input';
import { type TimelineActivityRuleDTO } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/timeline-activity-rule.dto';
import { type UpsertTimelineActivityRuleInput } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/upsert-timeline-activity-rule.input';
import {
  TimelineActivityRuleException,
  TimelineActivityRuleExceptionCode,
} from 'src/engine/metadata-modules/timeline-activity-rule/timeline-activity-rule.exception';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { deriveDefaultTimelineActivityRule } from 'src/modules/timeline/utils/derive-default-timeline-activity-rule.util';

const DEFAULT_RELATION_RULE_ACTIONS: TimelineActivityAction[] = [
  'linked',
  'unlinked',
  'updated',
];

type RuleFlatMaps = {
  flatTimelineActivityRuleMaps: FlatEntityMaps<FlatTimelineActivityRule>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

@Injectable()
export class TimelineActivityRuleService {
  constructor(
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationService: ApplicationService,
  ) {}

  async findEffectiveRules(
    workspaceId: string,
  ): Promise<TimelineActivityRuleDTO[]> {
    const flatMaps = await this.getFlatMaps(workspaceId);
    const workspaceCustomApplicationUniversalIdentifier =
      await this.getWorkspaceCustomApplicationUniversalIdentifier(workspaceId);

    const persistedFlatRules = Object.values(
      flatMaps.flatTimelineActivityRuleMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const selfRules = Object.values(
      flatMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((flatObjectMetadata) =>
        this.buildEffectiveSelfRule({
          flatObjectMetadata,
          persistedFlatRules,
        }),
      )
      .filter(isDefined);

    const relationRules = persistedFlatRules
      .filter((flatRule) => isDefined(flatRule.relationFieldMetadataId))
      .map((flatRule) =>
        this.buildEffectiveRelationRule({
          flatRule,
          workspaceCustomApplicationUniversalIdentifier,
        }),
      );

    return [...selfRules, ...relationRules];
  }

  async upsert(
    input: UpsertTimelineActivityRuleInput,
    workspaceId: string,
  ): Promise<TimelineActivityRuleDTO> {
    const flatMaps = await this.getFlatMaps(workspaceId);
    const relationFieldMetadataId = input.relationFieldMetadataId ?? null;

    this.assertTriggerFieldsBelongToObject({ input, flatMaps });

    const existingFlatRule = this.findFlatRuleByNaturalKey({
      flatMaps,
      objectMetadataId: input.objectMetadataId,
      relationFieldMetadataId,
    });

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const now = new Date().toISOString();

    if (isDefined(existingFlatRule)) {
      // Editing an application owned rule must not rewrite the definition the
      // application ships: the change is stored as an override instead.
      const { overrides, updatedEditableProperties } =
        sanitizeOverridableEntityInput({
          metadataName: 'timelineActivityRule',
          existingFlatEntity: existingFlatRule,
          updatedEditableProperties: {
            ...(isDefined(input.actions) && {
              actions: input.actions as TimelineActivityAction[],
            }),
            ...(input.triggerFieldMetadataIds !== undefined && {
              triggerFieldMetadataIds: input.triggerFieldMetadataIds,
            }),
            ...(isDefined(input.isActive) && { isActive: input.isActive }),
          },
          shouldOverride: isCallerOverridingEntity({
            callerApplicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            entityApplicationUniversalIdentifier:
              existingFlatRule.applicationUniversalIdentifier,
            workspaceCustomApplicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            isSystemSideEffect: false,
          }),
        });

      const flatRuleToUpdate: FlatTimelineActivityRule = {
        ...existingFlatRule,
        ...updatedEditableProperties,
        overrides,
        updatedAt: now,
      };

      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatEntityToUpdate: [flatRuleToUpdate],
      });
    } else {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: input.objectMetadataId,
        flatEntityMaps: flatMaps.flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        throw new TimelineActivityRuleException(
          'Object metadata not found',
          TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
        );
      }

      const relationFlatFieldMetadata = isDefined(relationFieldMetadataId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: relationFieldMetadataId,
            flatEntityMaps: flatMaps.flatFieldMetadataMaps,
          })
        : null;

      if (
        isDefined(relationFieldMetadataId) &&
        !isDefined(relationFlatFieldMetadata)
      ) {
        throw new TimelineActivityRuleException(
          'Relation field metadata not found',
          TimelineActivityRuleExceptionCode.INVALID_RELATION_FIELD,
        );
      }

      const flatRuleToCreate: FlatTimelineActivityRule = {
        id: v4(),
        universalIdentifier: getTimelineActivityRuleUniversalIdentifier({
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          relationFieldMetadataUniversalIdentifier:
            relationFlatFieldMetadata?.universalIdentifier ?? null,
        }),
        applicationId: workspaceCustomFlatApplication.id,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        objectMetadataId: input.objectMetadataId,
        objectMetadataUniversalIdentifier:
          flatObjectMetadata.universalIdentifier,
        relationFieldMetadataId,
        relationFieldMetadataUniversalIdentifier:
          relationFlatFieldMetadata?.universalIdentifier ?? null,
        resolution: 'MATERIALIZED',
        actions: (input.actions as TimelineActivityAction[] | undefined) ?? [
          ...(isDefined(relationFieldMetadataId)
            ? DEFAULT_RELATION_RULE_ACTIONS
            : SELF_TIMELINE_ACTIVITY_RULE_ACTIONS),
        ],
        triggerFieldMetadataIds: input.triggerFieldMetadataIds ?? null,
        isActive: input.isActive ?? true,
        overrides: null,
        workspaceId,
        createdAt: now,
        updatedAt: now,
      };

      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatEntityToCreate: [flatRuleToCreate],
      });
    }

    const effectiveRule = await this.findEffectiveRuleByNaturalKey({
      workspaceId,
      objectMetadataId: input.objectMetadataId,
      relationFieldMetadataId,
    });

    if (!isDefined(effectiveRule)) {
      throw new TimelineActivityRuleException(
        'Timeline rule not found after upsert',
        TimelineActivityRuleExceptionCode.TIMELINE_ACTIVITY_RULE_NOT_FOUND,
      );
    }

    return effectiveRule;
  }

  async reset(
    input: ResetTimelineActivityRuleInput,
    workspaceId: string,
  ): Promise<TimelineActivityRuleDTO | null> {
    const flatMaps = await this.getFlatMaps(workspaceId);
    const relationFieldMetadataId = input.relationFieldMetadataId ?? null;

    const existingFlatRule = this.findFlatRuleByNaturalKey({
      flatMaps,
      objectMetadataId: input.objectMetadataId,
      relationFieldMetadataId,
    });

    if (isDefined(existingFlatRule)) {
      await this.resetExistingFlatRule({
        existingFlatRule,
        workspaceId,
      });
    }

    return await this.findEffectiveRuleByNaturalKey({
      workspaceId,
      objectMetadataId: input.objectMetadataId,
      relationFieldMetadataId,
    });
  }

  private async resetExistingFlatRule({
    existingFlatRule,
    workspaceId,
  }: {
    existingFlatRule: FlatTimelineActivityRule;
    workspaceId: string;
  }): Promise<void> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const isApplicationOwned =
      existingFlatRule.applicationUniversalIdentifier !==
      workspaceCustomFlatApplication.universalIdentifier;

    if (isApplicationOwned) {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatEntityToUpdate: [
          {
            ...existingFlatRule,
            overrides: null,
            updatedAt: new Date().toISOString(),
          },
        ],
      });
    } else {
      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatEntityToDelete: [existingFlatRule],
      });
    }
  }

  private async getWorkspaceCustomApplicationUniversalIdentifier(
    workspaceId: string,
  ): Promise<string> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return workspaceCustomFlatApplication.universalIdentifier;
  }

  private async getFlatMaps(workspaceId: string): Promise<RuleFlatMaps> {
    return await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
      {
        workspaceId,
        flatMapsKeys: [
          'flatTimelineActivityRuleMaps',
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ],
      },
    );
  }

  private assertTriggerFieldsBelongToObject({
    input,
    flatMaps,
  }: {
    input: UpsertTimelineActivityRuleInput;
    flatMaps: RuleFlatMaps;
  }): void {
    for (const triggerFieldMetadataId of input.triggerFieldMetadataIds ?? []) {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: triggerFieldMetadataId,
        flatEntityMaps: flatMaps.flatFieldMetadataMaps,
      });

      if (
        !isDefined(flatFieldMetadata) ||
        flatFieldMetadata.objectMetadataId !== input.objectMetadataId
      ) {
        throw new TimelineActivityRuleException(
          'Trigger fields must belong to the rule object',
          TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
        );
      }
    }
  }

  private findFlatRuleByNaturalKey({
    flatMaps,
    objectMetadataId,
    relationFieldMetadataId,
  }: {
    flatMaps: RuleFlatMaps;
    objectMetadataId: string;
    relationFieldMetadataId: string | null;
  }): FlatTimelineActivityRule | undefined {
    return Object.values(
      flatMaps.flatTimelineActivityRuleMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(
        (flatRule) =>
          flatRule.objectMetadataId === objectMetadataId &&
          flatRule.relationFieldMetadataId === relationFieldMetadataId &&
          flatRule.resolution === 'MATERIALIZED',
      );
  }

  private async findEffectiveRuleByNaturalKey({
    workspaceId,
    objectMetadataId,
    relationFieldMetadataId,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    relationFieldMetadataId: string | null;
  }): Promise<TimelineActivityRuleDTO | null> {
    const flatMaps = await this.getFlatMaps(workspaceId);

    if (isDefined(relationFieldMetadataId)) {
      const flatRule = this.findFlatRuleByNaturalKey({
        flatMaps,
        objectMetadataId,
        relationFieldMetadataId,
      });

      return isDefined(flatRule)
        ? this.buildEffectiveRelationRule({
            flatRule,
            workspaceCustomApplicationUniversalIdentifier:
              await this.getWorkspaceCustomApplicationUniversalIdentifier(
                workspaceId,
              ),
          })
        : null;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return null;
    }

    const persistedFlatRules = Object.values(
      flatMaps.flatTimelineActivityRuleMaps.byUniversalIdentifier,
    ).filter(isDefined);

    return (
      this.buildEffectiveSelfRule({ flatObjectMetadata, persistedFlatRules }) ??
      null
    );
  }

  private buildEffectiveSelfRule({
    flatObjectMetadata,
    persistedFlatRules,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    persistedFlatRules: FlatTimelineActivityRule[];
  }): TimelineActivityRuleDTO | undefined {
    const derivedSelfRule =
      deriveDefaultTimelineActivityRule(flatObjectMetadata);

    if (!isDefined(derivedSelfRule)) {
      return undefined;
    }

    const persistedSelfFlatRule = findSelfOverrideFlatTimelineActivityRule({
      persistedFlatRules,
      objectMetadataId: flatObjectMetadata.id,
    });

    const selfOverrideFlatRule = isDefined(persistedSelfFlatRule)
      ? resolveEffectiveEntity(persistedSelfFlatRule)
      : undefined;

    return {
      id: selfOverrideFlatRule?.id ?? null,
      objectMetadataId: flatObjectMetadata.id,
      relationFieldMetadataId: null,
      resolution: 'MATERIALIZED',
      actions: isNonEmptyArray(selfOverrideFlatRule?.actions)
        ? selfOverrideFlatRule.actions
        : derivedSelfRule.actions,
      triggerFieldMetadataIds:
        selfOverrideFlatRule?.triggerFieldMetadataIds ?? null,
      isActive: selfOverrideFlatRule?.isActive ?? true,
      isStandard: true,
      isOverridden: isDefined(selfOverrideFlatRule),
    };
  }

  private buildEffectiveRelationRule({
    flatRule,
    workspaceCustomApplicationUniversalIdentifier,
  }: {
    flatRule: FlatTimelineActivityRule;
    workspaceCustomApplicationUniversalIdentifier: string;
  }): TimelineActivityRuleDTO {
    const effectiveFlatRule = resolveEffectiveEntity(flatRule);

    return {
      id: effectiveFlatRule.id,
      objectMetadataId: effectiveFlatRule.objectMetadataId,
      relationFieldMetadataId: effectiveFlatRule.relationFieldMetadataId,
      resolution: effectiveFlatRule.resolution,
      actions: effectiveFlatRule.actions,
      triggerFieldMetadataIds: effectiveFlatRule.triggerFieldMetadataIds,
      isActive: effectiveFlatRule.isActive,
      isStandard:
        flatRule.applicationUniversalIdentifier !==
        workspaceCustomApplicationUniversalIdentifier,
      isOverridden: isDefined(flatRule.overrides),
    };
  }

  private async runMigration({
    workspaceId,
    applicationUniversalIdentifier,
    flatEntityToCreate = [],
    flatEntityToUpdate = [],
    flatEntityToDelete = [],
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatEntityToCreate?: FlatTimelineActivityRule[];
    flatEntityToUpdate?: FlatTimelineActivityRule[];
    flatEntityToDelete?: FlatTimelineActivityRule[];
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            timelineActivityRule: {
              flatEntityToCreate,
              flatEntityToUpdate,
              flatEntityToDelete,
            },
          },
          workspaceId,
          applicationUniversalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while saving the timeline rule',
      );
    }
  }
}
