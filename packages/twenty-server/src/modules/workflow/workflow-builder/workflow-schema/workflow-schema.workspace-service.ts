import { computeAiAgentOutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-ai-agent-output-schema.util';
import { Injectable, Logger } from '@nestjs/common';

import { inputSchemaToOutputSchema } from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import { BaseOutputSchemaV2, WorkflowActionType } from 'twenty-shared/workflow';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { computeOutputSchemaFromExpectedSample } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-output-schema-from-expected-sample.util';
import {
  computeStepOutputSchemaFromObjectMetadataMaps,
  type WorkflowVersionContent,
} from 'src/modules/workflow/workflow-builder/workflow-schema/utils/compute-step-output-schema-from-object-metadata-maps.util';
import { generateFakeObjectRecordEvent } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record-event';
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
      case WorkflowTriggerType.MANUAL:
      case WorkflowActionType.CREATE_RECORD:
      case WorkflowActionType.UPDATE_RECORD:
      case WorkflowActionType.DELETE_RECORD:
      case WorkflowActionType.UPSERT_RECORD:
      case WorkflowActionType.PICK_RECORD:
      case WorkflowActionType.FIND_RECORDS:
      case WorkflowActionType.FORM:
      case WorkflowActionType.WAIT_FOR_EVENT:
      case WorkflowActionType.ITERATOR:
        return computeStepOutputSchemaFromObjectMetadataMaps({
          step,
          objectMetadataMaps:
            await this.workflowCommonWorkspaceService.getFlatEntityMaps(
              workspaceId,
            ),
          workflowVersionContent,
        });
      case WorkflowTriggerType.CRON: {
        return {};
      }
      case WorkflowActionType.SEND_EMAIL: {
        return this.computeSendEmailActionOutputSchema();
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

        return computeOutputSchemaFromExpectedSample(expectedOutputSchema);
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
    workflowVersionContent,
  }: {
    step: WorkflowAction;
    workspaceId: string;
    workflowVersionContent?: WorkflowVersionContent;
  }): Promise<WorkflowAction> {
    const BACKEND_ENRICHED_TYPES = [
      WorkflowActionType.ITERATOR,
      WorkflowActionType.AI_AGENT,
    ];

    if (!BACKEND_ENRICHED_TYPES.includes(step.type)) {
      return step;
    }

    const result = { ...step };
    const outputSchema = await this.computeStepOutputSchema({
      step,
      workspaceId,
      workflowVersionContent,
    });

    result.settings = {
      ...result.settings,
      outputSchema: outputSchema || {},
    };

    return result;
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

    return computeOutputSchemaFromExpectedSample(expectedOutputSchema);
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

  private computeSendEmailActionOutputSchema(): OutputSchema {
    return {
      success: { isLeaf: true, type: 'boolean', value: true },
      headerMessageId: {
        isLeaf: true,
        type: 'string',
        label: 'Message-ID header',
        value: '<message-id@mail.example.com>',
      },
      messageId: {
        isLeaf: true,
        type: 'string',
        label: 'Message record ID',
        value: '',
      },
      messageThreadId: {
        isLeaf: true,
        type: 'string',
        label: 'Message thread ID',
        value: '',
      },
    };
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

    return computeAiAgentOutputSchema(flatAgent?.responseFormat);
  }
}
