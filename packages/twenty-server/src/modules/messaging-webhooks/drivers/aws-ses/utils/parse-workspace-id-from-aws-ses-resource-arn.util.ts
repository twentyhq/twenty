import { isDefined } from 'twenty-shared/utils';

import { parseWorkspaceIdFromAwsSesResourceName } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/parse-workspace-id-from-aws-ses-resource-name.util';

export const parseWorkspaceIdFromAwsSesResourceArn = (
  resourceArn: string,
): string | null => {
  const slashIndex = resourceArn.indexOf('/');

  if (slashIndex === -1) {
    return null;
  }

  const afterPrefix = resourceArn.slice(slashIndex + 1);
  const resourceName = afterPrefix.split('/')[0];

  if (!isDefined(resourceName)) {
    return null;
  }

  return parseWorkspaceIdFromAwsSesResourceName(resourceName);
};
