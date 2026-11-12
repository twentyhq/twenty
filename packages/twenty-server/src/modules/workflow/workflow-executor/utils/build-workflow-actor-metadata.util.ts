import { isNonEmptyString } from '@sniptt/guards';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowExecutionContext } from 'src/modules/workflow/workflow-executor/types/workflow-execution-context.type';

const DEFAULT_WORKFLOW_ACTOR_NAME = 'Workflow';

export const buildWorkflowActorMetadata = (
  executionContext: WorkflowExecutionContext,
): ActorMetadata => {
  const workflowContext = isDefined(executionContext.workflowId)
    ? { workflowId: executionContext.workflowId }
    : {};

  if (executionContext.isActingOnBehalfOfUser) {
    return {
      ...executionContext.initiator,
      context: { ...executionContext.initiator.context, ...workflowContext },
    };
  }

  const workflowName = executionContext.workflowName?.trim();

  return {
    source: FieldActorSource.WORKFLOW,
    name: isNonEmptyString(workflowName)
      ? workflowName
      : DEFAULT_WORKFLOW_ACTOR_NAME,
    workspaceMemberId: null,
    context: workflowContext,
  };
};
