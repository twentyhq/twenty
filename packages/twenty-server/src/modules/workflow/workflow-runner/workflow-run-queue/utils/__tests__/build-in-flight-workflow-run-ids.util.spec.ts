import { type InFlightQueueJob } from 'src/engine/core-modules/message-queue/drivers/interfaces/message-queue-driver.interface';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildInFlightWorkflowRunIds } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/build-in-flight-workflow-run-ids.util';

const WORKFLOW_RUN_ID = '2b2f1bd8-7cf8-4a8f-9a4d-9d0b7b3c9e11';
const OTHER_WORKFLOW_RUN_ID = 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f';

describe('buildInFlightWorkflowRunIds', () => {
  it('collects the run of each job from its data and from its job id', () => {
    const inFlightJobs: InFlightQueueJob<RunWorkflowJobData>[] = [
      {
        id: 'job-without-run-prefix',
        data: { workspaceId: 'workspace-id', workflowRunId: WORKFLOW_RUN_ID },
      },
      {
        id: `${OTHER_WORKFLOW_RUN_ID}-6f3a3c4e-1d2b-4b5a-9c8d-7e6f5a4b3c2d`,
        data: { workspaceId: 'workspace-id', workflowRunId: '' },
      },
      {
        id: 'workflow-handle-staled-runs',
        data: { workspaceId: 'workspace-id', workflowRunId: '' },
      },
    ];

    expect([...buildInFlightWorkflowRunIds(inFlightJobs)].sort()).toEqual(
      [WORKFLOW_RUN_ID, OTHER_WORKFLOW_RUN_ID].sort(),
    );
  });
});
