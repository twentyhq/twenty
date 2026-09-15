import { createApplicationFileUploadsQueryFactory } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export type ApplicationFileUploadTarget = {
  fileId: string;
  fileFolder: string;
  filePath: string;
  uploadUrl: string;
  contentType: string;
  expiresAt: string;
};

export type ApplicationFileUploadError = {
  fileFolder: string;
  filePath: string;
  message: string;
};

export type CreateApplicationFileUploadsResult = {
  targets: ApplicationFileUploadTarget[];
  errors: ApplicationFileUploadError[];
};

export const createApplicationFileUploads = async ({
  applicationUniversalIdentifier,
  files,
  expectToFail = false,
  token,
}: {
  applicationUniversalIdentifier: string;
  files: { fileFolder: string; filePath: string; size: number }[];
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  createApplicationFileUploads: CreateApplicationFileUploadsResult;
}> => {
  const graphqlOperation = createApplicationFileUploadsQueryFactory({
    applicationUniversalIdentifier,
    files,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Create application file uploads should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Create application file uploads has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
