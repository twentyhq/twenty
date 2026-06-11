import { type WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import {
  WorkflowActionType,
  type WorkflowAiAgentAction,
  type WorkflowFindRecordsAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowValidationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-validation.workspace-service';

const WORKSPACE_ID = 'workspace-id';

const ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: false },
  continueOnFailure: { value: false },
};

const buildService = (objectIdByNameSingular: Record<string, string> = {}) => {
  const workflowCommonWorkspaceService = {
    getWorkflowVersionOrFail: jest.fn(),
    getFlatEntityMaps: jest.fn().mockResolvedValue({ objectIdByNameSingular }),
  } as unknown as jest.Mocked<WorkflowCommonWorkspaceService>;

  const workflowSchemaWorkspaceService = {
    computeStepOutputSchema: jest.fn().mockResolvedValue(undefined),
  } as unknown as jest.Mocked<WorkflowSchemaWorkspaceService>;

  return new WorkflowValidationWorkspaceService(
    workflowCommonWorkspaceService,
    workflowSchemaWorkspaceService,
  );
};

const buildAiAgentStep = (input: {
  agentId?: string;
  prompt?: string;
}): WorkflowAiAgentAction => ({
  id: 'ai-agent-step',
  name: 'AI Agent',
  type: WorkflowActionType.AI_AGENT,
  valid: true,
  settings: {
    input,
    outputSchema: {
      result: { isLeaf: true, type: 'string', label: 'result', value: '' },
    },
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildFindRecordsStep = (
  objectName: string,
): WorkflowFindRecordsAction => ({
  id: 'find-records-step',
  name: 'Find Records',
  type: WorkflowActionType.FIND_RECORDS,
  valid: true,
  settings: {
    input: { objectName },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

describe('WorkflowValidationWorkspaceService', () => {
  it('should flag an AI Agent step that has no agent selected', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildAiAgentStep({})],
    });

    expect(result.errors.map((issue) => issue.code)).toContain(
      'AI_AGENT_MISSING_AGENT',
    );
  });

  it('should not flag an AI Agent step that has an agent selected', async () => {
    const service = buildService();

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildAiAgentStep({ agentId: 'agent-1' })],
    });

    expect(result.errors.map((issue) => issue.code)).not.toContain(
      'AI_AGENT_MISSING_AGENT',
    );
  });

  it('should flag a record step targeting an object that does not exist in the workspace', async () => {
    const service = buildService({});

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildFindRecordsStep('ghost')],
    });

    expect(
      result.errors.some((issue) =>
        issue.message.includes('does not exist in this workspace'),
      ),
    ).toBe(true);
  });

  it('should not flag a record step targeting an existing object', async () => {
    const service = buildService({ person: 'object-id-1' });

    const result = await service.validateWorkflowDefinition({
      workspaceId: WORKSPACE_ID,
      trigger: null,
      steps: [buildFindRecordsStep('person')],
    });

    expect(
      result.errors.some((issue) =>
        issue.message.includes('does not exist in this workspace'),
      ),
    ).toBe(false);
  });
});
