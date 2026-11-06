import { WorkflowActionType } from 'twenty-shared/workflow';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';

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

  describe('computeStepOutputSchema', () => {
    const service = new WorkflowSchemaWorkspaceService(
      {} as never,
      {} as never,
    );

    it.each([
      {
        type: WorkflowActionType.CLASSIFY,
        input: {
          questions: [{ name: 'sentiment', type: 'boolean', criteria: [] }],
        },
        keys: ['answers', 'modelId'],
      },
      {
        type: WorkflowActionType.SEND_CHAT_MESSAGE,
        input: { toolCall: { toolName: 'send_email' } },
        keys: [
          'threadId',
          'outcome',
          'toolName',
          'feedback',
          'error',
          'arguments',
          'output',
        ],
      },
      { type: WorkflowActionType.DRAFT_EMAIL, input: {}, keys: ['success'] },
      {
        type: WorkflowActionType.CREATE_CALENDAR_EVENT,
        input: {},
        keys: ['success', 'iCalUid', 'externalEventId', 'conferenceLink'],
      },
    ])(
      'describes the output of a $type step',
      async ({ type, input, keys }) => {
        const outputSchema = await service.computeStepOutputSchema({
          step: { type, settings: { input, outputSchema: {} } } as never,
          workspaceId: WORKSPACE_ID,
        });

        expect(Object.keys(outputSchema)).toEqual(keys);
      },
    );
  });

  describe('enrichWorkflowVersionContentOutputSchemas', () => {
    const service = new WorkflowSchemaWorkspaceService(
      {} as never,
      {
        getOrRecomputeManyOrAllFlatEntityMaps: jest
          .fn()
          .mockResolvedValue({
            flatLogicFunctionMaps: createEmptyFlatEntityMaps(),
          }),
      } as never,
    );

    const buildStep = (type: WorkflowActionType, settings: object) =>
      ({
        id: `${type}-step`,
        type,
        settings: { outputSchema: {}, input: {}, ...settings },
      }) as never;

    it('stores the schema of the trigger and of every step, derived from their sample over the one sent', async () => {
      const staleOutputSchema = {
        stale: { isLeaf: true, type: 'string', label: 'stale', value: '' },
      };

      const { trigger, steps } =
        await service.enrichWorkflowVersionContentOutputSchemas({
          workspaceId: WORKSPACE_ID,
          trigger: {
            type: 'WEBHOOK',
            settings: {
              outputSchema: staleOutputSchema,
              httpMethod: 'POST',
              authentication: null,
              expectedBody: { message: 'hello' },
            },
          } as never,
          steps: [
            WorkflowActionType.CODE,
            WorkflowActionType.HTTP_REQUEST,
            WorkflowActionType.LOGIC_FUNCTION,
          ].map((type) =>
            buildStep(type, {
              outputSchema: staleOutputSchema,
              expectedOutputSchema: { total: 3 },
            }),
          ),
        });

      expect(trigger?.settings.outputSchema).toEqual({
        message: {
          isLeaf: true,
          type: 'string',
          label: 'message',
          value: 'hello',
        },
      });
      expect(steps?.map((step) => step.settings.outputSchema)).toEqual(
        Array(3).fill({
          total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
        }),
      );
    });

    it('keeps a test result schema not yet moved to the expected output', async () => {
      const testResultSchema = {
        total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
      };

      const { steps } = await service.enrichWorkflowVersionContentOutputSchemas(
        {
          workspaceId: WORKSPACE_ID,
          trigger: null,
          steps: [
            buildStep(WorkflowActionType.CODE, {
              outputSchema: testResultSchema,
            }),
          ],
        },
      );

      expect(steps?.[0].settings.outputSchema).toEqual(testResultSchema);
    });

    it('saves a step whose output schema cannot be computed with an empty one', async () => {
      const failingService = new WorkflowSchemaWorkspaceService(
        {
          getObjectMetadataInfo: jest
            .fn()
            .mockRejectedValue(new Error('Object not found')),
        } as never,
        {} as never,
      );

      const { steps } =
        await failingService.enrichWorkflowVersionContentOutputSchemas({
          workspaceId: WORKSPACE_ID,
          trigger: null,
          steps: [
            buildStep(WorkflowActionType.CREATE_RECORD, {
              input: { objectName: 'deletedObject' },
            }),
          ],
        });

      expect(steps?.[0].settings.outputSchema).toEqual({});
    });
  });
});
