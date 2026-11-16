import gql from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';

type MyConnectedAccount = {
  id: string;
  handle: string;
  provider: string;
  lastSignedInAt: string | null;
};

export const findMyConnectedAccounts = async ({
  token,
}: {
  token?: string;
} = {}): Promise<MyConnectedAccount[]> => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query MyConnectedAccounts {
          myConnectedAccounts {
            id
            handle
            provider
            lastSignedInAt
          }
        }
      `,
    },
    token,
  );

  warnIfErrorButNotExpectedToFail({
    response,
    errorMessage: 'Connected account listing has failed but should not',
  });

  return response.body.data.myConnectedAccounts;
};
