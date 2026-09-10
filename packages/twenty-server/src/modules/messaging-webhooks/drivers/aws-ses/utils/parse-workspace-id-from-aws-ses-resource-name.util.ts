import { AWS_SES_RESOURCE_NAME_PREFIX } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/constants/aws-ses-resource-name-prefix.constant';

export const parseWorkspaceIdFromAwsSesResourceName = (
  resourceName: string,
): string | null => {
  const expectedPrefix = `${AWS_SES_RESOURCE_NAME_PREFIX}-`;

  if (!resourceName.startsWith(expectedPrefix)) {
    return null;
  }

  const workspaceId = resourceName.slice(expectedPrefix.length);

  return workspaceId.length > 0 ? workspaceId : null;
};
