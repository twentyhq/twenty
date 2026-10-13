import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildWorkflowRunCreatedBy = ({
  source,
  workflowApplicationId,
  workspaceCustomApplicationId,
}: {
  source: ActorMetadata;
  workflowApplicationId: string;
  workspaceCustomApplicationId: string;
}): ActorMetadata => {
  const startingApplicationId = source.context?.applicationId;

  const isInstalledApplicationId = (
    applicationId: string | undefined,
  ): applicationId is string =>
    isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;

  if (isInstalledApplicationId(workflowApplicationId)) {
    return {
      ...source,
      context: { ...source.context, applicationId: workflowApplicationId },
    };
  }

  if (
    !isDefined(startingApplicationId) ||
    isInstalledApplicationId(startingApplicationId)
  ) {
    return source;
  }

  return {
    ...source,
    context: { ...source.context, applicationId: undefined },
  };
};
