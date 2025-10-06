import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  BulkRecordsAvailability,
  extractRawVariableNamePart,
  GlobalAvailability,
  SingleRecordAvailability,
  TRIGGER_STEP_ID,
} from 'twenty-shared/workflow';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import {
  Leaf,
  Node,
  type OutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeArrayItem } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-array-item';
import { generateFakeFormResponse } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-response';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowSchemaWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async computeStepOutputSchema({
    step,
    workspaceId,
    workflowVersionId,
  }: {
    step: WorkflowTrigger | WorkflowAction;
    workspaceId: string;
    workflowVersionId?: string;
  }): Promise<OutputSchema> {
    const stepType = step.type;

    switch (stepType) {
      case WorkflowTriggerType.DATABASE_EVENT: {
        return this.computeDatabaseEventTriggerOutputSchema({
          eventName: step.settings.eventName,
          workspaceId,
        });
      }
      case WorkflowTriggerType.MANUAL: {
        const isIteratorEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_WORKFLOW_ITERATOR_ENABLED,
            workspaceId,
          );

        const { objectType, availability } = step.settings;

        if (isDefined(availability) && isIteratorEnabled) {
          return this.computeTriggerOutputSchemaFromAvailability({
            availability,
            workspaceId,
          });
        }

        // TODO: to be deprecated once all triggers are migrated to the new availability type
        if (isDefined(objectType)) {
          return this.computeRecordOutputSchema({
            objectType,
            workspaceId,
          });
        }

        return {};
      }
      case WorkflowTriggerType.WEBHOOK:
      case WorkflowTriggerType.CRON: {
        return {};
      }
      case WorkflowActionType.SEND_EMAIL: {
        return this.computeSendEmailActionOutputSchema();
      }
      case WorkflowActionType.CREATE_RECORD:
      case WorkflowActionType.UPDATE_RECORD:
      case WorkflowActionType.DELETE_RECORD:
        return this.computeRecordOutputSchema({
          objectType: step.settings.input.objectName,
          workspaceId,
        });
      case WorkflowActionType.FIND_RECORDS:
        return this.computeFindRecordsOutputSchema({
          objectType: step.settings.input.objectName,
          workspaceId,
        });
      case WorkflowActionType.FORM:
        return this.computeFormActionOutputSchema({
          formFieldMetadataItems: step.settings.input,
          workspaceId,
        });
      case WorkflowActionType.ITERATOR: {
        const items = step.settings.input.items;

        return {
          currentItem: await this.computeLoopCurrentItemOutputSchema({
            items,
            workspaceId,
            workflowVersionId,
          }),
          currentItemIndex: {
            label: 'Current Item Index',
            isLeaf: true,
            type: 'number',
            value: generateFakeValue('number'),
          },
          hasProcessedAllItems: {
            label: 'Has Processed All Items',
            isLeaf: true,
            type: 'boolean',
            value: false,
          },
        };
      }
      case WorkflowActionType.CODE: // StepOutput schema is computed on serverlessFunction draft execution
      default:
        return {};
    }
  }

  async enrichOutputSchema({
    step,
    workspaceId,
    workflowVersionId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
    workflowVersionId: string;
  }): Promise<WorkflowAction> {
    // We don't enrich on the fly for code and HTTP request workflow actions.
    // For code actions, OutputSchema is computed and updated when testing the serverless function.
    // For HTTP requests and AI agent, OutputSchema is determined by the example response input
    if (
      [
        WorkflowActionType.CODE,
        WorkflowActionType.HTTP_REQUEST,
        WorkflowActionType.AI_AGENT,
      ].includes(step.type)
    ) {
      return step;
    }

    const result = { ...step };
    const outputSchema = await this.computeStepOutputSchema({
      step,
      workspaceId,
      workflowVersionId,
    });

    result.settings = {
      ...result.settings,
      outputSchema: outputSchema || {},
    };

    return result;
  }

  private async computeDatabaseEventTriggerOutputSchema({
    eventName,
    workspaceId,
  }: {
    eventName: string;
    workspaceId: string;
  }): Promise<OutputSchema> {
    const [nameSingular, action] = eventName.split('.');

    if (!checkStringIsDatabaseEventAction(action)) {
      return {};
    }

    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        nameSingular,
        workspaceId,
      );

    return generateFakeObjectRecordEvent(
      objectMetadataInfo,
      action as DatabaseEventAction,
    );
  }

  private async computeFindRecordsOutputSchema({
    objectType,
    workspaceId,
  }: {
    objectType: string;
    workspaceId: string;
  }): Promise<OutputSchema> {
    const recordOutputSchema = await this.computeRecordOutputSchema({
      objectType,
      workspaceId,
      maxDepth: 0,
    });

    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        objectType,
        workspaceId,
      );

    const first: Node = {
      isLeaf: false,
      label: `First ${objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelSingular ?? 'Record'}`,
      icon: 'IconAlpha',
      type: 'object',
      value: recordOutputSchema,
    };

    const all: Leaf = {
      isLeaf: true,
      label: `All ${objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelPlural ?? 'Records'}`,
      type: 'array',
      icon: 'IconListDetails',
      value: 'Returns an array of records',
    };

    const totalCount: Leaf = {
      isLeaf: true,
      label: 'Total Count',
      icon: 'IconSum',
      type: 'number',
      value: 'Count of matching records',
    };

    return { first, all, totalCount } satisfies OutputSchema;
  }

  private async computeRecordOutputSchema({
    objectType,
    workspaceId,
    maxDepth = 1,
  }: {
    objectType: string;
    workspaceId: string;
    maxDepth?: number;
  }): Promise<OutputSchema> {
    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
        objectType,
        workspaceId,
      );

    return generateFakeObjectRecord({ objectMetadataInfo, maxDepth });
  }

  private computeSendEmailActionOutputSchema(): OutputSchema {
    return { success: { isLeaf: true, type: 'boolean', value: true } };
  }

  private async computeFormActionOutputSchema({
    formFieldMetadataItems,
    workspaceId,
  }: {
    formFieldMetadataItems: FormFieldMetadata[];
    workspaceId: string;
  }): Promise<OutputSchema> {
    const objectMetadataMaps =
      await this.workflowCommonWorkspaceService.getObjectMetadataMaps(
        workspaceId,
      );

    return generateFakeFormResponse({
      formFieldMetadataItems,
      objectMetadataMaps,
    });
  }

  private async computeTriggerOutputSchemaFromAvailability({
    availability,
    workspaceId,
  }: {
    availability:
      | GlobalAvailability
      | SingleRecordAvailability
      | BulkRecordsAvailability;
    workspaceId: string;
  }): Promise<OutputSchema> {
    if (availability.type === 'GLOBAL') {
      return {};
    }

    if (availability.type === 'SINGLE_RECORD') {
      return this.computeRecordOutputSchema({
        objectType: availability.objectNameSingular,
        workspaceId,
      });
    }

    if (availability.type === 'BULK_RECORDS') {
      const objectMetadataInfo =
        await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
          availability.objectNameSingular,
          workspaceId,
        );

      return {
        [objectMetadataInfo.objectMetadataItemWithFieldsMaps.namePlural]: {
          label:
            objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelPlural,
          isLeaf: true,
          type: 'array',
          value:
            'Array of ' +
            objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelPlural,
        },
      };
    }

    return {};
  }

  private async computeLoopCurrentItemOutputSchema({
    items,
    workspaceId,
    workflowVersionId,
  }: {
    items: string | undefined | unknown[];
    workspaceId: string;
    workflowVersionId?: string;
  }): Promise<Leaf | Node> {
    if (!isDefined(items)) {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }

    if (isString(items) && isValidVariable(items)) {
      return this.computeIteratorCurrentItemFromVariable({
        items,
        workspaceId,
        workflowVersionId,
      });
    }

    return generateFakeArrayItem({ items });
  }

  private async computeIteratorCurrentItemFromVariable({
    items,
    workspaceId,
    workflowVersionId,
  }: {
    items: string;
    workspaceId: string;
    workflowVersionId?: string;
  }): Promise<Leaf | Node> {
    if (!isDefined(workflowVersionId)) {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    const stepId = extractRawVariableNamePart({
      rawVariableName: items,
      part: 'stepId',
    });

    if (stepId === TRIGGER_STEP_ID) {
      const trigger = workflowVersion.trigger;

      if (!isDefined(trigger)) {
        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }

      switch (trigger.type) {
        case WorkflowTriggerType.MANUAL: {
          if (trigger.settings.availability?.type === 'BULK_RECORDS') {
            const objectMetadataInfo =
              await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
                trigger.settings.availability.objectNameSingular,
                workspaceId,
              );

            return {
              label:
                'Current Item (' +
                objectMetadataInfo.objectMetadataItemWithFieldsMaps
                  .labelSingular +
                ')',
              isLeaf: false,
              type: 'object',
              value: await this.computeRecordOutputSchema({
                objectType: trigger.settings.availability.objectNameSingular,
                workspaceId,
              }),
            };
          }

          return DEFAULT_ITERATOR_CURRENT_ITEM;
        }
        // TODO(t.trompette): handle other trigger types
        default: {
          return DEFAULT_ITERATOR_CURRENT_ITEM;
        }
      }
    }

    const step = workflowVersion.steps?.find((step) => step.id === stepId);

    if (!isDefined(step)) {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }

    switch (step.type) {
      case WorkflowActionType.FIND_RECORDS: {
        const objectMetadataInfo =
          await this.workflowCommonWorkspaceService.getObjectMetadataItemWithFieldsMaps(
            step.settings.input.objectName,
            workspaceId,
          );

        return {
          label:
            'Current Item (' +
            objectMetadataInfo.objectMetadataItemWithFieldsMaps.labelSingular +
            ')',
          isLeaf: false,
          type: 'object',
          value: await this.computeRecordOutputSchema({
            objectType: step.settings.input.objectName,
            workspaceId,
          }),
        };
      }
      default: {
        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }
    }
  }
}
