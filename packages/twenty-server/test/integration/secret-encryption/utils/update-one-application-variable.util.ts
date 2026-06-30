import gql from 'graphql-tag';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const updateOneApplicationVariable = async ({
  key,
  value,
  applicationId,
}: {
  key: string;
  value: string;
  applicationId: string;
}): Promise<void> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation UpdateOneApplicationVariable(
        $key: String!
        $value: String!
        $applicationId: UUID!
      ) {
        updateOneApplicationVariable(
          key: $key
          value: $value
          applicationId: $applicationId
        )
      }
    `,
    variables: { key, value, applicationId },
  });

  expect(response.body.errors).toBeUndefined();
};
