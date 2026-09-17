import gql from 'graphql-tag';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getDataOrThrow } from 'test/integration/utils/query-messaging.util';

export const generateTransientToken = async (): Promise<string> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      mutation GenerateTransientToken {
        generateTransientToken {
          transientToken {
            token
          }
        }
      }
    `,
  });

  const data = getDataOrThrow(response) as {
    generateTransientToken: { transientToken: { token: string } };
  };

  return data.generateTransientToken.transientToken.token;
};
