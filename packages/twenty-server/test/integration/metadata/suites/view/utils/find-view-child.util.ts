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
}): Promise<{ child: { id: string } | null; errorCode?: string }> => {
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

  return {
    child: response.body.data?.[oneQueryName] ?? null,
    errorCode: response.body.errors?.[0]?.extensions?.code,
  };
};
