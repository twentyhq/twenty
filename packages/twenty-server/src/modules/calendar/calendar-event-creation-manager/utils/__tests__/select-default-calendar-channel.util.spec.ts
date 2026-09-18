import { ConnectedAccountProvider } from 'twenty-shared/types';

import { selectDefaultCalendarChannel } from 'src/modules/calendar/calendar-event-creation-manager/utils/select-default-calendar-channel.util';

const GOOGLE_CALENDAR_EVENTS_SCOPE =
  'https://www.googleapis.com/auth/calendar.events';

const CALLER_USER_WORKSPACE_ID = 'caller-user-workspace-id';
const TEAMMATE_USER_WORKSPACE_ID = 'teammate-user-workspace-id';

const buildCalendarChannel = ({
  connectedAccountId,
  userWorkspaceId = TEAMMATE_USER_WORKSPACE_ID,
  scopes = [GOOGLE_CALENDAR_EVENTS_SCOPE],
  visibility = 'workspace',
  archivedAt = null,
}: {
  connectedAccountId: string;
  userWorkspaceId?: string;
  scopes?: string[];
  visibility?: 'workspace' | 'user';
  archivedAt?: Date | null;
}) => ({
  connectedAccountId,
  connectedAccount: {
    id: connectedAccountId,
    provider: ConnectedAccountProvider.GOOGLE,
    userWorkspaceId,
    scopes,
    visibility,
    archivedAt,
  },
});

describe('selectDefaultCalendarChannel', () => {
  it('skips an older account that cannot create calendar events', () => {
    const calendarChannel = selectDefaultCalendarChannel({
      calendarChannels: [
        buildCalendarChannel({
          connectedAccountId: 'stale-scopes-account',
          scopes: ['email', 'profile'],
        }),
        buildCalendarChannel({ connectedAccountId: 'calendar-write-account' }),
      ],
    });

    expect(calendarChannel?.connectedAccountId).toBe('calendar-write-account');
  });

  it('skips archived accounts', () => {
    const calendarChannel = selectDefaultCalendarChannel({
      calendarChannels: [
        buildCalendarChannel({
          connectedAccountId: 'archived-account',
          archivedAt: new Date('2026-09-01'),
        }),
        buildCalendarChannel({ connectedAccountId: 'active-account' }),
      ],
    });

    expect(calendarChannel?.connectedAccountId).toBe('active-account');
  });

  it("prefers the caller's own account over an older teammate account", () => {
    const calendarChannel = selectDefaultCalendarChannel({
      calendarChannels: [
        buildCalendarChannel({ connectedAccountId: 'teammate-account' }),
        buildCalendarChannel({
          connectedAccountId: 'caller-account',
          userWorkspaceId: CALLER_USER_WORKSPACE_ID,
        }),
      ],
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
    });

    expect(calendarChannel?.connectedAccountId).toBe('caller-account');
  });

  it("never picks a teammate's private account for the caller", () => {
    const calendarChannel = selectDefaultCalendarChannel({
      calendarChannels: [
        buildCalendarChannel({
          connectedAccountId: 'private-teammate-account',
          visibility: 'user',
        }),
        buildCalendarChannel({ connectedAccountId: 'shared-teammate-account' }),
      ],
      userWorkspaceId: CALLER_USER_WORKSPACE_ID,
    });

    expect(calendarChannel?.connectedAccountId).toBe('shared-teammate-account');
  });

  it('returns nothing when no account can create calendar events', () => {
    const calendarChannel = selectDefaultCalendarChannel({
      calendarChannels: [
        buildCalendarChannel({
          connectedAccountId: 'stale-scopes-account',
          scopes: ['email', 'profile'],
        }),
      ],
    });

    expect(calendarChannel).toBeUndefined();
  });
});
