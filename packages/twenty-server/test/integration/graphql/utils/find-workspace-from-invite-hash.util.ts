import { findWorkspaceFromInviteHashQueryFactory } from 'test/integration/graphql/utils/find-workspace-from-invite-hash-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type WorkspaceFromInviteHashDTO } from 'src/engine/core-modules/auth/dto/workspace-from-invite-hash.dto';

export const findWorkspaceFromInviteHash = async ({
  inviteHash,
  gqlFields,
  expectToFail,
}: {
  inviteHash: string;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  findWorkspaceFromInviteHash: WorkspaceFromInviteHashDTO;
}> => {
  const response = await makeMetadataApiRequest(
    findWorkspaceFromInviteHashQueryFactory({ inviteHash, gqlFields }),
    undefined,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Workspace lookup by invite hash should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Workspace lookup by invite hash has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
