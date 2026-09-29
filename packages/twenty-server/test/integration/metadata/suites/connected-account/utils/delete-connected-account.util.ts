import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export const deleteConnectedAccount = async ({
  id,
  expectToFail,
}: {
  id: string;
  expectToFail: boolean;
}) => {
  const response = await makeMetadataApiRequest({
    query: gql`
      mutation DeleteConnectedAccount($id: UUID!) {
        deleteConnectedAccount(id: $id) {
          id
        }
      }
    `,
    variables: { id },
  });

  if (expectToFail) {
    expect(response.body.data?.deleteConnectedAccount).toBeNull();

    return { errors: response.body.errors, data: null };
  }

  expect(response.body.errors).toBeUndefined();

  return { errors: null, data: response.body.data.deleteConnectedAccount };
};
