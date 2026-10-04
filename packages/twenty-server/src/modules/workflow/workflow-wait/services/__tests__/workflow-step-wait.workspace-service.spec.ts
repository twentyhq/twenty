import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

describe('WorkflowStepWaitWorkspaceService', () => {
  it('queues the resolution of an overdue wait once however many sweeps find it', async () => {
    const messageQueueService = { add: jest.fn() };
    const service = new WorkflowStepWaitWorkspaceService(
      {} as never,
      messageQueueService as never,
    );

    const overdueWait = {
      workspaceId: 'workspace-id',
      workflowRunId: 'workflow-run-id',
      waitId: 'wait-id',
    };

    await service.scheduleOverdueResolution(overdueWait);
    await service.scheduleOverdueResolution(overdueWait);
    await service.scheduleOverdueResolution({
      ...overdueWait,
      waitId: 'other-wait-id',
    });

    const deduplicationIds = messageQueueService.add.mock.calls.map(
      ([, , options]) => options.deduplication.id,
    );

    expect(deduplicationIds[0]).toEqual(deduplicationIds[1]);
    expect(deduplicationIds[2]).not.toEqual(deduplicationIds[0]);
  });
});
