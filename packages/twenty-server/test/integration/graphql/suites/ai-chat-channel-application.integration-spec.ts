import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { assertGraphQLSuccessfulResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const CHANNEL_MANAGER_PERMISSION_FLAGS = [
  SystemPermissionFlag.AI,
  SystemPermissionFlag.AI_SETTINGS,
];

type ListedChannel = {
  id: string;
  name: string;
  isCustom: boolean;
  isAccessible: boolean;
  roleIds: string[];
};

type ApplicationUnderTest = {
  application: ApplicationWithResources;
  token: string;
  roleId: string;
};

const CHANNELS = parse(
  `query Channels { agentChatChannels { id name isCustom isAccessible roleIds } }`,
);

const CHANNEL_ROLES = parse(
  `query ChannelRoles { agentChatChannelRoles { id } }`,
);

const CREATE_CHANNEL = parse(
  `mutation CreateChannel($input: CreateAgentChatChannelInput!) { createAgentChatChannel(input: $input) { id name roleIds isCustom } }`,
);

const UPDATE_CHANNEL = parse(
  `mutation UpdateChannel($channelId: UUID!, $input: UpdateAgentChatChannelInput!) { updateAgentChatChannel(channelId: $channelId, input: $input) { id name roleIds } }`,
);

const DELETE_CHANNEL = parse(
  `mutation DeleteChannel($channelId: UUID!, $destinationChannelId: UUID) { deleteAgentChatChannel(channelId: $channelId, destinationChannelId: $destinationChannelId) }`,
);

const CHANNEL_SUMMARIES = parse(
  `query Summaries { agentChatChannelSummaries { channelId } }`,
);

const CREATE_THREAD = parse(
  `mutation CreateThread($channelId: UUID) { createChatThread(channelId: $channelId) { id } }`,
);

const setupApplicationUnderTest = async ({
  name,
  permissionFlagUniversalIdentifiers,
}: {
  name: string;
  permissionFlagUniversalIdentifiers: string[];
}): Promise<ApplicationUnderTest> => {
  const application = await setupApplicationWithResources({
    name,
    permissionFlagUniversalIdentifiers,
  });

  jest.useRealTimers();

  const [
    {
      applicationAccessToken: { token },
    },
    [{ defaultRoleId }],
  ] = await Promise.all([
    generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    }),
    global.testDataSource.query(
      `SELECT "defaultRoleId" FROM core."application" WHERE id = $1`,
      [application.id],
    ),
  ]);

  return { application, token, roleId: defaultRoleId };
};

