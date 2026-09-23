import { completeApplicationFileUploadsQueryFactory } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads-query-factory.util';
import { type CompleteApplicationFileUploadsResult } from 'test/integration/metadata/suites/application/utils/complete-application-file-uploads.util';
import { createApplicationFileUploadsQueryFactory } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads-query-factory.util';
import { type CreateApplicationFileUploadsResult } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';
import { putApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/put-application-file-upload-target.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { isDefined } from 'twenty-shared/utils';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type UploadedFile = {
  id: string;
  path: string;
};

type UploadApplicationFileError = Pick<BaseGraphQLError, 'message'>;

type UploadApplicationFileResult = {
  data: { uploadApplicationFile: UploadedFile } | undefined;
  errors: UploadApplicationFileError[] | undefined;
};

const toGraphqlErrors = (messages: string[]): UploadApplicationFileError[] =>
  messages.map((message) => ({ message }));

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

  const {
    targets,
    errors: reservationErrors,
  }: CreateApplicationFileUploadsResult =
    createResponse.body.data.createApplicationFileUploads;

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

  const {
    files,
    errors: completionErrors,
  }: CompleteApplicationFileUploadsResult =
    completeResponse.body.data.completeApplicationFileUploads;

  if (completionErrors.length > 0 || files.length === 0) {
    return {
      data: undefined,
      errors: toGraphqlErrors(completionErrors.map(({ message }) => message)),
    };
  }

  const [{ id, path }] = files;

  return { data: { uploadApplicationFile: { id, path } }, errors: undefined };
};

export const uploadApplicationFileWithDirectUpload = async ({
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
}): Promise<UploadApplicationFileResult> => {
  const { data, errors } = await runDirectUpload({
    applicationUniversalIdentifier,
    fileFolder,
    filePath,
    fileBuffer,
    token,
  });

  if (expectToFail) {
    expect(errors).toBeDefined();
  } else {
    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
  }

  return { data, errors };
};
