import { Test } from '@nestjs/testing';

import { FieldActorSource } from 'twenty-shared/types';

import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkflowExecutionContextService } from 'src/modules/workflow/workflow-executor/services/workflow-execution-context.service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const APPLICATION_ID = 'application-id';
const CORE_WORKFLOW_ID = 'core-workflow-id';
const CORE_WORKFLOW_UNIVERSAL_IDENTIFIER = 'core-workflow-universal-identifier';

describe('WorkflowExecutionContextService', () => {
  const buildService = async ({
    workspaceWorkflowId,
  }: {
    workspaceWorkflowId: string | null;
  }) => {
    const module = await Test.createTestingModule({
      providers: [
        WorkflowExecutionContextService,
        {
          provide: WorkflowRunWorkspaceService,
          useValue: {
            getWorkflowRunOrFail: jest.fn().mockResolvedValue({
              id: 'workflow-run-id',
              coreWorkflowId: CORE_WORKFLOW_ID,
              createdBy: {
                source: FieldActorSource.WORKFLOW,
                workspaceMemberId: null,
                name: 'Workflow',
                context: {},
              },
            }),
          },
        },
        { provide: UserWorkspaceService, useValue: {} },
        {
          provide: CoreEntityCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue({
              id: WORKSPACE_ID,
              workspaceCustomApplicationId: 'workspace-custom-application-id',
            }),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatApplicationMaps: {
                byId: {
                  [APPLICATION_ID]: {
                    id: APPLICATION_ID,
                    name: 'Application',
                    deletedAt: null,
                    defaultRoleId: 'role-id',
                  },
                },
              },
              flatWorkflowMaps: {
                byUniversalIdentifier: {
                  [CORE_WORKFLOW_UNIVERSAL_IDENTIFIER]: {
                    id: CORE_WORKFLOW_ID,
                    universalIdentifier: CORE_WORKFLOW_UNIVERSAL_IDENTIFIER,
                    applicationId: APPLICATION_ID,
                    workspaceWorkflowId,
                  },
                },
                universalIdentifierById: {
                  [CORE_WORKFLOW_ID]: CORE_WORKFLOW_UNIVERSAL_IDENTIFIER,
                },
                universalIdentifiersByApplicationId: {},
              },
            }),
          },
        },
        {
          provide: RolePermissionsService,
          useValue: { hasAnyRole: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    return module.get(WorkflowExecutionContextService);
  };

  it('attributes a legacy workflow to its workspace workflow id, like step billing', async () => {
    const service = await buildService({
      workspaceWorkflowId: 'workspace-workflow-id',
    });

    const executionContext = await service.getExecutionContext({
      workflowRunId: 'workflow-run-id',
      workspaceId: WORKSPACE_ID,
    });

    expect(executionContext.workflowId).toBe('workspace-workflow-id');
  });

  it('attributes a workflow without a workspace twin to its core id', async () => {
    const service = await buildService({ workspaceWorkflowId: null });

    const executionContext = await service.getExecutionContext({
      workflowRunId: 'workflow-run-id',
      workspaceId: WORKSPACE_ID,
    });

    expect(executionContext.workflowId).toBe(CORE_WORKFLOW_ID);
  });
});
