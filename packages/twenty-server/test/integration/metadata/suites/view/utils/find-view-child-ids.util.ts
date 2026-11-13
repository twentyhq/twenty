import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

export const findViewChildIds = async ({
  listQueryName,
  viewId,
  token,
}: {
  listQueryName: string;
  viewId?: string;
  token?: string;
}): Promise<string[]> => {
  const response = await makeMetadataApiRequest(
    isDefined(viewId)
      ? {
          query: gql`
            query FindViewChildren($viewId: String!) {
              ${listQueryName}(viewId: $viewId) {
                id
              }
            }
          `,
          variables: { viewId },
        }
      : {
          query: gql`
            query FindAllViewChildren {
              ${listQueryName} {
                id
              }
            }
          `,
        },
    token,
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data[listQueryName].map(({ id }: { id: string }) => id);
};
