import gql from 'graphql-tag';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type WorkspaceSettings = {
  displayName: string;
  aiChatDirectMessageAssistantMode: AiChatAssistantMode;
  aiChatInboxAssistantMode: AiChatAssistantMode;
};

const setInboxEnabled = (value: boolean) =>
  getAppProviderByClassName<FeatureFlagService>(
    'FeatureFlagService',
  ).upsertWorkspaceFeatureFlag({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    value,
  });

const readWorkspace = (token: string = APPLE_JANE_ADMIN_ACCESS_TOKEN) =>
  makeMetadataApiRequest(
    {
      query: gql`
        query WorkspaceAssistantModes {
          currentWorkspace {
            displayName
            aiChatDirectMessageAssistantMode
            aiChatInboxAssistantMode
          }
        }
      `,
    },
    token,
  );

const updateWorkspace = ({
  data,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
}: {
  data: UpdateWorkspaceInput;
  token?: string;
}) =>
  makeMetadataApiRequest(
    {
      query: gql`
        mutation UpdateWorkspaceAssistantModes($data: UpdateWorkspaceInput!) {
          updateWorkspace(data: $data) {
            aiChatDirectMessageAssistantMode
            aiChatInboxAssistantMode
          }
        }
      `,
      variables: { data },
    },
    token,
  );

const assignMemberRole = async (roleId: string) => {
  const { errors } = await updateWorkspaceMemberRole({
    input: {
      roleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
  });

  expect(errors).toBeUndefined();
};

const createSettingsRole = async ({
  label,
  permission,
}: {
  label: string;
  permission: PermissionFlagType;
}) => {
  const { data, errors } = await createOneRole({
    input: {
      label,
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: true,
    },
  });

  expect(errors).toBeUndefined();

  const roleId = data.createOneRole.id;
  const permissionResponse = await upsertPermissionFlags({
    input: { roleId, permissionFlagKeys: [permission] },
  });

  expect(permissionResponse.errors).toBeUndefined();

  return roleId;
};

describe('workspace assistant mode permissions and persistence', () => {
  let originalWorkspace: WorkspaceSettings;
  let originalMemberRoleId: string;
  let aiSettingsRoleId: string;
  let workspaceSettingsRoleId: string;
  let wasInboxEnabled: boolean;

  beforeAll(async () => {
    wasInboxEnabled = await getAppProviderByClassName<FeatureFlagService>(
      'FeatureFlagService',
    ).isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      SEED_APPLE_WORKSPACE_ID,
    );

    const response = await readWorkspace();

    expect(response.body.errors).toBeUndefined();
    originalWorkspace = response.body.data.currentWorkspace;
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;
    aiSettingsRoleId = await createSettingsRole({
      label: 'Assistant mode editor',
      permission: PermissionFlagType.AI_SETTINGS,
    });
    workspaceSettingsRoleId = await createSettingsRole({
      label: 'Workspace editor without assistant modes',
      permission: PermissionFlagType.WORKSPACE,
    });
  });

  beforeEach(async () => {
    await setInboxEnabled(true);
    await assignMemberRole(aiSettingsRoleId);

    const response = await updateWorkspace({
      data: {
        aiChatDirectMessageAssistantMode: AiChatAssistantMode.MENTION_ONLY,
        aiChatInboxAssistantMode: AiChatAssistantMode.AUTOMATIC,
      },
    });

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    try {
      await setInboxEnabled(true);
      await assignMemberRole(originalMemberRoleId);

      const response = await updateWorkspace({ data: originalWorkspace });

      expect(response.body.errors).toBeUndefined();

      for (const roleId of [aiSettingsRoleId, workspaceSettingsRoleId]) {
        const { errors } = await deleteOneRole({
          input: { idToDelete: roleId },
        });

        expect(errors).toBeUndefined();
      }
    } finally {
      await setInboxEnabled(wasInboxEnabled);
    }
  });

  it('persists both modes and preserves the other scope on a partial update', async () => {
    const response = await updateWorkspace({
      data: {
        aiChatDirectMessageAssistantMode: AiChatAssistantMode.AUTOMATIC,
        aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspace).toEqual({
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.AUTOMATIC,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });

    const partialResponse = await updateWorkspace({
      data: {
        aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(partialResponse.body.errors).toBeUndefined();

    const persisted = await readWorkspace(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(persisted.body.errors).toBeUndefined();
    expect(persisted.body.data.currentWorkspace).toEqual({
      displayName: originalWorkspace.displayName,
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
      aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
    });
  });

  it('allows workspace members to read modes but requires AI_SETTINGS to update them', async () => {
    await assignMemberRole(workspaceSettingsRoleId);

    const before = await readWorkspace(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(before.body.errors).toBeUndefined();
    expect(before.body.data.currentWorkspace).toEqual({
      displayName: originalWorkspace.displayName,
      aiChatDirectMessageAssistantMode: AiChatAssistantMode.MENTION_ONLY,
      aiChatInboxAssistantMode: AiChatAssistantMode.AUTOMATIC,
    });

    const response = await updateWorkspace({
      data: {
        aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
        aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0]).toMatchObject({
      message: PermissionsExceptionMessage.PERMISSION_DENIED,
      extensions: { code: ErrorCode.FORBIDDEN },
    });

    const after = await readWorkspace();

    expect(after.body.data.currentWorkspace).toEqual(
      before.body.data.currentWorkspace,
    );
  });

  it('rejects the whole update when an AI editor also changes a workspace-only field', async () => {
    const before = await readWorkspace();
    const response = await updateWorkspace({
      data: {
        aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
        displayName: 'Rejected assistant settings edit',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0]).toMatchObject({
      message: PermissionsExceptionMessage.PERMISSION_DENIED,
      extensions: { code: ErrorCode.FORBIDDEN },
    });

    const after = await readWorkspace();

    expect(after.body.data.currentWorkspace).toEqual(
      before.body.data.currentWorkspace,
    );
  });

  it('rejects mode changes with Inbox disabled while allowing unrelated workspace edits', async () => {
    await setInboxEnabled(false);

    const before = await readWorkspace();
    const response = await updateWorkspace({
      data: {
        aiChatDirectMessageAssistantMode: AiChatAssistantMode.NEVER,
        aiChatInboxAssistantMode: AiChatAssistantMode.NEVER,
        displayName: 'Rejected disabled inbox edit',
      },
    });

    expect(response.body.data).toBeNull();
    expect(response.body.errors[0]).toMatchObject({
      message: PermissionsExceptionMessage.PERMISSION_DENIED,
      extensions: { code: ErrorCode.FORBIDDEN },
    });

    const after = await readWorkspace();

    expect(after.body.data.currentWorkspace).toEqual(
      before.body.data.currentWorkspace,
    );

    const unrelatedResponse = await updateWorkspace({
      data: { displayName: originalWorkspace.displayName },
    });

    expect(unrelatedResponse.body.errors).toBeUndefined();
  });
});
