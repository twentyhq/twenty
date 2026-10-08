import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { MessagingMessageParticipantService } from 'src/modules/messaging/message-participant-manager/services/messaging-message-participant.service';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { raiseSqlState } from 'test/integration/utils/raise-sql-state.util';
import { readBackendState } from 'test/integration/utils/read-backend-state.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-transient-database-error@apple.dev';

// The error has to be raised by Postgres itself: an Error built in the jest
// realm is not an `instanceof Error` for the application realm the app runs in.
// The mock inbox is fixed at setup time, so every test needs its own message
// served out of it rather than a freshly built one.
const INBOX_MESSAGES = Array.from({ length: 2 }, () =>
  gmailMessage({ from: `sender-${randomUUID()}@acme.com`, to: HANDLE }),
);

describe('Messaging import transient database errors (integration)', () => {
  const google = setupGoogleMock({ handle: HANDLE, inbox: INBOX_MESSAGES });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let messageParticipantService: MessagingMessageParticipantService;

  const serveInboundMessage = async (messageIndex: number): Promise<void> => {
    google.serveMessageList([INBOX_MESSAGES[messageIndex]]);

    await resetMessageChannelSyncState(channel.channelId, '');
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    messageParticipantService =
      getAppProviderByClassName<MessagingMessageParticipantService>(
        'MessagingMessageParticipantService',
      );
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should reschedule the message channel instead of failing it when the connection is killed by the idle-in-transaction timeout', async () => {
    await serveInboundMessage(0);

    jest
      .spyOn(messageParticipantService, 'saveMessageParticipants')
      .mockImplementation(
        async (_participants, _workspaceId, transactionScope) => {
          await transactionScope.executeRawQuery(
            raiseSqlState(
              POSTGRESQL_ERROR_CODES.IDLE_IN_TRANSACTION_SESSION_TIMEOUT,
            ),
          );

          return [];
        },
      );

    await runMessageChannelSync(channel.channelId);

    const channelState = await queryMessageChannel(channel);

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.syncStage).toBe(
      MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
    );
    expect(channelState.syncStatus).toBe(MessageChannelSyncStatus.ONGOING);
  }, 120000);

  it('should have ended the import transaction before the message participants are matched', async () => {
    await serveInboundMessage(1);

    const saveMessageParticipants =
      messageParticipantService.saveMessageParticipants.bind(
        messageParticipantService,
      );
    const matchMessageParticipants =
      messageParticipantService.matchMessageParticipants.bind(
        messageParticipantService,
      );

    let importBackendPid: number | undefined;
    let importBackendStateWhileMatching: string | undefined;

    jest
      .spyOn(messageParticipantService, 'saveMessageParticipants')
      .mockImplementation(
        async (participants, workspaceId, transactionScope) => {
          const backends = await transactionScope.executeRawQuery(
            'SELECT pg_backend_pid() AS pid',
          );

          importBackendPid = Number(backends[0].pid);

          return saveMessageParticipants(
            participants,
            workspaceId,
            transactionScope,
          );
        },
      );

    jest
      .spyOn(messageParticipantService, 'matchMessageParticipants')
      .mockImplementation(async (args) => {
        importBackendStateWhileMatching = await readBackendState(
          importBackendPid ?? 0,
        );

        return matchMessageParticipants(args);
      });

    await runMessageChannelSync(channel.channelId);

    expect(importBackendPid).toEqual(expect.any(Number));
    expect(importBackendStateWhileMatching).toBeDefined();
    expect(importBackendStateWhileMatching).not.toBe('idle in transaction');
  }, 120000);
});
