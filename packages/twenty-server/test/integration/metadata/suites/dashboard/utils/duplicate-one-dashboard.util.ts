import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type DuplicatedDashboardDTO } from 'src/modules/dashboard/dtos/duplicated-dashboard.dto';

import {
  type DuplicateOneDashboardFactoryInput,
  duplicateOneDashboardQueryFactory,
} from './duplicate-one-dashboard-query-factory.util';

export const duplicateOneDashboard = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: {
  input: DuplicateOneDashboardFactoryInput;
  gqlFields?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  duplicateDashboard: DuplicatedDashboardDTO;
}> => {
  const graphqlOperation = duplicateOneDashboardQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Dashboard duplication should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Dashboard duplication has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
