import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { type QueryFailedErrorWithCode } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import {
  GLOBAL_BLOCKING_SUPPRESSION_REASONS,
  HARD_SUPPRESSION_REASONS,
} from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

type SuppressArgs = {
  workspaceId: string;
  emailAddress: string;
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  providerEventId?: string | null;
  unsubscribeTopicId?: string | null;
};

type TopicOptOutStateArgs = {
  workspaceId: string;
  emailAddress: string;
};

type SetTopicOptOutsArgs = {
  workspaceId: string;
  emailAddress: string;
  keptTopicIds: string[];
};

@Injectable()
export class MessageSuppressionService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageSuppressionEntity)
    private readonly suppressionRepository: WorkspaceScopedRepository<MessageSuppressionEntity>,
    private readonly unsubscribeTopicService: UnsubscribeTopicService,
  ) {}

  async getSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
  ): Promise<Set<string>> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const suppressions = await this.suppressionRepository.find(workspaceId, {
      where: {
        emailAddress: In(normalizedAddresses),
        reason: In(GLOBAL_BLOCKING_SUPPRESSION_REASONS),
        unsubscribeTopicId: IsNull(),
      },
    });

    return new Set(suppressions.map((suppression) => suppression.emailAddress));
  }

  async getTopicSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
    unsubscribeTopicId: string,
  ): Promise<Set<string>> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (
      !isNonEmptyArray(normalizedAddresses) ||
      !isNonEmptyString(unsubscribeTopicId)
    ) {
      return new Set();
    }

    const suppressions = await this.suppressionRepository.find(workspaceId, {
      where: {
        emailAddress: In(normalizedAddresses),
        reason: MessageSuppressionReason.UNSUBSCRIBE,
        unsubscribeTopicId,
      },
    });

    return new Set(suppressions.map((suppression) => suppression.emailAddress));
  }

  async suppress({
    workspaceId,
    emailAddress,
    reason,
    source,
    providerEventId = null,
    unsubscribeTopicId = null,
  }: SuppressArgs): Promise<void> {
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    // Hard suppressions (delivery failures) are inherently address-level: a
    // topic-scoped BOUNCE/COMPLAINT row would block nothing (reads filter
    // per-topic rows to UNSUBSCRIBE) while occupying the (address, topic) slot.
    const effectiveTopicId = HARD_SUPPRESSION_REASONS.includes(reason)
      ? null
      : unsubscribeTopicId;

    const whereKey = {
      emailAddress: normalizedEmailAddress,
      unsubscribeTopicId: isDefined(effectiveTopicId)
        ? effectiveTopicId
        : IsNull(),
    };

    const escalateExisting = async (): Promise<boolean> => {
      const existing = await this.suppressionRepository.findOneBy(
        workspaceId,
        whereKey,
      );

      if (!isDefined(existing)) {
        return false;
      }

      if (this.shouldEscalate(existing.reason, reason)) {
        await this.suppressionRepository.update(
          workspaceId,
          { id: existing.id },
          { reason, source, providerEventId },
        );
      }

      return true;
    };

    if (await escalateExisting()) {
      return;
    }

    try {
      await this.suppressionRepository.insert(workspaceId, {
        emailAddress: normalizedEmailAddress,
        reason,
        source,
        providerEventId,
        unsubscribeTopicId: effectiveTopicId,
      });
    } catch (error) {
      const isUniqueViolation =
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      if (!isUniqueViolation || !(await escalateExisting())) {
        throw error;
      }
    }
  }

  async getTopicOptOutState({
    workspaceId,
    emailAddress,
  }: TopicOptOutStateArgs): Promise<TopicOptOutState[]> {
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return [];
    }

    const visibleTopics =
      await this.unsubscribeTopicService.findPublicTopics(workspaceId);

    if (!isNonEmptyArray(visibleTopics)) {
      return [];
    }

    const optOuts = await this.suppressionRepository.find(workspaceId, {
      where: {
        emailAddress: normalizedEmailAddress,
        reason: MessageSuppressionReason.UNSUBSCRIBE,
        unsubscribeTopicId: In(visibleTopics.map((topic) => topic.id)),
      },
    });

    const optedOutTopicIds = new Set(
      optOuts.map((suppression) => suppression.unsubscribeTopicId),
    );

    return visibleTopics.map((topic) => ({
      unsubscribeTopicId: topic.id,
      topicName: topic.name,
      optedOut: optedOutTopicIds.has(topic.id),
    }));
  }

  async setTopicOptOuts({
    workspaceId,
    emailAddress,
    keptTopicIds,
  }: SetTopicOptOutsArgs): Promise<void> {
    const topicStates = await this.getTopicOptOutState({
      workspaceId,
      emailAddress,
    });
    const keptTopicIdSet = new Set(keptTopicIds);

    for (const topicState of topicStates) {
      const shouldReceive = keptTopicIdSet.has(topicState.unsubscribeTopicId);

      if (shouldReceive === !topicState.optedOut) {
        continue;
      }

      if (shouldReceive) {
        await this.liftTopicOptOut(
          workspaceId,
          emailAddress,
          topicState.unsubscribeTopicId,
        );
      } else {
        await this.suppress({
          workspaceId,
          emailAddress,
          reason: MessageSuppressionReason.UNSUBSCRIBE,
          source: MessageSuppressionSource.SYSTEM,
          unsubscribeTopicId: topicState.unsubscribeTopicId,
        });
      }
    }
  }

  private async liftTopicOptOut(
    workspaceId: string,
    emailAddress: string,
    unsubscribeTopicId: string,
  ): Promise<void> {
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    await this.suppressionRepository.delete(workspaceId, {
      emailAddress: normalizedEmailAddress,
      unsubscribeTopicId,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
    });
  }

  private normalizeEmailAddress(emailAddress: string): string {
    return emailAddress.trim().toLowerCase();
  }

  private normalizeAddresses(emailAddresses: string[]): string[] {
    return [
      ...new Set(
        emailAddresses.map((emailAddress) =>
          this.normalizeEmailAddress(emailAddress),
        ),
      ),
    ];
  }

  private shouldEscalate(
    existingReason: MessageSuppressionReason,
    incomingReason: MessageSuppressionReason,
  ): boolean {
    return (
      !HARD_SUPPRESSION_REASONS.includes(existingReason) &&
      HARD_SUPPRESSION_REASONS.includes(incomingReason)
    );
  }
}
