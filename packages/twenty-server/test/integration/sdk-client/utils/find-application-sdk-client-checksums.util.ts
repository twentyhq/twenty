import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const findApplicationSdkClientChecksums = async (
  applicationId: string,
): Promise<{ core: string | null; metadata: string | null } | null> => {
  const response = await makeMetadataApiRequest({
    query: gql`
      query ApplicationSdkClientChecksums($applicationId: UUID!) {
        applicationSdkClientChecksums(applicationId: $applicationId) {
          core
          metadata
        }
      }
    `,
    variables: { applicationId },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.applicationSdkClientChecksums;
};
