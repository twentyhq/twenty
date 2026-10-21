import {
  type DeleteApplicationRegistrationFactoryInput,
  deleteApplicationRegistrationQueryFactory,
} from 'test/integration/metadata/suites/application-registration/utils/delete-application-registration-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteApplicationRegistration = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<DeleteApplicationRegistrationFactoryInput>): CommonResponseBody<{
  deleteApplicationRegistration: boolean;
}> => {
  const graphqlOperation = deleteApplicationRegistrationQueryFactory({
    input,
  });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Deleting application registration should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Deleting application registration has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
