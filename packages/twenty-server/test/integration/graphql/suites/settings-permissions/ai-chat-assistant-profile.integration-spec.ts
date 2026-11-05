import { randomUUID } from 'crypto';
import { currentUserAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/current-user-assistant-profile-query-factory.util';
import { updateWorkspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/update-workspace-assistant-profile-query-factory.util';
import { workspaceAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/workspace-assistant-profile-query-factory.util';
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

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { CORE_ENTITY_CACHE_KEYS } from 'src/engine/core-entity-cache/types/core-entity-cache-key.type';
import { type CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { fromWorkspaceEntityToFlat } from 'src/engine/core-modules/workspace/utils/from-workspace-entity-to-flat.util';
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
  data: Record<string, unknown>;
  token?: string;
  errorCode: ErrorCode;
}) => {
  const before = await readWorkspace();
  const response = await makeMetadataApiRequest(
    updateWorkspaceAssistantProfileQueryFactory({ data }),
    token,
  );

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

  it('rehydrates an older cached workspace profile through the current user query', async () => {
    const workspaceRepository =
      getCoreRepository<WorkspaceEntity>(WorkspaceEntity);
    const workspace = await workspaceRepository.findOneByOrFail({
      id: SEED_APPLE_WORKSPACE_ID,
    });
    const { aiChatAssistantProfile: storedProfile, ...legacyProjection } =
      fromWorkspaceEntityToFlat(workspace);
    const coreEntityCacheService =
      getAppProviderByClassName<CoreEntityCacheService>(
        'CoreEntityCacheService',
      );
    const cacheStorage = global.app.get<CacheStorageService>(
      CacheStorageNamespace.EngineCoreEntity,
    );
    const cacheKey = `${CORE_ENTITY_CACHE_KEYS.workspaceEntity}:${workspace.id}`;
    const cacheDataKey = `${cacheKey}:data`;

    expect(storedProfile).toEqual(CUSTOM_ASSISTANT_PROFILE);

    await coreEntityCacheService.invalidate('workspaceEntity', workspace.id);

    try {
      await cacheStorage.mset<
        string | Omit<FlatWorkspace, 'aiChatAssistantProfile'>
      >([
        { key: `${cacheKey}:hash`, value: randomUUID() },
        { key: cacheDataKey, value: legacyProjection },
      ]);

      const cachedWorkspace = await coreEntityCacheService.get(
        'workspaceEntity',
        workspace.id,
      );

      expect(cachedWorkspace?.aiChatAssistantProfile).toBeUndefined();

      const response = await makeMetadataApiRequest(
        currentUserAssistantProfileQueryFactory(),
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.currentUser.currentWorkspace.aiChatAssistantProfile,
      ).toEqual(storedProfile);

      const refreshedCachedWorkspace =
        await cacheStorage.get<FlatWorkspace>(cacheDataKey);

      expect(refreshedCachedWorkspace?.aiChatAssistantProfile).toEqual(
        storedProfile,
      );
    } finally {
      await coreEntityCacheService.invalidate('workspaceEntity', workspace.id);
    }
  });

  it('resets every profile field to Ada defaults and reads them back', async () => {
    const unchanged = await updateWorkspace({
      data: { shouldResetAiChatAssistantProfile: false },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(unchanged.body.errors).toBeUndefined();
    expect(unchanged.body.data.updateWorkspace.aiChatAssistantProfile).toEqual(
      CUSTOM_ASSISTANT_PROFILE,
    );

    const response = await updateWorkspace({
      data: { shouldResetAiChatAssistantProfile: true },
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
        },
        errorCode: ErrorCode.BAD_USER_INPUT,
      });
    }

    await expectRejectedUpdate({
      data: {
        shouldResetAiChatAssistantProfile: null,
      },
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
      { shouldResetAiChatAssistantProfile: true },
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
      { shouldResetAiChatAssistantProfile: true },
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
        shouldResetAiChatAssistantProfile: true,
        aiChatAssistantProfile: { displayName: 'Ambiguous' },
      },
      errorCode: ErrorCode.BAD_USER_INPUT,
    });
  });

  it('updates only the authenticated workspace without changing another workspace profile', async () => {
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
