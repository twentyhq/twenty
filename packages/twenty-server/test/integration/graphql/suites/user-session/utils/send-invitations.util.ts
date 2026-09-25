import { sendInvitationsOperationFactory } from 'test/integration/graphql/utils/send-invitations-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type SendInvitationsDTO } from 'src/engine/core-modules/workspace-invitation/dtos/send-invitations.dto';

export const sendInvitations = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<{
  emails: string[];
  roleId?: string;
}>): CommonResponseBody<{ sendInvitations: SendInvitationsDTO }> => {
  const response = await makeMetadataAPIRequest(
    sendInvitationsOperationFactory(input),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Sending invitations should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Sending invitations has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
