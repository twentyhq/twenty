import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { computeAgentExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-agent-execution-fingerprint.util';
import { computeLogicFunctionExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-logic-function-execution-fingerprint.util';

type LogicFunctionFixture = Parameters<
  typeof computeLogicFunctionExecutionFingerprint
>[0];
type AgentFixture = Parameters<typeof computeAgentExecutionFingerprint>[0];

const logicFunction: LogicFunctionFixture = {
  checksum: 'checksum-1',
  handlerName: 'main',
  runtime: LogicFunctionRuntime.NODE22,
  workflowActionTriggerSettings: { label: 'Greet' },
};

const agent: AgentFixture = {
  prompt: 'You summarize',
  modelId: 'auto',
  responseFormat: {
    type: 'json',
    schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        score: { type: 'number' },
      },
    },
  },
  modelConfiguration: null,
};

describe('computeLogicFunctionExecutionFingerprint', () => {
  it('changes with the built code', () => {
    expect(computeLogicFunctionExecutionFingerprint(logicFunction)).not.toBe(
      computeLogicFunctionExecutionFingerprint({
        ...logicFunction,
        checksum: 'checksum-2',
      }),
    );
  });

  it('changes when the function stops being a workflow action', () => {
    expect(computeLogicFunctionExecutionFingerprint(logicFunction)).not.toBe(
      computeLogicFunctionExecutionFingerprint({
        ...logicFunction,
        workflowActionTriggerSettings: null,
      }),
    );
  });

  it('ignores properties that do not change the executed code', () => {
    const renamedLogicFunction = {
      ...logicFunction,
      name: 'renamed',
      timeoutSeconds: 30,
      workflowActionTriggerSettings: { label: 'Say hello' },
    };

    expect(computeLogicFunctionExecutionFingerprint(logicFunction)).toBe(
      computeLogicFunctionExecutionFingerprint(renamedLogicFunction),
    );
  });
});

describe('computeAgentExecutionFingerprint', () => {
  it('changes with the prompt', () => {
    expect(computeAgentExecutionFingerprint(agent)).not.toBe(
      computeAgentExecutionFingerprint({ ...agent, prompt: 'You translate' }),
    );
  });

  it('does not depend on the key order of JSON settings', () => {
    expect(computeAgentExecutionFingerprint(agent)).toBe(
      computeAgentExecutionFingerprint({
        ...agent,
        responseFormat: {
          schema: {
            properties: {
              score: { type: 'number' },
              summary: { type: 'string' },
            },
            type: 'object',
          },
          type: 'json',
        },
      }),
    );
  });

  it('ignores the label and role', () => {
    const relabeledAgent = { ...agent, label: 'Renamed', roleId: 'role-2' };

    expect(computeAgentExecutionFingerprint(agent)).toBe(
      computeAgentExecutionFingerprint(relabeledAgent),
    );
  });
});
