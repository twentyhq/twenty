import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';
import { buildWorkflowRunSource } from 'src/modules/workflow/workflow-trigger/utils/build-workflow-run-source.util';

export const buildWorkflowActorMetadata = (
  executionContext: Pick<
    WorkflowExecutionContext,
    'isActingOnBehalfOfUser' | 'initiator' | 'workflowId' | 'workflowName'
  >,
): ActorMetadata => {
  const actor = executionContext.isActingOnBehalfOfUser
    ? executionContext.initiator
    : buildWorkflowRunSource(executionContext.workflowName);

  return {
    ...actor,
    context: { ...actor.context, workflowId: executionContext.workflowId },
  };
};
