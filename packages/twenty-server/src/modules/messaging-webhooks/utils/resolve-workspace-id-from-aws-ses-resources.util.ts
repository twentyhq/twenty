import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { parseWorkspaceIdFromAwsSesResourceArn } from 'src/modules/messaging-webhooks/utils/parse-workspace-id-from-aws-ses-resource-arn.util';

export const resolveWorkspaceIdFromAwsSesResources = (
  resources: string[] | undefined,
): string | null => {
  if (!isNonEmptyArray(resources)) {
    return null;
  }

  for (const resourceArn of resources) {
    const workspaceId = parseWorkspaceIdFromAwsSesResourceArn(resourceArn);

    if (isDefined(workspaceId)) {
      return workspaceId;
    }
  }

  return null;
};
