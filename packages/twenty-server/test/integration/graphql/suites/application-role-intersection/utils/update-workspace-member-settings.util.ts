import { updateWorkspaceMemberSettingsQueryFactory } from 'test/integration/graphql/suites/application-role-intersection/utils/update-workspace-member-settings-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpdateWorkspaceMemberSettingsInput } from 'src/engine/core-modules/user/dtos/update-workspace-member-settings.input';

export const updateWorkspaceMemberSettings = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: UpdateWorkspaceMemberSettingsInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  updateWorkspaceMemberSettings: boolean;
}> => {
  const response = await makeMetadataApiRequest(
    updateWorkspaceMemberSettingsQueryFactory({ input }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'updateWorkspaceMemberSettings should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'updateWorkspaceMemberSettings has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
