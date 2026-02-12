import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';

export const buildWorkflowActorMetadata = (
  executionContext: WorkflowExecutionContext,
): ActorMetadata => {
  if (executionContext.isActingOnBehalfOfUser) {
    return executionContext.initiator;
  }

  return {
    source: FieldActorSource.WORKFLOW,
    name: 'Workflow',
    workspaceMemberId: null,
    context: {},
  };
};
