import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  type CorePictureUploadTarget,
  completeWorkspaceLogoUploadMutation,
  createWorkspaceLogoUploadMutation,
  putCorePictureToUploadTarget,
} from 'test/integration/graphql/utils/upload-core-picture-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF',
);

const createWorkspaceLogoUpload = async ({
  filename,
  size,
}: {
  filename: string;
  size: number;
}): Promise<CorePictureUploadTarget> => {
  const response = await makeMetadataAPIRequest({
    query: createWorkspaceLogoUploadMutation,
    variables: { filename, size },
  });

  expect(response.body.errors).toBeUndefined();

  return response.body.data.createWorkspaceLogoUpload;
};

const completeWorkspaceLogoUpload = async (fileId: string) => {
  const response = await makeMetadataAPIRequest({
    query: completeWorkspaceLogoUploadMutation,
    variables: { fileId },
  });

  return response.body;
};

const findFileStatus = async (fileId: string): Promise<string> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "status" FROM core."file" WHERE id = $1`,
    [fileId],
  );

  return row.status;
};

const findWorkspaceLogoFileId = async (): Promise<string | null> => {
  const [workspace] = await globalThis.testDataSource.query(
    `SELECT "logoFileId" FROM core."workspace" WHERE id = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return workspace.logoFileId;
};

describe('Core picture direct upload should fail', () => {
  const reservedFileIds: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE id = ANY($1)`,
      [reservedFileIds],
    );

    jest.useFakeTimers();
  });

  it('should refuse to bind a logo whose bytes were never uploaded', async () => {
    const uploadTarget = await createWorkspaceLogoUpload({
      filename: 'logo.png',
      size: ONE_BY_ONE_TRANSPARENT_PNG.length,
    });

    reservedFileIds.push(uploadTarget.fileId);

    const { data, errors } = await completeWorkspaceLogoUpload(
      uploadTarget.fileId,
    );

    expect(data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) =>
        message.replace(uploadTarget.fileId, '<fileId>'),
    });
    expect(await findFileStatus(uploadTarget.fileId)).toBe(FILE_STATUS.PENDING);
    expect(await findWorkspaceLogoFileId()).not.toBe(uploadTarget.fileId);
  }, 30000);

  it('should refuse a logo whose content is not an image', async () => {
    const uploadTarget = await createWorkspaceLogoUpload({
      filename: 'logo.pdf',
      size: MINIMAL_PDF.length,
    });

    reservedFileIds.push(uploadTarget.fileId);

    const putResponse = await putCorePictureToUploadTarget({
      uploadTarget,
      content: MINIMAL_PDF,
    });

    expect(putResponse.status).toBe(204);

    const { data, errors } = await completeWorkspaceLogoUpload(
      uploadTarget.fileId,
    );

    expect(data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({ errors });
    expect(await findFileStatus(uploadTarget.fileId)).toBe(FILE_STATUS.PENDING);
    expect(await findWorkspaceLogoFileId()).not.toBe(uploadTarget.fileId);
  }, 30000);

  it('should refuse to complete an unknown file', async () => {
    const unknownFileId = uuidv4();

    const { data, errors } = await completeWorkspaceLogoUpload(unknownFileId);

    expect(data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) => message.replace(unknownFileId, '<fileId>'),
    });
  }, 30000);

  it('should refuse to reserve an empty logo', async () => {
    const response = await makeMetadataAPIRequest({
      query: createWorkspaceLogoUploadMutation,
      variables: { filename: 'logo.png', size: 0 },
    });

    expect(response.body.data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({ errors: response.body.errors });
  }, 30000);
});
