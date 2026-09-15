import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  escapeForIlike,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { ILike, In, IsNull, Not, QueryFailedError } from 'typeorm';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { type QueryFailedErrorWithCode } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { HARD_SUPPRESSION_REASONS } from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { MessageSuppressionEntity } from 'src/engine/core-modules/emailing-domain/message-suppression.entity';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { type UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

type FindSuppressionsArgs = {
  workspaceId: string;
  reason?: MessageSuppressionReason;
  searchTerm?: string;
  unsubscribeTopicId?: string;
  limit: number;
  offset: number;
};

type FindApplicableSuppressionsArgs = {
  workspaceId: string;
  emailAddresses: string[];
  unsubscribeTopicId?: string;
};

type SuppressArgs = {
  workspaceId: string;
  emailAddress: string;
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  providerEventId?: string | null;
  unsubscribeTopicId?: string | null;
};

type SuppressManuallyArgs = {
  workspaceId: string;
  emailAddress: string;
  unsubscribeTopicId?: string;
};

type RemoveSuppressionArgs = {
  workspaceId: string;
  suppressionId: string;
};

type TopicOptOutStateArgs = {
  workspaceId: string;
  emailAddress: string;
};

type SetTopicOptOutsArgs = {
  workspaceId: string;
  emailAddress: string;
  keptTopicIds: string[];
  canResubscribe: boolean;
};

@Injectable()
export class MessageSuppressionService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageSuppressionEntity)
    private readonly suppressionRepository: WorkspaceScopedRepository<MessageSuppressionEntity>,
    private readonly unsubscribeTopicService: UnsubscribeTopicService,
  ) {}

  async findSuppressions({
    workspaceId,
    reason,
    searchTerm,
    unsubscribeTopicId,
    limit,
    offset,
  }: FindSuppressionsArgs): Promise<{
    records: MessageSuppressionEntity[];
    totalCount: number;
  }> {
    const [records, totalCount] = await this.suppressionRepository.findAndCount(
      workspaceId,
      {
        where: {
          ...(isDefined(reason) ? { reason } : {}),
          ...(isNonEmptyString(unsubscribeTopicId)
            ? { unsubscribeTopicId }
            : {}),
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

  async findApplicableSuppressions({
    workspaceId,
    emailAddresses,
    unsubscribeTopicId,
  }: FindApplicableSuppressionsArgs): Promise<MessageSuppressionEntity[]> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (!isNonEmptyArray(normalizedAddresses)) {
      return [];
    }

    return this.suppressionRepository.find(workspaceId, {
      where: [
        {
          emailAddress: In(normalizedAddresses),
          unsubscribeTopicId: IsNull(),
        },
        ...(isNonEmptyString(unsubscribeTopicId)
          ? [{ emailAddress: In(normalizedAddresses), unsubscribeTopicId }]
          : []),
      ],
    });
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

  async suppressManually({
    workspaceId,
    emailAddress,
    unsubscribeTopicId,
  }: SuppressManuallyArgs): Promise<MessageSuppressionEntity> {
    await this.recordUnsubscribe({
      workspaceId,
      emailAddress,
      unsubscribeTopicId,
    });

    const suppression = await this.suppressionRepository.findOneBy(
      workspaceId,
      {
        emailAddress: this.normalizeEmailAddress(emailAddress),
        unsubscribeTopicId: isNonEmptyString(unsubscribeTopicId)
          ? unsubscribeTopicId
          : IsNull(),
      },
    );

    if (!isDefined(suppression)) {
      throw new EmailingDomainException(
        `Suppression for ${emailAddress} was not persisted`,
        EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND,
      );
    }

    return suppression;
  }

  async removeSuppression({
    workspaceId,
    suppressionId,
  }: RemoveSuppressionArgs): Promise<void> {
    const suppression = await this.suppressionRepository.findOneBy(
      workspaceId,
      { id: suppressionId },
    );

    if (!isDefined(suppression)) {
      throw new EmailingDomainException(
        `Suppression ${suppressionId} not found`,
        EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND,
      );
    }

    const { affected } = await this.suppressionRepository.delete(workspaceId, {
      id: suppressionId,
      reason: Not(In(HARD_SUPPRESSION_REASONS)),
    });

    if (affected === 0) {
      throw new EmailingDomainException(
        `Suppression ${suppressionId} records a ${suppression.reason} and cannot be removed`,
        EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE,
      );
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
      where: [
        {
          emailAddress: normalizedEmailAddress,
          reason: MessageSuppressionReason.UNSUBSCRIBE,
          unsubscribeTopicId: In(visibleTopics.map((topic) => topic.id)),
        },
        {
          emailAddress: normalizedEmailAddress,
          reason: MessageSuppressionReason.UNSUBSCRIBE,
          unsubscribeTopicId: IsNull(),
        },
      ],
    });

    const optedOutTopicIds = new Set(
      optOuts
        .filter((suppression) => isDefined(suppression.unsubscribeTopicId))
        .map((suppression) => suppression.unsubscribeTopicId),
    );

    const globalOptOut = optOuts.find(
      (suppression) => !isDefined(suppression.unsubscribeTopicId),
    );

    return visibleTopics.map((topic) => ({
      unsubscribeTopicId: topic.id,
      topicName: topic.name,
      optedOut: isDefined(globalOptOut) || optedOutTopicIds.has(topic.id),
    }));
  }

  async setTopicOptOuts({
    workspaceId,
    emailAddress,
    keptTopicIds,
    canResubscribe,
  }: SetTopicOptOutsArgs): Promise<void> {
    const visibleTopics =
      await this.unsubscribeTopicService.findPublicTopics(workspaceId);

    if (!isNonEmptyArray(visibleTopics)) {
      return;
    }

    const visibleTopicIds = new Set(visibleTopics.map((topic) => topic.id));
    const keptTopicIdSet = new Set(
      keptTopicIds.filter((topicId) => visibleTopicIds.has(topicId)),
    );

    if (keptTopicIdSet.size === 0) {
      await this.unsubscribeFromEverything({ workspaceId, emailAddress });

      return;
    }

    await this.suppressTopicsNotKept({
      workspaceId,
      emailAddress,
      visibleTopics,
      keptTopicIdSet,
    });

    if (!canResubscribe) {
      return;
    }

    await this.liftOptOut(workspaceId, emailAddress, null);

    for (const topicId of keptTopicIdSet) {
      await this.liftOptOut(workspaceId, emailAddress, topicId);
    }
  }

  async unsubscribeFromEverything({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<void> {
    await this.recordUnsubscribe({
      workspaceId,
      emailAddress,
      unsubscribeTopicId: null,
    });
  }

  private async recordUnsubscribe({
    workspaceId,
    emailAddress,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    emailAddress: string;
    unsubscribeTopicId?: string | null;
  }): Promise<void> {
    await this.suppress({
      workspaceId,
      emailAddress,
      reason: MessageSuppressionReason.UNSUBSCRIBE,
      source: MessageSuppressionSource.SYSTEM,
      unsubscribeTopicId,
    });
  }

  private async suppressTopicsNotKept({
    workspaceId,
    emailAddress,
    visibleTopics,
    keptTopicIdSet,
  }: {
    workspaceId: string;
    emailAddress: string;
    visibleTopics: UnsubscribeTopicEntity[];
    keptTopicIdSet: Set<string>;
  }): Promise<void> {
    for (const topic of visibleTopics) {
      if (keptTopicIdSet.has(topic.id)) {
        continue;
      }

      await this.recordUnsubscribe({
        workspaceId,
        emailAddress,
        unsubscribeTopicId: topic.id,
      });
    }
  }

  private async liftOptOut(
    workspaceId: string,
    emailAddress: string,
    unsubscribeTopicId: string | null,
  ): Promise<void> {
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    await this.suppressionRepository.delete(workspaceId, {
      emailAddress: normalizedEmailAddress,
      unsubscribeTopicId: isNonEmptyString(unsubscribeTopicId)
        ? unsubscribeTopicId
        : IsNull(),
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
