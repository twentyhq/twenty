import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { type MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { type RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { type WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_RUN_ID = 'workflow-run-id';
const AGENT_STEP_ID = 'agent-step-id';
const THREAD_ID = 'thread-id';

describe('WorkflowRunWorkspaceService', () => {
  const service = Object.assign(
    new WorkflowRunWorkspaceService(
      {} as WorkspaceOrmManager,
      {} as RecordPositionService,
      {} as MetricsService,
      {} as WorkflowRunRecordShareService,
    ),
    {
      cacheLockService: {
        withLock: (callback: () => Promise<unknown>) => callback(),
      },
    },
  );

  const getWorkflowRunOrFail = jest.spyOn(service, 'getWorkflowRunOrFail');
  const updateWorkflowRun = jest.spyOn(service, 'updateWorkflowRun');

  const mockWorkflowRun = ({
    status = WorkflowRunStatus.RUNNING,
    stepInfos,
  }: {
    status?: WorkflowRunStatus;
    stepInfos: WorkflowRunStepInfos;
  }) =>
    getWorkflowRunOrFail.mockResolvedValue({
      id: WORKFLOW_RUN_ID,
      status,
      state: { stepInfos },
    } as unknown as WorkflowRunWorkspaceEntity);

  const findStepAwaitingAnswer = () =>
    service.findStepAwaitingAnswer({
      threadId: THREAD_ID,
      workflowRunId: WORKFLOW_RUN_ID,
      workspaceId: WORKSPACE_ID,
    });

  beforeEach(() => {
    jest.clearAllMocks();
    updateWorkflowRun.mockResolvedValue(undefined);
  });

  describe('findStepAwaitingAnswer', () => {
    it('finds the PENDING step holding the conversation and leaves it PENDING', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.PENDING, threadId: THREAD_ID },
        },
      });

      expect(await findStepAwaitingAnswer()).toEqual({
        status: 'AWAITING_ANSWER',
        stepId: AGENT_STEP_ID,
      });
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });

    it('asks to wait out a step that has asked but is not parked yet', async () => {
      mockWorkflowRun({
        stepInfos: {
          [AGENT_STEP_ID]: { status: StepStatus.RUNNING, threadId: THREAD_ID },
        },
      });

      expect(await findStepAwaitingAnswer()).toEqual({
        status: 'NOT_YET_AWAITING',
      });
    });

    it.each([
      [
        'the run is no longer running',
        WorkflowRunStatus.STOPPED,
        { status: StepStatus.PENDING, threadId: THREAD_ID },
      ],
      [
        'the step moved on',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.SUCCESS, threadId: THREAD_ID },
      ],
      [
        'a retry replaced the conversation',
        WorkflowRunStatus.RUNNING,
        { status: StepStatus.PENDING, error: 'failed' },
      ],
    ])('reports no longer awaiting when %s', async (_, status, stepInfo) => {
      mockWorkflowRun({ status, stepInfos: { [AGENT_STEP_ID]: stepInfo } });

      expect(await findStepAwaitingAnswer()).toEqual({
        status: 'NO_LONGER_AWAITING',
      });
      expect(updateWorkflowRun).not.toHaveBeenCalled();
    });
  });
});
