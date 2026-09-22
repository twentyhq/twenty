import gql from 'graphql-tag';
import {
  completeWorkspaceLogoUploadMutation,
  uploadWorkspaceLogoWithDirectUpload,
  uploadWorkspaceMemberProfilePictureWithDirectUpload,
} from 'test/integration/graphql/utils/upload-core-picture-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CORE_PICTURE_PATH_PATTERN = /^core-picture\/[0-9a-f-]{36}\.png$/;

const findFileRow = async (
  fileId: string,
): Promise<{ status: string; mimeType: string } | undefined> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "status", "mimeType" FROM core."file" WHERE id = $1`,
    [fileId],
  );

  return row;
};

const findWorkspaceLogoFileId = async (): Promise<string | null> => {
  const [workspace] = await globalThis.testDataSource.query(
    `SELECT "logoFileId" FROM core."workspace" WHERE id = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return workspace.logoFileId;
};

describe('Core picture direct upload should succeed', () => {
  const uploadedFileIds: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `UPDATE core."workspace" SET "logoFileId" = NULL WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE id = ANY($1)`,
      [uploadedFileIds],
    );

    jest.useFakeTimers();
  });

  it('should upload a workspace logo and bind it to the workspace', async () => {
    const uploadedLogo = await uploadWorkspaceLogoWithDirectUpload({
      filename: 'logo.png',
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });

    uploadedFileIds.push(uploadedLogo.id);

    expect(uploadedLogo).toEqual({
      id: expect.any(String),
      path: expect.stringMatching(CORE_PICTURE_PATH_PATTERN),
      size: ONE_BY_ONE_TRANSPARENT_PNG.length,
      createdAt: expect.any(String),
      url: expect.stringContaining(uploadedLogo.id),
    });

    expect(await findFileRow(uploadedLogo.id)).toEqual({
      status: FILE_STATUS.UPLOADED,
      mimeType: 'image/png',
    });
    expect(await findWorkspaceLogoFileId()).toBe(uploadedLogo.id);

    const workspaceResponse = await makeMetadataAPIRequest({
      query: gql`
        query GetWorkspaceLogo {
          currentWorkspace {
            logo
          }
        }
      `,
    });

    expect(workspaceResponse.body.errors).toBeUndefined();
    expect(workspaceResponse.body.data.currentWorkspace.logo).toContain(
      uploadedLogo.id,
    );
  }, 30000);

  it('should delete the previous logo when a new one replaces it', async () => {
    const previousLogo = await uploadWorkspaceLogoWithDirectUpload({
      filename: 'previous-logo.png',
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });
    const newLogo = await uploadWorkspaceLogoWithDirectUpload({
      filename: 'new-logo.png',
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });

    uploadedFileIds.push(previousLogo.id, newLogo.id);

    expect(await findWorkspaceLogoFileId()).toBe(newLogo.id);
    expect(await findFileRow(previousLogo.id)).toBeUndefined();
    expect(await findFileRow(newLogo.id)).toEqual({
      status: FILE_STATUS.UPLOADED,
      mimeType: 'image/png',
    });
  }, 30000);

  it('should return the bound logo again when its completion is retried', async () => {
    const uploadedLogo = await uploadWorkspaceLogoWithDirectUpload({
      filename: 'logo.png',
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });

    uploadedFileIds.push(uploadedLogo.id);

    const retriedResponse = await makeMetadataAPIRequest({
      query: completeWorkspaceLogoUploadMutation,
      variables: { fileId: uploadedLogo.id },
    });

    expect(retriedResponse.body.errors).toBeUndefined();
    expect(retriedResponse.body.data.completeWorkspaceLogoUpload).toEqual({
      ...uploadedLogo,
      url: expect.stringContaining(uploadedLogo.id),
    });
    expect(await findWorkspaceLogoFileId()).toBe(uploadedLogo.id);
  }, 30000);

  it('should upload a workspace member profile picture without touching the workspace logo', async () => {
    const logoFileIdBefore = await findWorkspaceLogoFileId();

    const uploadedPicture =
      await uploadWorkspaceMemberProfilePictureWithDirectUpload({
        filename: 'avatar.png',
        content: ONE_BY_ONE_TRANSPARENT_PNG,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

    uploadedFileIds.push(uploadedPicture.id);

    expect(uploadedPicture).toEqual({
      id: expect.any(String),
      path: expect.stringMatching(CORE_PICTURE_PATH_PATTERN),
      size: ONE_BY_ONE_TRANSPARENT_PNG.length,
      createdAt: expect.any(String),
      url: expect.stringContaining(uploadedPicture.id),
    });
    expect(await findFileRow(uploadedPicture.id)).toEqual({
      status: FILE_STATUS.UPLOADED,
      mimeType: 'image/png',
    });
    expect(await findWorkspaceLogoFileId()).toBe(logoFileIdBefore);
  }, 30000);
});
