import { Injectable } from '@nestjs/common';

import { getTimelineActivityRuleUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  isTimelineActivityAction,
  type TimelineActivityAction,
} from 'twenty-shared/timeline';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatTimelineActivityRule } from 'src/engine/metadata-modules/flat-timeline-activity-rule/types/flat-timeline-activity-rule.type';
import { SELF_TIMELINE_ACTIVITY_RULE_ACTIONS } from 'src/engine/metadata-modules/timeline-activity-rule/constants/self-timeline-activity-rule-actions.constant';
import { type ResetTimelineActivityRuleInput } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/reset-timeline-activity-rule.input';
import { type TimelineActivityRuleDTO } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/timeline-activity-rule.dto';
import { type UpsertTimelineActivityRuleInput } from 'src/engine/metadata-modules/timeline-activity-rule/dtos/upsert-timeline-activity-rule.input';
import {
  TimelineActivityRuleException,
  TimelineActivityRuleExceptionCode,
} from 'src/engine/metadata-modules/timeline-activity-rule/timeline-activity-rule.exception';
import { STANDARD_TIMELINE_ACTIVITY_RULES } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-timeline-activity-rules.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DEFAULT_RELATION_RULE_ACTIONS: TimelineActivityAction[] = [
  'linked',
  'unlinked',
  'updated',
];

type StandardRuleDefinition = {
  objectUniversalIdentifier: string;
  relationFieldUniversalIdentifier: string;
  actions: TimelineActivityAction[];
  triggerFieldUniversalIdentifiers: string[];
};

