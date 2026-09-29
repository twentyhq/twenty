import { makeAdminPanelApiRequestWithGuestRole } from 'test/integration/graphql/suites/admin-panel/utils/make-admin-panel-api-request-with-guest-role.util';
import {
  type UpdateAdminApplicationRegistrationFactoryInput,
  updateAdminApplicationRegistrationQueryFactory,
} from 'test/integration/metadata/suites/application/utils/update-admin-application-registration-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

type UpdateAdminApplicationRegistrationResult = Pick<
  ApplicationRegistrationEntity,
  'id' | 'name' | 'isListed' | 'isPreInstalled' | 'isVetted'
>;

export const updateAdminApplicationRegistration = async ({
  id,
  update,
  expectToFail = false,
  withGuestRole = false,
}: UpdateAdminApplicationRegistrationFactoryInput & {
  expectToFail?: boolean;
  withGuestRole?: boolean;
}): CommonResponseBody<{
  updateAdminApplicationRegistration: UpdateAdminApplicationRegistrationResult;
}> => {
  const graphqlOperation = updateAdminApplicationRegistrationQueryFactory({
    id,
    update,
  });

  const response = withGuestRole
    ? await makeAdminPanelApiRequestWithGuestRole(graphqlOperation)
    : await makeAdminPanelApiRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Update admin application registration should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Update admin application registration has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
