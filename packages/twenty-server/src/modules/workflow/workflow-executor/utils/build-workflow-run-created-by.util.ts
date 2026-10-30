import { type ActorMetadata } from 'twenty-shared/types';

// A run acts through the application owning its workflow, whoever starts it
export const buildWorkflowRunCreatedBy = ({
  source,
  workflowApplicationId,
}: {
  source: ActorMetadata;
  workflowApplicationId: string;
}): ActorMetadata => {
  if (source.context?.applicationId === workflowApplicationId) {
    return source;
  }

  return {
    ...source,
    context: { ...source.context, applicationId: workflowApplicationId },
  };
};