const STANDARD_RULE_DEFINITIONS: StandardRuleDefinition[] =
  STANDARD_TIMELINE_ACTIVITY_RULES.map((standardRule) => {
    const objectFields = STANDARD_OBJECTS[standardRule.objectName]
      .fields as Record<string, { universalIdentifier: string }>;

    return {
      objectUniversalIdentifier:
        STANDARD_OBJECTS[standardRule.objectName].universalIdentifier,
      relationFieldUniversalIdentifier:
        objectFields[standardRule.relationFieldName].universalIdentifier,
      actions: [...standardRule.actions],
      triggerFieldUniversalIdentifiers: standardRule.triggerFieldNames.map(
        (triggerFieldName) =>
          objectFields[triggerFieldName].universalIdentifier,
      ),
    };
  });

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
        this.buildEffectiveRelationRule({ flatRule, flatMaps }),
      );

    return [...selfRules, ...relationRules];
  }

  async upsert(
    input: UpsertTimelineActivityRuleInput,
    workspaceId: string,
  ): Promise<TimelineActivityRuleDTO> {
    this.validateUpsertInput(input);

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
      const flatRuleToUpdate: FlatTimelineActivityRule = {
        ...existingFlatRule,
        ...(isDefined(input.actions) && {
          actions: input.actions as TimelineActivityAction[],
        }),
        ...(input.triggerFieldMetadataIds !== undefined && {
          triggerFieldMetadataIds: input.triggerFieldMetadataIds,
        }),
        ...(isDefined(input.isActive) && { isActive: input.isActive }),
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

  // Reset removes the customization: a standard rule goes back to its standard
  // definition, a materialized self override or a custom rule is deleted.
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

    if (!isDefined(existingFlatRule)) {
      return await this.findEffectiveRuleByNaturalKey({
        workspaceId,
        objectMetadataId: input.objectMetadataId,
        relationFieldMetadataId,
      });
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const standardRuleDefinition =
      this.findStandardRuleDefinition(existingFlatRule);

    if (isDefined(standardRuleDefinition)) {
      const standardTriggerFieldMetadataIds =
        standardRuleDefinition.triggerFieldUniversalIdentifiers
          .map(
            (triggerFieldUniversalIdentifier) =>
              flatMaps.flatFieldMetadataMaps.byUniversalIdentifier[
                triggerFieldUniversalIdentifier
              ]?.id,
          )
          .filter(isDefined);

      await this.runMigration({
        workspaceId,
        applicationUniversalIdentifier:
          workspaceCustomFlatApplication.universalIdentifier,
        flatEntityToUpdate: [
          {
            ...existingFlatRule,
            actions: [...standardRuleDefinition.actions],
            triggerFieldMetadataIds: standardTriggerFieldMetadataIds,
            isActive: true,
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

    return await this.findEffectiveRuleByNaturalKey({
      workspaceId,
      objectMetadataId: input.objectMetadataId,
      relationFieldMetadataId,
    });
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

  private validateUpsertInput(input: UpsertTimelineActivityRuleInput): void {
    const invalidActions = (input.actions ?? []).filter(
      (action) => !isTimelineActivityAction(action),
    );

    if (invalidActions.length > 0) {
      throw new TimelineActivityRuleException(
        `Unknown timeline rule actions: ${invalidActions.join(', ')}`,
        TimelineActivityRuleExceptionCode.INVALID_TIMELINE_ACTIVITY_RULE_INPUT,
      );
    }
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
          (flatRule.relationFieldMetadataId ?? null) ===
            relationFieldMetadataId &&
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
    const effectiveRules = await this.findEffectiveRules(workspaceId);

    return (
      effectiveRules.find(
        (rule) =>
          rule.objectMetadataId === objectMetadataId &&
          rule.relationFieldMetadataId === relationFieldMetadataId,
      ) ?? null
    );
  }

  private findStandardRuleDefinition(
    flatRule: FlatTimelineActivityRule,
  ): StandardRuleDefinition | undefined {
    return STANDARD_RULE_DEFINITIONS.find(
      (definition) =>
        definition.objectUniversalIdentifier ===
          flatRule.objectMetadataUniversalIdentifier &&
        definition.relationFieldUniversalIdentifier ===
          flatRule.relationFieldMetadataUniversalIdentifier,
    );
  }

  private buildEffectiveSelfRule({
    flatObjectMetadata,
    persistedFlatRules,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    persistedFlatRules: FlatTimelineActivityRule[];
  }): TimelineActivityRuleDTO | undefined {
    const hasDerivedSelfRule =
      flatObjectMetadata.isAuditLogged && !flatObjectMetadata.isSystem;

    if (!hasDerivedSelfRule) {
      return undefined;
    }

    const selfOverrideFlatRule = persistedFlatRules.find(
      (flatRule) =>
        flatRule.objectMetadataId === flatObjectMetadata.id &&
        !isDefined(flatRule.relationFieldMetadataId) &&
        flatRule.resolution === 'MATERIALIZED',
    );

    if (!isDefined(selfOverrideFlatRule)) {
      return {
        id: null,
        objectMetadataId: flatObjectMetadata.id,
        relationFieldMetadataId: null,
        resolution: 'MATERIALIZED',
        actions: [...SELF_TIMELINE_ACTIVITY_RULE_ACTIONS],
        triggerFieldMetadataIds: null,
        isActive: true,
        isStandard: true,
        isOverridden: false,
      };
    }

    return {
      id: selfOverrideFlatRule.id,
      objectMetadataId: flatObjectMetadata.id,
      relationFieldMetadataId: null,
      resolution: 'MATERIALIZED',
      actions:
        selfOverrideFlatRule.actions.length > 0
          ? selfOverrideFlatRule.actions
          : [...SELF_TIMELINE_ACTIVITY_RULE_ACTIONS],
      triggerFieldMetadataIds: selfOverrideFlatRule.triggerFieldMetadataIds,
      isActive: selfOverrideFlatRule.isActive,
      isStandard: true,
      isOverridden: true,
    };
  }

  private buildEffectiveRelationRule({
    flatRule,
    flatMaps,
  }: {
    flatRule: FlatTimelineActivityRule;
    flatMaps: RuleFlatMaps;
  }): TimelineActivityRuleDTO {
    const standardRuleDefinition = this.findStandardRuleDefinition(flatRule);

    const isOverridden = isDefined(standardRuleDefinition)
      ? !flatRule.isActive ||
        !this.haveSameMembers(
          flatRule.actions,
          standardRuleDefinition.actions,
        ) ||
        !this.haveSameMembers(
          flatRule.triggerFieldMetadataIds ?? [],
          standardRuleDefinition.triggerFieldUniversalIdentifiers
            .map(
              (triggerFieldUniversalIdentifier) =>
                flatMaps.flatFieldMetadataMaps.byUniversalIdentifier[
                  triggerFieldUniversalIdentifier
                ]?.id,
            )
            .filter(isDefined),
        )
      : false;

    return {
      id: flatRule.id,
      objectMetadataId: flatRule.objectMetadataId,
      relationFieldMetadataId: flatRule.relationFieldMetadataId,
      resolution: flatRule.resolution,
      actions: flatRule.actions,
      triggerFieldMetadataIds: flatRule.triggerFieldMetadataIds,
      isActive: flatRule.isActive,
      isStandard: isDefined(standardRuleDefinition),
      isOverridden,
    };
  }

  private haveSameMembers(left: string[], right: string[]): boolean {
    return (
      left.length === right.length &&
      [...left].sort().join(',') === [...right].sort().join(',')
    );
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
