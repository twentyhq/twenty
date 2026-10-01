import { WorkflowActionType } from 'twenty-shared/workflow';

import { getWorkflowStepsExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-steps-execution-dependencies.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const buildStep = (
  id: string,
  type: WorkflowActionType,
  input: Record<string, unknown>,
) =>
  ({
    id,
    name: id,
    type,
    valid: true,
    nextStepIds: [],
    settings: { input, outputSchema: {}, errorHandlingOptions: {} },
  }) as unknown as WorkflowAction;

describe('getWorkflowStepsExecutionDependencies', () => {
  it('collects the functions of code and logic function steps and the agents of agent steps', () => {
    expect(
      getWorkflowStepsExecutionDependencies([
        buildStep('code', WorkflowActionType.CODE, {
          logicFunctionId: 'function-1',
        }),
        buildStep('logic', WorkflowActionType.LOGIC_FUNCTION, {
          logicFunctionId: 'function-2',
        }),
        buildStep('again', WorkflowActionType.CODE, {
          logicFunctionId: 'function-1',
        }),
        buildStep('agent', WorkflowActionType.AI_AGENT, {
          agentId: 'agent-1',
          prompt: 'Summarize',
        }),
        buildStep('record', WorkflowActionType.CREATE_RECORD, {
          objectName: 'company',
        }),
      ]),
    ).toEqual({
      logicFunctionIds: ['function-1', 'function-2'],
      agentIds: ['agent-1'],
    });
  });

  it('ignores agent steps without an agent', () => {
    expect(
      getWorkflowStepsExecutionDependencies([
        buildStep('agent', WorkflowActionType.AI_AGENT, {
          agentId: '',
          prompt: 'Summarize',
        }),
      ]),
    ).toEqual({ logicFunctionIds: [], agentIds: [] });
  });
});
