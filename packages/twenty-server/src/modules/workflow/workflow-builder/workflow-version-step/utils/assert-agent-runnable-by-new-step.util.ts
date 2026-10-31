import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';

// deleting or duplicating a step takes its hidden agent along, so no new step may share one
export const assertAgentRunnableByNewStep = (
  agent: Pick<FlatAgentWithRoleId, 'label' | 'isSystem'>,
): void => {
  if (agent.isSystem) {
    throw new WorkflowVersionStepException(
      `Agent "${agent.label}" belongs to another workflow step and cannot be run by a new step. Run a reusable agent, or give the step its own instructions.`,
      WorkflowVersionStepExceptionCode.INVALID_REQUEST,
    );
  }
};
