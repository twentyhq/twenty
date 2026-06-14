import { AWS_SES_RESOURCE_NAME_PREFIX } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-resource-name-prefix.constant';
import { isDefined } from 'twenty-shared/utils';

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

  const expectedPrefix = `${AWS_SES_RESOURCE_NAME_PREFIX}-`;

  if (!resourceName.startsWith(expectedPrefix)) {
    return null;
  }

  const workspaceId = resourceName.slice(expectedPrefix.length);

  return workspaceId.length > 0 ? workspaceId : null;
};
