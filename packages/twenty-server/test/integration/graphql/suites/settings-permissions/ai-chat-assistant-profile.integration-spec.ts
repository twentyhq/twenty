import { assistantSystemPromptPreviewQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/assistant-system-prompt-preview-query-factory.util';
import { resetWorkspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/reset-workspace-assistant-profile-query-factory.util';
import { updateWorkspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/update-workspace-assistant-profile-query-factory.util';
import { workspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/workspace-assistant-profile-query-factory.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type AiChatAssistantProfile,
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
} from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const CUSTOM_ASSISTANT_PROFILE: AiChatAssistantProfile = {
  displayName: 'Scout',
  avatarShape: 'cloud',
  avatarColor: 'green',
  avatarFace: 'wink',
  isAvatarAnimated: false,
};

const readWorkspace = (token = APPLE_JANE_ADMIN_ACCESS_TOKEN) =>
  makeMetadataApiRequest(workspaceAssistantProfileQueryFactory(), token);

const updateWorkspace = ({
  data,
  token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
}: {
  data: UpdateWorkspaceInput;
  token?: string;
}) =>
  makeMetadataApiRequest(
    updateWorkspaceAssistantProfileQueryFactory({ data: { ...data } }),
    token,
  );

const setInboxEnabled = (value: boolean) =>
  getAppProviderByClassName<FeatureFlagService>(
    'FeatureFlagService',
  ).upsertWorkspaceFeatureFlag({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    featureFlag: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
    value,
  });

const assignMemberRole = async (roleId: string) => {
  const { errors } = await updateWorkspaceMemberRole({
    input: {
      roleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    },
  });

  expect(errors).toBeUndefined();
};

describe('workspace assistant profile settings', () => {
  let originalProfile: AiChatAssistantProfile;
  let originalMemberRoleId: string;
  let aiSettingsRoleId: string;
  let isInboxInitiallyEnabled: boolean;

  beforeAll(async () => {
    isInboxInitiallyEnabled =
      await getAppProviderByClassName<FeatureFlagService>(
        'FeatureFlagService',
      ).isFeatureEnabled(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        SEED_APPLE_WORKSPACE_ID,
      );

    const response = await readWorkspace();

    expect(response.body.errors).toBeUndefined();
    originalProfile =
      response.body.data.currentWorkspace.aiChatAssistantProfile;
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const { data, errors } = await createOneRole({
      input: { label: 'Assistant profile editor' },
    });

    expect(errors).toBeUndefined();
    aiSettingsRoleId = data.createOneRole.id;

    const permissionResponse = await upsertPermissionFlags({
      input: {
        roleId: aiSettingsRoleId,
        permissionFlagKeys: [PermissionFlagType.AI_SETTINGS],
      },
    });

    expect(permissionResponse.errors).toBeUndefined();
    await assignMemberRole(aiSettingsRoleId);
    await setInboxEnabled(true);
  });

  beforeEach(async () => {
    const response = await updateWorkspace({
      data: { aiChatAssistantProfile: CUSTOM_ASSISTANT_PROFILE },
    });

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    try {
      await assignMemberRole(originalMemberRoleId);

      const response = await updateWorkspace({
        data: {
          aiChatAssistantProfile: originalProfile,
        },
      });

      expect(response.body.errors).toBeUndefined();

      const { errors } = await deleteOneRole({
        input: { idToDelete: aiSettingsRoleId },
      });

      expect(errors).toBeUndefined();
    } finally {
      await setInboxEnabled(isInboxInitiallyEnabled);
    }
  });

  it('previews the configured name only while Inbox is enabled', async () => {
    const expectPreviewName = async (displayName: string) => {
      const response = await makeMetadataApiRequest(
        assistantSystemPromptPreviewQueryFactory(),
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.getAiSystemPromptPreview.sections,
      ).toContainEqual({
        title: 'Assistant Identity',
        content: expect.stringContaining(JSON.stringify(displayName)),
      });
    };

    await expectPreviewName(CUSTOM_ASSISTANT_PROFILE.displayName);

    try {
      await setInboxEnabled(false);
      await expectPreviewName(DEFAULT_AI_CHAT_ASSISTANT_PROFILE.displayName);
    } finally {
      await setInboxEnabled(true);
    }
  });

  it('resets every profile field to Ada defaults and reads them back', async () => {
    const response = await makeMetadataApiRequest(
      resetWorkspaceAssistantProfileQueryFactory(),
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.resetAiChatAssistantProfile).toEqual(
      DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    );

    const persisted = await readWorkspace(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(persisted.body.errors).toBeUndefined();
    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    );
  });

  it('updates profile fields while preserving omitted values', async () => {
    const response = await updateWorkspace({
      data: {
        aiChatAssistantProfile: {
          displayName: '  Sage  ',
          avatarColor: 'purple',
        },
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();

    const persisted = await readWorkspace();

    expect(persisted.body.errors).toBeUndefined();
    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      {
        ...CUSTOM_ASSISTANT_PROFILE,
        displayName: 'Sage',
        avatarColor: 'purple',
      },
    );
  });

  it('rejects unauthorized profile edits and reset without changing the profile', async () => {
    for (const operation of [
      updateWorkspaceAssistantProfileQueryFactory({
        data: { aiChatAssistantProfile: { displayName: 'Denied' } },
      }),
      resetWorkspaceAssistantProfileQueryFactory(),
    ]) {
      for (const token of [
        APPLE_PHIL_GUEST_ACCESS_TOKEN,
        API_KEY_ACCESS_TOKEN,
      ]) {
        const response = await makeMetadataApiRequest(operation, token);

        expect(response.body.data).toBeNull();
        expect(response.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );
      }
    }

    const persisted = await readWorkspace();

    expect(persisted.body.errors).toBeUndefined();
    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      CUSTOM_ASSISTANT_PROFILE,
    );
  });
});
