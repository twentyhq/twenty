import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

export type ApplicationVariableSummary = {
  key: string;
  value: string;
  isSecret: boolean;
};

export const findOneApplicationIdByUniversalIdentifier = async ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}): Promise<string> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query FindOneApplicationIdByUniversalIdentifier(
        $universalIdentifier: UUID!
      ) {
        findOneApplication(universalIdentifier: $universalIdentifier) {
          id
        }
      }
    `,
    variables: { universalIdentifier },
  });

  const id: string | undefined = response.body?.data?.findOneApplication?.id;

  if (!isDefined(id)) {
    throw new Error(
      `findOneApplication did not return an id for universalIdentifier=${universalIdentifier}: ${JSON.stringify(
        response.body,
      )}`,
    );
  }

  return id;
};

export const findOneApplicationVariables = async ({
  id,
}: {
  id: string;
}): Promise<ApplicationVariableSummary[]> => {
  const response = await makeMetadataAPIRequest({
    query: gql`
      query FindOneApplicationVariables($id: UUID!) {
        findOneApplication(id: $id) {
          applicationVariables {
            key
            value
            isSecret
          }
        }
      }
    `,
    variables: { id },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.findOneApplication.applicationVariables;
};
