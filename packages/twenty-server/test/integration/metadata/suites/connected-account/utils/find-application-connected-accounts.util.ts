import {
  type FindApplicationConnectedAccountsFactoryInput,
  findApplicationConnectedAccountsQueryFactory,
} from 'test/integration/metadata/suites/connected-account/utils/find-application-connected-accounts-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationConnectedAccountDTO } from 'src/engine/metadata-modules/connected-account/dtos/application-connected-account.dto';

export const findApplicationConnectedAccounts = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindApplicationConnectedAccountsFactoryInput>): CommonResponseBody<{
  applicationConnectedAccounts: ApplicationConnectedAccountDTO[];
}> => {
  const graphqlOperation = findApplicationConnectedAccountsQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding application connected accounts should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding application connected accounts has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
