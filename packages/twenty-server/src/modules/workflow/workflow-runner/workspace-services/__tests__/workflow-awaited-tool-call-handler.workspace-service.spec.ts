import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';
import { WorkflowAwaitedToolCallHandlerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-awaited-tool-call-handler.workspace-service';

describe('WorkflowAwaitedToolCallHandlerWorkspaceService', () => {
  const buildHandler = (findStepAwaitingAnswer: jest.Mock) => {
    const workflowRunWorkspaceService = {
      findStepAwaitingAnswer,
      isStepStillRunning: jest.fn().mockResolvedValue(false),
    };

    return new WorkflowAwaitedToolCallHandlerWorkspaceService(
      { register: jest.fn() } as never,
      workflowRunWorkspaceService as never,
      {} as never,
    );
  };

  const findWaiter = (
    handler: WorkflowAwaitedToolCallHandlerWorkspaceService,
  ) =>
    handler.findWaiter({
      workspaceId: 'workspace-id',
      threadId: 'thread-id',
      workflowStep: { workflowRunId: 'workflow-run-id', stepId: 'step-id' },
    });

  it('reports a deleted workflow run as gone', async () => {
    const handler = buildHandler(
      jest
        .fn()
        .mockRejectedValue(
          new WorkflowRunException(
            'Workflow run not found',
            WorkflowRunExceptionCode.WORKFLOW_RUN_NOT_FOUND,
          ),
        ),
    );

    await expect(findWaiter(handler)).resolves.toEqual({ status: 'gone' });
  });

  it('rethrows other errors', async () => {
    const error = new Error('Database unavailable');
    const handler = buildHandler(jest.fn().mockRejectedValue(error));

    await expect(findWaiter(handler)).rejects.toBe(error);
  });
});
