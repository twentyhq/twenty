import { Test, type TestingModule } from '@nestjs/testing';

import { google } from 'googleapis';
import { MessageFolderImportPolicy } from 'twenty-shared/types';

import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import {
  createMockMessageFolder,
  createRawGmailMessage,
  createThreadGetResponse,
  mockConnectedAccount,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/services/__mocks__/gmail-get-messages.mocks';
import { GmailGetMessagesService } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-get-messages.service';
import { GmailMessagesImportErrorHandler } from 'src/modules/messaging/message-import-manager/drivers/gmail/services/gmail-messages-import-error-handler.service';
import {
  createCountedGmailClient,
  createGmailQuotaCounter,
} from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/__tests__/test-utils/gmail-quota-counter';

const SYNCED_LABEL = 'INBOX';
const NON_SYNCED_LABEL = 'Label_archive';

type MailboxFixture = {
  initialMessageIds: string[];
  rawById: Record<string, ReturnType<typeof createRawGmailMessage>>;
  threadMessageIds: Record<string, string[]>;
};

const buildMailbox = (threadCount: number): MailboxFixture => {
  const initialMessageIds: string[] = [];
  const rawById: Record<string, ReturnType<typeof createRawGmailMessage>> = {};
  const threadMessageIds: Record<string, string[]> = {};

  for (let index = 0; index < threadCount; index++) {
    const threadId = `thread-${index}`;
    const rootId = `root-${index}`;
    const replyId = `reply-${index}`;
    const ancestorId = `ancestor-${index}`;

    rawById[rootId] = createRawGmailMessage({
      id: rootId,
      threadId,
      labelIds: [SYNCED_LABEL],
    });
    rawById[replyId] = createRawGmailMessage({
      id: replyId,
      threadId,
      labelIds: [SYNCED_LABEL],
    });
    rawById[ancestorId] = createRawGmailMessage({
      id: ancestorId,
      threadId,
      labelIds: [NON_SYNCED_LABEL],
    });

    initialMessageIds.push(rootId, replyId);
    threadMessageIds[threadId] = [rootId, replyId, ancestorId];
  }

  return { initialMessageIds, rawById, threadMessageIds };
};

const labelIdsOf = (
  rawById: MailboxFixture['rawById'],
  messageId: string,
): string[] => rawById[messageId]?.labelIds ?? [];

const runBaselineSelectiveSync = async (
  mailbox: MailboxFixture,
  countedClient: ReturnType<typeof createCountedGmailClient>,
): Promise<string[]> => {
  const fetched = await Promise.all(
    mailbox.initialMessageIds.map((id) => countedClient.users.messages.get({ id })),
  );
  const fetchedIds = new Set(mailbox.initialMessageIds);
  const threadIds = [
    ...new Set(fetched.map((response) => (response as { data: { threadId: string } }).data.threadId)),
  ];

  const includedIds = new Set<string>(mailbox.initialMessageIds);
  const missingIds: string[] = [];

  await Promise.all(
    threadIds.map(async (threadId) => {
      const thread = (await countedClient.users.threads.get({ id: threadId })) as {
        data: { messages: { id: string; labelIds: string[] }[] };
      };

      const threadTouchesSynced = thread.data.messages.some((message) =>
        message.labelIds.includes(SYNCED_LABEL),
      );

      if (!threadTouchesSynced) {
        return;
      }

      for (const message of thread.data.messages) {
        if (!fetchedIds.has(message.id)) {
          missingIds.push(message.id);
        }
      }
    }),
  );

  await Promise.all(missingIds.map((id) => countedClient.users.messages.get({ id })));
  for (const id of missingIds) {
    includedIds.add(id);
  }

  return [...includedIds].sort();
};

describe('Gmail SELECTED_FOLDERS quota: baseline vs grouped-thread', () => {
  let service: GmailGetMessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GmailGetMessagesService,
        {
          provide: GoogleOAuth2ClientProvider,
          useValue: { getClient: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: GmailMessagesImportErrorHandler,
          useValue: { handleError: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(GmailGetMessagesService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const threadCount = 3;

  it('imports fewer-or-equal messages while consuming strictly fewer quota units and zero threads.get', async () => {
    const mailbox = buildMailbox(threadCount);

    const baselineCounter = createGmailQuotaCounter();
    const baselineClient = createCountedGmailClient(baselineCounter, {
      messagesGet: ({ id }) => Promise.resolve({ data: mailbox.rawById[id] }),
      threadsGet: ({ id }) =>
        Promise.resolve(
          createThreadGetResponse(
            mailbox.threadMessageIds[id].map((messageId) => ({
              id: messageId,
              labelIds: labelIdsOf(mailbox.rawById, messageId),
            })),
          ),
        ),
    });

    const baselineResult = await runBaselineSelectiveSync(mailbox, baselineClient);

    const groupedCounter = createGmailQuotaCounter();
    const groupedClient = createCountedGmailClient(groupedCounter, {
      messagesGet: ({ id }) => Promise.resolve({ data: mailbox.rawById[id] }),
      threadsGet: () => Promise.reject(new Error('threads.get should not be called')),
    });

    jest.spyOn(google, 'gmail').mockReturnValue(groupedClient as never);

    const groupedResult = await service.getMessages(
      mailbox.initialMessageIds,
      mockConnectedAccount,
      {
        messageFolderImportPolicy: MessageFolderImportPolicy.SELECTED_FOLDERS,
        messageFolders: [
          createMockMessageFolder({ externalId: SYNCED_LABEL, isSynced: true }),
        ],
      } as never,
    );

    const groupedResultIds = groupedResult
      .map((message) => message.externalId)
      .sort();

    const syncedFolderMessageIds = mailbox.initialMessageIds.slice().sort();

    expect(groupedResultIds).toStrictEqual(syncedFolderMessageIds);
    expect(baselineResult).toStrictEqual(
      [
        ...syncedFolderMessageIds,
        ...Array.from({ length: threadCount }, (_, index) => `ancestor-${index}`),
      ].sort(),
    );

    expect(groupedCounter.callCounts['threads.get']).toBe(0);
    expect(baselineCounter.callCounts['threads.get']).toBe(threadCount);

    expect(groupedCounter.totalQuotaUnits()).toBe(threadCount * 2 * 20);
    expect(baselineCounter.totalQuotaUnits()).toBe(
      threadCount * 2 * 20 + threadCount * 40 + threadCount * 20,
    );
    expect(groupedCounter.totalQuotaUnits()).toBeLessThan(
      baselineCounter.totalQuotaUnits(),
    );
  });
});
