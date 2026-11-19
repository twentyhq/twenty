import { signUpInWorkspaceOperationFactory } from 'test/integration/graphql/utils/sign-up-in-workspace-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type SignUpDTO } from 'src/engine/core-modules/auth/dto/sign-up.dto';

type SignUpInWorkspaceUtilArgs = {
  input: Parameters<typeof signUpInWorkspaceOperationFactory>[0];
  expectToFail?: boolean;
};

export const signUpInWorkspace = async ({
  input,
  expectToFail,
}: SignUpInWorkspaceUtilArgs): CommonResponseBody<{
  signUpInWorkspace: SignUpDTO;
}> => {
  const response = await makeMetadataApiRequest(
    signUpInWorkspaceOperationFactory(input),
    null,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Sign up in workspace should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Sign up in workspace has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
