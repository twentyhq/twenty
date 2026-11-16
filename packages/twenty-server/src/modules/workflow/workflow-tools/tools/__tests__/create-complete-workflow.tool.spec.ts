import { WorkflowActionType } from 'twenty-shared/workflow';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowAiAgentActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/types/workflow-ai-agent-action-input.type';
import { type WorkflowCodeActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/code/types/workflow-code-action-input.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { createCreateCompleteWorkflowTool } from 'src/modules/workflow/workflow-tools/tools/create-complete-workflow.tool';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const CORE_WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000001';
const CORE_WORKFLOW_VERSION_ID = 'b3b8a4f0-0000-4000-8000-000000000002';
const WORKSPACE_WORKFLOW_ID = 'b3b8a4f0-0000-4000-8000-000000000003';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: 'workspace-id' },
} as WorkspaceAuthContext;
const STEP_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

const trigger: WorkflowTrigger = {
  name: 'Manual Trigger',
  type: WorkflowTriggerType.MANUAL,
  settings: { outputSchema: {} },
  nextStepIds: [],
};

const baseStep = {
  id: STEP_ID,
  name: 'Step',
  valid: true,
  nextStepIds: [],
};

const baseSettings = {
  outputSchema: {},
  errorHandlingOptions: {
    continueOnFailure: { value: false },
    retryOnFailure: { value: 0 },
  },
};

const sendEmailStep: WorkflowAction = {
  ...baseStep,
  type: WorkflowActionType.SEND_EMAIL,
  settings: {
    ...baseSettings,
    input: {
      connectedAccountId: 'connected-account-id',
      recipients: { to: 'person@example.com' },
    },
  },
};

const buildCodeStep = (input: WorkflowCodeActionInput): WorkflowAction => ({
  ...baseStep,
  type: WorkflowActionType.CODE,
  settings: { ...baseSettings, input },
});

const buildAiAgentStep = (
  input: WorkflowAiAgentActionInput = {},
): WorkflowAction => ({
  ...baseStep,
  type: WorkflowActionType.AI_AGENT,
  settings: { ...baseSettings, input },
});

const edges = [{ source: 'trigger', target: STEP_ID }];

const buildTool = () => {
  const coreWorkflowMutationService = {
    createWorkflowWithContent: jest.fn().mockResolvedValue({
      coreWorkflow: {
        id: CORE_WORKFLOW_ID,
        workspaceWorkflowId: WORKSPACE_WORKFLOW_ID,
      },
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    }),
  };
  const coreWorkflowLifecycleService = {
    activateCoreWorkflowVersion: jest.fn().mockResolvedValue(true),
  };
  const workflowAiAgentStepAgentService = {
    findAgentRunnableByNewStepOrThrow: jest.fn(),
  };
  const dependencies: Parameters<typeof createCreateCompleteWorkflowTool>[0] = {
    coreWorkflowMutationService,
    coreWorkflowLifecycleService,
    workflowAiAgentStepAgentService,
  };

  const tool = createCreateCompleteWorkflowTool(dependencies, {
    workspaceId: 'workspace-id',
    userWorkspaceId: 'user-workspace-id',
    authContext: AUTH_CONTEXT,
  });

  return {
    tool,
    coreWorkflowMutationService,
    coreWorkflowLifecycleService,
    workflowAiAgentStepAgentService,
  };
};

type ToolInput = Parameters<
  ReturnType<typeof createCreateCompleteWorkflowTool>['execute']
>[0];

const buildInput = (overrides: Partial<ToolInput> = {}): ToolInput => ({
  name: 'My workflow',
  trigger,
  steps: [sendEmailStep],
  edges,
  ...overrides,
});

describe('createCreateCompleteWorkflowTool', () => {
  it('creates the workflow with its whole content in one server call', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(buildInput());

    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalledTimes(1);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
        name: 'My workflow',
        trigger,
        steps: [sendEmailStep],
        edges,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        result: expect.objectContaining({
          coreWorkflowId: CORE_WORKFLOW_ID,
          coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
          stepIds: [STEP_ID],
        }),
      }),
    );
  });

  it('reports that nothing was created when the creation fails', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    coreWorkflowMutationService.createWorkflowWithContent.mockRejectedValue(
      new Error("Target step 'unknown' not found"),
    );

    const result = await tool.execute(buildInput());

    expect(result).toEqual({
      success: false,
      error: "Target step 'unknown' not found",
      message: expect.stringContaining('nothing was created'),
    });
  });

  it('refuses CODE steps without inline code, creating nothing', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(
      buildInput({
        steps: [
          buildCodeStep({ logicFunctionId: STEP_ID, logicFunctionInput: {} }),
        ],
      }),
    );

    expect(result.success).toBe(false);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).not.toHaveBeenCalled();
  });

  it('refuses CODE steps with empty inline code, creating nothing', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(
      buildInput({
        steps: [buildCodeStep({ code: '', logicFunctionInput: {} })],
      }),
    );

    expect(result.success).toBe(false);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).not.toHaveBeenCalled();
  });

  it('creates CODE steps carrying their source inline', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();
    const code = 'export const main = async () => ({});';

    const result = await tool.execute(
      buildInput({
        steps: [buildCodeStep({ code, logicFunctionInput: {} })],
      }),
    );

    expect(result.success).toBe(true);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [
          expect.objectContaining({
            type: 'CODE',
            settings: expect.objectContaining({
              input: expect.objectContaining({ code }),
            }),
          }),
        ],
      }),
    );
  });

  it('creates AI_AGENT steps, which need no agent', async () => {
    const { tool, coreWorkflowMutationService } = buildTool();

    const result = await tool.execute(
      buildInput({ steps: [buildAiAgentStep()] }),
    );

    expect(result.success).toBe(true);
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).toHaveBeenCalled();
  });

  it("refuses an AI_AGENT step running another step's hidden agent", async () => {
    const {
      tool,
      coreWorkflowMutationService,
      workflowAiAgentStepAgentService,
    } = buildTool();

    workflowAiAgentStepAgentService.findAgentRunnableByNewStepOrThrow.mockRejectedValue(
      new WorkflowVersionStepException(
        'Agent "Hidden step agent" is archived or belongs to another workflow step',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      ),
    );

    const result = await tool.execute(
      buildInput({
        steps: [buildAiAgentStep({ agentId: 'hidden-agent-id' })],
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        error: expect.stringContaining('belongs to another workflow step'),
      }),
    );
    expect(
      coreWorkflowMutationService.createWorkflowWithContent,
    ).not.toHaveBeenCalled();
  });

  it('activates the created version when asked to', async () => {
    const { tool, coreWorkflowLifecycleService } = buildTool();

    const result = await tool.execute(buildInput({ activate: true }));

    expect(
      coreWorkflowLifecycleService.activateCoreWorkflowVersion,
    ).toHaveBeenCalledWith({
      workspaceId: 'workspace-id',
      userWorkspaceId: 'user-workspace-id',
      coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
    });
    expect(result.success).toBe(true);
  });

  it('returns the created draft ids when the activation fails', async () => {
    const { tool, coreWorkflowLifecycleService } = buildTool();

    coreWorkflowLifecycleService.activateCoreWorkflowVersion.mockRejectedValue(
      new Error('The workflow has no steps.'),
    );

    const result = await tool.execute(buildInput({ activate: true }));

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Do not create it again'),
        result: expect.objectContaining({
          coreWorkflowId: CORE_WORKFLOW_ID,
          coreWorkflowVersionId: CORE_WORKFLOW_VERSION_ID,
        }),
      }),
    );
  });
});
