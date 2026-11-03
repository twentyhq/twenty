import { createChatParticipationTestContext } from 'test/integration/ai/utils/create-chat-participation-test-context.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildApplicationAuthContext } from 'src/engine/core-modules/auth/utils/build-application-auth-context.util';
import { type UserWorkspaceAuthContextService } from 'src/engine/core-modules/user-workspace/services/user-workspace-auth-context.service';
import { type AgentChatDirectMessageIdentityService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-direct-message-identity.service';
import { type AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Application access to direct messages', () => {
  let application: ApplicationWithResources;
  let authContext: ApplicationWorkspaceAuthContext;
  let context: Awaited<ReturnType<typeof createChatParticipationTestContext>>;
  let inboxAccessService: AgentInboxAccessService;
  let threadObjectMetadata: FlatObjectMetadata;
  let applicationRoleId: string;
  let wasRecordSharingEnabled: boolean;

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Direct Message Inbox Access',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
    });
    jest.useRealTimers();
    inboxAccessService = getAppProviderByClassName<AgentInboxAccessService>(
      'AgentInboxAccessService',
    );
  });

  beforeEach(async () => {
    context = await createChatParticipationTestContext();
    wasRecordSharingEnabled = await context.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      context.workspaceId,
    );
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: true,
    });

    const userAuthContext =
      await getAppProviderByClassName<UserWorkspaceAuthContextService>(
        'UserWorkspaceAuthContextService',
      ).resolveWorkspaceMember({
        workspaceId: context.workspaceId,
        workspaceMemberId: context.workspaceMemberId,
        applicationId: application.id,
      });

    assertIsDefinedOrThrow(userAuthContext.application);
    assertIsDefinedOrThrow(userAuthContext.application.defaultRoleId);
    authContext = buildApplicationAuthContext({
      workspace: userAuthContext.workspace,
      application: userAuthContext.application,
    });
    applicationRoleId = userAuthContext.application.defaultRoleId;

    const { flatObjectMetadataMaps } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(context.workspaceId, ['flatObjectMetadataMaps']);
    const threadMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    assertIsDefinedOrThrow(threadMetadata);
    threadObjectMetadata = threadMetadata;
  });

  afterEach(async () => {
    await context.cleanup();
    await context.featureFlagService.upsertWorkspaceFeatureFlag({
      workspaceId: context.workspaceId,
      featureFlag: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
      value: wasRecordSharingEnabled,
    });
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  const grantApplicationRoleAccess = (threadId: string) =>
    setManualRecordShare({
      workspaceId: context.workspaceId,
      enabled: true,
      share: {
        objectMetadataId: threadObjectMetadata.id,
        recordId: threadId,
        sourceId: threadId,
        principalType: RecordSharePrincipalType.ROLE,
        principalId: applicationRoleId,
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      },
    });

  const addApplicationMessage = async (threadId: string) => {
    const message = await context.saveMessage({ threadId });

    await global.testDataSource.query(
      `UPDATE "${context.schema}"."agentMessage"
       SET "senderApplicationId" = $2, "senderWorkspaceMemberId" = NULL
       WHERE id = $1`,
      [message.id, application.id],
    );
  };

  it('rejects a DM despite application participation and a role grant', async () => {
    const threadId = context.registerThread(
      await getAppProviderByClassName<AgentChatDirectMessageIdentityService>(
        'AgentChatDirectMessageIdentityService',
      ).getOrCreate({
        workspaceId: context.workspaceId,
        firstWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        secondWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      }),
    );

    await addApplicationMessage(threadId);
    await grantApplicationRoleAccess(threadId);

    await expect(
      inboxAccessService.assertThreadIsWritableOrThrow({
        authContext,
        threadId,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
  });

  it.each(['participation', 'role grant'])(
    'allows an ordinary thread through application %s',
    async (accessSource) => {
      const threadId = await context.createThread();

      if (accessSource === 'participation') {
        await addApplicationMessage(threadId);
      }

      if (accessSource === 'role grant') {
        await grantApplicationRoleAccess(threadId);
      }

      await expect(
        inboxAccessService.assertThreadIsWritableOrThrow({
          authContext,
          threadId,
        }),
      ).resolves.toBeUndefined();
    },
  );
});
