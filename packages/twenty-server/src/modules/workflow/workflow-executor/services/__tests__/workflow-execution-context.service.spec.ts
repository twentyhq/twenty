import { FieldActorSource } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowStepExecutorException } from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { type WorkflowRunInfo } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-1';
const STANDARD_APPLICATION_ROLE_ID = 'standard-application-role-1';

const RUN_INFO: WorkflowRunInfo = {
  workflowRunId: 'workflow-run-1',
  workspaceId: WORKSPACE_ID,
};

const buildService = (standardApplicationDefaultRoleId: string | null) => {
  const workflowRunService = {
    getWorkflowRunOrFail: jest.fn().mockResolvedValue({
      id: RUN_INFO.workflowRunId,
      createdBy: {
        source: FieldActorSource.WORKFLOW,
        workspaceMemberId: null,
        name: 'Workflow',
        context: {},
      },
    }),
  } as unknown as WorkflowRunWorkspaceService;

  const applicationService = {
    findTwentyStandardApplicationOrThrow: jest.fn().mockResolvedValue({
      application: {
        id: 'standard-application-1',
        defaultRoleId: standardApplicationDefaultRoleId,
      },
      workspace: {
        id: WORKSPACE_ID,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        suspendedAt: null,
      },
    }),
  } as unknown as ApplicationService;

  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({ userWorkspaceRoleMap: {} }),
  } as unknown as WorkspaceCacheService;

  return new WorkflowExecutionContextService(
    workflowRunService,
    {} as UserWorkspaceService,
    applicationService,
    workspaceCacheService,
    {} as Repository<WorkspaceEntity>,
  );
};

describe('WorkflowExecutionContextService', () => {
  describe('automated run of a workspace workflow', () => {
    it('should run with the standard application role', async () => {
      const executionContext = await buildService(
        STANDARD_APPLICATION_ROLE_ID,
      ).getExecutionContext(RUN_INFO);

      expect(executionContext.rolePermissionConfig).toEqual({
        intersectionOf: { applicationRoleId: STANDARD_APPLICATION_ROLE_ID },
      });
    });

    it('should be refused when the standard application has no role', async () => {
      await expect(
        buildService(null).getExecutionContext(RUN_INFO),
      ).rejects.toThrow(WorkflowStepExecutorException);
    });
  });
});
