import gql from 'graphql-tag';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateWorkspaceMemberRole } from 'test/integration/metadata/suites/role/utils/update-workspace-member-role.util';
import { upsertPermissionFlags } from 'test/integration/metadata/suites/role-permission-flag/utils/upsert-permission-flags.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  type AiChatAssistantProfile,
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
} from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type WorkspaceSettings = {
  id: string;
  displayName: string;
  aiChatAssistantProfile: AiChatAssistantProfile;
};

const CUSTOM_ASSISTANT_PROFILE: AiChatAssistantProfile = {
  displayName: 'Scout',
  avatarShape: 'cloud',
  avatarColor: 'green',
  avatarFace: 'wink',
  isAvatarAnimated: false,
};

const ASSISTANT_PROFILE_FRAGMENT = gql`
  fragment WorkspaceAssistantProfile on Workspace {
    id
    displayName
    aiChatAssistantProfile {
      displayName
      avatarShape
      avatarColor
      avatarFace
      isAvatarAnimated
    }
  }
`;

const readWorkspace = (token = APPLE_JANE_ADMIN_ACCESS_TOKEN) =>
  makeMetadataApiRequest(
    {
      query: gql`
        ${ASSISTANT_PROFILE_FRAGMENT}
        query WorkspaceAssistantProfileSettings {
          currentWorkspace {
            ...WorkspaceAssistantProfile
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
        ${ASSISTANT_PROFILE_FRAGMENT}
        mutation UpdateWorkspaceAssistantProfile($data: UpdateWorkspaceInput!) {
          updateWorkspace(data: $data) {
            ...WorkspaceAssistantProfile
          }
        }
      `,
      variables: { data },
    },
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

const expectRejectedUpdate = async ({
  data,
  token,
  errorCode,
}: {
  data: UpdateWorkspaceInput;
  token?: string;
  errorCode: ErrorCode;
}) => {
  const before = await readWorkspace();
  const response = await updateWorkspace({ data, token });

  expect(response.body.data?.updateWorkspace).toBeUndefined();
  expect(response.body.errors[0].extensions.code).toBe(errorCode);

  const after = await readWorkspace();

  expect(after.body.errors).toBeUndefined();
  expect(after.body.data.currentWorkspace).toEqual(
    before.body.data.currentWorkspace,
  );
};

describe('workspace assistant profile settings', () => {
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
      label: 'Assistant profile editor',
      permission: PermissionFlagType.AI_SETTINGS,
    });
    workspaceSettingsRoleId = await createSettingsRole({
      label: 'Workspace editor without assistant profile',
      permission: PermissionFlagType.WORKSPACE,
    });
  });

  beforeEach(async () => {
    await setInboxEnabled(true);
    await assignMemberRole(aiSettingsRoleId);

    const response = await updateWorkspace({
      data: { aiChatAssistantProfile: CUSTOM_ASSISTANT_PROFILE },
    });

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    try {
      await setInboxEnabled(true);
      await assignMemberRole(originalMemberRoleId);

      const response = await updateWorkspace({
        data: {
          displayName: originalWorkspace.displayName,
          aiChatAssistantProfile: originalWorkspace.aiChatAssistantProfile,
        },
      });

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

  it('resets every profile field to Ada defaults and reads them back', async () => {
    const unchanged = await updateWorkspace({
      data: { resetAiChatAssistantProfile: false },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(unchanged.body.errors).toBeUndefined();
    expect(unchanged.body.data.updateWorkspace.aiChatAssistantProfile).toEqual(
      CUSTOM_ASSISTANT_PROFILE,
    );

    const response = await updateWorkspace({
      data: { resetAiChatAssistantProfile: true },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspace.aiChatAssistantProfile).toEqual(
      DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    );

    const persisted = await readWorkspace(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(persisted.body.errors).toBeUndefined();
    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    );
  });

  it('trims names, accepts the maximum name length and preserves omitted fields', async () => {
    const response = await updateWorkspace({
      data: { aiChatAssistantProfile: { displayName: '  Nova  ' } },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspace.aiChatAssistantProfile).toEqual({
      ...CUSTOM_ASSISTANT_PROFILE,
      displayName: 'Nova',
    });

    const maximumName = 'N'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH);
    const maximumResponse = await updateWorkspace({
      data: { aiChatAssistantProfile: { displayName: maximumName } },
    });

    expect(maximumResponse.body.errors).toBeUndefined();

    const unrelatedResponse = await updateWorkspace({
      data: { displayName: originalWorkspace.displayName },
    });

    expect(unrelatedResponse.body.errors).toBeUndefined();

    const persisted = await readWorkspace();

    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      {
        ...CUSTOM_ASSISTANT_PROFILE,
        displayName: maximumName,
      },
    );
  });

  it('rejects invalid names, options, unsupported fields and explicit null without committing a mixed update', async () => {
    const invalidProfiles = [
      null,
      { displayName: '   ' },
      {
        displayName: 'N'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH + 1),
      },
      { displayName: null },
      { avatarShape: 'triangle' },
      { avatarColor: 'black' },
      { avatarFace: 'angry' },
      { isAvatarAnimated: 'true' },
      { avatarColor: null },
      { unsupported: 'value' },
    ];

    for (const aiChatAssistantProfile of invalidProfiles) {
      await expectRejectedUpdate({
        data: {
          displayName: 'Rejected invalid assistant profile',
          aiChatAssistantProfile,
        } as unknown as UpdateWorkspaceInput,
        errorCode: ErrorCode.BAD_USER_INPUT,
      });
    }

    await expectRejectedUpdate({
      data: {
        resetAiChatAssistantProfile: null,
      } as unknown as UpdateWorkspaceInput,
      errorCode: ErrorCode.BAD_USER_INPUT,
    });
  });

  it('preserves independent profile edits submitted concurrently', async () => {
    const responses = await Promise.all([
      updateWorkspace({
        data: { aiChatAssistantProfile: { displayName: 'Sage' } },
      }),
      updateWorkspace({
        data: {
          aiChatAssistantProfile: {
            avatarShape: 'gem',
            avatarColor: 'purple',
            avatarFace: 'love',
            isAvatarAnimated: true,
          },
        },
      }),
    ]);

    for (const response of responses) {
      expect(response.body.errors).toBeUndefined();
    }

    const persisted = await readWorkspace();

    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      {
        displayName: 'Sage',
        avatarShape: 'gem',
        avatarColor: 'purple',
        avatarFace: 'love',
        isAvatarAnimated: true,
      },
    );
  });

  it('allows profile reads but requires AI_SETTINGS for updates and reset', async () => {
    await assignMemberRole(workspaceSettingsRoleId);

    const response = await readWorkspace(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      CUSTOM_ASSISTANT_PROFILE,
    );

    for (const data of [
      { aiChatAssistantProfile: { displayName: 'Denied' } },
      { resetAiChatAssistantProfile: true },
    ]) {
      await expectRejectedUpdate({
        data,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        errorCode: ErrorCode.FORBIDDEN,
      });
    }
  });

  it('rejects an AI editor mixed update to a workspace-only field atomically', async () => {
    await expectRejectedUpdate({
      data: {
        displayName: 'Rejected workspace edit',
        aiChatAssistantProfile: { displayName: 'Rejected assistant edit' },
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      errorCode: ErrorCode.FORBIDDEN,
    });
  });

  it('rejects profile updates and reset while Inbox is disabled', async () => {
    await setInboxEnabled(false);

    for (const data of [
      { aiChatAssistantProfile: { displayName: 'Denied' } },
      { resetAiChatAssistantProfile: true },
    ]) {
      await expectRejectedUpdate({
        data: { ...data, displayName: 'Rejected disabled inbox update' },
        errorCode: ErrorCode.FORBIDDEN,
      });
    }

    const unrelatedResponse = await updateWorkspace({
      data: { displayName: originalWorkspace.displayName },
    });

    expect(unrelatedResponse.body.errors).toBeUndefined();
  });

  it('rejects combining a reset with a profile patch', async () => {
    await expectRejectedUpdate({
      data: {
        resetAiChatAssistantProfile: true,
        aiChatAssistantProfile: { displayName: 'Ambiguous' },
      },
      errorCode: ErrorCode.BAD_USER_INPUT,
    });
  });

  it('updates only the authenticated workspace and rejects a foreign workspace identifier', async () => {
    const workspaceRepository =
      getCoreRepository<WorkspaceEntity>(WorkspaceEntity);
    const foreignWorkspace = await workspaceRepository.findOneByOrFail({
      id: SEED_YCOMBINATOR_WORKSPACE_ID,
    });

    const response = await updateWorkspace({
      data: { aiChatAssistantProfile: { displayName: 'Apple assistant' } },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspace.id).toBe(SEED_APPLE_WORKSPACE_ID);

    await expectRejectedUpdate({
      data: {
        id: SEED_YCOMBINATOR_WORKSPACE_ID,
        aiChatAssistantProfile: { displayName: 'Rejected foreign update' },
      } as unknown as UpdateWorkspaceInput,
      errorCode: ErrorCode.BAD_USER_INPUT,
    });

    const persistedForeignWorkspace = await workspaceRepository.findOneByOrFail(
      {
        id: SEED_YCOMBINATOR_WORKSPACE_ID,
      },
    );

    expect(persistedForeignWorkspace.aiChatAssistantProfile).toEqual(
      foreignWorkspace.aiChatAssistantProfile,
    );
  });
});