const findGeneralChannelId = async (): Promise<string> => {
  const [{ id }]: { id: string }[] = await global.testDataSource.query(
    `SELECT id FROM core."agentChatChannel"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [
      SEED_APPLE_WORKSPACE_ID,
      STANDARD_AGENT_CHAT_CHANNEL.general.universalIdentifier,
    ],
  );

  return id;
};

const findWorkspaceCustomApplicationId = async (): Promise<string> => {
  const [{ workspaceCustomApplicationId }]: {
    workspaceCustomApplicationId: string;
  }[] = await global.testDataSource.query(
    `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return workspaceCustomApplicationId;
};

const readChannelsWithUniversalIdentifier = async (
  universalIdentifier: string,
): Promise<{ id: string; applicationId: string }[]> =>
  global.testDataSource.query(
    `SELECT id, "applicationId" FROM core."agentChatChannel"
     WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
    [SEED_APPLE_WORKSPACE_ID, universalIdentifier],
  );

const readChannelApplicationId = async (
  channelId: string,
): Promise<string | undefined> => {
  const [channel]: { applicationId: string }[] =
    await global.testDataSource.query(
      `SELECT "applicationId" FROM core."agentChatChannel" WHERE id = $1`,
      [channelId],
    );

  return channel?.applicationId;
};

const readChannelRoleApplicationIds = async (
  channelId: string,
): Promise<{ roleId: string; applicationId: string }[]> =>
  global.testDataSource.query(
    `SELECT "roleId", "applicationId" FROM core."agentChatChannelRole"
     WHERE "channelId" = $1 ORDER BY "roleId"`,
    [channelId],
  );

const readThreadChannelId = async (threadId: string): Promise<string> => {
  const [{ channelId }]: { channelId: string }[] =
    await global.testDataSource.query(
      `SELECT "channelId" FROM ${SCHEMA}."agentChatThread" WHERE id = $1`,
      [threadId],
    );

  return channelId;
};

const readChannelGrants = async (
  threadId: string,
): Promise<{ principalType: string; sourceId: string }[]> =>
  global.testDataSource.query(
    `SELECT DISTINCT "principalType", "sourceId" FROM ${SCHEMA}."recordShare"
     WHERE "recordId" = $1 AND "rowCause" = 'RULE' AND "deletedAt" IS NULL
     ORDER BY "principalType"`,
    [threadId],
  );

const readChannelGrantRoleIds = async (threadId: string): Promise<string[]> =>
  (
    await global.testDataSource.query(
      `SELECT "principalId" FROM ${SCHEMA}."recordShare"
       WHERE "recordId" = $1 AND "rowCause" = 'RULE' AND "deletedAt" IS NULL
         AND "principalType" = 'ROLE'
       ORDER BY "principalId"`,
      [threadId],
    )
  ).map(({ principalId }: { principalId: string }) => principalId);

const countSessionsWaitingOnLocks = async (): Promise<number> => {
  const [{ count }]: { count: number }[] = await global.testDataSource.query(
    `SELECT count(*)::int AS count FROM pg_stat_activity
     WHERE datname = current_database() AND wait_event_type = 'Lock'`,
  );

  return count;
};

const listChannels = async (token: string): Promise<ListedChannel[]> => {
  const response = await makeMetadataApiRequest({ query: CHANNELS }, token);

  assertGraphQLSuccessfulResponse(response);

  return response.body.data.agentChatChannels;
};

const buildChannelName = () => `Application channel ${randomUUID()}`;

describe('Inbox channels managed by an application', () => {
  const createdChannelIds: string[] = [];
  const createdThreadIds: string[] = [];
  let channelManager: ApplicationUnderTest;
  let otherChannelManager: ApplicationUnderTest;
  let channelReader: ApplicationUnderTest;
  let generalChannelId: string;

  const createChannel = async (
    input: Record<string, unknown>,
    token: string,
  ) => {
    const response = await makeMetadataApiRequest(
      { query: CREATE_CHANNEL, variables: { input } },
      token,
    );
    const createdChannelId = response.body.data?.createAgentChatChannel?.id;

    if (isDefined(createdChannelId)) {
      createdChannelIds.push(createdChannelId);
    }

    return response;
  };

  const createChannelOrThrow = async (
    input: Record<string, unknown>,
    token: string,
  ): Promise<string> => {
    const response = await createChannel(input, token);

    assertGraphQLSuccessfulResponse(response);

    return response.body.data.createAgentChatChannel.id;
  };

  const updateChannel = (
    channelId: string,
    input: Record<string, unknown>,
    token: string,
  ) =>
    makeMetadataApiRequest(
      { query: UPDATE_CHANNEL, variables: { channelId, input } },
      token,
    );

  const deleteChannel = (
    channelId: string,
    token: string,
    destinationChannelId: string | null = null,
  ) =>
    makeMetadataApiRequest(
      {
        query: DELETE_CHANNEL,
        variables: { channelId, destinationChannelId },
      },
      token,
    );

  const createThreadInChannel = async (channelId: string): Promise<string> => {
    const response = await makeMetadataApiRequest({
      query: CREATE_THREAD,
      variables: { channelId },
    });

    assertGraphQLSuccessfulResponse(response);

    const threadId = response.body.data.createChatThread.id;

    createdThreadIds.push(threadId);

    return threadId;
  };

  beforeAll(async () => {
    channelManager = await setupApplicationUnderTest({
      name: 'Channel Manager Application',
      permissionFlagUniversalIdentifiers: CHANNEL_MANAGER_PERMISSION_FLAGS,
    });
    otherChannelManager = await setupApplicationUnderTest({
      name: 'Other Channel Manager Application',
      permissionFlagUniversalIdentifiers: CHANNEL_MANAGER_PERMISSION_FLAGS,
    });
    channelReader = await setupApplicationUnderTest({
      name: 'Channel Reader Application',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
    });
    generalChannelId = await findGeneralChannelId();
  }, 180_000);

  afterAll(async () => {
    for (const threadId of createdThreadIds.splice(0)) {
      await destroyAgentChatThread({ threadId });
    }

    for (const channelId of createdChannelIds.splice(0)) {
      await deleteChannel(channelId, APPLE_JANE_ADMIN_ACCESS_TOKEN);
    }

    for (const { application } of [
      channelManager,
      otherChannelManager,
      channelReader,
    ].filter(isDefined)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  }, 120_000);

  it('lists every channel to an application managing AI settings, accessible through its role only', async () => {
    const channelId = await createChannelOrThrow(
      { name: buildChannelName(), roleIds: [channelManager.roleId] },
      channelManager.token,
    );

    const channels = await listChannels(channelManager.token);

    expect(channels.find(({ id }) => id === generalChannelId)).toMatchObject({
      isCustom: false,
      isAccessible: false,
    });
    expect(channels.find(({ id }) => id === channelId)).toMatchObject({
      isCustom: true,
      isAccessible: true,
      roleIds: [channelManager.roleId],
    });
  });

  it('lists only the channels open to the role of an application without AI settings, and keeps their settings closed', async () => {
    const openChannelId = await createChannelOrThrow(
      { name: buildChannelName(), roleIds: [channelReader.roleId] },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );
    const closedChannelId = await createChannelOrThrow(
      { name: buildChannelName() },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    const channelIds = (await listChannels(channelReader.token)).map(
      ({ id }) => id,
    );

    expect(channelIds).toContain(openChannelId);
    expect(channelIds).not.toContain(closedChannelId);
    expect(channelIds).not.toContain(generalChannelId);

    const rolesResponse = await makeMetadataApiRequest(
      { query: CHANNEL_ROLES },
      channelReader.token,
    );
    const createResponse = await createChannel(
      { name: buildChannelName() },
      channelReader.token,
    );

    for (const response of [rolesResponse, createResponse]) {
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    }
  });

  it('lists the roles a channel can be opened to for an application managing AI settings', async () => {
    const applicationResponse = await makeMetadataApiRequest(
      { query: CHANNEL_ROLES },
      channelManager.token,
    );
    const memberResponse = await makeMetadataApiRequest({
      query: CHANNEL_ROLES,
    });

    assertGraphQLSuccessfulResponse(applicationResponse);
    assertGraphQLSuccessfulResponse(memberResponse);
    expect(applicationResponse.body.data.agentChatChannelRoles).toEqual(
      memberResponse.body.data.agentChatChannelRoles,
    );
  });

  it('creates one channel owned by the application for a universal identifier', async () => {
    const universalIdentifier = randomUUID();
    const name = buildChannelName();

    const channelId = await createChannelOrThrow(
      { name, universalIdentifier },
      channelManager.token,
    );
    const repeatedResponse = await createChannel(
      {
        name: buildChannelName(),
        universalIdentifier: universalIdentifier.toUpperCase(),
        roleIds: [channelManager.roleId],
      },
      channelManager.token,
    );

    assertGraphQLSuccessfulResponse(repeatedResponse);
    expect(repeatedResponse.body.data.createAgentChatChannel).toMatchObject({
      id: channelId,
      name,
      roleIds: [],
    });
    expect(
      await readChannelsWithUniversalIdentifier(universalIdentifier),
    ).toEqual([
      { id: channelId, applicationId: channelManager.application.id },
    ]);
  });

  it('creates a single channel when the same universal identifier is sent twice at once', async () => {
    const universalIdentifier = randomUUID();

    const responses = await Promise.all(
      [buildChannelName(), buildChannelName()].map((name) =>
        createChannel({ name, universalIdentifier }, channelManager.token),
      ),
    );

    for (const response of responses) {
      assertGraphQLSuccessfulResponse(response);
    }

    const channelIds = responses.map(
      ({ body }) => body.data.createAgentChatChannel.id,
    );

    expect(channelIds[0]).toBe(channelIds[1]);
    expect(
      await readChannelsWithUniversalIdentifier(universalIdentifier),
    ).toEqual([
      { id: channelIds[0], applicationId: channelManager.application.id },
    ]);
  });

  it('refuses the universal identifier of a channel another application owns', async () => {
    const universalIdentifier = randomUUID();

    await createChannelOrThrow(
      { name: buildChannelName(), universalIdentifier },
      channelManager.token,
    );

    const otherApplicationResponse = await createChannel(
      { name: buildChannelName(), universalIdentifier },
      otherChannelManager.token,
    );
    const memberResponse = await createChannel(
      { name: buildChannelName(), universalIdentifier },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    for (const response of [otherApplicationResponse, memberResponse]) {
      expect(response.body.errors[0].extensions).toMatchObject({
        code: 'CONFLICT',
        subCode: AiExceptionCode.CHAT_CHANNEL_UNIVERSAL_IDENTIFIER_TAKEN,
      });
    }
  });

  it('updates and deletes its own channel, keeping the access it adds as its own', async () => {
    const channelId = await createChannelOrThrow(
      { name: buildChannelName(), universalIdentifier: randomUUID() },
      channelManager.token,
    );
    const renamedName = buildChannelName();

    const updateResponse = await updateChannel(
      channelId,
      { name: renamedName, roleIds: [channelManager.roleId] },
      channelManager.token,
    );

    assertGraphQLSuccessfulResponse(updateResponse);
    expect(updateResponse.body.data.updateAgentChatChannel).toMatchObject({
      id: channelId,
      name: renamedName,
      roleIds: [channelManager.roleId],
    });
    expect(await readChannelRoleApplicationIds(channelId)).toEqual([
      {
        roleId: channelManager.roleId,
        applicationId: channelManager.application.id,
      },
    ]);

    assertGraphQLSuccessfulResponse(
      await deleteChannel(channelId, channelManager.token),
    );
    expect(await readChannelApplicationId(channelId)).toBeUndefined();
  });

  it('answers as if a channel it does not own did not exist', async () => {
    const memberChannelId = await createChannelOrThrow(
      { name: buildChannelName() },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );
    const otherApplicationChannelId = await createChannelOrThrow(
      { name: buildChannelName() },
      otherChannelManager.token,
    );

    const responses = await Promise.all([
      ...[memberChannelId, otherApplicationChannelId, generalChannelId].flatMap(
        (channelId) => [
          updateChannel(
            channelId,
            { name: buildChannelName() },
            channelManager.token,
          ),
          deleteChannel(channelId, channelManager.token),
        ],
      ),
      deleteChannel(randomUUID(), channelManager.token),
    ]);

    for (const response of responses) {
      expect(response.body.errors[0].extensions).toMatchObject({
        code: 'NOT_FOUND',
        subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
      });
    }
    expect(await readChannelApplicationId(generalChannelId)).toBeDefined();
  });

  it('moves the chats of its deleted channel only to a channel its role can open', async () => {
    const channelId = await createChannelOrThrow(
      { name: buildChannelName(), roleIds: [channelManager.roleId] },
      channelManager.token,
    );
    const destinationChannelId = await createChannelOrThrow(
      { name: buildChannelName(), roleIds: [channelManager.roleId] },
      channelManager.token,
    );
    const threadId = await createThreadInChannel(channelId);

    const withoutDestinationResponse = await deleteChannel(
      channelId,
      channelManager.token,
    );
    const closedDestinationResponse = await deleteChannel(
      channelId,
      channelManager.token,
      generalChannelId,
    );

    expect(withoutDestinationResponse.body.errors[0].extensions).toMatchObject({
      code: 'CONFLICT',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_EMPTY,
    });
    expect(closedDestinationResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
    });
    expect(await readThreadChannelId(threadId)).toBe(channelId);

    assertGraphQLSuccessfulResponse(
      await deleteChannel(
        channelId,
        channelManager.token,
        destinationChannelId,
      ),
    );
    expect(await readThreadChannelId(threadId)).toBe(destinationChannelId);
    expect(await readChannelGrants(threadId)).toEqual([
      { principalType: 'ROLE', sourceId: destinationChannelId },
    ]);
  });

  it('keeps member behaviour on channels, including those an application owns', async () => {
    const workspaceCustomApplicationId =
      await findWorkspaceCustomApplicationId();
    const universalIdentifier = randomUUID();
    const memberChannelId = await createChannelOrThrow(
      { name: buildChannelName(), universalIdentifier },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );
    const repeatedMemberChannelId = await createChannelOrThrow(
      { name: buildChannelName(), universalIdentifier },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );
    const applicationChannelId = await createChannelOrThrow(
      { name: buildChannelName() },
      channelManager.token,
    );

    expect(repeatedMemberChannelId).toBe(memberChannelId);
    expect(await readChannelApplicationId(memberChannelId)).toBe(
      workspaceCustomApplicationId,
    );

    const updateResponse = await updateChannel(
      applicationChannelId,
      { roleIds: [channelReader.roleId] },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

    assertGraphQLSuccessfulResponse(updateResponse);
    expect(await readChannelRoleApplicationIds(applicationChannelId)).toEqual([
      {
        roleId: channelReader.roleId,
        applicationId: workspaceCustomApplicationId,
      },
    ]);

    assertGraphQLSuccessfulResponse(
      await deleteChannel(applicationChannelId, APPLE_JANE_ADMIN_ACCESS_TOKEN),
    );
    expect(
      await readChannelApplicationId(applicationChannelId),
    ).toBeUndefined();
  });

  it('keeps the conversation endpoints of channels closed to application tokens', async () => {
    const response = await makeMetadataApiRequest(
      { query: CHANNEL_SUMMARIES },
      channelManager.token,
    );

    expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});

describe('Uninstalling an application that created inbox channels', () => {
  const createdThreadIds: string[] = [];
  let uninstalledApplication: ApplicationUnderTest;

  beforeAll(async () => {
    uninstalledApplication = await setupApplicationUnderTest({
      name: 'Uninstalled Channel Application',
      permissionFlagUniversalIdentifiers: CHANNEL_MANAGER_PERMISSION_FLAGS,
    });
  }, 180_000);

  afterAll(async () => {
    for (const threadId of createdThreadIds.splice(0)) {
      await destroyAgentChatThread({ threadId });
    }

    if (!isDefined(uninstalledApplication)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        uninstalledApplication.application.universalIdentifier,
    });
  }, 120_000);

  const createThreadInChannel = async (
    channelId: string | null,
  ): Promise<string> => {
    const response = await makeMetadataApiRequest({
      query: CREATE_THREAD,
      variables: { channelId },
    });

    assertGraphQLSuccessfulResponse(response);

    const threadId = response.body.data.createChatThread.id;

    createdThreadIds.push(threadId);

    return threadId;
  };

  const fileThreadIntoChannelWhileUninstalling = async ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId: string;
  }) => {
    const queryRunner = global.testDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await lockAgentChatChannelForThreadWriteOrThrow({
        manager: queryRunner.manager,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        channelId,
      });
      await queryRunner.query(
        `UPDATE ${SCHEMA}."agentChatThread" SET "channelId" = $1 WHERE id = $2`,
        [channelId, threadId],
      );

      const uninstallResponse = uninstallApplication({
        universalIdentifier:
          uninstalledApplication.application.universalIdentifier,
      });

      await expectEventually(async () =>
        expect(await countSessionsWaitingOnLocks()).toBeGreaterThan(0),
      );
      await queryRunner.commitTransaction();

      return await uninstallResponse;
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      await queryRunner.release();
    }
  };

  it('deletes its channels and moves their chats, even one filed in meanwhile, to General with the access of General', async () => {
    const generalChannelId = await findGeneralChannelId();
    const createResponse = await makeMetadataApiRequest(
      {
        query: CREATE_CHANNEL,
        variables: {
          input: {
            name: buildChannelName(),
            roleIds: [uninstalledApplication.roleId],
          },
        },
      },
      uninstalledApplication.token,
    );

    assertGraphQLSuccessfulResponse(createResponse);

    const channelId = createResponse.body.data.createAgentChatChannel.id;
    const threadId = await createThreadInChannel(channelId);
    const lateThreadId = await createThreadInChannel(null);
    const generalThreadId = await createThreadInChannel(generalChannelId);
    const generalRoleIds = await readChannelGrantRoleIds(generalThreadId);

    expect(await readChannelGrantRoleIds(threadId)).toContain(
      uninstalledApplication.roleId,
    );

    const { errors } = await fileThreadIntoChannelWhileUninstalling({
      threadId: lateThreadId,
      channelId,
    });

    expect(errors).toBeUndefined();
    expect(await readChannelApplicationId(channelId)).toBeUndefined();

    for (const movedThreadId of [threadId, lateThreadId]) {
      expect(await readThreadChannelId(movedThreadId)).toBe(generalChannelId);
      expect(await readChannelGrants(movedThreadId)).toEqual([
        { principalType: 'ROLE', sourceId: generalChannelId },
      ]);
      expect(await readChannelGrantRoleIds(movedThreadId)).toEqual(
        generalRoleIds,
      );
    }
  }, 60_000);
});
