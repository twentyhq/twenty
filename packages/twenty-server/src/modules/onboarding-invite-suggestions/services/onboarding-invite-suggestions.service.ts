import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import {
  ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS,
  ONBOARDING_INVITE_SUGGESTIONS_MAX_COUNT,
  getOnboardingInviteSuggestionsCacheKey,
} from 'src/modules/onboarding-invite-suggestions/constants/onboarding-invite-suggestions.constants';
import { GoogleCalendarAttendeesService } from 'src/modules/onboarding-invite-suggestions/services/google-calendar-attendees.service';
import { type InviteSuggestion } from 'src/modules/onboarding-invite-suggestions/types/invite-suggestion.type';
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
    private readonly googleCalendarAttendeesService: GoogleCalendarAttendeesService,
    @InjectCacheStorage(CacheStorageNamespace.EngineOnboardingInviteSuggestions)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async getCachedSuggestions({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }): Promise<InviteSuggestion[]> {
    const cached = await this.cacheStorageService.get<InviteSuggestion[]>(
      getOnboardingInviteSuggestionsCacheKey(workspaceId, userId),
    );

    return cached ?? [];
  }

  // Derives likely teammates (same work-email domain) from the freshly
  // connected calendar and caches them so the invite step can prefill them.
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
      return;
    }

    // Google-only for now; other providers fall back to no suggestions.
    if (connectedAccount.provider !== ConnectedAccountProvider.GOOGLE) {
      return;
    }

    const selfHandle = connectedAccount.handle.toLowerCase();

    // Personal mailboxes (gmail.com, etc.) have no meaningful "same company"
    // signal, so we never suggest anyone.
    if (!isWorkEmail(selfHandle)) {
      await this.cacheStorageService.set<InviteSuggestion[]>(
        cacheKey,
        [],
        ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS,
      );

      return;
    }

    const selfDomain = getDomainNameFromHandle(selfHandle);
    const selfHandles = new Set<string>([
      selfHandle,
      ...(connectedAccount.handleAliases ?? []).map((alias) =>
        alias.toLowerCase(),
      ),
    ]);

    let attendees: { email: string; displayName?: string }[] = [];

    try {
      attendees =
        await this.googleCalendarAttendeesService.getRecentAttendees(
          connectedAccountId,
        );
    } catch (error) {
      this.logger.warn(
        `Could not compute invite suggestions for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : 'unknown error'
        }`,
      );
    }

    const suggestionsByEmail = new Map<
      string,
      { count: number; displayName?: string }
    >();

    for (const attendee of attendees) {
      const email = attendee.email.toLowerCase();

      if (selfHandles.has(email)) {
        continue;
      }

      // Only same-company colleagues, never external contacts.
      if (getDomainNameFromHandle(email) !== selfDomain) {
        continue;
      }

      const existing = suggestionsByEmail.get(email) ?? { count: 0 };

      existing.count += 1;

      if (!isDefined(existing.displayName) && isDefined(attendee.displayName)) {
        existing.displayName = attendee.displayName;
      }

      suggestionsByEmail.set(email, existing);
    }

    // Most-frequent colleagues first — they are the most likely teammates.
    const suggestions: InviteSuggestion[] = Array.from(
      suggestionsByEmail.entries(),
    )
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, ONBOARDING_INVITE_SUGGESTIONS_MAX_COUNT)
      .map(([email, { displayName }]) => ({ email, displayName }));

    await this.cacheStorageService.set<InviteSuggestion[]>(
      cacheKey,
      suggestions,
      ONBOARDING_INVITE_SUGGESTIONS_CACHE_TTL_MS,
    );
  }
}
