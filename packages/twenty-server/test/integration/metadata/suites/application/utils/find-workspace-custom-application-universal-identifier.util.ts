import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';

import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';

export const findWorkspaceCustomApplicationUniversalIdentifier = async (
  accessToken: string,
): Promise<string> => {
  const { data } = await findManyApplications({
    expectToFail: false,
    accessToken,
  });
  const customApplication = data.findManyApplications.find(
    ({ name }) => name === WORKSPACE_CUSTOM_APPLICATION_NAME,
  );

  if (!customApplication) {
    throw new Error('The workspace has no custom application');
  }

  return customApplication.universalIdentifier;
};
