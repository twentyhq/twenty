import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isString } from '@sniptt/guards';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  BaseOutputSchemaV2,
  BulkRecordsAvailability,
  extractRawVariableNamePart,
  GlobalAvailability,
  navigateOutputSchemaProperty,
  SingleRecordAvailability,
  TRIGGER_STEP_ID,
} from 'twenty-shared/workflow';
import { Repository } from 'typeorm';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
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
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
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
        const { availability } = step.settings;

        if (isDefined(availability)) {
          return this.computeTriggerOutputSchemaFromAvailability({
            availability,
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
      case WorkflowActionType.UPSERT_RECORD:
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
      case WorkflowActionType.AI_AGENT: {
        const agentId = step.settings.input.agentId;

        if (!isDefined(agentId) || agentId === '') {
          return {};
        }

        const agent = await this.agentRepository.findOne({
          where: { id: agentId, workspaceId },
        });

        if (
          !isDefined(agent) ||
          agent.responseFormat?.type !== 'json' ||
          !isDefined(agent.responseFormat.schema)
        ) {
          return {};
        }

        return Object.fromEntries(
          Object.entries(agent.responseFormat.schema.properties).map(
            ([key, field]) => [
              key,
              {
                isLeaf: true,
                type: field.type,
                label: field.description || key,
                value: null,
              },
            ],
          ),
        ) as OutputSchema;
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
    const BACKEND_ENRICHED_TYPES = [
      WorkflowActionType.AI_AGENT,
      WorkflowActionType.ITERATOR,
    ];

    if (!BACKEND_ENRICHED_TYPES.includes(step.type)) {
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
        await this.workflowCommonWorkspaceService.getObjectMetadataInfo(
          availability.objectNameSingular,
          workspaceId,
        );

      return {
        [objectMetadataInfo.flatObjectMetadata.namePlural]: {
          label: objectMetadataInfo.flatObjectMetadata.labelPlural,
          isLeaf: true,
          type: 'array',
          value:
            'Array of ' + objectMetadataInfo.flatObjectMetadata.labelPlural,
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
          const schemaNode = navigateOutputSchemaProperty({
            schema: trigger.settings.outputSchema as BaseOutputSchemaV2,
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
      case WorkflowActionType.HTTP_REQUEST: {
        const propertyPath = extractPropertyPathFromVariable(items);
        const schemaNode = navigateOutputSchemaProperty({
          schema: step.settings.outputSchema as BaseOutputSchemaV2,
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
