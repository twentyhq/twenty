import {
  type UpdateApplicationRegistrationFactoryInput,
  updateApplicationRegistrationQueryFactory,
} from 'test/integration/metadata/suites/application/utils/update-application-registration-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

type UpdateApplicationRegistrationResult = Pick<
  ApplicationRegistrationEntity,
  'id' | 'name' | 'isListed' | 'isPreInstalled' | 'isVetted'
>;

export const updateApplicationRegistration = async ({
  id,
  update,
  expectToFail = false,
  token,
}: UpdateApplicationRegistrationFactoryInput & {
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  updateApplicationRegistration: UpdateApplicationRegistrationResult;
}> => {
  const graphqlOperation = updateApplicationRegistrationQueryFactory({
    id,
    update,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Update application registration should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Update application registration has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
