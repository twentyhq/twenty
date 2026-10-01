import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';
import { computeAgentExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-agent-execution-fingerprint.util';
import { computeLogicFunctionExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-logic-function-execution-fingerprint.util';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

export const computeWorkflowRunPinnedDependencies = ({
  logicFunctions,
  agents,
}: {
  logicFunctions: Pick<
    LogicFunctionEntity,
    | 'id'
    | 'checksum'
    | 'handlerName'
    | 'runtime'
    | 'workflowActionTriggerSettings'
  >[];
  agents: Pick<
    AgentEntity,
    'id' | 'prompt' | 'modelId' | 'responseFormat' | 'modelConfiguration'
  >[];
}): WorkflowRunPinnedDependencies => ({
  logicFunctionFingerprintById: Object.fromEntries(
    logicFunctions.map((logicFunction) => [
      logicFunction.id,
      computeLogicFunctionExecutionFingerprint(logicFunction),
    ]),
  ),
  agentFingerprintById: Object.fromEntries(
    agents.map((agent) => [agent.id, computeAgentExecutionFingerprint(agent)]),
  ),
});
