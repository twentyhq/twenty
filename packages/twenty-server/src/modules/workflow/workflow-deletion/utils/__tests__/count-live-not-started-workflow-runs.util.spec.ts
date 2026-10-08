import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { countLiveNotStartedWorkflowRuns } from 'src/modules/workflow/workflow-deletion/utils/count-live-not-started-workflow-runs.util';

describe('countLiveNotStartedWorkflowRuns', () => {
  it('counts the not started runs that were not soft-deleted', () => {
    expect(
      countLiveNotStartedWorkflowRuns([
        { status: WorkflowRunStatus.NOT_STARTED, deletedAt: null },
        { status: WorkflowRunStatus.NOT_STARTED, deletedAt: null },
        {
          status: WorkflowRunStatus.NOT_STARTED,
          deletedAt: '2026-10-06T00:00:00.000Z',
        },
        { status: WorkflowRunStatus.ENQUEUED, deletedAt: null },
        { status: WorkflowRunStatus.RUNNING, deletedAt: null },
        { status: WorkflowRunStatus.COMPLETED, deletedAt: null },
      ]),
    ).toBe(2);
  });

  it('returns zero when no run is not started', () => {
    expect(countLiveNotStartedWorkflowRuns([])).toBe(0);
    expect(
      countLiveNotStartedWorkflowRuns([
        { status: WorkflowRunStatus.FAILED, deletedAt: null },
      ]),
    ).toBe(0);
  });
});
