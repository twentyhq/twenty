import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { ILike, In, Not, QueryFailedError } from 'typeorm';
import {
  escapeForIlike,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { MessageTrackingConsentEntity } from 'src/engine/core-modules/emailing-domain/message-tracking-consent.entity';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type TrackingPreference } from 'src/modules/emailing/types/tracking-preference.type';
import { normalizeCampaignRecipientEmailAddress } from 'src/modules/emailing/utils/normalize-campaign-recipient-email-address.util';

const isUniqueViolation = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  Reflect.get(error, 'code') === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

@Injectable()
export class MessageTrackingConsentService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageTrackingConsentEntity)
    private readonly consentRepository: WorkspaceScopedRepository<MessageTrackingConsentEntity>,
  ) {}

  async findConsent({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<MessageTrackingConsentEntity | null> {
    const normalizedEmailAddress =
      normalizeCampaignRecipientEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return null;
    }

    return this.consentRepository.findOneBy(workspaceId, {
      emailAddress: normalizedEmailAddress,
    });
  }

  async findDecision({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<MessageTrackingConsentDecision | null> {
    const consent = await this.findConsent({ workspaceId, emailAddress });

    return consent?.decision ?? null;
  }

  async findTrackingPreference({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<TrackingPreference> {
    return { decision: await this.findDecision({ workspaceId, emailAddress }) };
  }

  async findDeniedEmailAddresses({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<Set<string>> {
    const normalizedEmailAddresses = [
      ...new Set(emailAddresses.map(normalizeCampaignRecipientEmailAddress)),
    ].filter(isNonEmptyString);

    if (!isNonEmptyArray(normalizedEmailAddresses)) {
      return new Set();
    }

    const deniedConsents = await this.consentRepository.find(workspaceId, {
      where: {
        emailAddress: In(normalizedEmailAddresses),
        decision: MessageTrackingConsentDecision.DENIED,
      },
      select: { emailAddress: true },
    });

    return new Set(deniedConsents.map(({ emailAddress }) => emailAddress));
  }

  async findDeniedConsents({
    workspaceId,
    searchTerm,
    limit,
    offset,
  }: {
    workspaceId: string;
    searchTerm?: string;
    limit: number;
    offset: number;
  }): Promise<{ records: MessageTrackingConsentEntity[]; totalCount: number }> {
    const [records, totalCount] = await this.consentRepository.findAndCount(
      workspaceId,
      {
        where: {
          decision: MessageTrackingConsentDecision.DENIED,
          ...(isNonEmptyString(searchTerm)
            ? { emailAddress: ILike(`%${escapeForIlike(searchTerm)}%`) }
            : {}),
        },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset,
      },
    );

    return { records, totalCount };
  }

  async recordDecision({
    workspaceId,
    emailAddress,
    decision,
    source,
  }: {
    workspaceId: string;
    emailAddress: string;
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<void> {
    const normalizedEmailAddress =
      normalizeCampaignRecipientEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.upsertDecision({
      workspaceId,
      emailAddress: normalizedEmailAddress,
      decision,
      source,
      mayRetry: true,
    });
  }

  private async upsertDecision({
    workspaceId,
    emailAddress,
    decision,
    source,
    mayRetry,
  }: {
    workspaceId: string;
    emailAddress: string;
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
    mayRetry: boolean;
  }): Promise<void> {
    const existingConsent = await this.consentRepository.findOneBy(
      workspaceId,
      { emailAddress },
    );

    if (isDefined(existingConsent)) {
      await this.updateDecision({
        workspaceId,
        consentId: existingConsent.id,
        decision,
        source,
      });

      return;
    }

    try {
      await this.consentRepository.insert(workspaceId, {
        emailAddress,
        decision,
        source,
      });
    } catch (error) {
      if (!mayRetry || !isUniqueViolation(error)) {
        throw error;
      }

      await this.upsertDecision({
        workspaceId,
        emailAddress,
        decision,
        source,
        mayRetry: false,
      });
    }
  }

  private async updateDecision({
    workspaceId,
    consentId,
    decision,
    source,
  }: {
    workspaceId: string;
    consentId: string;
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<void> {
    if (source === MessageTrackingConsentSource.PREFERENCES_PAGE) {
      await this.consentRepository.update(
        workspaceId,
        { id: consentId },
        { decision, source },
      );

      return;
    }

    // The conditional writes preserve a recipient's refusal even if it arrives
    // after a workspace member read the row.
    const outsidePreferencesPage = await this.consentRepository.update(
      workspaceId,
      {
        id: consentId,
        source: Not(MessageTrackingConsentSource.PREFERENCES_PAGE),
      },
      { decision, source },
    );
    const grantedOnPreferencesPage = await this.consentRepository.update(
      workspaceId,
      {
        id: consentId,
        source: MessageTrackingConsentSource.PREFERENCES_PAGE,
        decision: Not(MessageTrackingConsentDecision.DENIED),
      },
      { decision, source },
    );

    if (
      decision === MessageTrackingConsentDecision.GRANTED &&
      (outsidePreferencesPage.affected ?? 0) +
        (grantedOnPreferencesPage.affected ?? 0) ===
        0
    ) {
      throw new EmailingDomainException(
        'A recipient opted out of tracking themselves',
        EmailingDomainExceptionCode.MESSAGE_TRACKING_CONSENT_REFUSED_BY_RECIPIENT,
      );
    }
  }
}
