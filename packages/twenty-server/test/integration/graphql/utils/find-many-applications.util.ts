import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import gql from 'graphql-tag';

import { type ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';

export const APPLICATION_GQL_FIELDS = `
  id
  name
  description
  version
  universalIdentifier
  canBeUninstalled
`;

export const findManyApplications = async ({
  gqlFields = APPLICATION_GQL_FIELDS,
  expectToFail,
  accessToken,
}: {
  gqlFields?: string;
  expectToFail?: boolean;
  accessToken?: string;
}): CommonResponseBody<{
  findManyApplications: ApplicationDTO[];
}> => {
  const response = await makeGraphqlAPIRequest(
    {
      query: gql`
    query FindManyApplications {
      findManyApplications {
        ${gqlFields}
      }
    }
  `,
      variables: {},
    },
    accessToken,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Application search should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Application search has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
