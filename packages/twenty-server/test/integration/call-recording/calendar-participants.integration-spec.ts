import { randomUUID } from 'node:crypto';

import { In } from 'typeorm';
import { type EventEmitter2 } from '@nestjs/event-emitter';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

import { type AddRecordingCalendarParticipantsCommand } from 'src/database/commands/upgrade-version-command/2-49/2-49-workspace-command-1792153361513-add-recording-calendar-participants.command';
import { type TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type CalendarEventParticipantService } from 'src/modules/calendar/calendar-event-participant-manager/services/calendar-event-participant.service';
import { buildCalendarEventParticipantSaveOperations } from 'src/modules/calendar/calendar-event-participant-manager/utils/build-calendar-event-participant-save-operations.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type CallRecordingCalendarParticipantService } from 'src/modules/call-recording/services/call-recording-calendar-participant.service';

import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;
const SCHEMA = getWorkspaceSchemaName(WORKSPACE_ID);

describe('Recording calendar participants (integration)', () => {
  let service: CallRecordingCalendarParticipantService;
  let workspaceOrmManager: WorkspaceOrmManager;
  let application: ApplicationEntity;
  let calendarEventIds: string[];
  let callRecordingIds: string[];

  const sync = () =>
    service.syncParticipants({ workspaceId: WORKSPACE_ID, callRecordingIds });
  const findParticipants = () =>
    findRecordNodesByFilter<CalendarEventParticipantWorkspaceEntity>(
      'calendarEventParticipant',
      'calendarEventParticipants',
      'id calendarEventId callRecordingId applicationId handle displayName responseStatus personId workspaceMemberId',
      { calendarEventId: { in: calendarEventIds } },
    );
  const updateRecording = async (data: Record<string, unknown>) => {
    const keys = Object.keys(data);
    await global.testDataSource.query(
      `UPDATE "${SCHEMA}"."callRecording" SET ${keys.map((key, index) => `"${key}" = $${index + 2}`).join(', ')} WHERE id = $1`,
      [callRecordingIds[0], ...Object.values(data)],
    );
  };

  beforeAll(async () => {
    service = getAppProviderByClassName(
      'CallRecordingCalendarParticipantService',
    );
    workspaceOrmManager = getAppProviderByClassName('WorkspaceOrmManager');
    application = await getCoreRepository<ApplicationEntity>(
      ApplicationEntity,
    ).findOneOrFail({ where: { workspaceId: WORKSPACE_ID } });
  });

  beforeEach(async () => {
    calendarEventIds = [randomUUID(), randomUUID()];
    callRecordingIds = [randomUUID()];
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."calendarEvent" (id, title) SELECT unnest($1::uuid[]), 'Recording participant test'`,
      [calendarEventIds],
    );
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."callRecording" (id, "calendarEventId", "applicationId", "externalBotId", status, "recordingRequestStatus") VALUES ($1, $2, $3, 'scheduled-bot', 'SCHEDULED', 'REQUESTED')`,
      [callRecordingIds[0], calendarEventIds[0], application.id],
    );
  });

  afterEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."callRecording" WHERE id = ANY($1::uuid[])`,
      [callRecordingIds],
    );
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."calendarEvent" WHERE id = ANY($1::uuid[])`,
      [calendarEventIds],
    );
  });

  it('creates a real participant only after a bot is scheduled', async () => {
    await updateRecording({ externalBotId: null });
    await sync();
    expect(await findParticipants()).toEqual([]);

    await updateRecording({ externalBotId: 'scheduled-bot' });
    await sync();
    expect(await findParticipants()).toEqual([
      expect.objectContaining({
        calendarEventId: calendarEventIds[0],
        callRecordingId: callRecordingIds[0],
        applicationId: application.id,
        handle: application.name,
        displayName: application.name,
        responseStatus: 'ACCEPTED',
        personId: null,
        workspaceMemberId: null,
      }),
    ]);
  });

  it('keeps one participant per bot under concurrent delivery and multiple bots from the same app', async () => {
    await Promise.all([sync(), sync(), sync()]);
    const [participant] = await findParticipants();
    expect(await findParticipants()).toHaveLength(1);
    await sync();
    expect((await findParticipants())[0].id).toBe(participant.id);

    const secondCallRecordingId = randomUUID();
    callRecordingIds.push(secondCallRecordingId);
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."callRecording" (id, "calendarEventId", "applicationId", "externalBotId", status) VALUES ($1, $2, $3, 'second-bot', 'SCHEDULED')`,
      [secondCallRecordingId, calendarEventIds[0], application.id],
    );
    await sync();
    expect(
      (await findParticipants())
        .map(({ callRecordingId }) => callRecordingId)
        .sort(),
    ).toEqual([...callRecordingIds].sort());
  });

  it('moves the existing participant when the recording changes meetings', async () => {
    await sync();
    const [participant] = await findParticipants();
    await updateRecording({ calendarEventId: calendarEventIds[1] });
    await sync();
    expect(await findParticipants()).toEqual([
      expect.objectContaining({
        id: participant.id,
        calendarEventId: calendarEventIds[1],
      }),
    ]);
  });

  it.each([
    { recordingRequestStatus: 'CANCELED' },
    { externalBotId: null },
    { deletedAt: new Date().toISOString() },
    { calendarEventId: null },
  ])(
    'removes the bot participant after %j and recreates it when rescheduled',
    async (data) => {
      await sync();
      await updateRecording(data);
      await sync();
      expect(await findParticipants()).toEqual([]);

      await updateRecording({
        recordingRequestStatus: 'REQUESTED',
        externalBotId: 'rescheduled-bot',
        deletedAt: null,
        calendarEventId: calendarEventIds[0],
      });
      await sync();
      expect(await findParticipants()).toHaveLength(1);
    },
  );

  it('preserves the application participant during provider participant reconciliation', async () => {
    await sync();
    const [participant] = await findParticipants();
    const participantService =
      getAppProviderByClassName<CalendarEventParticipantService>(
        'CalendarEventParticipantService',
      );

    await workspaceOrmManager.executeInWorkspaceContext(async () => {
      const repository =
        workspaceOrmManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
          'calendarEventParticipant',
          { shouldBypassPermissionChecks: true },
        );
      const existingParticipants = await repository.find({
        where: { calendarEventId: In(calendarEventIds) },
      });
      const operations = buildCalendarEventParticipantSaveOperations({
        existingParticipants,
        fetchedParticipants: [],
        shouldSkipUnchangedParticipants: false,
      });
      await workspaceOrmManager.runInWorkspaceTransaction((transactionScope) =>
        participantService.writeCalendarEventParticipants({
          operations,
          transactionScope,
        }),
      );
    }, buildSystemAuthContext(WORKSPACE_ID));

    expect(await findParticipants()).toEqual([
      expect.objectContaining({ id: participant.id }),
    ]);
  });

  it('backfills existing scheduled bots on upgrade and is idempotent', async () => {
    const command =
      getAppProviderByClassName<AddRecordingCalendarParticipantsCommand>(
        'AddRecordingCalendarParticipantsCommand',
      );
    const args = { workspaceId: WORKSPACE_ID, options: {}, index: 0, total: 1 };
    const runUpgrade = (dryRun = false) =>
      workspaceOrmManager.executeInWorkspaceContext(
        () => command.up({ ...args, options: { dryRun } }),
        buildSystemAuthContext(WORKSPACE_ID),
      );

    await runUpgrade(true);
    expect(await findParticipants()).toEqual([]);
    await runUpgrade();
    const [participant] = await findParticipants();
    expect(participant).toMatchObject({
      callRecordingId: callRecordingIds[0],
      applicationId: application.id,
    });
    await runUpgrade();
    expect(await findParticipants()).toEqual([
      expect.objectContaining({ id: participant.id }),
    ]);
    await workspaceOrmManager.executeInWorkspaceContext(
      () => command.down(args),
      buildSystemAuthContext(WORKSPACE_ID),
    );
    try {
      const columns = await global.testDataSource.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = 'calendarEventParticipant' AND column_name = 'callRecordingId'`,
        [SCHEMA],
      );
      expect(columns).toEqual([]);
      await workspaceOrmManager.executeInWorkspaceContext(
        () => command.down(args),
        buildSystemAuthContext(WORKSPACE_ID),
      );
    } finally {
      await runUpgrade();
    }
    expect(await findParticipants()).toEqual([
      expect.objectContaining({
        callRecordingId: callRecordingIds[0],
        applicationId: application.id,
      }),
    ]);
  }, 60000);

  it('returns the app through timeline participants without a separate recording projection', async () => {
    await sync();
    const [{ id: personId }] = await global.testDataSource.query(
      `SELECT id FROM "${SCHEMA}".person LIMIT 1`,
    );
    const [{ id: workspaceMemberId }] = await global.testDataSource.query(
      `SELECT id FROM "${SCHEMA}"."workspaceMember" LIMIT 1`,
    );
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."calendarEventParticipant" ("calendarEventId", "personId", handle) VALUES ($1, $2, 'human@example.com')`,
      [calendarEventIds[0], personId],
    );
    const timelineService =
      getAppProviderByClassName<TimelineCalendarEventService>(
        'TimelineCalendarEventService',
      );
    const result = await timelineService.getCalendarEventsFromPersonIds({
      workspaceId: WORKSPACE_ID,
      currentWorkspaceMemberId: workspaceMemberId,
      personIds: [personId],
      page: 1,
      pageSize: 100,
    });
    const event = result.timelineCalendarEvents.find(
      ({ id }) => id === calendarEventIds[0],
    );

    expect(event?.participants).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          applicationId: application.id,
          displayName: application.name,
          id: expect.any(String),
        }),
      ]),
    );
    expect(event).not.toHaveProperty('callRecordings');
  });

  it('synchronizes database events from current state and ignores stale scheduling events after cancellation', async () => {
    const eventEmitter =
      getAppProviderByClassName<EventEmitter2>('EventEmitter');
    const cache = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    const { flatObjectMetadataMaps } = await cache.getOrRecompute(
      WORKSPACE_ID,
      ['flatObjectMetadataMaps'],
    );
    const recording = await workspaceOrmManager.executeInWorkspaceContext(
      () =>
        workspaceOrmManager
          .getRepository<CallRecordingWorkspaceEntity>('callRecording', {
            shouldBypassPermissionChecks: true,
          })
          .findOneByOrFail({ id: callRecordingIds[0] }),
      buildSystemAuthContext(WORKSPACE_ID),
    );
    const createdEvent = {
      name: 'callRecording.created',
      workspaceId: WORKSPACE_ID,
      objectMetadata:
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.callRecording.universalIdentifier
        ],
      events: [{ recordId: recording.id, properties: { after: recording } }],
    };

    await eventEmitter.emitAsync(createdEvent.name, createdEvent);
    expect(await findParticipants()).toHaveLength(1);
    await updateRecording({ recordingRequestStatus: 'CANCELED' });
    await eventEmitter.emitAsync('callRecording.updated', {
      ...createdEvent,
      name: 'callRecording.updated',
      events: [
        {
          recordId: recording.id,
          properties: {
            before: recording,
            after: { ...recording, recordingRequestStatus: 'CANCELED' },
            updatedFields: ['recordingRequestStatus'],
          },
        },
      ],
    });
    expect(await findParticipants()).toEqual([]);
    await eventEmitter.emitAsync(createdEvent.name, createdEvent);
    expect(await findParticipants()).toEqual([]);
  });
});
