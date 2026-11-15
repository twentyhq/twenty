import request from 'supertest';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { FeatureFlagKey, MessageChannelVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { type PersonalRoleService } from 'src/engine/permissions/channel-visibility/services/personal-role.service';
import { type ChannelVisibilityLevel } from 'src/engine/permissions/channel-visibility/types/channel-visibility-level.type';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { search } from 'test/integration/graphql/utils/search.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { createUpsertObjectPermissionsOperation } from 'test/integration/graphql/utils/upsert-object-permission-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForDeferredWorkspaceOperations } from 'test/integration/utils/wait-for-deferred-workspace-operations.util';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);
const FLAGS = [
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
  FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
];
// both belong to a member who is none of the viewers, so every viewer has messages at every level
const METADATA_MESSAGE_CHANNEL_ID = '20202020-9b80-4c2c-a597-383db48de1d6';
const SUBJECT_MESSAGE_CHANNEL_ID = '20202020-e2f1-49b5-85d2-5d3a3386990e';
const UNASSOCIATED_MESSAGE_ID = '20202020-c4a1-4000-8000-000000000001';
const FULL_MESSAGE_ATTACHMENT_ID = '20202020-c4a1-4000-8000-000000000002';
const METADATA_MESSAGE_ATTACHMENT_ID = '20202020-c4a1-4000-8000-000000000003';
const OTHER_ATTACHMENT_ID = '20202020-c4a1-4000-8000-000000000004';
const ATTACHMENT_IDS = [
  FULL_MESSAGE_ATTACHMENT_ID,
  METADATA_MESSAGE_ATTACHMENT_ID,
  OTHER_ATTACHMENT_ID,
];
const SAMPLE_SIZE = 4;
const LEVELS: ChannelVisibilityLevel[] = ['full', 'subject', 'metadata'];
const LEVEL_RANK: Record<ChannelVisibilityLevel, number> = {
  metadata: 0,
  subject: 1,
  full: 2,
};

type Viewer = { name: string; token: string; userWorkspaceId: string };
type Channel = {
  id: string;
  ownerUserWorkspaceId: string | null;
  sharedLevel: ChannelVisibilityLevel;
};
type OracleRecord = {
  id: string;
  hiddenAtSubject: Record<string, string>;
  hiddenAtMetadata: Record<string, string>;
  channelIds: string[];
  threadId?: string;
};

const VIEWERS: Viewer[] = [
  {
    name: 'an admin',
    token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
  },
  {
    name: 'a member',
    token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
  },
  {
    name: 'a guest',
    token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
  },
];

const query = <TRow>(sql: string, parameters: unknown[] = []) =>
  globalThis.testDataSource.query(sql, parameters) as Promise<TRow[]>;

const syncRules = async () => {
  await getAppProviderByClassName<ChannelVisibilityRuleSyncService>(
    'ChannelVisibilityRuleSyncService',
  ).syncWorkspace(SEED_APPLE_WORKSPACE_ID);
  await getAppProviderByClassName<AccessGroupSyncService>(
    'AccessGroupSyncService',
  ).syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
  await waitForDeferredWorkspaceOperations(SEED_APPLE_WORKSPACE_ID);
};

const setMessageChannelVisibility = (
  id: string,
  visibility: MessageChannelVisibility,
) =>
  getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
    { id },
    { visibility },
  );

const findExpectedLevel = ({
  viewer,
  channels,
  channelIds,
}: {
  viewer: Viewer;
  channels: Map<string, Channel>;
  channelIds: string[];
}): ChannelVisibilityLevel | undefined =>
  channelIds
    .map((channelId) => channels.get(channelId))
    .filter(isDefined)
    .map((channel) =>
      channel.ownerUserWorkspaceId === viewer.userWorkspaceId
        ? 'full'
        : channel.sharedLevel,
    )
    .sort((levelA, levelB) => LEVEL_RANK[levelB] - LEVEL_RANK[levelA])[0];

