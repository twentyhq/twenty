import {
  type ClaimApplicationRegistrationOwnershipFactoryInput,
  claimApplicationRegistrationOwnershipQueryFactory,
} from 'test/integration/metadata/suites/application-registration/utils/claim-application-registration-ownership-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const claimApplicationRegistrationOwnership = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<ClaimApplicationRegistrationOwnershipFactoryInput>): CommonResponseBody<{
  claimApplicationRegistrationOwnership: ApplicationRegistrationEntity;
}> => {
  const graphqlOperation = claimApplicationRegistrationOwnershipQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Claiming application registration ownership should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Claiming application registration ownership has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
