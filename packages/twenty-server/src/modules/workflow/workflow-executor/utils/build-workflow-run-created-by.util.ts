import { type ActorMetadata } from 'twenty-shared/types';

// Only workflows of installed applications bind their runs; the workspace custom application acts across applications
export const buildWorkflowRunCreatedBy = ({
  source,
  workflowApplicationId,
  workspaceCustomApplicationId,
}: {
  source: ActorMetadata;
  workflowApplicationId: string;
  workspaceCustomApplicationId: string;
}): ActorMetadata => {
  const runApplicationId =
    workflowApplicationId === workspaceCustomApplicationId
      ? undefined
      : workflowApplicationId;

  if (source.context?.applicationId === runApplicationId) {
    return source;
  }

  return {
    ...source,
    context: { ...source.context, applicationId: runApplicationId },
  };
};
