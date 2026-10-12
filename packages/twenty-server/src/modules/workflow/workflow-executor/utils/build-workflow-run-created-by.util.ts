import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildWorkflowRunCreatedBy = ({
  source,
  workflowApplicationId,
  workspaceOwnedApplicationIds,
}: {
  source: ActorMetadata;
  workflowApplicationId: string;
  workspaceOwnedApplicationIds: string[];
}): ActorMetadata => {
  const startingApplicationId = source.context?.applicationId;

  const isInstalledApplicationId = (
    applicationId: string | undefined,
  ): applicationId is string =>
    isDefined(applicationId) &&
    !workspaceOwnedApplicationIds.includes(applicationId);

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
