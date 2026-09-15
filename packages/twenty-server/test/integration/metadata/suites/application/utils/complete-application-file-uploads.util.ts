import { completeApplicationFileUploadsQueryFactory } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export type CompleteApplicationFileUploadsResult = {
  files: { id: string; path: string; size: number }[];
  errors: { fileId: string; message: string }[];
};

export const completeApplicationFileUploads = async ({
  applicationUniversalIdentifier,
  fileIds,
  expectToFail = false,
  token,
}: {
  applicationUniversalIdentifier: string;
  fileIds: string[];
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  completeApplicationFileUploads: CompleteApplicationFileUploadsResult;
}> => {
  const graphqlOperation = completeApplicationFileUploadsQueryFactory({
    applicationUniversalIdentifier,
    fileIds,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage:
        'Complete application file uploads should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage:
        'Complete application file uploads has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
