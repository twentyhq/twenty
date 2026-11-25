import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type InstalledApplication = {
  id: string;
  [fieldName: string]: unknown;
};

export const findCurrentWorkspaceInstalledApplication = async ({
  applicationId,
  gqlFields,
  token,
}: {
  applicationId: string;
  gqlFields: string;
  token: string;
}): Promise<InstalledApplication | undefined> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query CurrentWorkspaceInstalledApplications {
          currentWorkspace {
            id
            installedApplications {
              id
              ${gqlFields}
            }
          }
        }
      `,
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.currentWorkspace.installedApplications.find(
    ({ id }: InstalledApplication) => id === applicationId,
  );
};
