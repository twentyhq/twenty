import { completeApplicationFileUploadsQueryFactory } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads-query-factory.util';
import { type CompleteApplicationFileUploadsResult } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads.util';
import { createApplicationFileUploadsQueryFactory } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads-query-factory.util';
import { type CreateApplicationFileUploadsResult } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { isDefined } from 'twenty-shared/utils';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type UploadedFile = {
  id: string;
  path: string;
};

type UploadApplicationFileResult = {
  data: { uploadApplicationFile: UploadedFile } | undefined;
  errors: BaseGraphQLError[] | undefined;
};

const toGraphqlErrors = (messages: string[]): BaseGraphQLError[] =>
  messages.map((message) => ({ message }) as BaseGraphQLError);

const runDirectUpload = async ({
  applicationUniversalIdentifier,
  fileFolder,
  filePath,
  fileBuffer,
  token,
}: {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
  fileBuffer: Buffer;
  token?: string;
}): Promise<UploadApplicationFileResult> => {
  const createResponse = await makeMetadataAPIRequest(
    createApplicationFileUploadsQueryFactory({
      applicationUniversalIdentifier,
      files: [{ fileFolder, filePath, size: fileBuffer.length }],
    }),
    token,
  );

  if (isDefined(createResponse.body.errors)) {
    return { data: undefined, errors: createResponse.body.errors };
  }

  const { targets, errors: reservationErrors } = createResponse.body.data
    .createApplicationFileUploads as CreateApplicationFileUploadsResult;

  if (reservationErrors.length > 0 || targets.length === 0) {
    return {
      data: undefined,
      errors: toGraphqlErrors(reservationErrors.map(({ message }) => message)),
    };
  }

  const [uploadTarget] = targets;

  const putResponse = await putApplicationFileUploadTarget({
    uploadTarget,
    body: fileBuffer,
  });

  if (putResponse.status !== 204) {
    return {
      data: undefined,
      errors: toGraphqlErrors([
        `Upload to the file storage failed with status ${putResponse.status}`,
      ]),
    };
  }

  const completeResponse = await makeMetadataAPIRequest(
    completeApplicationFileUploadsQueryFactory({
      applicationUniversalIdentifier,
      fileIds: [uploadTarget.fileId],
    }),
    token,
  );

  if (isDefined(completeResponse.body.errors)) {
    return { data: undefined, errors: completeResponse.body.errors };
  }

  const { files, errors: completionErrors } = completeResponse.body.data
    .completeApplicationFileUploads as CompleteApplicationFileUploadsResult;

  if (completionErrors.length > 0 || files.length === 0) {
    return {
      data: undefined,
      errors: toGraphqlErrors(completionErrors.map(({ message }) => message)),
    };
  }

  const [{ id, path }] = files;

  return { data: { uploadApplicationFile: { id, path } }, errors: undefined };
};

// Uploads a single application file the way the CLI does: reserve an upload
// target, PUT the bytes to it, then confirm the upload.
export const uploadApplicationFile = async ({
  applicationUniversalIdentifier,
  fileFolder,
  filePath,
  fileBuffer,
  expectToFail = false,
  token,
}: {
  applicationUniversalIdentifier: string;
  fileFolder: string;
  filePath: string;
  fileBuffer: Buffer;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  uploadApplicationFile: UploadedFile;
}> => {
  const { data, errors } = await runDirectUpload({
    applicationUniversalIdentifier,
    fileFolder,
    filePath,
    fileBuffer,
    token,
  });

  if (expectToFail === true) {
    expect(errors).toBeDefined();
  }

  if (expectToFail === false) {
    if (isDefined(errors)) {
      expect(errors).toEqual(
        'Upload application file has failed but should not',
      );
    }
    expect(data).toBeDefined();
  }

  return {
    data: data as { uploadApplicationFile: UploadedFile },
    errors: errors as BaseGraphQLError[],
  };
};
