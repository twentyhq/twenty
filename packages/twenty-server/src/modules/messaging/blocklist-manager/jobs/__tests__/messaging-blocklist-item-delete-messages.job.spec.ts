import {
  createInMemoryWorkspaceRepository,
  type InMemoryRecord,
} from 'test/utils/create-in-memory-workspace-repository.util';
import { BlocklistScope, MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type FindOperator, type Repository } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { RECORD_DELETE_BATCH_SIZE } from 'src/engine/twenty-orm/constants/record-delete-batch-size.constant';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import {
  BlocklistItemDeleteMessagesJob,
  type BlocklistItemDeleteMessagesJobData,
} from 'src/modules/messaging/blocklist-manager/jobs/messaging-blocklist-item-delete-messages.job';
import { type MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const OTHER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000002';

type MessageChannelFixture = {
  id: string;
  workspaceId: string;
  connectedAccountId: string;
  handle: string;
  handleAliases: string[];
};

const OWN_CHANNEL: MessageChannelFixture = {
  id: 'channel-own',
  workspaceId: WORKSPACE_ID,
  connectedAccountId: 'connected-account-own',
  handle: 'me@acme.com',
  handleAliases: ['alias@acme.com'],
};

const TEAMMATE_CHANNEL: MessageChannelFixture = {
  id: 'channel-teammate',
  workspaceId: WORKSPACE_ID,
  connectedAccountId: 'connected-account-teammate',
  handle: 'teammate@partner.com',
  handleAliases: [],
};

const OTHER_WORKSPACE_CHANNEL: MessageChannelFixture = {
  id: 'channel-other-workspace',
  workspaceId: OTHER_WORKSPACE_ID,
  connectedAccountId: 'connected-account-other-workspace',
  handle: 'someone@elsewhere.com',
  handleAliases: [],
};

const MESSAGE_CHANNELS = [
  OWN_CHANNEL,
  TEAMMATE_CHANNEL,
  OTHER_WORKSPACE_CHANNEL,
];

const buildParticipant = ({
  id,
  messageId,
  handle,
  role = MessageParticipantRole.FROM,
  deletedAt = null,
}: {
  id: string;
  messageId: string;
  handle: string;
  role?: MessageParticipantRole;
  deletedAt?: string | null;
}): InMemoryRecord => ({ id, messageId, handle, role, deletedAt });

const buildAssociation = ({
  messageChannelId,
  messageId,
  deletedAt = null,
}: {
  messageChannelId: string;
  messageId: string;
  deletedAt?: string | null;
}): InMemoryRecord => ({
  id: `${messageChannelId}:${messageId}`,
  messageChannelId,
  messageId,
  deletedAt,
});

const buildAssociationsForAllChannels = (messageIds: string[]) =>
  [OWN_CHANNEL, TEAMMATE_CHANNEL].flatMap((messageChannel) =>
    messageIds.map((messageId) =>
      buildAssociation({ messageChannelId: messageChannel.id, messageId }),
    ),
  );

const buildWorkspaceBlocklistItem = (handle: string): InMemoryRecord => ({
  id: `blocklist-${handle}`,
  handle,
  scope: BlocklistScope.WORKSPACE,
  workspaceMemberId: null,
  deletedAt: null,
});

const getIds = (records: InMemoryRecord[]) =>
  records.map(({ id }) => id).sort();

describe('BlocklistItemDeleteMessagesJob', () => {
  let job: BlocklistItemDeleteMessagesJob;
  let cleanOrphanMessagesAndThreads: jest.Mock;
  let runInWorkspaceTransaction: jest.Mock;
  let workspaceTables: Record<
    string,
    Record<string, ReturnType<typeof createInMemoryWorkspaceRepository>>
  >;

  const setWorkspaceRecords = (
    recordsByWorkspaceId: Record<string, Record<string, InMemoryRecord[]>>,
  ) => {
    workspaceTables = Object.fromEntries(
      Object.entries(recordsByWorkspaceId).map(
        ([workspaceId, recordsByObjectName]) => [
          workspaceId,
          Object.fromEntries(
            Object.entries(recordsByObjectName).map(([objectName, records]) => [
              objectName,
              createInMemoryWorkspaceRepository(records),
            ]),
          ),
        ],
      ),
    );
  };

  const getAssociationTable = (workspaceId = WORKSPACE_ID) =>
    workspaceTables[workspaceId].messageChannelMessageAssociation;

  const runJob = (blocklistItemIds: string[]) =>
    job.handle({
      workspaceId: WORKSPACE_ID,
      events: blocklistItemIds.map((recordId) => ({ recordId })),
    } as unknown as BlocklistItemDeleteMessagesJobData);

  const toMessageChannelEntity = (messageChannel: MessageChannelFixture) =>
    ({
      id: messageChannel.id,
      handle: messageChannel.handle,
      connectedAccount: { handleAliases: messageChannel.handleAliases },
    }) as unknown as MessageChannelEntity;

  beforeEach(() => {
    let currentWorkspaceId: string | undefined;

    runInWorkspaceTransaction = jest.fn(
      (work: (transactionScope: WorkspaceTransactionScope) => unknown) =>
        work({
          getRepository: (objectName: string) =>
            workspaceTables[currentWorkspaceId as string][objectName]
              .repository,
        } as unknown as WorkspaceTransactionScope),
    );

    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn(
        async (
          callback: () => Promise<void>,
          authContext: WorkspaceAuthContext,
        ) => {
          currentWorkspaceId = authContext.workspace.id;

          try {
            return await callback();
          } finally {
            currentWorkspaceId = undefined;
          }
        },
      ),
      getRepository: jest.fn(
        (objectName: string) =>
          workspaceTables[currentWorkspaceId as string][objectName].repository,
      ),
      runInWorkspaceTransaction,
    };

    const messageChannelRepository = {
      find: jest.fn(
        async ({
          where,
        }: {
          where: {
            workspaceId: string;
            connectedAccountId?: FindOperator<string[]>;
          };
        }) =>
          MESSAGE_CHANNELS.filter(
            (messageChannel) =>
              messageChannel.workspaceId === where.workspaceId &&
              (!isDefined(where.connectedAccountId) ||
                where.connectedAccountId.value.includes(
                  messageChannel.connectedAccountId,
                )),
          ).map(toMessageChannelEntity),
      ),
    };

    const userWorkspaceRepository = {
      findOne: jest.fn(async ({ where }: { where: { userId: string } }) => ({
        id: `user-workspace-${where.userId}`,
      })),
    };

    const connectedAccountRepository = {
      find: jest.fn(async ({ where }: { where: { userWorkspaceId: string } }) =>
        where.userWorkspaceId === 'user-workspace-user-own'
          ? [{ id: OWN_CHANNEL.connectedAccountId }]
          : [],
      ),
    };

    cleanOrphanMessagesAndThreads = jest.fn();

    job = new BlocklistItemDeleteMessagesJob(
      {
        cleanOrphanMessagesAndThreads,
      } as unknown as MessagingMessageCleanerService,
      workspaceOrmManager as unknown as WorkspaceOrmManager,
      messageChannelRepository as unknown as Repository<MessageChannelEntity>,
      connectedAccountRepository as unknown as Repository<ConnectedAccountEntity>,
      userWorkspaceRepository as unknown as Repository<UserWorkspaceEntity>,
    );
  });

  it('should delete associations of messages sent from or to a blocked address or domain', async () => {
    const participants = [
      buildParticipant({
        id: 'participant-01',
        messageId: 'message-address',
        handle: 'spam@spammer.com',
      }),
      buildParticipant({
        id: 'participant-02',
        messageId: 'message-domain',
        handle: 'sales@blocked.com',
        role: MessageParticipantRole.TO,
      }),
      buildParticipant({
        id: 'participant-03',
        messageId: 'message-subdomain',
        handle: 'news@mail.blocked.com',
      }),
      buildParticipant({
        id: 'participant-04',
        messageId: 'message-cc',
        handle: 'spam@spammer.com',
        role: MessageParticipantRole.CC,
      }),
      buildParticipant({
        id: 'participant-05',
        messageId: 'message-lookalike-domain',
        handle: 'hello@notblocked.com',
      }),
      buildParticipant({
        id: 'participant-06',
        messageId: 'message-trashed-participant',
        handle: 'spam@spammer.com',
        deletedAt: '2026-01-01T00:00:00.000Z',
      }),
    ];

    const messageIds = [
      ...new Set(participants.map(({ messageId }) => messageId as string)),
    ];
    const trashedAssociation = buildAssociation({
      messageChannelId: OWN_CHANNEL.id,
      messageId: 'message-address',
      deletedAt: '2026-01-01T00:00:00.000Z',
    });

    setWorkspaceRecords({
      [WORKSPACE_ID]: {
        blocklist: [
          buildWorkspaceBlocklistItem('spam@spammer.com'),
          buildWorkspaceBlocklistItem('@blocked.com'),
        ],
        messageParticipant: participants,
        messageChannelMessageAssociation: [
          ...buildAssociationsForAllChannels(messageIds).filter(
            ({ id }) => id !== trashedAssociation.id,
          ),
          trashedAssociation,
        ],
      },
    });

    await runJob(['blocklist-spam@spammer.com', 'blocklist-@blocked.com']);

    expect(getIds(getAssociationTable().getRecords())).toEqual(
      getIds([
        trashedAssociation,
        ...buildAssociationsForAllChannels([
          'message-cc',
          'message-lookalike-domain',
          'message-trashed-participant',
        ]),
      ]),
    );
    expect(cleanOrphanMessagesAndThreads).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it("should not match a blocked domain against a channel's own handle and aliases", async () => {
    const messageIds = ['message-from-owner', 'message-from-alias'];

    setWorkspaceRecords({
      [WORKSPACE_ID]: {
        blocklist: [buildWorkspaceBlocklistItem('@acme.com')],
        messageParticipant: [
          buildParticipant({
            id: 'participant-01',
            messageId: 'message-from-owner',
            handle: OWN_CHANNEL.handle,
          }),
          buildParticipant({
            id: 'participant-02',
            messageId: 'message-from-alias',
            handle: OWN_CHANNEL.handleAliases[0],
          }),
        ],
        messageChannelMessageAssociation:
          buildAssociationsForAllChannels(messageIds),
      },
    });

    await runJob(['blocklist-@acme.com']);

    expect(getIds(getAssociationTable().getRecords())).toEqual(
      getIds(
        messageIds.map((messageId) =>
          buildAssociation({ messageChannelId: OWN_CHANNEL.id, messageId }),
        ),
      ),
    );
  });

  it("should only delete associations of the blocking member's channels", async () => {
    const messageIds = ['message-from-spammer'];

    setWorkspaceRecords({
      [WORKSPACE_ID]: {
        blocklist: [
          {
            id: 'blocklist-member',
            handle: 'spam@spammer.com',
            scope: BlocklistScope.WORKSPACE_MEMBER,
            workspaceMemberId: 'workspace-member-own',
            deletedAt: null,
          },
        ],
        workspaceMember: [
          { id: 'workspace-member-own', userId: 'user-own', deletedAt: null },
        ],
        messageParticipant: [
          buildParticipant({
            id: 'participant-01',
            messageId: 'message-from-spammer',
            handle: 'spam@spammer.com',
          }),
        ],
        messageChannelMessageAssociation:
          buildAssociationsForAllChannels(messageIds),
      },
    });

    await runJob(['blocklist-member']);

    expect(getIds(getAssociationTable().getRecords())).toEqual(
      getIds([
        buildAssociation({
          messageChannelId: TEAMMATE_CHANNEL.id,
          messageId: 'message-from-spammer',
        }),
      ]),
    );
  });

  it('should delete matching associations in batches of at most RECORD_DELETE_BATCH_SIZE', async () => {
    const matchingMessageIds = Array.from(
      { length: 2 * RECORD_DELETE_BATCH_SIZE + 300 },
      (_, index) => `message-${String(index).padStart(6, '0')}`,
    );
    const participants = [
      ...matchingMessageIds.map((messageId, index) =>
        buildParticipant({
          id: `participant-from-${String(index).padStart(6, '0')}`,
          messageId,
          handle: 'spam@spammer.com',
        }),
      ),
      ...matchingMessageIds.slice(0, 500).map((messageId, index) =>
        buildParticipant({
          id: `participant-to-${String(index).padStart(6, '0')}`,
          messageId,
          handle: 'spam@spammer.com',
          role: MessageParticipantRole.TO,
        }),
      ),
    ].reverse();
    const unrelatedAssociations = buildAssociationsForAllChannels([
      'message-unrelated',
    ]);
    const otherWorkspaceAssociations = [
      buildAssociation({
        messageChannelId: OTHER_WORKSPACE_CHANNEL.id,
        messageId: 'message-000000',
      }),
    ];

    setWorkspaceRecords({
      [WORKSPACE_ID]: {
        blocklist: [buildWorkspaceBlocklistItem('spam@spammer.com')],
        messageParticipant: participants,
        messageChannelMessageAssociation: [
          ...buildAssociationsForAllChannels(matchingMessageIds),
          ...unrelatedAssociations,
        ],
      },
      [OTHER_WORKSPACE_ID]: {
        messageParticipant: [
          buildParticipant({
            id: 'participant-other-workspace',
            messageId: 'message-000000',
            handle: 'spam@spammer.com',
          }),
        ],
        messageChannelMessageAssociation: otherWorkspaceAssociations,
      },
    });

    await runJob(['blocklist-spam@spammer.com']);

    const associationTable = getAssociationTable();
    const deletedIdsByCall = associationTable.getDeletedIdsByCall();
    const deletedIds = deletedIdsByCall.flat();

    expect(
      deletedIdsByCall.map((deletedIdsOfCall) => deletedIdsOfCall.length),
    ).toEqual([
      RECORD_DELETE_BATCH_SIZE,
      RECORD_DELETE_BATCH_SIZE,
      300,
      RECORD_DELETE_BATCH_SIZE,
      RECORD_DELETE_BATCH_SIZE,
      300,
    ]);
    expect(new Set(deletedIds).size).toBe(deletedIds.length);
    expect(deletedIds.sort()).toEqual(
      getIds(buildAssociationsForAllChannels(matchingMessageIds)),
    );
    expect(runInWorkspaceTransaction).toHaveBeenCalledTimes(6);
    expect(getIds(associationTable.getRecords())).toEqual(
      getIds(unrelatedAssociations),
    );
    expect(
      getIds(getAssociationTable(OTHER_WORKSPACE_ID).getRecords()),
    ).toEqual(getIds(otherWorkspaceAssociations));
    workspaceTables[
      WORKSPACE_ID
    ].messageParticipant.repository.find.mock.calls.forEach(([options]) =>
      expect(options?.take).toBe(RECORD_DELETE_BATCH_SIZE),
    );
  });

  it('should not delete anything when no participant matches', async () => {
    const associations = buildAssociationsForAllChannels(['message-01']);

    setWorkspaceRecords({
      [WORKSPACE_ID]: {
        blocklist: [buildWorkspaceBlocklistItem('spam@spammer.com')],
        messageParticipant: [
          buildParticipant({
            id: 'participant-01',
            messageId: 'message-01',
            handle: 'friend@partner.com',
          }),
        ],
        messageChannelMessageAssociation: associations,
      },
    });

    await runJob(['blocklist-spam@spammer.com']);

    expect(getAssociationTable().repository.delete).not.toHaveBeenCalled();
    expect(getIds(getAssociationTable().getRecords())).toEqual(
      getIds(associations),
    );
    expect(cleanOrphanMessagesAndThreads).toHaveBeenCalledWith(WORKSPACE_ID);
  });

  it('should fail the job without cleaning orphans when a deletion fails', async () => {
    setWorkspaceRecords({
      [WORKSPACE_ID]: {
        blocklist: [buildWorkspaceBlocklistItem('spam@spammer.com')],
        messageParticipant: [
          buildParticipant({
            id: 'participant-01',
            messageId: 'message-01',
            handle: 'spam@spammer.com',
          }),
        ],
        messageChannelMessageAssociation: buildAssociationsForAllChannels([
          'message-01',
        ]),
      },
    });

    const deletionError = new Error('Deletion failed');

    getAssociationTable().repository.delete.mockRejectedValueOnce(
      deletionError,
    );

    await expect(runJob(['blocklist-spam@spammer.com'])).rejects.toThrow(
      deletionError,
    );
    expect(cleanOrphanMessagesAndThreads).not.toHaveBeenCalled();
  });
});
