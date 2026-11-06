import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';
import { computeOutputSchemaFromExpectedOutput } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-output-schema-from-expected-output.util';
import { computeOutputSchemaFromSample } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-output-schema-from-sample.util';
import { computeClassifyOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-classify-output-schema.util';
import { computeCreateCalendarEventOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-create-calendar-event-output-schema.util';
import { computeDraftEmailOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-draft-email-output-schema.util';
import { computeSendChatMessageOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-send-chat-message-output-schema.util';
import { computeSendEmailOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-send-email-output-schema.util';
import { WAIT_FOR_EVENT_NAME_PATTERN } from 'src/modules/workflow/workflow-executor/workflow-actions/wait-for-event/constants/wait-for-event-name-pattern.constant';
import { Injectable, Logger } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  BaseOutputSchemaV2,
  buildManualTriggerMetadataNode,
  BulkRecordsAvailability,
  extractRawVariableNamePart,
  getCurrentItemSchemaFromFlattenedArrayOutputSchema,
  GlobalAvailability,
  isBaseOutputSchemaV2,
  isFlattenedArrayOutputSchema,
  navigateOutputSchemaProperty,
  SingleRecordAvailability,
  TRIGGER_STEP_ID,
  WORKFLOW_TRIGGER_METADATA_KEY,
  WORKFLOW_TRIGGER_PAYLOAD_KEY,
  WORKFLOW_TRIGGER_RECORD_LABEL,
  WORKFLOW_TRIGGER_RECORDS_LABEL,
  WorkflowActionType,
} from 'twenty-shared/workflow';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';
import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import {
  Leaf,
  Node,
  type OutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { extractPropertyPathFromVariable } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/extract-property-path-from-variable';
import { generateFakeArrayItem } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-array-item';
import { generateFakeFormResponse } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-response';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
import { inferArrayItemSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/infer-array-item-schema';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export type WorkflowVersionContent = {
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
};

@Injectable()
export class WorkflowSchemaWorkspaceService {
  private readonly logger = new Logger(WorkflowSchemaWorkspaceService.name);

  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async computeStepOutputSchema({
    step,
    workspaceId,
    workflowVersionContent,
  }: {
    step: WorkflowTrigger | WorkflowAction;
    workspaceId: string;
    workflowVersionContent?: WorkflowVersionContent;
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
        const { availability } = step.settings;

        if (isDefined(availability)) {
          return this.computeTriggerOutputSchemaFromAvailability({
            availability,
            workspaceId,
          });
        }

        return {};
      }
      case WorkflowTriggerType.CRON: {
        return {};
      }
      case WorkflowActionType.SEND_EMAIL:
        return computeSendEmailOutputSchema();
      case WorkflowActionType.DRAFT_EMAIL:
        return computeDraftEmailOutputSchema();
      case WorkflowActionType.CREATE_CALENDAR_EVENT:
        return computeCreateCalendarEventOutputSchema();
      case WorkflowActionType.SEND_CHAT_MESSAGE:
        return computeSendChatMessageOutputSchema({
          hasToolCall: isDefined(step.settings.input.toolCall),
        });
      case WorkflowActionType.CLASSIFY:
        return computeClassifyOutputSchema(step.settings.input.questions);
      case WorkflowActionType.CREATE_RECORD:
      case WorkflowActionType.UPDATE_RECORD:
      case WorkflowActionType.DELETE_RECORD:
      case WorkflowActionType.UPSERT_RECORD:
      case WorkflowActionType.PICK_RECORD:
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
      case WorkflowActionType.WAIT_FOR_EVENT:
        return this.computeWaitForEventOutputSchema({
          eventName: step.settings.input?.eventName,
          workspaceId,
        });
      case WorkflowActionType.ITERATOR: {
        const items = step.settings.input.items;

        return {
          currentItem: await this.computeLoopCurrentItemOutputSchema({
            items,
            workspaceId,
            workflowVersionContent,
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
      case WorkflowActionType.AI_AGENT: {
        if (isDefined(step.settings.input.responseFormat)) {
          return computeAiAgentOutputSchema(step.settings.input.responseFormat);
        }

        return this.computeAiAgentActionOutputSchema({
          agentId: step.settings.input.agentId,
          workspaceId,
        });
      }
      case WorkflowTriggerType.WEBHOOK:
        return step.settings.httpMethod === 'POST'
          ? computeOutputSchemaFromSample(step.settings.expectedBody)
          : {};
      case WorkflowActionType.CODE:
      case WorkflowActionType.HTTP_REQUEST:
        return computeOutputSchemaFromExpectedOutput(step.settings);
      case WorkflowActionType.LOGIC_FUNCTION: {
        const declaredOutputSchema =
          await this.getLogicFunctionDeclaredOutputSchema({
            logicFunctionId: step.settings.input.logicFunctionId,
            workspaceId,
          });

        return (
          declaredOutputSchema ??
          computeOutputSchemaFromExpectedOutput(step.settings)
        );
      }
      default:
        return {};
    }
  }

  async enrichWorkflowVersionContentOutputSchemas({
    trigger,
    steps,
    workspaceId,
    shouldKeepStoredSchemaOnError = false,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[] | null;
    workspaceId: string;
    shouldKeepStoredSchemaOnError?: boolean;
  }): Promise<WorkflowVersionContent> {
    const workflowVersionContent = { trigger, steps };

    const enrichedTrigger = isDefined(trigger) ? { ...trigger } : null;

    if (isDefined(enrichedTrigger)) {
      enrichedTrigger.settings = {
        ...enrichedTrigger.settings,
        outputSchema: await this.computeStoredOutputSchema({
          step: enrichedTrigger,
          workspaceId,
          workflowVersionContent,
          shouldKeepStoredSchemaOnError,
        }),
      };
    }

    if (!isDefined(steps)) {
      return { trigger: enrichedTrigger, steps: null };
    }

    const enrichedSteps = await Promise.all(
      steps.map(async (step) => {
        const enrichedStep = { ...step };

        enrichedStep.settings = {
          ...enrichedStep.settings,
          outputSchema: await this.computeStoredOutputSchema({
            step,
            workspaceId,
            workflowVersionContent,
            shouldKeepStoredSchemaOnError,
          }),
        };

        return enrichedStep;
      }),
    );

    return { trigger: enrichedTrigger, steps: enrichedSteps };
  }

  private async computeStoredOutputSchema({
    step,
    workspaceId,
    workflowVersionContent,
    shouldKeepStoredSchemaOnError,
  }: {
    step: WorkflowTrigger | WorkflowAction;
    workspaceId: string;
    workflowVersionContent: WorkflowVersionContent;
    shouldKeepStoredSchemaOnError: boolean;
  }): Promise<OutputSchema> {
    try {
      return await this.computeStepOutputSchema({
        step,
        workspaceId,
        workflowVersionContent,
      });
    } catch (error) {
      if (
        !(error instanceof WorkflowCommonException) ||
        error.code !== WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND
      ) {
        // a read shows the stored schema rather than failing the whole version over one step
        if (!shouldKeepStoredSchemaOnError) {
          throw error;
        }

        this.logger.error(
          `Workspace ${workspaceId}: could not compute the output schema of ${step.type} step ${'id' in step ? step.id : 'trigger'}, the stored one is shown: ${error}`,
        );

        return step.settings.outputSchema;
      }

      // a step on a deleted object must still save; validation reports the object
      this.logger.warn(
        `Workspace ${workspaceId}: a ${step.type} step reads a deleted object, its output schema is empty`,
      );

      return {};
    }
  }

  private async getLogicFunctionDeclaredOutputSchema({
    logicFunctionId,
    workspaceId,
  }: {
    logicFunctionId: string;
    workspaceId: string;
  }): Promise<BaseOutputSchemaV2 | undefined> {
    if (!isDefined(logicFunctionId)) {
      return undefined;
    }

    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    const declaredInputSchema =
      flatLogicFunction?.workflowActionTriggerSettings?.outputSchema;

    if (!isDefined(declaredInputSchema)) {
      return undefined;
    }

    const declaredOutputSchema = inputSchemaToOutputSchema(declaredInputSchema);

    if (Object.keys(declaredOutputSchema).length === 0) {
      return undefined;
    }

    return declaredOutputSchema;
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
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
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
    });

    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        objectType,
        workspaceId,
      );

    const first: Node = {
      isLeaf: false,
      label: `First ${objectMetadataInfo.flatObjectMetadata.labelSingular ?? 'Record'}`,
      icon: 'IconAlpha',
      type: 'object',
      value: recordOutputSchema,
    };

    const all: Leaf = {
      isLeaf: true,
      label: `All ${objectMetadataInfo.flatObjectMetadata.labelPlural ?? 'Records'}`,
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
  }: {
    objectType: string;
    workspaceId: string;
  }): Promise<OutputSchema> {
    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        objectType,
        workspaceId,
      );

    return generateFakeObjectRecord({ objectMetadataInfo });
  }

  private async computeWaitForEventOutputSchema({
    eventName,
    workspaceId,
  }: {
    eventName: string | undefined;
    workspaceId: string;
  }): Promise<OutputSchema> {
    // a step being configured has no output to describe yet, like on the front
    if (!isDefined(eventName) || !WAIT_FOR_EVENT_NAME_PATTERN.test(eventName)) {
      return {};
    }

    const [objectType, action] = eventName.split('.');

    const objectMetadataInfo =
      await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
        objectType,
        workspaceId,
      );

    const recordLabel =
      objectMetadataInfo.flatObjectMetadata.labelSingular ?? 'Record';

    const record: Node = {
      isLeaf: false,
      label: recordLabel,
      icon: objectMetadataInfo.flatObjectMetadata.icon ?? 'IconAlpha',
      type: 'object',
      value: generateFakeObjectRecord({ objectMetadataInfo }),
    };

    const recordId: Leaf = {
      isLeaf: true,
      label: 'Record ID',
      icon: 'IconId',
      type: 'string',
      value: generateFakeValue('string'),
    };

    const hasTimedOut: Leaf = {
      isLeaf: true,
      label: 'Has Timed Out',
      icon: 'IconClockX',
      type: 'boolean',
      value: false,
    };

    if (action !== 'updated' && action !== 'upserted') {
      return { record, recordId, hasTimedOut } satisfies OutputSchema;
    }

    const before: Node = {
      isLeaf: false,
      label: `${recordLabel} Before Update`,
      icon: 'IconHistory',
      type: 'object',
      value: generateFakeObjectRecord({ objectMetadataInfo }),
    };

    const updatedFields: Leaf = {
      isLeaf: true,
      label: 'Updated Fields',
      icon: 'IconListDetails',
      type: 'array',
      value: ['name'],
    };

    return {
      record,
      recordId,
      before,
      updatedFields,
      hasTimedOut,
    } satisfies OutputSchema;
  }

  private async computeAiAgentActionOutputSchema({
    agentId,
    workspaceId,
  }: {
    agentId?: string;
    workspaceId: string;
  }): Promise<OutputSchema> {
    if (!isDefined(agentId)) {
      return computeAiAgentOutputSchema();
    }

    const { flatAgentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatAgentMaps'],
        },
      );

    const flatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: agentId,
      flatEntityMaps: flatAgentMaps,
    });

    if (!isDefined(flatAgent)) {
      return computeAiAgentOutputSchema();
    }

    return computeAiAgentOutputSchema(
      resolveEffectiveAgent(flatAgent).responseFormat,
    );
  }

  private async computeFormActionOutputSchema({
    formFieldMetadataItems,
    workspaceId,
  }: {
    formFieldMetadataItems: FormFieldMetadata[];
    workspaceId: string;
  }): Promise<OutputSchema> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    return generateFakeFormResponse({
      formFieldMetadataItems,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
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
      return {
        [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
      };
    }

    if (availability.type === 'SINGLE_RECORD') {
      const recordOutputSchema = await this.computeRecordOutputSchema({
        objectType: availability.objectNameSingular,
        workspaceId,
      });

      const objectMetadataInfo =
        await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
          availability.objectNameSingular,
          workspaceId,
        );

      const payload: Node = {
        isLeaf: false,
        type: 'object',
        icon: objectMetadataInfo.flatObjectMetadata.icon ?? undefined,
        label: WORKFLOW_TRIGGER_RECORD_LABEL,
        value: recordOutputSchema,
      };

      return {
        [WORKFLOW_TRIGGER_PAYLOAD_KEY]: payload,
        [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
      };
    }

    if (availability.type === 'BULK_RECORDS') {
      const objectMetadataInfo =
        await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
          availability.objectNameSingular,
          workspaceId,
        );

      const payload: Node = {
        isLeaf: false,
        type: 'object',
        label: WORKFLOW_TRIGGER_RECORDS_LABEL,
        value: {
          [objectMetadataInfo.flatObjectMetadata.namePlural]: {
            label: objectMetadataInfo.flatObjectMetadata.labelPlural,
            isLeaf: true,
            type: 'array',
            value:
              'Array of ' + objectMetadataInfo.flatObjectMetadata.labelPlural,
          },
        },
      };

      return {
        [WORKFLOW_TRIGGER_PAYLOAD_KEY]: payload,
        [WORKFLOW_TRIGGER_METADATA_KEY]: buildManualTriggerMetadataNode(),
      };
    }

    return {};
  }

  private async computeLoopCurrentItemOutputSchema({
    items,
    workspaceId,
    workflowVersionContent,
  }: {
    items: string | undefined | unknown[];
    workspaceId: string;
    workflowVersionContent?: WorkflowVersionContent;
  }): Promise<Leaf | Node> {
    if (!isDefined(items)) {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }

    if (isString(items) && isValidVariable(items)) {
      // runs on every content write, so a source that no longer resolves (e.g. a deleted object) must not block saving
      try {
        return await this.computeIteratorCurrentItemFromVariable({
          items,
          workspaceId,
          workflowVersionContent,
        });
      } catch {
        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }
    }

    return generateFakeArrayItem({ items });
  }

  private async computeIteratorCurrentItemFromVariable({
    items,
    workspaceId,
    workflowVersionContent,
  }: {
    items: string;
    workspaceId: string;
    workflowVersionContent?: WorkflowVersionContent;
  }): Promise<Leaf | Node> {
    if (!isDefined(workflowVersionContent)) {
      return DEFAULT_ITERATOR_CURRENT_ITEM;
    }

    const workflowVersion = workflowVersionContent;

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
              await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
                trigger.settings.availability.objectNameSingular,
                workspaceId,
              );

            return {
              label:
                'Current Item (' +
                objectMetadataInfo.flatObjectMetadata.labelSingular +
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
        case WorkflowTriggerType.WEBHOOK: {
          const propertyPath = extractPropertyPathFromVariable(items);
          const triggerOutputSchema = await this.computeStepOutputSchema({
            step: trigger,
            workspaceId,
          });
          const schemaNode = isBaseOutputSchemaV2(triggerOutputSchema)
            ? navigateOutputSchemaProperty({
                schema: triggerOutputSchema,
                propertyPath,
              })
            : undefined;

          if (!isDefined(schemaNode)) {
            return DEFAULT_ITERATOR_CURRENT_ITEM;
          }

          return inferArrayItemSchema({ schemaNode });
        }
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
          await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
            step.settings.input.objectName,
            workspaceId,
          );

        return {
          label:
            'Current Item (' +
            objectMetadataInfo.flatObjectMetadata.labelSingular +
            ')',
          isLeaf: false,
          type: 'object',
          value: await this.computeRecordOutputSchema({
            objectType: step.settings.input.objectName,
            workspaceId,
          }),
        };
      }
      case WorkflowActionType.CODE:
      case WorkflowActionType.HTTP_REQUEST:
      case WorkflowActionType.LOGIC_FUNCTION: {
        const propertyPath = extractPropertyPathFromVariable(items);
        const outputSchema = await this.computeStepOutputSchema({
          step,
          workspaceId,
        });

        // the only other shape these steps produce is the empty schema of a step with no sample
        if (!isBaseOutputSchemaV2(outputSchema)) {
          return DEFAULT_ITERATOR_CURRENT_ITEM;
        }

        const variableTargetsWholeStepOutput = propertyPath.length === 0;

        if (variableTargetsWholeStepOutput) {
          if (!isFlattenedArrayOutputSchema(outputSchema)) {
            return DEFAULT_ITERATOR_CURRENT_ITEM;
          }

          return (
            getCurrentItemSchemaFromFlattenedArrayOutputSchema({
              schema: outputSchema,
            }) ?? DEFAULT_ITERATOR_CURRENT_ITEM
          );
        }

        const schemaNode = navigateOutputSchemaProperty({
          schema: outputSchema,
          propertyPath,
        });

        if (!isDefined(schemaNode)) {
          return DEFAULT_ITERATOR_CURRENT_ITEM;
        }

        return inferArrayItemSchema({ schemaNode });
      }
      default: {
        return DEFAULT_ITERATOR_CURRENT_ITEM;
      }
    }
  }
}
