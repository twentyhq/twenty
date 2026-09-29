import { findManyApplicationRegistrationsQueryFactory } from 'test/integration/metadata/suites/application-registration/utils/find-many-application-registrations-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const findManyApplicationRegistrations = async ({
  gqlFields,
  expectToFail = false,
  token,
}: Partial<PerformMetadataQueryParams<undefined>>): CommonResponseBody<{
  findManyApplicationRegistrations: ApplicationRegistrationEntity[];
}> => {
  const graphqlOperation = findManyApplicationRegistrationsQueryFactory({
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding application registrations should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding application registrations has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