const buildExpectedFields = ({
  record,
  level,
}: {
  record: OracleRecord;
  level: ChannelVisibilityLevel;
}): Record<string, string> => {
  const mask = (fields: Record<string, string>) =>
    Object.fromEntries(Object.keys(fields).map((key) => [key, RESTRICTED]));

  return {
    ...(level === 'metadata'
      ? mask(record.hiddenAtMetadata)
      : record.hiddenAtMetadata),
    ...(level === 'full'
      ? record.hiddenAtSubject
      : mask(record.hiddenAtSubject)),
  };
};

describe('Channel visibility matrix (integration)', () => {
  let messageChannels: Map<string, Channel>;
  let calendarChannels: Map<string, Channel>;
  let messages: OracleRecord[];
  let calendarEvents: OracleRecord[];
  let participantCountByMessageId: Map<string, number>;

  const sample = ({
    viewer,
    records,
    channels,
    level,
  }: {
    viewer: Viewer;
    records: OracleRecord[];
    channels: Map<string, Channel>;
    level: ChannelVisibilityLevel;
  }) =>
    records
      .filter(
        (record) =>
          findExpectedLevel({
            viewer,
            channels,
            channelIds: record.channelIds,
          }) === level,
      )
      .slice(0, SAMPLE_SIZE);

  const sampleEveryLevel = (
    viewer: Viewer,
    records: OracleRecord[],
    channels: Map<string, Channel>,
  ) =>
    LEVELS.flatMap((level) =>
      sample({ viewer, records, channels, level }).map((record) => ({
        record,
        level,
      })),
    );

  beforeAll(async () => {
    await setMessageChannelVisibility(
      METADATA_MESSAGE_CHANNEL_ID,
      MessageChannelVisibility.METADATA,
    );
    await setMessageChannelVisibility(
      SUBJECT_MESSAGE_CHANNEL_ID,
      MessageChannelVisibility.SUBJECT,
    );

    const loadChannels = async (
      tableName: string,
      levelByVisibility: Record<string, ChannelVisibilityLevel>,
    ) =>
      new Map(
        (
          await query<{
            id: string;
            visibility: string;
            userWorkspaceId: string | null;
          }>(
            `SELECT channel.id, channel.visibility, account."userWorkspaceId" FROM core."${tableName}" channel JOIN core."connectedAccount" account ON account.id = channel."connectedAccountId" WHERE channel."workspaceId" = $1`,
            [SEED_APPLE_WORKSPACE_ID],
          )
        ).map(({ id, visibility, userWorkspaceId }): [string, Channel] => [
          id,
          {
            id,
            ownerUserWorkspaceId: userWorkspaceId,
            sharedLevel: levelByVisibility[visibility],
          },
        ]),
      );

    messageChannels = await loadChannels('messageChannel', {
      SHARE_EVERYTHING: 'full',
      SUBJECT: 'subject',
      METADATA: 'metadata',
    });
    calendarChannels = await loadChannels('calendarChannel', {
      SHARE_EVERYTHING: 'full',
      METADATA: 'metadata',
    });

    await query(
      `INSERT INTO "${SCHEMA}"."message" (id, subject, text) VALUES ($1, 'Unassociated subject', 'Unassociated text') ON CONFLICT (id) DO NOTHING`,
      [UNASSOCIATED_MESSAGE_ID],
    );

    messages = (
      await query<{
        id: string;
        subject: string;
        text: string;
        messageThreadId: string;
        channelIds: string[];
      }>(
        `SELECT message.id, message.subject, message.text, message."messageThreadId", array_agg(association."messageChannelId"::text) AS "channelIds" FROM "${SCHEMA}"."message" message JOIN "${SCHEMA}"."messageChannelMessageAssociation" association ON association."messageId" = message.id AND association."deletedAt" IS NULL WHERE message."deletedAt" IS NULL AND coalesce(message.subject, '') <> '' AND coalesce(message.text, '') <> '' GROUP BY message.id ORDER BY message.id`,
      )
    ).map(({ id, subject, text, messageThreadId, channelIds }) => ({
      id,
      hiddenAtSubject: { text },
      hiddenAtMetadata: { subject },
      channelIds,
      threadId: messageThreadId,
    }));
    calendarEvents = (
      await query<{
        id: string;
        title: string;
        description: string;
        channelIds: string[];
      }>(
        `SELECT event.id, event.title, event.description, array_agg(association."calendarChannelId"::text) AS "channelIds" FROM "${SCHEMA}"."calendarEvent" event JOIN "${SCHEMA}"."calendarChannelEventAssociation" association ON association."calendarEventId" = event.id AND association."deletedAt" IS NULL WHERE event."deletedAt" IS NULL AND coalesce(event.title, '') <> '' AND coalesce(event.description, '') <> '' GROUP BY event.id ORDER BY event.id`,
      )
    ).map(({ id, title, description, channelIds }) => ({
      id,
      hiddenAtSubject: {},
      hiddenAtMetadata: { title, description },
      channelIds,
    }));
    participantCountByMessageId = new Map(
      (
        await query<{ messageId: string; count: string }>(
          `SELECT "messageId", count(*) AS count FROM "${SCHEMA}"."messageParticipant" WHERE "deletedAt" IS NULL GROUP BY "messageId"`,
        )
      ).map(({ messageId, count }) => [messageId, Number(count)]),
    );

    for (const [attachmentId, level] of [
      [FULL_MESSAGE_ATTACHMENT_ID, 'full'],
      [METADATA_MESSAGE_ATTACHMENT_ID, 'metadata'],
    ] as const) {
      const [message] = sample({
        viewer: VIEWERS[1],
        records: messages,
        channels: messageChannels,
        level,
      });

      await query(
        `INSERT INTO "${SCHEMA}"."attachment" (id, name, "targetMessageId") VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [attachmentId, `${level}.txt`, message.id],
      );
    }

    await query(
      `INSERT INTO "${SCHEMA}"."attachment" (id, name) VALUES ($1, 'other.txt') ON CONFLICT (id) DO NOTHING`,
      [OTHER_ATTACHMENT_ID],
    );

    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: true,
        expectToFail: false,
      });
    }

    await syncRules();
  }, 600000);

  afterAll(async () => {
    await query(`DELETE FROM "${SCHEMA}"."attachment" WHERE id = ANY($1)`, [
      ATTACHMENT_IDS,
    ]);
    await query(`DELETE FROM "${SCHEMA}"."message" WHERE id = $1`, [
      UNASSOCIATED_MESSAGE_ID,
    ]);

    for (const channelId of [
      METADATA_MESSAGE_CHANNEL_ID,
      SUBJECT_MESSAGE_CHANNEL_ID,
    ]) {
      await setMessageChannelVisibility(
        channelId,
        MessageChannelVisibility.SHARE_EVERYTHING,
      );
    }

    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: false,
        expectToFail: false,
      });
    }

    await getAppProviderByClassName<PersonalRoleService>(
      'PersonalRoleService',
    ).deletePersonalRoles({ workspaceId: SEED_APPLE_WORKSPACE_ID });
    await waitForDeferredWorkspaceOperations(SEED_APPLE_WORKSPACE_ID);
  }, 300000);

  it('has seeded messages at every level for every viewer', () => {
    for (const viewer of VIEWERS) {
      for (const level of LEVELS) {
        expect(
          sample({
            viewer,
            records: messages,
            channels: messageChannels,
            level,
          }).length,
        ).toBeGreaterThan(0);
      }
    }
  });

  describe.each(VIEWERS)('as $name', (viewer) => {
    const readMany = async ({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields,
      filter,
    }: {
      objectMetadataSingularName: string;
      objectMetadataPluralName: string;
      gqlFields: string;
      filter: Record<string, unknown>;
    }) => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName,
          objectMetadataPluralName,
          gqlFields,
          filter,
          first: 200,
        }),
        viewer.token,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data[objectMetadataPluralName].edges.map(
        (edge: { node: Record<string, unknown> }) => edge.node,
      ) as Record<string, any>[];
    };

    it('masks messages by their best level in a list', async () => {
      const sampled = sampleEveryLevel(viewer, messages, messageChannels);
      const nodes = await readMany({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id subject text',
        filter: { id: { in: sampled.map(({ record }) => record.id) } },
      });

      expect(nodes).toHaveLength(sampled.length);

      for (const { record, level } of sampled) {
        expect(nodes.find(({ id }) => id === record.id)).toMatchObject(
          buildExpectedFields({ record, level }),
        );
      }
    });

    it('masks a single message read by id', async () => {
      for (const { record, level } of sampleEveryLevel(
        viewer,
        messages,
        messageChannels,
      ).filter((_, index) => index % SAMPLE_SIZE === 0)) {
        const response = await makeGraphqlApiRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'message',
            gqlFields: 'id subject text',
            filter: { id: { eq: record.id } },
          }),
          viewer.token,
        );

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.message).toMatchObject(
          buildExpectedFields({ record, level }),
        );
      }
    });

    it('masks messages the same way over REST', async () => {
      const sampled = sampleEveryLevel(viewer, messages, messageChannels);
      const response = await makeRestApiRequest({
        method: 'get',
        path: `/messages?filter=id[in]:[${sampled.map(({ record }) => record.id).join(',')}]`,
        bearer: viewer.token,
      });

      expect(response.status).toBe(200);

      const nodes: Record<string, unknown>[] = response.body.data.messages;

      expect(nodes).toHaveLength(sampled.length);

      for (const { record, level } of sampled) {
        expect(nodes.find(({ id }) => id === record.id)).toMatchObject(
          buildExpectedFields({ record, level }),
        );
      }
    });

    it('does not let a hidden field be matched by a filter', async () => {
      const [metadataMessage] = sample({
        viewer,
        records: messages,
        channels: messageChannels,
        level: 'metadata',
      });
      const [subjectMessage] = sample({
        viewer,
        records: messages,
        channels: messageChannels,
        level: 'subject',
      });
      const filters = [
        {
          id: { eq: metadataMessage.id },
          subject: { eq: metadataMessage.hiddenAtMetadata.subject },
        },
        {
          id: { eq: metadataMessage.id },
          text: { eq: metadataMessage.hiddenAtSubject.text },
        },
        {
          id: { eq: subjectMessage.id },
          text: { eq: subjectMessage.hiddenAtSubject.text },
        },
      ];

      for (const filter of filters) {
        const response = await makeGraphqlApiRequest(
          findManyOperationFactory({
            objectMetadataSingularName: 'message',
            objectMetadataPluralName: 'messages',
            gqlFields: 'id',
            filter,
          }),
          viewer.token,
        );

        expect(response.body.data?.messages?.edges ?? []).toHaveLength(0);
      }

      const participantsResponse = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'messageParticipant',
          objectMetadataPluralName: 'messageParticipants',
          gqlFields: 'id',
          filter: {
            messageId: { eq: metadataMessage.id },
            message: {
              subject: { eq: metadataMessage.hiddenAtMetadata.subject },
            },
          },
        }),
        viewer.token,
      );

      expect(
        participantsResponse.body.data?.messageParticipants?.edges ?? [],
      ).toHaveLength(0);
    });

    it('does not let a hidden subject be found by a search', async () => {
      const [metadataMessage] = sample({
        viewer,
        records: messages,
        channels: messageChannels,
        level: 'metadata',
      });
      const { data, errors } = await search({
        searchInput: metadataMessage.hiddenAtMetadata.subject.split(' ')[0],
        includedObjectNameSingulars: ['message'],
        filter: { id: { eq: metadataMessage.id } },
        limit: 10,
        accessToken: viewer.token,
      });

      expect(errors).toBeUndefined();
      expect(data.search.edges).toHaveLength(0);
    });

    it('does not order messages by a hidden subject', async () => {
      const metadataMessages = sample({
        viewer,
        records: messages,
        channels: messageChannels,
        level: 'metadata',
      });
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'message',
          objectMetadataPluralName: 'messages',
          gqlFields: 'id',
          filter: { id: { in: metadataMessages.map(({ id }) => id) } },
          orderBy: [{ subject: 'AscNullsFirst' }, { id: 'AscNullsFirst' }],
        }),
        viewer.token,
      );

      expect(response.body.errors).toBeUndefined();
      expect(
        response.body.data.messages.edges.map(
          ({ node }: { node: { id: string } }) => node.id,
        ),
      ).toEqual(metadataMessages.map(({ id }) => id).sort());
    });

    it('does not reveal a hidden subject through a group by', async () => {
      const sampled = sampleEveryLevel(viewer, messages, messageChannels);
      const response = await makeGraphqlApiRequest(
        groupByOperationFactory({
          objectMetadataSingularName: 'message',
          objectMetadataPluralName: 'messages',
          groupBy: [{ subject: true }],
          filter: { id: { in: sampled.map(({ record }) => record.id) } },
        }),
        viewer.token,
      );
      const groups: {
        groupByDimensionValues: (string | null)[];
        totalCount: number;
      }[] = response.body.data?.messagesGroupBy ?? [];
      const countBySubject = new Map(
        groups.map(({ groupByDimensionValues, totalCount }) => [
          groupByDimensionValues[0],
          totalCount,
        ]),
      );
      const readableSubjects = sampled
        .filter(({ level }) => level !== 'metadata')
        .map(({ record }) => record.hiddenAtMetadata.subject);

      expect(response.body.errors).toBeUndefined();
      expect([...countBySubject.keys()].filter(isDefined).sort()).toEqual(
        [...new Set(readableSubjects)].sort(),
      );
      expect(
        [...countBySubject.values()].reduce((sum, count) => sum + count, 0),
      ).toBe(sampled.length);
    });

    it('reads every participant of a readable message, and masks the message read back from them', async () => {
      const sampled = sampleEveryLevel(viewer, messages, messageChannels);
      const nodes = await readMany({
        objectMetadataSingularName: 'messageParticipant',
        objectMetadataPluralName: 'messageParticipants',
        gqlFields: 'id messageId message { id subject text }',
        filter: { messageId: { in: sampled.map(({ record }) => record.id) } },
      });

      for (const { record, level } of sampled) {
        const participants = nodes.filter(
          ({ messageId }) => messageId === record.id,
        );

        expect(participants).toHaveLength(
          participantCountByMessageId.get(record.id) ?? 0,
        );

        for (const participant of participants) {
          expect(participant.message).toMatchObject(
            buildExpectedFields({ record, level }),
          );
        }
      }
    });

    it('reads the thread of a readable message without its subject, and masks its messages', async () => {
      const sampled = sampleEveryLevel(viewer, messages, messageChannels);
      const threads = await readMany({
        objectMetadataSingularName: 'messageThread',
        objectMetadataPluralName: 'messageThreads',
        gqlFields: 'id messages { edges { node { id subject text } } }',
        filter: {
          id: { in: sampled.map(({ record }) => record.threadId) },
        },
      });

      for (const { record, level } of sampled) {
        expect(
          threads
            .find(({ id }) => id === record.threadId)
            ?.messages.edges.find(
              ({ node }: { node: { id: string } }) => node.id === record.id,
            )?.node,
        ).toMatchObject(buildExpectedFields({ record, level }));
      }

      const subjectResponse = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'messageThread',
          objectMetadataPluralName: 'messageThreads',
          gqlFields: 'id subject',
          filter: { id: { eq: sampled[0].record.threadId } },
        }),
        viewer.token,
      );

      expect(subjectResponse.body.errors).toBeDefined();
    });

    it('never reads a message that belongs to no channel', async () => {
      const nodes = await readMany({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id',
        filter: { id: { eq: UNASSOCIATED_MESSAGE_ID } },
      });

      expect(nodes).toHaveLength(0);
    });

    it('cannot edit a message', async () => {
      const [{ record }] = sampleEveryLevel(viewer, messages, messageChannels);
      const response = await makeGraphqlApiRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: 'id',
          recordId: record.id,
          data: { subject: 'Edited' },
        }),
        viewer.token,
      );

      expect(response.body.errors).toBeDefined();
    });

    it('masks calendar events by their best level, with their participants', async () => {
      const sampled = sampleEveryLevel(
        viewer,
        calendarEvents,
        calendarChannels,
      );

      expect(sampled.length).toBeGreaterThan(0);

      const nodes = await readMany({
        objectMetadataSingularName: 'calendarEvent',
        objectMetadataPluralName: 'calendarEvents',
        gqlFields: 'id title description',
        filter: { id: { in: sampled.map(({ record }) => record.id) } },
      });

      expect(nodes).toHaveLength(sampled.length);

      for (const { record, level } of sampled) {
        expect(nodes.find(({ id }) => id === record.id)).toMatchObject(
          buildExpectedFields({ record, level }),
        );
      }

      const participants = await readMany({
        objectMetadataSingularName: 'calendarEventParticipant',
        objectMetadataPluralName: 'calendarEventParticipants',
        gqlFields: 'id calendarEventId',
        filter: {
          calendarEventId: { in: sampled.map(({ record }) => record.id) },
        },
      });
      const [{ count }] = await query<{ count: string }>(
        `SELECT count(*) AS count FROM "${SCHEMA}"."calendarEventParticipant" WHERE "deletedAt" IS NULL AND "calendarEventId" = ANY($1)`,
        [sampled.map(({ record }) => record.id)],
      );

      expect(participants).toHaveLength(Math.min(Number(count), 200));
    });
  });

  it('gives an API key no message, no participant and no calendar event', async () => {
    for (const [objectMetadataSingularName, objectMetadataPluralName] of [
      ['message', 'messages'],
      ['messageParticipant', 'messageParticipants'],
      ['calendarEvent', 'calendarEvents'],
    ]) {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName,
          objectMetadataPluralName,
          gqlFields: 'id',
        }),
        API_KEY_ACCESS_TOKEN,
      );

      expect(
        response.body.data?.[objectMetadataPluralName]?.edges ?? [],
      ).toHaveLength(0);
    }
  });

  it('lets a role be granted every message like any other object', async () => {
    const member = VIEWERS[1];
    const [record] = sample({
      viewer: member,
      records: messages,
      channels: messageChannels,
      level: 'metadata',
    });
    const [{ memberRoleId }] = await query<{ memberRoleId: string }>(
      `SELECT id AS "memberRoleId" FROM core."role" WHERE "workspaceId" = $1 AND label = 'Member'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const [{ objectMetadataId }] = await query<{ objectMetadataId: string }>(
      `SELECT id AS "objectMetadataId" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'message'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const client = request(`http://localhost:${APP_PORT}`);
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'Reads every message',
    });
    const grantResponse = await makeMetadataApiRequest(
      createUpsertObjectPermissionsOperation(roleId, [
        { objectMetadataId, canReadObjectRecords: true },
      ]),
    );

    expect(grantResponse.body.errors).toBeUndefined();

    const readAsMember = async () =>
      (
        await makeGraphqlApiRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'message',
            gqlFields: 'id subject text',
            filter: { id: { eq: record.id } },
          }),
          member.token,
        )
      ).body.data.message;

    await updateWorkspaceMemberRole({
      client,
      roleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
    await syncRules();

    try {
      expect(await readAsMember()).toMatchObject({
        ...record.hiddenAtMetadata,
        ...record.hiddenAtSubject,
      });
    } finally {
      await updateWorkspaceMemberRole({
        client,
        roleId: memberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });
      await deleteRole(client, roleId);
      await syncRules();
    }

    expect(await readAsMember()).toMatchObject(
      buildExpectedFields({ record, level: 'metadata' }),
    );
  }, 240000);

  it('keeps a role on the attachments that are not of a message, lets the ones of a message follow it at full level, and lets a granted role read them all', async () => {
    const readAttachmentIds = async (token: string): Promise<string[]> => {
      const response = await makeGraphqlApiRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'attachment',
          objectMetadataPluralName: 'attachments',
          gqlFields: 'id',
          filter: { id: { in: ATTACHMENT_IDS } },
        }),
        token,
      );

      expect(response.body.errors).toBeUndefined();

      return response.body.data.attachments.edges
        .map(({ node }: { node: { id: string } }) => node.id)
        .sort();
    };
    const member = VIEWERS[1];

    for (const viewer of [VIEWERS[0], member]) {
      expect(await readAttachmentIds(viewer.token)).toEqual([
        FULL_MESSAGE_ATTACHMENT_ID,
        OTHER_ATTACHMENT_ID,
      ]);
    }

    const [{ memberRoleId }] = await query<{ memberRoleId: string }>(
      `SELECT id AS "memberRoleId" FROM core."role" WHERE "workspaceId" = $1 AND label = 'Member'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const [{ objectMetadataId }] = await query<{ objectMetadataId: string }>(
      `SELECT id AS "objectMetadataId" FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'attachment'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    const client = request(`http://localhost:${APP_PORT}`);
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'Reads every attachment',
    });

    await updateWorkspaceMemberRole({
      client,
      roleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
    await syncRules();

    try {
      expect(await readAttachmentIds(member.token)).toEqual([
        FULL_MESSAGE_ATTACHMENT_ID,
        OTHER_ATTACHMENT_ID,
      ]);

      const grantResponse = await makeMetadataApiRequest(
        createUpsertObjectPermissionsOperation(roleId, [
          { objectMetadataId, canReadObjectRecords: true },
        ]),
      );

      expect(grantResponse.body.errors).toBeUndefined();
      await syncRules();

      expect(await readAttachmentIds(member.token)).toEqual(ATTACHMENT_IDS);
    } finally {
      await updateWorkspaceMemberRole({
        client,
        roleId: memberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });
      await deleteRole(client, roleId);
      await syncRules();
    }
  }, 240000);

  it('follows a channel visibility change', async () => {
    const admin = VIEWERS[0];
    const [record] = messages.filter(
      ({ channelIds }) =>
        channelIds.length === 1 &&
        channelIds[0] === METADATA_MESSAGE_CHANNEL_ID,
    );
    const readAsAdmin = async () =>
      (
        await makeGraphqlApiRequest(
          findOneOperationFactory({
            objectMetadataSingularName: 'message',
            gqlFields: 'id subject text',
            filter: { id: { eq: record.id } },
          }),
          admin.token,
        )
      ).body.data.message;

    expect(await readAsAdmin()).toMatchObject(
      buildExpectedFields({ record, level: 'metadata' }),
    );

    await setMessageChannelVisibility(
      METADATA_MESSAGE_CHANNEL_ID,
      MessageChannelVisibility.SHARE_EVERYTHING,
    );
    await syncRules();

    try {
      expect(await readAsAdmin()).toMatchObject(
        buildExpectedFields({ record, level: 'full' }),
      );
    } finally {
      await setMessageChannelVisibility(
        METADATA_MESSAGE_CHANNEL_ID,
        MessageChannelVisibility.METADATA,
      );
      await syncRules();
    }
  }, 240000);
});
