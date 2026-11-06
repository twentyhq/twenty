import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import {
  type WorkflowCodeAction,
  type WorkflowCreateRecordAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowTriggerType,
  type WorkflowWebhookTrigger,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKSPACE_ID = 'workspace-id';
const AGENT_ID = 'agent-id';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

describe('WorkflowSchemaWorkspaceService', () => {
  it('computes an AI agent step output schema from the overridden response format', async () => {
    const flatAgentMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: {
        id: AGENT_ID,
        universalIdentifier: AGENT_ID,
        workspaceId: WORKSPACE_ID,
        responseFormat: { type: 'text' },
        isActive: true,
        deletedAt: null,
        overrides: {
          [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            responseFormat: {
              type: 'json',
              schema: {
                type: 'object',
                properties: { summary: { type: 'string' } },
              },
            },
          },
        },
      } as never,
      flatEntityMaps: createEmptyFlatEntityMaps(),
    });
    const flatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest
        .fn()
        .mockResolvedValue({ flatAgentMaps }),
    };
    const service = new WorkflowSchemaWorkspaceService(
      {} as never,
      flatEntityMapsCacheService as never,
    );

    const outputSchema = await service.computeStepOutputSchema({
      step: {
        type: WorkflowActionType.AI_AGENT,
        settings: { input: { agentId: AGENT_ID } },
      } as never,
      workspaceId: WORKSPACE_ID,
    });

    expect(outputSchema).toEqual({
      summary: expect.objectContaining({ isLeaf: true, type: 'string' }),
    });
  });

  describe('enrichWorkflowVersionContentOutputSchemas', () => {
    const errorHandlingOptions = {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    };

    const codeStep: WorkflowCodeAction = {
      id: 'code-step',
      name: 'Code',
      type: WorkflowActionType.CODE,
      valid: true,
      settings: {
        input: { logicFunctionInput: {} },
        outputSchema: {},
        expectedOutputSchema: { total: 3 },
        errorHandlingOptions,
      },
    };

    const createRecordStep: WorkflowCreateRecordAction = {
      id: 'create-record-step',
      name: 'Create Record',
      type: WorkflowActionType.CREATE_RECORD,
      valid: true,
      settings: {
        input: { objectName: 'deletedObject', objectRecord: {} },
        outputSchema: {},
        errorHandlingOptions,
      },
    };

    const webhookTrigger: WorkflowWebhookTrigger = {
      name: 'Webhook',
      type: WorkflowTriggerType.WEBHOOK,
      settings: {
        outputSchema: {},
        httpMethod: 'POST',
        authentication: null,
        expectedBody: { message: 'hello' },
      },
    };

    const buildService = async (getObjectMetadataInfo: jest.Mock) => {
      const testingModule = await Test.createTestingModule({
        providers: [
          WorkflowSchemaWorkspaceService,
          {
            provide: WorkflowCommonWorkspaceService,
            useValue: { getObjectMetadataInfo },
          },
          {
            provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
            useValue: {},
          },
        ],
      }).compile();

      return testingModule.get(WorkflowSchemaWorkspaceService);
    };

    it('stores the schema of the trigger and of every step', async () => {
      const service = await buildService(jest.fn());

      const { trigger, steps } =
        await service.enrichWorkflowVersionContentOutputSchemas({
          workspaceId: WORKSPACE_ID,
          trigger: webhookTrigger,
          steps: [codeStep],
        });

      expect(trigger?.settings.outputSchema).toEqual({
        message: {
          isLeaf: true,
          type: 'string',
          label: 'message',
          value: 'hello',
        },
      });
      expect(steps?.[0].settings.outputSchema).toEqual({
        total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
      });
    });

    it('stores an empty schema for a step on a deleted object', async () => {
      const service = await buildService(
        jest
          .fn()
          .mockRejectedValue(
            new WorkflowCommonException(
              'Object deletedObject not found',
              WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
            ),
          ),
      );

      const { steps } = await service.enrichWorkflowVersionContentOutputSchemas(
        { workspaceId: WORKSPACE_ID, trigger: null, steps: [createRecordStep] },
      );

      expect(steps?.[0].settings.outputSchema).toEqual({});
    });

    it('fails the save on any other error, keeping the stored schema', async () => {
      const service = await buildService(
        jest.fn().mockRejectedValue(new Error('Connection lost')),
      );

      await expect(
        service.enrichWorkflowVersionContentOutputSchemas({
          workspaceId: WORKSPACE_ID,
          trigger: null,
          steps: [createRecordStep],
        }),
      ).rejects.toThrow('Connection lost');
    });
  });
});
