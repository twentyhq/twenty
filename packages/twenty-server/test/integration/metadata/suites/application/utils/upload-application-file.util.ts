import { uploadApplicationFileQueryFactory } from 'test/integration/metadata/suites/application/utils/upload-application-file-query-factory.util';
import { makeMetadataAPIRequestWithFileUpload } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-file-upload.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type UploadedFile = {
  id: string;
  path: string;
};

export const uploadApplicationFile = async ({
  applicationUniversalIdentifier,
  fileFolder,
  filePath,
  fileBuffer,
  filename,
  contentType = 'application/json',
  expectToFail = false,
  token,
}: {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
  fileBuffer: Buffer;
  filename: string;
  contentType?: string;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  uploadApplicationFile: UploadedFile;
}> => {
  const graphqlOperation = uploadApplicationFileQueryFactory({
    applicationUniversalIdentifier,
    fileFolder,
    filePath,
  });

  const response = await makeMetadataAPIRequestWithFileUpload(
    graphqlOperation,
    {
      field: 'file',
      buffer: fileBuffer,
      filename,
      contentType,
    },
    token,
  );

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Upload application file should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Upload application file has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
