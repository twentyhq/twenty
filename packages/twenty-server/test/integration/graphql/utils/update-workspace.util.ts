import { updateWorkspaceOperationFactory } from 'test/integration/graphql/utils/update-workspace-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';

type UpdateWorkspaceUtilArgs = {
  data: UpdateWorkspaceInput;
  expectToFail?: boolean;
  token?: string;
};

export const updateWorkspace = async ({
  data,
  expectToFail = false,
  token,
}: UpdateWorkspaceUtilArgs): CommonResponseBody<{
  updateWorkspace: { id: string };
}> => {
  const response = await makeMetadataAPIRequest(
    updateWorkspaceOperationFactory({ data }),
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'updateWorkspace should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'updateWorkspace has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
