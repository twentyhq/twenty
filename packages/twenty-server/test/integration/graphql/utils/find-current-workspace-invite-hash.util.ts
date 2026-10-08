import { findCurrentWorkspaceInviteHashQueryFactory } from 'test/integration/graphql/utils/find-current-workspace-invite-hash-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findCurrentWorkspaceInviteHash = async ({
  expectToFail = false,
  token,
}: {
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  currentWorkspace: { id: string; inviteHash: string | null };
}> => {
  const response = await makeMetadataApiRequest(
    findCurrentWorkspaceInviteHashQueryFactory(),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'currentWorkspace should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'currentWorkspace has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
