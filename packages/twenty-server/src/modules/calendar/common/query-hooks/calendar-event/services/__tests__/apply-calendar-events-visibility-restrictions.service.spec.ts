import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { CalendarChannelVisibility } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ApplyCalendarEventsVisibilityRestrictionsService } from 'src/modules/calendar/common/query-hooks/calendar-event/services/apply-calendar-events-visibility-restrictions.service';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const USER_ID = '20202020-0000-4000-8000-000000000002';
const SHARED_CHANNEL_ID = '20202020-0000-4000-8000-000000000003';
const METADATA_CHANNEL_ID = '20202020-0000-4000-8000-000000000004';
const SHARED_EVENT_ID = '20202020-0000-4000-8000-000000000005';
const METADATA_EVENT_ID = '20202020-0000-4000-8000-000000000006';
const UNASSOCIATED_EVENT_ID = '20202020-0000-4000-8000-000000000007';

const buildCalendarEvent = (id: string) =>
  ({
    id,
    title: 'Board meeting',
    description: 'Quarterly numbers',
  }) as CalendarEventWorkspaceEntity;

const buildService = ({
  connectedAccounts = [],
}: {
  connectedAccounts?: Partial<ConnectedAccountEntity>[];
} = {}) => {
  const associationRepository = {
    find: jest.fn().mockResolvedValue([
      {
        calendarEventId: SHARED_EVENT_ID,
        calendarChannelId: SHARED_CHANNEL_ID,
      },
      {
        calendarEventId: METADATA_EVENT_ID,
        calendarChannelId: METADATA_CHANNEL_ID,
      },
    ]),
  };

  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(
      async (callback: () => Promise<unknown>) => callback(),
    ),
    getRepository: jest.fn().mockReturnValue(associationRepository),
  } as unknown as WorkspaceOrmManager;

  const connectedAccountRepository = {
    find: jest.fn().mockResolvedValue(connectedAccounts),
  } as unknown as Repository<ConnectedAccountEntity>;

  const userWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue({ id: 'user-workspace-id' }),
  } as unknown as Repository<UserWorkspaceEntity>;

  const calendarChannelRepository = {
    find: jest.fn().mockResolvedValue([
      {
        id: SHARED_CHANNEL_ID,
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      },
      {
        id: METADATA_CHANNEL_ID,
        visibility: CalendarChannelVisibility.METADATA,
      },
    ]),
  } as unknown as Repository<CalendarChannelEntity>;

  return new ApplyCalendarEventsVisibilityRestrictionsService(
    workspaceOrmManager,
    connectedAccountRepository,
    userWorkspaceRepository,
    calendarChannelRepository,
  );
};

describe('ApplyCalendarEventsVisibilityRestrictionsService', () => {
  it('keeps shared events and masks metadata-only and unassociated events in place', async () => {
    const calendarEvents = [
      buildCalendarEvent(SHARED_EVENT_ID),
      buildCalendarEvent(METADATA_EVENT_ID),
      buildCalendarEvent(UNASSOCIATED_EVENT_ID),
    ];
    const originalNodes = [...calendarEvents];

    await buildService().applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      WORKSPACE_ID,
      USER_ID,
    );

    expect(calendarEvents).toEqual(originalNodes);
    expect(originalNodes[0]).toMatchObject({
      title: 'Board meeting',
      description: 'Quarterly numbers',
    });
    expect(originalNodes[1]).toMatchObject({
      title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    });
    expect(originalNodes[2]).toMatchObject({
      title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    });
  });

  it('masks an unassociated event when no user is provided', async () => {
    const calendarEvent = buildCalendarEvent(UNASSOCIATED_EVENT_ID);

    await buildService().applyCalendarEventsVisibilityRestrictions(
      [calendarEvent],
      WORKSPACE_ID,
    );

    expect(calendarEvent).toMatchObject({
      title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
    });
  });

  it('keeps metadata-only events visible to the owner of the channel', async () => {
    const calendarEvent = buildCalendarEvent(METADATA_EVENT_ID);

    await buildService({
      connectedAccounts: [{ id: 'connected-account-id' }],
    }).applyCalendarEventsVisibilityRestrictions(
      [calendarEvent],
      WORKSPACE_ID,
      USER_ID,
    );

    expect(calendarEvent).toMatchObject({
      title: 'Board meeting',
      description: 'Quarterly numbers',
    });
  });
});
