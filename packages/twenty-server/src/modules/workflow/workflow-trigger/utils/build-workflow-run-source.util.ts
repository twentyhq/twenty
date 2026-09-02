import { isNonEmptyString } from '@sniptt/guards';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

const DEFAULT_WORKFLOW_NAME = 'Workflow';

export const buildWorkflowRunSource = (
  workflowName?: string | null,
): ActorMetadata => {
  const trimmedWorkflowName = workflowName?.trim();

  return {
    source: FieldActorSource.WORKFLOW,
    name: isNonEmptyString(trimmedWorkflowName)
      ? trimmedWorkflowName
      : DEFAULT_WORKFLOW_NAME,
    context: {},
    workspaceMemberId: null,
  };
};
