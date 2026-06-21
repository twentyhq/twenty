import { Injectable, Logger } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import {
  getOutputSchemaFromValue,
  inputSchemaToOutputSchema,
} from 'twenty-shared/logic-function';
import { isDefined, isValidVariable } from 'twenty-shared/utils';
import {
  BaseOutputSchemaV2,
  buildManualTriggerMetadataNode,
  BulkRecordsAvailability,
  extractRawVariableNamePart,
  GlobalAvailability,
  isBaseOutputSchemaV2,
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
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { DEFAULT_ITERATOR_CURRENT_ITEM } from 'src/modules/workflow/workflow-builder/workflow-schema/constants/default-iterator-current-item.const';
import {
  type BaseOutputSchema,
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
        return this.computeAiAgentActionOutputSchema({
          agentId: step.settings.input.agentId,
          workspaceId,
        });
      }
      case WorkflowTriggerType.WEBHOOK:
      case WorkflowActionType.CODE:
      case WorkflowActionType.HTTP_REQUEST: {
        const expectedOutputSchema =
          'expectedOutputSchema' in step.settings
            ? step.settings.expectedOutputSchema
            : undefined;

        return this.computeOutputSchemaFromExpectedSample(expectedOutputSchema);
      }
      case WorkflowActionType.LOGIC_FUNCTION: {
        return this.computeLogicFunctionOutputSchema({
          logicFunctionId: step.settings.input.logicFunctionId,
          expectedOutputSchema: step.settings.expectedOutputSchema,
          workspaceId,
        });
      }
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
    const BACKEND_ENRICHED_TYPES = [WorkflowActionType.ITERATOR];

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

  private computeOutputSchemaFromExpectedSample(
    expectedOutputSchema: object | undefined,
  ): OutputSchema {
    if (
      isDefined(expectedOutputSchema) &&
      Object.keys(expectedOutputSchema).length > 0
    ) {
      return getOutputSchemaFromValue(expectedOutputSchema);
    }

    return {};
  }

  private getOutputSchemaWithExpectedFallback(settings: {
    outputSchema?: OutputSchema;
    expectedOutputSchema?: object;
  }): BaseOutputSchemaV2 {
    const outputSchema = settings.outputSchema;

    if (isBaseOutputSchemaV2(outputSchema)) {
      return outputSchema;
    }

    const expectedOutputSchema = this.computeOutputSchemaFromExpectedSample(
      settings.expectedOutputSchema,
    );

    return isBaseOutputSchemaV2(expectedOutputSchema)
      ? expectedOutputSchema
      : {};
  }

  private async computeLogicFunctionOutputSchema({
    logicFunctionId,
    expectedOutputSchema,
    workspaceId,
  }: {
    logicFunctionId: string;
    expectedOutputSchema: object | undefined;
    workspaceId: string;
  }): Promise<OutputSchema> {
    const declaredOutputSchema =
      await this.getLogicFunctionDeclaredOutputSchema({
        logicFunctionId,
        workspaceId,
      });

    if (isDefined(declaredOutputSchema)) {
      return declaredOutputSchema;
    }

    return this.computeOutputSchemaFromExpectedSample(expectedOutputSchema);
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

  private computeSendEmailActionOutputSchema(): OutputSchema {
    return { success: { isLeaf: true, type: 'boolean', value: true } };
  }

  private async computeAiAgentActionOutputSchema({
    agentId,
    workspaceId,
  }: {
    agentId?: string;
    workspaceId: string;
  }): Promise<OutputSchema> {
    const textResponseOutputSchema: OutputSchema = {
      response: {
        label: 'Response',
        isLeaf: true,
        type: 'string',
        value: 'Response of the agent',
      },
    };

    if (!isDefined(agentId)) {
      return textResponseOutputSchema;
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

    const responseFormat = flatAgent?.responseFormat;

    if (responseFormat?.type !== 'json') {
      return textResponseOutputSchema;
    }

    return Object.entries(responseFormat.schema.properties || {}).reduce(
      (outputSchema, [propertyName, property]) => {
        outputSchema[propertyName] = {
          isLeaf: true,
          type: property.type,
          label: propertyName,
          ...(isDefined(property.description)
            ? { description: property.description }
            : {}),
          value: generateFakeValue(property.type),
        };

        return outputSchema;
      },
      {} as BaseOutputSchema,
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

      const payload: Node = {
        isLeaf: false,
        type: 'object',
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
      case WorkflowActionType.HTTP_REQUEST:
      case WorkflowActionType.LOGIC_FUNCTION: {
        const propertyPath = extractPropertyPathFromVariable(items);
        const schemaNode = navigateOutputSchemaProperty({
          schema: this.getOutputSchemaWithExpectedFallback(step.settings),
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
