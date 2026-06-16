import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS } from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions-cache-ttl-ms.constant';
import { ONBOARDING_INVITE_SUGGESTIONS_MAX_COUNT } from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions-max-count.constant';
import { getOnboardingInviteSuggestionsCacheKey } from 'src/modules/onboarding-invite-suggestions/utils/get-onboarding-invite-suggestions-cache-key.util';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { CalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/calendar-attendees.service';
import { type CalendarAttendee } from 'src/modules/onboarding-invite-suggestions/types/calendar-attendee.type';
import { isWorkEmail } from 'src/utils/is-work-email';

type ComputeAndCacheSuggestionsArgs = {
  workspaceId: string;
  userId: string;
  connectedAccountId: string;
};

@Injectable()
export class OnboardingInviteSuggestionsService {
  private readonly logger = new Logger(OnboardingInviteSuggestionsService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly calendarAttendeesService: CalendarAttendeesService,
    @InjectCacheStorage(CacheStorageNamespace.EngineOnboardingInviteSuggestions)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async getCachedSuggestions({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<CalendarAttendee[]> {
    const cachedSuggestions = await this.cacheStorageService.get<
      CalendarAttendee[]
    >(getOnboardingInviteSuggestionsCacheKey(workspaceId, userId));

    return cachedSuggestions ?? [];
  }

  async computeAndCacheSuggestions({
    workspaceId,
    userId,
    connectedAccountId,
  }: ComputeAndCacheSuggestionsArgs): Promise<void> {
    const cacheKey = getOnboardingInviteSuggestionsCacheKey(
      workspaceId,
      userId,
    );

    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: { id: connectedAccountId, workspaceId },
    });

    if (!isDefined(connectedAccount)) {
      await this.cacheStorageService.set<CalendarAttendee[]>(
        cacheKey,
        [],
        ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS,
      );

      return;
    }

    const connectedAccountHandle = connectedAccount.handle.toLowerCase();

    if (!isWorkEmail(connectedAccountHandle)) {
      await this.cacheStorageService.set<CalendarAttendee[]>(
        cacheKey,
        [],
        ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS,
      );

      return;
    }

    const connectedAccountDomain = getDomainNameFromHandle(
      connectedAccountHandle,
    );
    const ownEmailHandles = new Set<string>([
      connectedAccountHandle,
      ...(connectedAccount.handleAliases ?? []).map((alias) =>
        alias.toLowerCase(),
      ),
    ]);

    let attendees: CalendarAttendee[] = [];

    try {
      attendees =
        await this.calendarAttendeesService.getRecentAttendees(
          connectedAccount,
        );
    } catch (error) {
      this.logger.warn(
        `Could not compute invite suggestions for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }

    const eventCountByColleagueEmail = new Map<
      string,
      { eventCount: number; displayName?: string }
    >();

    for (const attendee of attendees) {
      const attendeeEmail = attendee.email.toLowerCase();

      const isOwnEmail = ownEmailHandles.has(attendeeEmail);
      const isSameCompanyColleague =
        getDomainNameFromHandle(attendeeEmail) === connectedAccountDomain;

      if (
        isOwnEmail ||
        !isSameCompanyColleague ||
        isGroupEmail(attendeeEmail)
      ) {
        continue;
      }

      const colleagueTally = eventCountByColleagueEmail.get(attendeeEmail) ?? {
        eventCount: 0,
      };

      colleagueTally.eventCount += 1;

      if (
        !isDefined(colleagueTally.displayName) &&
        isDefined(attendee.displayName)
      ) {
        colleagueTally.displayName = attendee.displayName;
      }

      eventCountByColleagueEmail.set(attendeeEmail, colleagueTally);
    }

    const mostFrequentColleaguesFirst = Array.from(
      eventCountByColleagueEmail.entries(),
    ).sort(([, left], [, right]) => right.eventCount - left.eventCount);

    const suggestions: CalendarAttendee[] = mostFrequentColleaguesFirst
      .slice(0, ONBOARDING_INVITE_SUGGESTIONS_MAX_COUNT)
      .map(([email, { displayName }]) => ({ email, displayName }));

    await this.cacheStorageService.set<CalendarAttendee[]>(
      cacheKey,
      suggestions,
      ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS,
    );
  }
}
