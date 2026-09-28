import { completeAppTarballUploadQueryFactory } from 'test/integration/metadata/suites/application/utils/complete-app-tarball-upload-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export type CompleteAppTarballUploadResult = {
  id: string;
  universalIdentifier: string;
  name: string;
};

export const completeAppTarballUpload = async ({
  fileId,
  expectToFail = false,
  token,
}: {
  fileId: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  completeAppTarballUpload: CompleteAppTarballUploadResult;
}> => {
  const graphqlOperation = completeAppTarballUploadQueryFactory({ fileId });

  const response = await makeMetadataApiRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Complete app tarball upload should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Complete app tarball upload has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
