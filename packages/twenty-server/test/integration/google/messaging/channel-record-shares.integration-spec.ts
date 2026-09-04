import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  CalendarChannelVisibility,
  ConnectedAccountProvider,
  MessageChannelVisibility,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { In } from 'typeorm';

import { BackfillChannelRecordSharesCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788561701130-backfill-channel-record-shares.command';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { googleCalendarEvent } from 'test/integration/google/mocks/google-calendar-event.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  updateCalendarChannel,
  updateMessageChannel,
} from 'test/integration/utils/query-messaging.util';
import { runCalendarChannelEventsImport } from 'test/integration/utils/run-calendar-channel-events-import.util';
import { runCalendarChannelListFetch } from 'test/integration/utils/run-calendar-channel-list-fetch.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-channel-record-shares@apple.dev';
const SECOND_HANDLE = 'gmail-channel-record-shares-second@apple.dev';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

type ShareableRecord = { recordId: string; objectMetadataId: string };

const sortRecordShares = <TRow extends object>(rows: TRow[]): TRow[] =>
  [...rows].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );

const toComparable = (recordShares: RecordShare[]): RecordShareInput[] =>
  sortRecordShares(
    recordShares.map(
      ({
        recordId,
        objectMetadataId,
        principalId,
        principalType,
        accessLevel,
        rowCause,
        sourceId,
      }) => ({
        recordId,
        objectMetadataId,
        principalId,
        principalType,
        accessLevel,
        rowCause,
        sourceId,
      }),
    ),
  );

const expectedRowsFor = ({
  sourceId,
  records,
}: {
  sourceId: string;
  records: ShareableRecord[];
}): RecordShareInput[] =>
  sortRecordShares(
    records.flatMap(({ recordId, objectMetadataId }) => [
      {
        recordId,
        objectMetadataId,
        principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.APPLICATION,
        sourceId,
      },
      {
        recordId,
        objectMetadataId,
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.READ,
        rowCause: RecordShareRowCause.APPLICATION,
        sourceId,
      },
    ]),
  );

