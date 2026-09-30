import {
  type RotateApplicationRegistrationClientSecretFactoryInput,
  rotateApplicationRegistrationClientSecretQueryFactory,
} from 'test/integration/metadata/suites/application-registration/utils/rotate-application-registration-client-secret-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type RotateClientSecretDTO } from 'src/engine/core-modules/application/application-registration/dtos/rotate-client-secret.dto';

export const rotateApplicationRegistrationClientSecret = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<RotateApplicationRegistrationClientSecretFactoryInput>): CommonResponseBody<{
  rotateApplicationRegistrationClientSecret: RotateClientSecretDTO;
}> => {
  const graphqlOperation =
    rotateApplicationRegistrationClientSecretQueryFactory({ input });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Rotating application registration client secret should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Rotating application registration client secret has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
