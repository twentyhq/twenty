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
});
