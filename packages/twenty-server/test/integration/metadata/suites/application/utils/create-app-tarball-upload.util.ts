import { createAppTarballUploadQueryFactory } from 'test/integration/metadata/suites/application/utils/create-app-tarball-upload-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export type AppTarballUploadTarget = {
  fileId: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

export const createAppTarballUpload = async ({
  filename = 'app.tar.gz',
  size,
  expectToFail = false,
  token,
}: {
  filename?: string;
  size: number;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  createFileUpload: AppTarballUploadTarget;
}> => {
  const graphqlOperation = createAppTarballUploadQueryFactory({
    filename,
    size,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Create app tarball upload should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Create app tarball upload has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
