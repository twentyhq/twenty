import { type ASTNode } from 'graphql';
import {
  completeWorkspaceLogoUploadMutation,
  completeWorkspaceMemberProfilePictureUploadMutation,
} from 'test/integration/graphql/utils/upload-core-picture-with-direct-upload.util';
import {
  completeFileUploadMutation,
  createFileUploadAndPutFile,
  createFileUploadMutation,
} from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const createRoleWithPermissionFlags = async (
  label: string,
  permissionFlagKeys: PermissionFlagType[],
): Promise<string> => {
  const { data } = await createOneRole({
    expectToFail: false,
    input: {
      label,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    },
  });

  const roleId = data.createOneRole.id;

  if (permissionFlagKeys.length > 0) {
    await upsertPermissionFlags({
      expectToFail: false,
      input: { roleId, permissionFlagKeys },
    });
  }

  return roleId;
};

const assignRoleToJony = async (roleId: string) => {
  await updateWorkspaceMemberRole({
    expectToFail: false,
    input: {
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      roleId,
    },
  });
};

const reserveAsJony = async (fileFolder: string) =>
  makeMetadataAPIRequest(
    {
      query: createFileUploadMutation,
      variables: {
        filename: 'picture.png',
        size: ONE_BY_ONE_TRANSPARENT_PNG.length,
        fileFolder,
      },
    },
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

const completeAsJony = async (query: ASTNode, fileId: string) =>
  makeMetadataAPIRequest(
    { query, variables: { fileId } },
    APPLE_JONY_MEMBER_ACCESS_TOKEN,
  );

const expectForbidden = (response: {
  body: { data: unknown; errors?: { extensions: { code: string } }[] };
}) => {
  expect(response.body.data).toBeNull();
  expect(response.body.errors?.[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

describe('Core picture direct upload permissions', () => {
  let memberRoleId: string;
  let workspaceSettingsRoleId: string;
  let profileInformationRoleId: string;
  let noUploadRoleId: string;
  const uploadedFileIds: string[] = [];

  beforeAll(async () => {
    jest.useRealTimers();

    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    workspaceSettingsRoleId = await createRoleWithPermissionFlags(
      'Core picture test workspace settings',
      [PermissionFlagType.WORKSPACE],
    );
    profileInformationRoleId = await createRoleWithPermissionFlags(
      'Core picture test profile information',
      [PermissionFlagType.PROFILE_INFORMATION],
    );
    noUploadRoleId = await createRoleWithPermissionFlags(
      'Core picture test no upload',
      [],
    );
  }, 60000);

  afterAll(async () => {
    await assignRoleToJony(memberRoleId);

    for (const roleId of [
      workspaceSettingsRoleId,
      profileInformationRoleId,
      noUploadRoleId,
    ]) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: roleId },
      });
    }

    await globalThis.testDataSource.query(
      `UPDATE core."workspace" SET "logoFileId" = NULL WHERE id = $1 AND "logoFileId" = ANY($2)`,
      [SEED_APPLE_WORKSPACE_ID, uploadedFileIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE id = ANY($1)`,
      [uploadedFileIds],
    );

    jest.useFakeTimers();
  }, 60000);

  describe('with the workspace settings permission and no upload permission', () => {
    beforeAll(async () => {
      await assignRoleToJony(workspaceSettingsRoleId);
    });

    it('should reserve, upload and bind a workspace logo', async () => {
      const { fileId } = await createFileUploadAndPutFile({
        filename: 'logo.png',
        content: ONE_BY_ONE_TRANSPARENT_PNG,
        fileFolder: 'CorePicture',
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      uploadedFileIds.push(fileId);

      const completeResponse = await completeAsJony(
        completeWorkspaceLogoUploadMutation,
        fileId,
      );

      expect(completeResponse.body.errors).toBeUndefined();
      expect(completeResponse.body.data.completeWorkspaceLogoUpload.id).toBe(
        fileId,
      );
    }, 30000);

    it('should refuse to reserve a file outside the core picture folder', async () => {
      expectForbidden(await reserveAsJony('Workflow'));
    }, 30000);
  });

  describe('with the profile information permission and no upload permission', () => {
    beforeAll(async () => {
      await assignRoleToJony(profileInformationRoleId);
    });

    it('should reserve, upload and complete a profile picture', async () => {
      const { fileId } = await createFileUploadAndPutFile({
        filename: 'avatar.png',
        content: ONE_BY_ONE_TRANSPARENT_PNG,
        fileFolder: 'CorePicture',
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });

      uploadedFileIds.push(fileId);

      expectForbidden(await completeAsJony(completeFileUploadMutation, fileId));

      const completeResponse = await completeAsJony(
        completeWorkspaceMemberProfilePictureUploadMutation,
        fileId,
      );

      expect(completeResponse.body.errors).toBeUndefined();
      expect(
        completeResponse.body.data.completeWorkspaceMemberProfilePictureUpload
          .id,
      ).toBe(fileId);
    }, 30000);
  });

  describe('without any upload, workspace or profile permission', () => {
    beforeAll(async () => {
      await assignRoleToJony(noUploadRoleId);
    });

    it('should refuse to reserve a core picture', async () => {
      expectForbidden(await reserveAsJony('CorePicture'));
    }, 30000);
  });
});
