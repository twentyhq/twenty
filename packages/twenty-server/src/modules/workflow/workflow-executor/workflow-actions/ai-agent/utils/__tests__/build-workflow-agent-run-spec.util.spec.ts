import { AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID } from 'twenty-shared/ai';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { buildWorkflowAgentRunSpec } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-agent/utils/build-workflow-agent-run-spec.util';
import { type WorkflowAiAgentAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildStep = (
  input: WorkflowAiAgentAction['settings']['input'],
): WorkflowAiAgentAction =>
  ({
    id: 'step-id',
    name: 'Draft the quote',
    type: WorkflowActionType.AI_AGENT,
    valid: true,
    nextStepIds: [],
    settings: {
      input,
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
  }) as WorkflowAiAgentAction;

describe('buildWorkflowAgentRunSpec', () => {
  it('keeps the agent from asking without human input instructions', () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({
        agentId: 'agent-id',
        prompt: 'Draft the quote',
        humanInputInstructions: '  ',
      }),
      isApplicationBound: false,
      applicationId: null,
    });

    expect(spec).toMatchObject({
      agentId: 'agent-id',
      title: 'Draft the quote',
      instructions: null,
      capabilities: {
        canAskHumans: false,
      },
    });
    expect(spec).not.toHaveProperty('additionalExcludedToolNames');
  });

  it('lets the agent ask humans with the instructions the step gives', () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({
        agentId: 'agent-id',
        humanInputInstructions: ' Ask before choosing a plan. ',
      }),
      isApplicationBound: false,
      applicationId: null,
    });

    expect(spec.agentId).toBe('agent-id');
    expect(spec.capabilities).toEqual({
      canAskHumans: true,
    });
    expect(spec.instructions).toMatch(/Ask before choosing a plan\.$/);
  });

  it('never lets a step without an agent ask humans', () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({
        prompt: 'Draft the quote',
        humanInputInstructions: 'Ask before choosing a plan.',
      }),
      isApplicationBound: false,
      applicationId: null,
    });

    expect(spec.agentId).toBeNull();
    expect(spec.capabilities).toEqual({ canAskHumans: false });
    expect(spec.instructions).toBeNull();
  });

  it('keeps tools out of reach of an application-bound run', () => {
    expect(
      buildWorkflowAgentRunSpec({
        step: buildStep({ agentId: 'agent-id', prompt: 'Draft the quote' }),
        isApplicationBound: true,
        applicationId: null,
      }).additionalExcludedToolNames,
    ).toContain('send_email');
  });

  it("asks for the step's output format", () => {
    const responseFormat = {
      type: 'json' as const,
      schema: {
        type: 'object' as const,
        properties: { summary: { type: 'string' as const } },
      },
    };

    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({ agentId: 'agent-id', responseFormat }),
      isApplicationBound: false,
      applicationId: null,
    });

    expect(spec.responseFormat).toEqual(responseFormat);
  });

  it("leaves the agent's output format to apply when the step gives none", () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({ agentId: 'agent-id' }),
      isApplicationBound: false,
      applicationId: null,
    });

    expect(spec).not.toHaveProperty('responseFormat');
  });

  it("carries the step's own config when it runs no agent", () => {
    const scope = {
      objectPermissions: [
        { objectUniversalIdentifier: 'person', canReadObjectRecords: true },
      ],
    };

    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({
        instructions: 'Qualify the lead.',
        modelConfiguration: { webSearch: { enabled: true } },
        scope,
        prompt: 'Qualify {{trigger.name}}',
      }),
      isApplicationBound: false,
      applicationId: 'application-id',
    });

    expect(spec).toMatchObject({
      agentId: null,
      inlineConfig: {
        instructions: 'Qualify the lead.',
        modelId: AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
        modelConfiguration: { webSearch: { enabled: true } },
        scope,
        applicationId: 'application-id',
        promptCacheKey: 'workflow-step:step-id',
      },
    });
  });

  it('gives a step without an agent or scope no data tools', () => {
    const spec = buildWorkflowAgentRunSpec({
      step: buildStep({ instructions: 'Summarize.' }),
      isApplicationBound: false,
      applicationId: null,
    });

    expect(spec.inlineConfig?.scope).toBeNull();
  });
});
