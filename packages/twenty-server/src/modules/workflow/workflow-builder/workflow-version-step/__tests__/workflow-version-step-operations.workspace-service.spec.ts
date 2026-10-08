import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';

describe('WorkflowVersionStepOperationsWorkspaceService', () => {
  let service: WorkflowVersionStepOperationsWorkspaceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WorkflowVersionStepOperationsWorkspaceService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get(WorkflowVersionStepOperationsWorkspaceService);
  });

  describe('runStepCreationSideEffectsAndBuildStep', () => {
    it('should use the provided time zone for a new calendar event step', async () => {
      const { builtStep } =
        await service.runStepCreationSideEffectsAndBuildStep({
          type: WorkflowActionType.CREATE_CALENDAR_EVENT,
          workspaceId: WORKSPACE_ID,
          defaultSettings: { input: { timeZone: 'Europe/Paris' } },
        });

      expect(builtStep.settings.input).toMatchObject({
        timeZone: 'Europe/Paris',
      });
    });

    it('should leave the time zone empty when none is provided', async () => {
      const { builtStep } =
        await service.runStepCreationSideEffectsAndBuildStep({
          type: WorkflowActionType.CREATE_CALENDAR_EVENT,
          workspaceId: WORKSPACE_ID,
        });

      expect(builtStep.settings.input).toMatchObject({ timeZone: '' });
    });
  });
});
