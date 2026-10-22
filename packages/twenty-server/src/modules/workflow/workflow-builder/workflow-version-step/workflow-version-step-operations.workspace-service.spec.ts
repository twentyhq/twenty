import { WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';

describe('WorkflowVersionStepOperationsWorkspaceService', () => {
  const service =
    new (WorkflowVersionStepOperationsWorkspaceService as unknown as new () => WorkflowVersionStepOperationsWorkspaceService)();

  const buildSendEmailStep = async (
    defaultSettings?: Record<string, unknown>,
  ) => {
    const { builtStep } = await service.runStepCreationSideEffectsAndBuildStep({
      type: WorkflowActionType.SEND_EMAIL,
      workspaceId: 'workspace-id',
      defaultSettings,
    });

    return builtStep.settings.input as {
      connectedAccountId: string;
      fromHandle?: string;
    };
  };

  describe('SEND_EMAIL step creation', () => {
    it('should use the default sender when provided', async () => {
      const input = await buildSendEmailStep({
        input: {
          connectedAccountId: 'acc',
          fromHandle: 'jane@example.com',
        },
      });

      expect(input.connectedAccountId).toBe('acc');
      expect(input.fromHandle).toBe('jane@example.com');
    });

    it('should leave the input unchanged without default settings', async () => {
      const input = await buildSendEmailStep();

      expect(input.connectedAccountId).toBe('');
      expect(input).not.toHaveProperty('fromHandle');
    });

    it('should ignore empty or non-string default sender values', async () => {
      const input = await buildSendEmailStep({
        input: { connectedAccountId: '', fromHandle: 42 },
      });

      expect(input.connectedAccountId).toBe('');
      expect(input).not.toHaveProperty('fromHandle');
    });
  });
});
