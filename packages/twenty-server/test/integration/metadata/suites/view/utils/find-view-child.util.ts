import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const findViewChild = async ({
  oneQueryName,
  childId,
  token,
}: {
  oneQueryName: string;
  childId: string;
  token?: string;
}): Promise<{ id: string } | null> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query FindViewChild($id: String!) {
          ${oneQueryName}(id: $id) {
            id
          }
        }
      `,
      variables: { id: childId },
    },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[oneQueryName];
};
