import bytes from 'bytes';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  completeWorkspaceLogoUploadMutation,
  createCorePictureUpload,
  uploadWorkspaceMemberProfilePictureWithDirectUpload,
} from 'test/integration/graphql/utils/upload-core-picture-with-direct-upload.util';
import {
  completeFileUploadMutation,
  createFileUploadMutation,
  putFileToUploadTarget,
} from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import { settings } from 'src/engine/constants/settings';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF',
);

const completeWorkspaceLogoUpload = async (fileId: string) => {
  const response = await makeMetadataApiRequest({
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
    const uploadTarget = await createCorePictureUpload({
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
    const uploadTarget = await createCorePictureUpload({
      filename: 'logo.pdf',
      size: MINIMAL_PDF.length,
    });

    reservedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadTarget({
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

  it('should refuse to bind a file reserved outside the core picture folder', async () => {
    const createResponse = await makeMetadataApiRequest({
      query: createFileUploadMutation,
      variables: {
        filename: 'logo.png',
        size: ONE_BY_ONE_TRANSPARENT_PNG.length,
        fileFolder: 'Workflow',
      },
    });

    expect(createResponse.body.errors).toBeUndefined();

    const uploadTarget = createResponse.body.data.createFileUpload;

    reservedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadTarget({
      uploadTarget,
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });

    expect(putResponse.status).toBe(204);

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

  it('should refuse the generic completion for a core picture', async () => {
    const uploadTarget = await createCorePictureUpload({
      filename: 'logo.png',
      size: ONE_BY_ONE_TRANSPARENT_PNG.length,
    });

    reservedFileIds.push(uploadTarget.fileId);

    const putResponse = await putFileToUploadTarget({
      uploadTarget,
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });

    expect(putResponse.status).toBe(204);

    const completeResponse = await makeMetadataApiRequest({
      query: completeFileUploadMutation,
      variables: { fileId: uploadTarget.fileId },
    });

    expect(completeResponse.body.data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({
      errors: completeResponse.body.errors,
      normalizeMessage: (message) =>
        message.replace(uploadTarget.fileId, '<fileId>'),
    });
    expect(await findFileStatus(uploadTarget.fileId)).toBe(FILE_STATUS.PENDING);
  }, 30000);

  it('should refuse to bind a completed profile picture as the workspace logo', async () => {
    const logoFileIdBefore = await findWorkspaceLogoFileId();
    const profilePicture =
      await uploadWorkspaceMemberProfilePictureWithDirectUpload({
        filename: 'avatar.png',
        content: ONE_BY_ONE_TRANSPARENT_PNG,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

    reservedFileIds.push(profilePicture.id);

    const { data, errors } = await completeWorkspaceLogoUpload(
      profilePicture.id,
    );

    expect(data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) =>
        message.replace(profilePicture.id, '<fileId>'),
    });
    expect(await findWorkspaceLogoFileId()).toBe(logoFileIdBefore);
    expect(await findFileStatus(profilePicture.id)).toBe(FILE_STATUS.UPLOADED);
  }, 30000);

  it('should refuse to reserve a picture larger than the core picture size limit', async () => {
    const createResponse = await makeMetadataApiRequest({
      query: createFileUploadMutation,
      variables: {
        filename: 'logo.png',
        size: (bytes(settings.storage.maxCorePictureFileSize) ?? 0) + 1,
        fileFolder: 'CorePicture',
      },
    });

    expect(createResponse.body.data).toBeNull();
    expectOneNotInternalServerErrorSnapshot({
      errors: createResponse.body.errors,
    });
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
});
