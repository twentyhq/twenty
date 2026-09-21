import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CalendarEventComposerService } from 'src/modules/calendar/calendar-event-creation-manager/services/calendar-event-composer.service';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const PHIL_USER_WORKSPACE_ID = '20202020-7169-42cf-bc47-1cfef15264b1';
const PHIL_CONNECTED_ACCOUNT_ID = '20202020-cafc-4323-908d-e5b42ad69fdf';
const PHIL_CALENDAR_CHANNEL_ID = '20202020-a40f-4faf-bb9f-c6f9945b8205';

const JONY_CONNECTED_ACCOUNT_ID = '20202020-0cc8-4d60-a3a4-803245698908';

const GOOGLE_CALENDAR_EVENTS_SCOPE =
  'https://www.googleapis.com/auth/calendar.events';

const philContext = {
  type: 'user',
  userWorkspaceId: PHIL_USER_WORKSPACE_ID,
  workspace: { id: WORKSPACE_ID },
} as unknown as WorkspaceAuthContext;

const baseParams = {
  title: 'Integration test event',
  startsAt: '2026-07-01T15:00:00Z',
  endsAt: '2026-07-01T16:00:00Z',
};

const readScopes = async (connectedAccountId: string) => {
  const [{ scopes }] = await global.testDataSource.query(
    `SELECT scopes FROM core."connectedAccount" WHERE id = $1`,
    [connectedAccountId],
  );

  return scopes as string[] | null;
};

const setScopes = async (
  connectedAccountId: string,
  scopes: string[] | null,
) => {
  await global.testDataSource.query(
    `UPDATE core."connectedAccount" SET scopes = $1 WHERE id = $2`,
    [scopes, connectedAccountId],
  );
};

const setCalendarSyncEnabled = async (
  calendarChannelId: string,
  isSyncEnabled: boolean,
) => {
  await global.testDataSource.query(
    `UPDATE core."calendarChannel" SET "isSyncEnabled" = $1 WHERE id = $2`,
    [isSyncEnabled, calendarChannelId],
  );
};

describe('CalendarEventComposerService connected account resolution (integration)', () => {
  let service: CalendarEventComposerService;
  let philScopes: string[] | null;
  let jonyScopes: string[] | null;

  beforeAll(async () => {
    service = getAppProviderByClassName<CalendarEventComposerService>(
      'CalendarEventComposerService',
    );

    philScopes = await readScopes(PHIL_CONNECTED_ACCOUNT_ID);
    jonyScopes = await readScopes(JONY_CONNECTED_ACCOUNT_ID);

    await setScopes(PHIL_CONNECTED_ACCOUNT_ID, [GOOGLE_CALENDAR_EVENTS_SCOPE]);
    await setScopes(JONY_CONNECTED_ACCOUNT_ID, [GOOGLE_CALENDAR_EVENTS_SCOPE]);
  });

  afterAll(async () => {
    await setScopes(PHIL_CONNECTED_ACCOUNT_ID, philScopes);
    await setScopes(JONY_CONNECTED_ACCOUNT_ID, jonyScopes);
  });

  it('creates from the named account on its synced calendar', async () => {
    const result = await service.composeCalendarEvent(
      { ...baseParams, connectedAccountId: PHIL_CONNECTED_ACCOUNT_ID },
      philContext,
    );

    expect(result.success).toBe(true);
    expect(result.success && result.data.connectedAccount.id).toBe(
      PHIL_CONNECTED_ACCOUNT_ID,
    );
    expect(result.success && result.data.calendarChannel.id).toBe(
      PHIL_CALENDAR_CHANNEL_ID,
    );
  });

  it("creates from the caller's own account when none is named", async () => {
    const result = await service.composeCalendarEvent(baseParams, philContext);

    expect(result.success).toBe(true);
    expect(result.success && result.data.connectedAccount.id).toBe(
      PHIL_CONNECTED_ACCOUNT_ID,
    );
  });

  it("refuses a teammate's private account", async () => {
    const result = await service.composeCalendarEvent(
      { ...baseParams, connectedAccountId: JONY_CONNECTED_ACCOUNT_ID },
      philContext,
    );

    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('is not usable by this caller'),
    });
  });

  it('asks to reconnect an account missing the calendar scope', async () => {
    await setScopes(PHIL_CONNECTED_ACCOUNT_ID, ['email']);

    try {
      const result = await service.composeCalendarEvent(
        { ...baseParams, connectedAccountId: PHIL_CONNECTED_ACCOUNT_ID },
        philContext,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining(
          `missing permissions (${GOOGLE_CALENDAR_EVENTS_SCOPE})`,
        ),
      });
    } finally {
      await setScopes(PHIL_CONNECTED_ACCOUNT_ID, [
        GOOGLE_CALENDAR_EVENTS_SCOPE,
      ]);
    }
  });

  it('refuses an account whose calendar sync is off', async () => {
    await setCalendarSyncEnabled(PHIL_CALENDAR_CHANNEL_ID, false);

    try {
      const result = await service.composeCalendarEvent(
        { ...baseParams, connectedAccountId: PHIL_CONNECTED_ACCOUNT_ID },
        philContext,
      );

      expect(result).toEqual({
        success: false,
        error: expect.stringContaining(
          'No connected account with calendar sync enabled',
        ),
      });
    } finally {
      await setCalendarSyncEnabled(PHIL_CALENDAR_CHANNEL_ID, true);
    }
  });
});
