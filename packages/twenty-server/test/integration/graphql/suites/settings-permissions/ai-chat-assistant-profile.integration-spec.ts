import { randomUUID } from 'crypto';
import { currentUserAssistantProfileQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/current-user-assistant-profile-query-factory.util';
import { invalidWorkspaceAssistantProfileUpdateQueryFactory } from 'test/integration/graphql/suites/settings-permissions/utils/invalid-workspace-assistant-profile-update-query-factory.util';
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
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
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

const expectRejectedOperation = async ({
  operation,
  token,
  errorCode,
}: {
  operation: Parameters<typeof makeMetadataApiRequest>[0];
  token?: string;
  errorCode: ErrorCode;
}) => {
  const before = await readWorkspace();
  const response = await makeMetadataApiRequest(operation, token);

  expect(response.body.data).toBeNull();
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

      const { errors } = await deleteOneRole({
        input: { idToDelete: aiSettingsRoleId },
      });

      expect(errors).toBeUndefined();
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

  it('rejects an invalid mixed update without committing either change', async () => {
    await expectRejectedOperation({
      operation: invalidWorkspaceAssistantProfileUpdateQueryFactory(),
      errorCode: ErrorCode.BAD_USER_INPUT,
    });
  });

  it('preserves concurrent partial edits in only the authenticated workspace', async () => {
    const workspaceRepository =
      getCoreRepository<WorkspaceEntity>(WorkspaceEntity);
    const foreignWorkspace = await workspaceRepository.findOneByOrFail({
      id: SEED_YCOMBINATOR_WORKSPACE_ID,
    });
    const responses = await Promise.all([
      updateWorkspace({
        data: { aiChatAssistantProfile: { displayName: '  Sage  ' } },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      }),
      updateWorkspace({
        data: { aiChatAssistantProfile: { avatarColor: 'purple' } },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      }),
    ]);

    for (const response of responses) {
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateWorkspace.id).toBe(
        SEED_APPLE_WORKSPACE_ID,
      );
    }

    const persisted = await readWorkspace();

    expect(persisted.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      {
        ...CUSTOM_ASSISTANT_PROFILE,
        displayName: 'Sage',
        avatarColor: 'purple',
      },
    );
    const persistedForeignWorkspace = await workspaceRepository.findOneByOrFail(
      {
        id: SEED_YCOMBINATOR_WORKSPACE_ID,
      },
    );

    expect(persistedForeignWorkspace.aiChatAssistantProfile).toEqual(
      foreignWorkspace.aiChatAssistantProfile,
    );
  });

  it('enforces permissions for every field in a mixed update and for reset', async () => {
    for (const token of [
      API_KEY_ACCESS_TOKEN,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    ]) {
      await expectRejectedOperation({
        operation: updateWorkspaceAssistantProfileQueryFactory({
          data: {
            displayName: 'Rejected workspace edit',
            aiChatAssistantProfile: { displayName: 'Rejected assistant edit' },
          },
        }),
        token,
        errorCode: ErrorCode.FORBIDDEN,
      });
    }
    await assignMemberRole(originalMemberRoleId);

    const response = await readWorkspace(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.currentWorkspace.aiChatAssistantProfile).toEqual(
      CUSTOM_ASSISTANT_PROFILE,
    );

    for (const operation of [
      updateWorkspaceAssistantProfileQueryFactory({
        data: { aiChatAssistantProfile: { displayName: 'Denied' } },
      }),
      resetWorkspaceAssistantProfileQueryFactory(),
    ]) {
      for (const token of [
        API_KEY_ACCESS_TOKEN,
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      ]) {
        await expectRejectedOperation({
          operation,
          token,
          errorCode: ErrorCode.FORBIDDEN,
        });
      }
    }
  });

  it('rejects profile updates and reset while Inbox is disabled', async () => {
    await setInboxEnabled(false);

    for (const operation of [
      updateWorkspaceAssistantProfileQueryFactory({
        data: {
          aiChatAssistantProfile: { displayName: 'Denied' },
          displayName: 'Rejected disabled inbox update',
        },
      }),
      resetWorkspaceAssistantProfileQueryFactory(),
    ]) {
      await expectRejectedOperation({
        operation,
        errorCode: ErrorCode.FORBIDDEN,
      });
    }
  });
});