describe('Message channel record shares (integration)', () => {
  const inbox = [gmailMessage()];
  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let secondChannel:
    | Awaited<ReturnType<typeof connectMessagingAccount>>
    | undefined;
  let workspaceOrmManager: WorkspaceOrmManager;
  let recordShareService: RecordShareService;
  let backfillCommand: BackfillChannelRecordSharesCommand;
  let objectMetadataIdByNameSingular: Record<string, string>;

  const findRecordSharesOfRecords = async (
    records: ShareableRecord[],
    sourceIds: string[],
  ): Promise<RecordShare[]> => {
    const recordIdsByObjectMetadataId = new Map<string, string[]>();

    for (const { recordId, objectMetadataId } of records) {
      recordIdsByObjectMetadataId.set(objectMetadataId, [
        ...(recordIdsByObjectMetadataId.get(objectMetadataId) ?? []),
        recordId,
      ]);
    }

    const recordShares = await Promise.all(
      Array.from(recordIdsByObjectMetadataId.entries(), (entry) =>
        recordShareService.findByRecordIds({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: entry[0],
          recordIds: entry[1],
        }),
      ),
    );

    return recordShares
      .flat()
      .filter((recordShare) => sourceIds.includes(recordShare.sourceId));
  };

  const insertStrayRecordShare = async (sourceId: string) => {
    const strayRecord = {
      recordId: randomUUID(),
      objectMetadataId: objectMetadataIdByNameSingular.message,
    };

    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          ...strayRecord,
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.APPLICATION,
          sourceId,
        },
      ],
    });

    return strayRecord;
  };

  const deleteRecordSharesBySourceIds = async (sourceIds: string[]) => {
    for (const sourceId of sourceIds) {
      await recordShareService.deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId,
      });
    }
  };

  const findMessageRecordsOfChannel = async (
    messageChannelId: string,
  ): Promise<ShareableRecord[]> => {
    const associations = await findRecordNodesByFilter<{
      messageId: string;
      message: { messageThreadId: string };
    }>(
      'messageChannelMessageAssociation',
      'messageChannelMessageAssociations',
      'messageId message { messageThreadId }',
      { messageChannelId: { eq: messageChannelId } },
    );

    return [
      ...associations.map(({ messageId }) => ({
        recordId: messageId,
        objectMetadataId: objectMetadataIdByNameSingular.message,
      })),
      ...[
        ...new Set(associations.map(({ message }) => message.messageThreadId)),
      ].map((messageThreadId) => ({
        recordId: messageThreadId,
        objectMetadataId: objectMetadataIdByNameSingular.messageThread,
      })),
    ];
  };

  const findCalendarEventRecordsOfChannel = async (
    calendarChannelId: string,
  ): Promise<ShareableRecord[]> => {
    const associations = await findRecordNodesByFilter<{
      calendarEventId: string;
    }>(
      'calendarChannelEventAssociation',
      'calendarChannelEventAssociations',
      'calendarEventId',
      { calendarChannelId: { eq: calendarChannelId } },
    );

    return associations.map(({ calendarEventId }) => ({
      recordId: calendarEventId,
      objectMetadataId: objectMetadataIdByNameSingular.calendarEvent,
    }));
  };

  const runBackfill = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        backfillCommand.runOnWorkspace({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          options,
          index: 0,
          total: 1,
        }),
      authContext,
    );

  const sourceIds = () =>
    [
      channel.channelId,
      channel.calendarChannelId,
      secondChannel?.channelId,
    ].filter((sourceId): sourceId is string => sourceId !== undefined);

  beforeAll(async () => {
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');
    backfillCommand =
      getAppProviderByClassName<BackfillChannelRecordSharesCommand>(
        'BackfillChannelRecordSharesCommand',
      );

    const objectMetadataItems = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: In(['message', 'messageThread', 'calendarEvent']),
      },
    });

    objectMetadataIdByNameSingular = Object.fromEntries(
      objectMetadataItems.map((objectMetadata) => [
        objectMetadata.nameSingular,
        objectMetadata.id,
      ]),
    );

    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
  }, 120000);

  afterAll(async () => {
    await deleteRecordSharesBySourceIds(sourceIds()).catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
    await secondChannel?.cleanup().catch(() => undefined);
  });

  it('gives the owner FULL and everyone READ on the imported message and its thread', async () => {
    const records = await findMessageRecordsOfChannel(channel.channelId);

    expect(records).toHaveLength(2);

    expect(
      toComparable(
        await findRecordSharesOfRecords(records, [channel.channelId]),
      ),
    ).toEqual(expectedRowsFor({ sourceId: channel.channelId, records }));
  }, 60000);

  it('adds its own rows when a second mailbox imports the same thread', async () => {
    gmail.actAsAccount(SECOND_HANDLE);

    secondChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: SECOND_HANDLE,
    });

    await runMessageChannelSync(secondChannel.channelId);

    const records = await findMessageRecordsOfChannel(secondChannel.channelId);

    expect(sortRecordShares(records)).toEqual(
      sortRecordShares(await findMessageRecordsOfChannel(channel.channelId)),
    );

    expect(
      toComparable(
        await findRecordSharesOfRecords(records, [secondChannel.channelId]),
      ),
    ).toEqual(expectedRowsFor({ sourceId: secondChannel.channelId, records }));
    expect(
      toComparable(
        await findRecordSharesOfRecords(records, [channel.channelId]),
      ),
    ).toEqual(expectedRowsFor({ sourceId: channel.channelId, records }));
  }, 120000);

  it('rebuilds exactly the same rows after a visibility change', async () => {
    const records = await findMessageRecordsOfChannel(channel.channelId);
    const rowsBefore = toComparable(
      await findRecordSharesOfRecords(records, [channel.channelId]),
    );

    expect(rowsBefore).toHaveLength(4);

    const strayRecord = await insertStrayRecordShare(channel.channelId);
    const recordsWithStray = [...records, strayRecord];

    expect(
      await findRecordSharesOfRecords(recordsWithStray, [channel.channelId]),
    ).toHaveLength(5);

    await updateMessageChannel(channel.channelId, {
      visibility: MessageChannelVisibility.METADATA,
    });
    await waitForAllJobsToFinish();

    expect(
      toComparable(
        await findRecordSharesOfRecords(recordsWithStray, [channel.channelId]),
      ),
    ).toEqual(rowsBefore);
  }, 60000);

  it('gives the owner FULL and everyone READ on the imported calendar event', async () => {
    gmail.actAsAccount(HANDLE);
    gmail.serveCalendarEvents([googleCalendarEvent()]);

    await runCalendarChannelListFetch(channel.calendarChannelId);
    await runCalendarChannelEventsImport(channel.calendarChannelId);

    const records = await findCalendarEventRecordsOfChannel(
      channel.calendarChannelId,
    );

    expect(records).toHaveLength(1);

    expect(
      toComparable(
        await findRecordSharesOfRecords(records, [channel.calendarChannelId]),
      ),
    ).toEqual(
      expectedRowsFor({ sourceId: channel.calendarChannelId, records }),
    );
  }, 120000);

  it('rebuilds exactly the same calendar event rows after a calendar visibility change', async () => {
    const records = await findCalendarEventRecordsOfChannel(
      channel.calendarChannelId,
    );
    const rowsBefore = toComparable(
      await findRecordSharesOfRecords(records, [channel.calendarChannelId]),
    );

    expect(rowsBefore).toHaveLength(2);

    const strayRecord = await insertStrayRecordShare(channel.calendarChannelId);
    const recordsWithStray = [...records, strayRecord];

    expect(
      await findRecordSharesOfRecords(recordsWithStray, [
        channel.calendarChannelId,
      ]),
    ).toHaveLength(3);

    await updateCalendarChannel(channel.calendarChannelId, {
      visibility: CalendarChannelVisibility.METADATA,
    });
    await waitForAllJobsToFinish();

    expect(
      toComparable(
        await findRecordSharesOfRecords(recordsWithStray, [
          channel.calendarChannelId,
        ]),
      ),
    ).toEqual(rowsBefore);
  }, 60000);

  it('backfills the same rows as the live writer, skipping writes on a dry run', async () => {
    const records = [
      ...(await findMessageRecordsOfChannel(channel.channelId)),
      ...(await findCalendarEventRecordsOfChannel(channel.calendarChannelId)),
    ];
    const rowsBefore = toComparable(
      await findRecordSharesOfRecords(records, sourceIds()),
    );

    expect(rowsBefore).toHaveLength(10);

    await deleteRecordSharesBySourceIds(sourceIds());
    await runBackfill({ dryRun: true });

    expect(await findRecordSharesOfRecords(records, sourceIds())).toHaveLength(
      0,
    );

    await runBackfill();
    await runBackfill();

    expect(
      toComparable(await findRecordSharesOfRecords(records, sourceIds())),
    ).toEqual(rowsBefore);
  }, 120000);
});
