import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/calendar-attendees.service';
import { OnboardingInviteSuggestionsService } from 'src/modules/onboarding-invite-suggestions/services/onboarding-invite-suggestions.service';

describe('OnboardingInviteSuggestionsService', () => {
  let service: OnboardingInviteSuggestionsService;
  let connectedAccountRepository: { findOne: jest.Mock };
  let calendarAttendeesService: { getRecentAttendees: jest.Mock };
  let cacheStorageService: { get: jest.Mock; set: jest.Mock };

  const workspaceId = 'workspace-id';
  const userId = 'user-id';
  const connectedAccountId = 'connected-account-id';

  const buildConnectedAccount = (
    overrides: Partial<ConnectedAccountEntity> = {},
  ): ConnectedAccountEntity =>
    ({
      id: connectedAccountId,
      workspaceId,
      provider: ConnectedAccountProvider.GOOGLE,
      handle: 'alice@acme.com',
      handleAliases: [],
      ...overrides,
    }) as ConnectedAccountEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingInviteSuggestionsService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: CalendarAttendeesService,
          useValue: { getRecentAttendees: jest.fn() },
        },
        {
          provide: CacheStorageNamespace.EngineOnboardingInviteSuggestions,
          useValue: { get: jest.fn(), set: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(OnboardingInviteSuggestionsService);
    connectedAccountRepository = module.get(
      getRepositoryToken(ConnectedAccountEntity),
    ) as Repository<ConnectedAccountEntity> & { findOne: jest.Mock };
    calendarAttendeesService = module.get(CalendarAttendeesService);
    cacheStorageService = module.get(
      CacheStorageNamespace.EngineOnboardingInviteSuggestions,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('computeAndCacheSuggestions', () => {
    it('does nothing when the connected account does not exist', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(null);

      await service.computeAndCacheSuggestions({
        workspaceId,
        userId,
        connectedAccountId,
      });

      expect(
        calendarAttendeesService.getRecentAttendees,
      ).not.toHaveBeenCalled();
      expect(cacheStorageService.set).not.toHaveBeenCalled();
    });

    it('caches no suggestions for personal email domains', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildConnectedAccount({ handle: 'alice@gmail.com' }),
      );

      await service.computeAndCacheSuggestions({
        workspaceId,
        userId,
        connectedAccountId,
      });

      expect(
        calendarAttendeesService.getRecentAttendees,
      ).not.toHaveBeenCalled();
      expect(cacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        [],
        expect.any(Number),
      );
    });

    it('keeps only same-domain colleagues, excludes self/aliases, and ranks by frequency', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildConnectedAccount({
          handle: 'alice@acme.com',
          handleAliases: ['alice.alias@acme.com'],
        }),
      );
      calendarAttendeesService.getRecentAttendees.mockResolvedValue([
        { email: 'Alice@acme.com' }, // self (case-insensitive)
        { email: 'alice.alias@acme.com' }, // alias
        { email: 'bob@acme.com', displayName: 'Bob' },
        { email: 'bob@acme.com' },
        { email: 'carol@acme.com', displayName: 'Carol' },
        { email: 'dave@other.com' }, // different domain
      ]);

      await service.computeAndCacheSuggestions({
        workspaceId,
        userId,
        connectedAccountId,
      });

      const [, cachedSuggestions] = cacheStorageService.set.mock.calls[0];

      expect(cachedSuggestions).toEqual([
        { email: 'bob@acme.com', displayName: 'Bob' },
        { email: 'carol@acme.com', displayName: 'Carol' },
      ]);
    });

    it('computes suggestions for Microsoft accounts too', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildConnectedAccount({
          provider: ConnectedAccountProvider.MICROSOFT,
          handle: 'alice@acme.com',
        }),
      );
      calendarAttendeesService.getRecentAttendees.mockResolvedValue([
        { email: 'bob@acme.com', displayName: 'Bob' },
      ]);

      await service.computeAndCacheSuggestions({
        workspaceId,
        userId,
        connectedAccountId,
      });

      const [, cachedSuggestions] = cacheStorageService.set.mock.calls[0];

      expect(cachedSuggestions).toEqual([
        { email: 'bob@acme.com', displayName: 'Bob' },
      ]);
    });

    it('caches empty suggestions when the calendar fetch fails', async () => {
      connectedAccountRepository.findOne.mockResolvedValue(
        buildConnectedAccount(),
      );
      calendarAttendeesService.getRecentAttendees.mockRejectedValue(
        new Error('calendar unavailable'),
      );

      await service.computeAndCacheSuggestions({
        workspaceId,
        userId,
        connectedAccountId,
      });

      const [, cachedSuggestions] = cacheStorageService.set.mock.calls[0];

      expect(cachedSuggestions).toEqual([]);
    });
  });

  describe('getCachedSuggestions', () => {
    it('returns cached suggestions', async () => {
      cacheStorageService.get.mockResolvedValue([{ email: 'bob@acme.com' }]);

      const result = await service.getCachedSuggestions({
        workspaceId,
        userId,
      });

      expect(result).toEqual([{ email: 'bob@acme.com' }]);
    });

    it('returns an empty array when nothing is cached', async () => {
      cacheStorageService.get.mockResolvedValue(undefined);

      const result = await service.getCachedSuggestions({
        workspaceId,
        userId,
      });

      expect(result).toEqual([]);
    });
  });
});
