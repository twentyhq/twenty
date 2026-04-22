import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { CalendarChannelVisibility } from 'twenty-shared/types';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

import { ApplyCalendarEventsVisibilityRestrictionsService } from './apply-calendar-events-visibility-restrictions.service';

const createMockCalendarEvent = (
  id: string,
  title: string,
  description: string,
): CalendarEventWorkspaceEntity => ({
  id,
  title,
  description,
  isCanceled: false,
  isFullDay: false,
  startsAt: '2024-03-20T10:00:00Z',
  endsAt: '2024-03-20T11:00:00Z',
  location: '',
  conferenceLink: {
    primaryLinkLabel: '',
    primaryLinkUrl: '',
    secondaryLinks: null,
  },
  externalCreatedAt: '2024-03-20T09:00:00Z',
  externalUpdatedAt: '2024-03-20T09:00:00Z',
  deletedAt: null,
  createdAt: '2024-03-20T09:00:00Z',
  updatedAt: '2024-03-20T09:00:00Z',
  iCalUid: '',
  conferenceSolution: '',
  calendarChannelEventAssociations: [],
  calendarEventParticipants: [],
});

describe('ApplyCalendarEventsVisibilityRestrictionsService', () => {
  let service: ApplyCalendarEventsVisibilityRestrictionsService;

  const mockCalendarEventAssociationRepository = {
    find: jest.fn(),
  };

  const mockWorkspaceMemberRepository = {
    findOneByOrFail: jest.fn(),
  };

  const mockConnectedAccountRepository = {
    find: jest.fn(),
  };

  const mockUserWorkspaceRepository = {
    findOne: jest.fn(),
  };

  const mockCalendarChannelRepository = {
    find: jest.fn(),
  };

  const mockGlobalWorkspaceOrmManager = {
    getRepository: jest.fn().mockImplementation((workspaceId, name) => {
      if (name === 'calendarChannelEventAssociation') {
        return mockCalendarEventAssociationRepository;
      }
      if (name === 'workspaceMember') {
        return mockWorkspaceMemberRepository;
      }
    }),
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((fn: () => any, _authContext?: any) => fn()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyCalendarEventsVisibilityRestrictionsService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: mockConnectedAccountRepository,
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: mockUserWorkspaceRepository,
        },
        {
          provide: getRepositoryToken(CalendarChannelEntity),
          useValue: mockCalendarChannelRepository,
        },
      ],
    }).compile();

    service = module.get<ApplyCalendarEventsVisibilityRestrictionsService>(
      ApplyCalendarEventsVisibilityRestrictionsService,
    );

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return calendar event without obfuscated title and description if the visibility is SHARE_EVERYTHING', async () => {
    const calendarEvents = [
      createMockCalendarEvent('1', 'Test Event', 'Test Description'),
    ];

    mockCalendarEventAssociationRepository.find.mockResolvedValue([
      {
        calendarEventId: '1',
        calendarChannelId: '1',
      },
    ]);

    mockCalendarChannelRepository.find.mockResolvedValue([
      {
        id: '1',
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      },
    ]);

    const result = await service.applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual(calendarEvents);
    expect(
      result.every(
        (item) =>
          item.title !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
          item.description !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(true);
    expect(mockConnectedAccountRepository.find).not.toHaveBeenCalled();
  });

  it('should return calendar event with obfuscated title and description if the visibility is METADATA', async () => {
    const calendarEvents = [
      createMockCalendarEvent('1', 'Test Event', 'Test Description'),
    ];

    mockCalendarEventAssociationRepository.find.mockResolvedValue([
      {
        calendarEventId: '1',
        calendarChannelId: '1',
      },
    ]);

    mockCalendarChannelRepository.find.mockResolvedValue([
      {
        id: '1',
        visibility: CalendarChannelVisibility.METADATA,
      },
    ]);

    mockUserWorkspaceRepository.findOne.mockResolvedValue({
      id: 'user-workspace-id',
    });

    mockConnectedAccountRepository.find.mockResolvedValue([]);

    const result = await service.applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([
      {
        ...calendarEvents[0],
        title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
  });

  it('should return calendar event without obfuscated title and description if the workspace member is the owner of the calendar event', async () => {
    const calendarEvents = [
      createMockCalendarEvent('1', 'Test Event', 'Test Description'),
    ];

    mockCalendarEventAssociationRepository.find.mockResolvedValue([
      {
        calendarEventId: '1',
        calendarChannelId: '1',
      },
    ]);

    mockCalendarChannelRepository.find.mockResolvedValue([
      {
        id: '1',
        visibility: CalendarChannelVisibility.METADATA,
      },
    ]);

    mockUserWorkspaceRepository.findOne.mockResolvedValue({
      id: 'user-workspace-id',
    });

    mockConnectedAccountRepository.find.mockResolvedValue([{ id: '1' }]);

    const result = await service.applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual(calendarEvents);
    expect(
      result.every(
        (item) =>
          item.title !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED &&
          item.description !== FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      ),
    ).toBe(true);
  });

  it('should not return calendar event if visibility is not SHARE_EVERYTHING or METADATA and the workspace member is not the owner of the calendar event', async () => {
    const calendarEvents = [
      createMockCalendarEvent('1', 'Test Event', 'Test Description'),
    ];

    mockCalendarEventAssociationRepository.find.mockResolvedValue([
      {
        calendarEventId: '1',
        calendarChannelId: '1',
      },
    ]);

    mockCalendarChannelRepository.find.mockResolvedValue([
      {
        id: '1',
      },
    ]);

    mockUserWorkspaceRepository.findOne.mockResolvedValue({
      id: 'user-workspace-id',
    });

    mockConnectedAccountRepository.find.mockResolvedValue([]);

    const result = await service.applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([]);
  });

  it('should return all calendar events with the right visibility', async () => {
    const calendarEvents = [
      createMockCalendarEvent('1', 'Event 1', 'Description 1'),
      createMockCalendarEvent('2', 'Event 2', 'Description 2'),
      createMockCalendarEvent('3', 'Event 3', 'Description 3'),
    ];

    mockUserWorkspaceRepository.findOne.mockResolvedValue({
      id: 'user-workspace-id',
    });

    mockCalendarEventAssociationRepository.find.mockResolvedValue([
      {
        calendarEventId: '1',
        calendarChannelId: '1',
      },
      {
        calendarEventId: '2',
        calendarChannelId: '2',
      },
      {
        calendarEventId: '3',
        calendarChannelId: '3',
      },
    ]);

    mockCalendarChannelRepository.find.mockResolvedValue([
      {
        id: '1',
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      },
      {
        id: '2',
        visibility: CalendarChannelVisibility.METADATA,
      },
      {
        id: '3',
        visibility: CalendarChannelVisibility.METADATA,
      },
    ]);

    mockConnectedAccountRepository.find
      .mockResolvedValueOnce([]) // request for calendar event 3
      .mockResolvedValueOnce([{ id: '1' }]); // request for calendar event 2

    const result = await service.applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      'test-workspace-id',
      'user-id',
    );

    expect(result).toEqual([
      calendarEvents[0],
      calendarEvents[1],
      {
        ...calendarEvents[2],
        title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
  });

  it('should return all calendar events with the right visibility when userId is undefined (api key request)', async () => {
    const calendarEvents = [
      createMockCalendarEvent('1', 'Event 1', 'Description 1'),
      createMockCalendarEvent('2', 'Event 2', 'Description 2'),
      createMockCalendarEvent('3', 'Event 3', 'Description 3'),
    ];

    mockCalendarEventAssociationRepository.find.mockResolvedValue([
      {
        calendarEventId: '1',
        calendarChannelId: '1',
      },
      {
        calendarEventId: '2',
        calendarChannelId: '2',
      },
      {
        calendarEventId: '3',
        calendarChannelId: '3',
      },
    ]);

    mockCalendarChannelRepository.find.mockResolvedValue([
      {
        id: '1',
        visibility: CalendarChannelVisibility.SHARE_EVERYTHING,
      },
      {
        id: '2',
        visibility: CalendarChannelVisibility.METADATA,
      },
      {
        id: '3',
        visibility: CalendarChannelVisibility.METADATA,
      },
    ]);

    // userId is undefined (api key request), so connected account check is skipped
    // METADATA events should be obfuscated

    const result = await service.applyCalendarEventsVisibilityRestrictions(
      calendarEvents,
      'test-workspace-id',
      undefined,
    );

    expect(result).toEqual([
      calendarEvents[0],
      {
        ...calendarEvents[1],
        title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
      {
        ...calendarEvents[2],
        title: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
        description: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
      },
    ]);
    expect(mockConnectedAccountRepository.find).not.toHaveBeenCalled();
  });
});
