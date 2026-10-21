import {
  type FindOneApplicationRegistrationFactoryInput,
  findOneApplicationRegistrationQueryFactory,
} from 'test/integration/metadata/suites/application-registration/utils/find-one-application-registration-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export const findOneApplicationRegistration = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindOneApplicationRegistrationFactoryInput>): CommonResponseBody<{
  findOneApplicationRegistration: ApplicationRegistrationEntity;
}> => {
  const graphqlOperation = findOneApplicationRegistrationQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Finding application registration should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Finding application registration has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
