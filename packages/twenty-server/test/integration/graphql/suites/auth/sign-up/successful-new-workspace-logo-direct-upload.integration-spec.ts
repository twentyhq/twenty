import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { putCorePictureToUploadTarget } from 'test/integration/graphql/utils/upload-core-picture-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const createNewWorkspaceLogoUploadMutation = gql`
  mutation CreateNewWorkspaceLogoUpload(
    $workspaceId: String!
    $filename: String!
    $size: Float!
  ) {
    createNewWorkspaceLogoUpload(
      workspaceId: $workspaceId
      filename: $filename
      size: $size
    ) {
      fileId
      uploadUrl
      contentType
      expiresAt
    }
  }
`;

const completeNewWorkspaceLogoUploadMutation = gql`
  mutation CompleteNewWorkspaceLogoUpload(
    $workspaceId: String!
    $fileId: String!
  ) {
    completeNewWorkspaceLogoUpload(workspaceId: $workspaceId, fileId: $fileId) {
      id
      path
      size
      createdAt
      url
    }
  }
`;

describe('New workspace logo direct upload', () => {
  const email = `test-${randomUUID()}@example.com`;
  let userAccessToken: string;
  let newWorkspaceId: string;
  let uploadedLogoFileId: string | undefined;

  beforeAll(async () => {
    jest.useRealTimers();

    const { data: signUpData } = await signUp({
      input: { email, password: 'Test123!@#' },
      expectToFail: false,
    });

    userAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await globalThis.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [email],
    );

    const { data: signUpInNewWorkspaceData } = await signUpInNewWorkspace({
      accessToken: userAccessToken,
      expectToFail: false,
    });

    newWorkspaceId = signUpInNewWorkspaceData.signUpInNewWorkspace.workspace.id;
  }, 60000);

  // The workspace never gets activated, so the deleteUser mutation cannot
  // clean it up: it expects a provisioned workspace schema.
  afterAll(async () => {
    if (uploadedLogoFileId !== undefined) {
      await globalThis.testDataSource.query(
        `DELETE FROM core."file" WHERE id = $1`,
        [uploadedLogoFileId],
      );
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."workspace" WHERE id = $1`,
      [newWorkspaceId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."user" WHERE email = $1`,
      [email],
    );

    jest.useFakeTimers();
  }, 60000);

  it('should let the creator upload a logo for the workspace being created', async () => {
    const createResponse = await makeMetadataAPIRequest(
      {
        query: createNewWorkspaceLogoUploadMutation,
        variables: {
          workspaceId: newWorkspaceId,
          filename: 'logo.png',
          size: ONE_BY_ONE_TRANSPARENT_PNG.length,
        },
      },
      userAccessToken,
    );

    expect(createResponse.body.errors).toBeUndefined();

    const uploadTarget = createResponse.body.data.createNewWorkspaceLogoUpload;

    uploadedLogoFileId = uploadTarget.fileId;

    const putResponse = await putCorePictureToUploadTarget({
      uploadTarget,
      content: ONE_BY_ONE_TRANSPARENT_PNG,
    });

    expect(putResponse.status).toBe(204);

    const completeResponse = await makeMetadataAPIRequest(
      {
        query: completeNewWorkspaceLogoUploadMutation,
        variables: { workspaceId: newWorkspaceId, fileId: uploadTarget.fileId },
      },
      userAccessToken,
    );

    expect(completeResponse.body.errors).toBeUndefined();
    expect(completeResponse.body.data.completeNewWorkspaceLogoUpload).toEqual({
      id: uploadTarget.fileId,
      path: expect.stringMatching(/^core-picture\/[0-9a-f-]{36}\.png$/),
      size: ONE_BY_ONE_TRANSPARENT_PNG.length,
      createdAt: expect.any(String),
      url: expect.stringContaining(uploadTarget.fileId),
    });

    const [file] = await globalThis.testDataSource.query(
      `SELECT "status", "mimeType", "workspaceId" FROM core."file" WHERE id = $1`,
      [uploadTarget.fileId],
    );

    expect(file).toEqual({
      status: FILE_STATUS.UPLOADED,
      mimeType: 'image/png',
      workspaceId: newWorkspaceId,
    });

    const [workspace] = await globalThis.testDataSource.query(
      `SELECT "logoFileId" FROM core."workspace" WHERE id = $1`,
      [newWorkspaceId],
    );

    expect(workspace.logoFileId).toBe(uploadTarget.fileId);
  }, 30000);

  it('should refuse a user who is not a member of the workspace being created', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: createNewWorkspaceLogoUploadMutation,
        variables: {
          workspaceId: newWorkspaceId,
          filename: 'logo.png',
          size: ONE_BY_ONE_TRANSPARENT_PNG.length,
        },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toBe(
      'Cannot set a logo for this workspace',
    );
  }, 30000);

  it('should refuse a workspace that is not pending creation', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: createNewWorkspaceLogoUploadMutation,
        variables: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          filename: 'logo.png',
          size: ONE_BY_ONE_TRANSPARENT_PNG.length,
        },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    expect(response.body.errors[0].message).toBe(
      'Cannot set a logo for this workspace',
    );
  }, 30000);
});
