import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CalendarFetchEventsService } from 'src/modules/calendar/calendar-event-import-manager/services/calendar-fetch-events.service';

const mockCalendarChannelSyncStatusService = {
  markAsCalendarEventListFetchOngoing: jest.fn(),
  markAsCalendarEventListFetchPending: jest.fn(),
  markAsCalendarEventsImportPending: jest.fn(),
};

const mockGetCalendarEventsService = {
  getCalendarEvents: jest.fn(),
};

const mockCalendarChannelDataAccessService = {
  update: jest.fn(),
};

const mockCalendarAccountAuthenticationService = {
  validateAndRefreshConnectedAccountAuthentication: jest
    .fn()
    .mockResolvedValue({
      accessToken: 'fresh-access-token',
      refreshToken: 'fresh-refresh-token',
    }),
};

const mockCalendarEventsImportService = {
  processCalendarEventsImport: jest.fn(),
};

const mockCalendarEventImportErrorHandlerService = {
  handleDriverException: jest.fn(),
};

const mockCacheStorage = {
  setAdd: jest.fn(),
};

const mockGlobalWorkspaceOrmManager = {
  executeInWorkspaceContext: jest.fn(async (callback: () => Promise<void>) => {
    await callback();
  }),
};

const workspaceId = 'workspace-123';

const baseConnectedAccount = {
  id: 'account-123',
  provider: 'google',
  refreshToken: 'refresh-token',
  accessToken: 'access-token',
  handle: 'test@example.com',
} as unknown as ConnectedAccountWorkspaceEntity;

const createCalendarChannel = (
  syncCursor: string | null,
): CalendarChannelWorkspaceEntity =>
  ({
    id: 'channel-123',
    syncCursor,
    connectedAccountId: 'account-123',
  }) as unknown as CalendarChannelWorkspaceEntity;

describe('CalendarFetchEventsService', () => {
  let service: CalendarFetchEventsService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetCalendarEventsService.getCalendarEvents.mockResolvedValue({
      fullEvents: true,
      calendarEvents: [{ id: 'event-1' }],
      nextSyncCursor: 'new-cursor-abc',
    });

    service = new CalendarFetchEventsService(
      mockCacheStorage as any,
      mockGlobalWorkspaceOrmManager as any,
      mockCalendarChannelDataAccessService as any,
      mockCalendarChannelSyncStatusService as any,
      mockGetCalendarEventsService as any,
      mockCalendarEventImportErrorHandlerService as any,
      mockCalendarEventsImportService as any,
      mockCalendarAccountAuthenticationService as any,
    );
  });

  describe('syncCursor handling (backwards compatibility)', () => {
    it('should perform full sync when syncCursor is null (core schema)', async () => {
      const calendarChannel = createCalendarChannel(null);

      await service.fetchCalendarEvents(
        calendarChannel,
        baseConnectedAccount,
        workspaceId,
      );

      expect(
        mockGetCalendarEventsService.getCalendarEvents,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ handle: 'test@example.com' }),
        undefined,
      );
    });

    it('should perform full sync when syncCursor is empty string (workspace schema)', async () => {
      const calendarChannel = createCalendarChannel('');

      await service.fetchCalendarEvents(
        calendarChannel,
        baseConnectedAccount,
        workspaceId,
      );

      expect(
        mockGetCalendarEventsService.getCalendarEvents,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ handle: 'test@example.com' }),
        undefined,
      );
    });

    it('should use existing syncCursor for incremental sync', async () => {
      const calendarChannel = createCalendarChannel('cursor-xyz');

      await service.fetchCalendarEvents(
        calendarChannel,
        baseConnectedAccount,
        workspaceId,
      );

      expect(
        mockGetCalendarEventsService.getCalendarEvents,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ handle: 'test@example.com' }),
        'cursor-xyz',
      );
    });

    it('should update syncCursor after successful fetch regardless of initial cursor state', async () => {
      const calendarChannel = createCalendarChannel(null);

      await service.fetchCalendarEvents(
        calendarChannel,
        baseConnectedAccount,
        workspaceId,
      );

      expect(mockCalendarChannelDataAccessService.update).toHaveBeenCalledWith(
        workspaceId,
        { id: 'channel-123' },
        { syncCursor: 'new-cursor-abc' },
      );
    });

    it('should not throw when feature flag switches from off (workspace empty string) to on (core null)', async () => {
      // Simulate flag OFF: workspace returns empty string
      const workspaceChannel = createCalendarChannel('');

      await expect(
        service.fetchCalendarEvents(
          workspaceChannel,
          baseConnectedAccount,
          workspaceId,
        ),
      ).resolves.not.toThrow();

      jest.clearAllMocks();
      mockGetCalendarEventsService.getCalendarEvents.mockResolvedValue({
        fullEvents: true,
        calendarEvents: [{ id: 'event-2' }],
        nextSyncCursor: 'new-cursor-def',
      });

      // Simulate flag ON: core returns null
      const coreChannel = createCalendarChannel(null);

      await expect(
        service.fetchCalendarEvents(
          coreChannel,
          baseConnectedAccount,
          workspaceId,
        ),
      ).resolves.not.toThrow();

      expect(
        mockGetCalendarEventsService.getCalendarEvents,
      ).toHaveBeenCalledWith(expect.anything(), undefined);
    });

    it('should preserve incremental sync behavior when toggling feature flag with existing cursor', async () => {
      // Flag OFF: workspace has cursor
      const workspaceChannel = createCalendarChannel('cursor-from-workspace');

      await service.fetchCalendarEvents(
        workspaceChannel,
        baseConnectedAccount,
        workspaceId,
      );

      expect(
        mockGetCalendarEventsService.getCalendarEvents,
      ).toHaveBeenCalledWith(expect.anything(), 'cursor-from-workspace');

      jest.clearAllMocks();
      mockGetCalendarEventsService.getCalendarEvents.mockResolvedValue({
        fullEvents: true,
        calendarEvents: [{ id: 'event-3' }],
        nextSyncCursor: 'newer-cursor',
      });

      // Flag ON: core has same cursor (dual-written)
      const coreChannel = createCalendarChannel('cursor-from-workspace');

      await service.fetchCalendarEvents(
        coreChannel,
        baseConnectedAccount,
        workspaceId,
      );

      expect(
        mockGetCalendarEventsService.getCalendarEvents,
      ).toHaveBeenCalledWith(expect.anything(), 'cursor-from-workspace');
    });
  });
});
