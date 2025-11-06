import { findManyApplicationsQueryFactory } from 'test/integration/graphql/utils/find-many-applications-query-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';

export const findManyApplications = async ({
  gqlFields,
  expectToFail,
}: {
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  findManyApplications: ApplicationDTO[];
}> => {
  const graphqlOperation = findManyApplicationsQueryFactory(gqlFields);

  const response = await makeGraphqlAPIRequest(graphqlOperation);

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
