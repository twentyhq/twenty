import gql from 'graphql-tag';

import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

export type ApplicationRegistrationVersionResult = {
  id: string;
  applicationRegistrationId: string;
  version: string;
  sourceType: string;
  sourcePackage: string | null;
  tarballFileId: string | null;
  tarballUrl: string | null;
  checksum: string | null;
  publishedByUserId: string | null;
  publishedByWorkspaceId: string | null;
  publishedAt: string;
  reviewState: string;
};

export const findAdminApplicationRegistrationVersions = async (
  applicationRegistrationId: string,
): Promise<ApplicationRegistrationVersionResult[]> => {
  const response = await makeAdminPanelApiRequest({
    query: gql`
      query FindApplicationRegistrationVersions(
        $applicationRegistrationId: String!
      ) {
        findAdminApplicationRegistrationVersions(
          applicationRegistrationId: $applicationRegistrationId
        ) {
          id
          applicationRegistrationId
          version
          sourceType
          sourcePackage
          tarballFileId
          tarballUrl
          checksum
          publishedByUserId
          publishedByWorkspaceId
          publishedAt
          reviewState
        }
      }
    `,
    variables: { applicationRegistrationId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.findAdminApplicationRegistrationVersions;
};
