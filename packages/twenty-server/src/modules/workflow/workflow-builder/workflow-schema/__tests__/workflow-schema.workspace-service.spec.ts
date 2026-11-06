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

  describe('enrichWorkflowVersionContentOutputSchemas', () => {
    const service = new WorkflowSchemaWorkspaceService(
      {} as never,
      {} as never,
    );

    const buildStep = (type: WorkflowActionType, settings: object) =>
      ({
        id: `${type}-step`,
        type,
        settings: { outputSchema: {}, ...settings },
      }) as never;

    it('stores the output schema of every step and of the trigger', async () => {
      const { trigger, steps } =
        await service.enrichWorkflowVersionContentOutputSchemas({
          workspaceId: WORKSPACE_ID,
          trigger: {
            type: 'WEBHOOK',
            settings: {
              outputSchema: {},
              httpMethod: 'POST',
              authentication: null,
              expectedBody: { message: 'hello' },
            },
          } as never,
          steps: [
            buildStep(WorkflowActionType.CLASSIFY, {
              input: {
                questions: [
                  {
                    name: 'sentiment',
                    type: 'choice',
                    criteria: [{ name: 'positive' }, { name: 'negative' }],
                  },
                ],
              },
            }),
            buildStep(WorkflowActionType.DRAFT_EMAIL, { input: {} }),
            buildStep(WorkflowActionType.CODE, {
              input: {},
              expectedOutputSchema: { total: 3 },
            }),
          ],
        });

      expect(trigger?.settings.outputSchema).toEqual({
        message: {
          isLeaf: true,
          type: 'string',
          label: 'message',
          value: 'hello',
        },
      });
      expect(steps?.map((step) => step.settings.outputSchema)).toEqual([
        {
          answers: expect.objectContaining({
            value: {
              sentiment: expect.objectContaining({
                value: expect.objectContaining({
                  choice: expect.objectContaining({ value: 'positive' }),
                }),
              }),
            },
          }),
          modelId: expect.objectContaining({ label: 'Model' }),
        },
        { success: expect.objectContaining({ label: 'Success' }) },
        {
          total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
        },
      ]);
    });

    it('replaces a schema the caller sent with the one its sample derives', async () => {
      const { steps } = await service.enrichWorkflowVersionContentOutputSchemas(
        {
          workspaceId: WORKSPACE_ID,
          trigger: null,
          steps: [
            buildStep(WorkflowActionType.HTTP_REQUEST, {
              input: {},
              outputSchema: {
                stale: {
                  isLeaf: true,
                  type: 'string',
                  label: 'stale',
                  value: '',
                },
              },
              expectedOutputSchema: { status: 200 },
            }),
          ],
        },
      );

      expect(steps?.[0].settings.outputSchema).toEqual({
        status: { isLeaf: true, type: 'number', label: 'status', value: 200 },
      });
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
              input: {},
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
