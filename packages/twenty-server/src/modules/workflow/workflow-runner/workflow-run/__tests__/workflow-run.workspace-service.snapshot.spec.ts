import { Test } from '@nestjs/testing';

import { FieldActorSource } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowCodeAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import {
  WorkflowTriggerType,
  type WorkflowWebhookTrigger,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

const STORED_OUTPUT_SCHEMA = {
  total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
} as const;

describe('WorkflowRunWorkspaceService run snapshot', () => {
  it('leaves the output schemas out of the flow a new run stores', async () => {
    const insert = jest.fn();
    const workflowRunRepository = { findOne: jest.fn(), insert };

    const testingModule = await Test.createTestingModule({
      providers: [
        WorkflowRunWorkspaceService,
        {
          provide: WorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: (run: () => Promise<unknown>) => run(),
            getRepositoryWithoutPermissionChecks: () => workflowRunRepository,
          },
        },
        {
          provide: RecordPositionService,
          useValue: { buildRecordPosition: async () => 1 },
        },
        { provide: MetricsService, useValue: {} },
        { provide: WorkflowStepWaitWorkspaceService, useValue: {} },
        { provide: AgentRunSuspensionService, useValue: {} },
        { provide: CacheLockService, useValue: {} },
      ],
    }).compile();

    const trigger: WorkflowWebhookTrigger = {
      name: 'Webhook',
      type: WorkflowTriggerType.WEBHOOK,
      settings: {
        outputSchema: STORED_OUTPUT_SCHEMA,
        httpMethod: 'POST',
        authentication: null,
        expectedBody: { total: 3 },
      },
    };
    const step: WorkflowCodeAction = {
      id: 'code-step',
      name: 'Code',
      type: WorkflowActionType.CODE,
      valid: true,
      settings: {
        input: { logicFunctionInput: {} },
        outputSchema: STORED_OUTPUT_SCHEMA,
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    };

    await testingModule.get(WorkflowRunWorkspaceService).createCoreWorkflowRun({
      coreWorkflowId: 'workflow-id',
      coreWorkflowVersionId: 'version-id',
      workspaceWorkflowId: null,
      workspaceWorkflowVersionId: null,
      workflowName: 'Workflow',
      trigger,
      steps: [step],
      createdBy: {
        source: FieldActorSource.MANUAL,
        name: 'Tim',
        workspaceMemberId: null,
        context: {},
      },
      status: WorkflowRunStatus.NOT_STARTED,
      triggerPayload: {},
      workspaceId: 'workspace-id',
    });

    const { flow } = insert.mock.calls[0][0].state;

    expect(flow.trigger.settings).toEqual({
      ...trigger.settings,
      outputSchema: {},
    });
    expect(flow.steps[0].settings).toEqual({
      ...step.settings,
      outputSchema: {},
    });
  });
});
