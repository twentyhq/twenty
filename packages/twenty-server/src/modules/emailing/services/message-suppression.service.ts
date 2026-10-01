import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  escapeForIlike,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { ILike, In, IsNull, Not } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { HARD_SUPPRESSION_REASONS } from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { MessageSuppressionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-suppression.workspace-entity';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { type UnsubscribeTopicEntity } from 'src/engine/core-modules/emailing-domain/unsubscribe-topic.entity';
import { UnsubscribeTopicService } from 'src/modules/emailing/services/unsubscribe-topic.service';

const SUPPRESSION_INSERT_ATTEMPTS = 2;

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
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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
    records: MessageSuppressionWorkspaceEntity[];
    totalCount: number;
  }> {
    const [records, totalCount] =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const suppressionRepository = this.workspaceOrmManager.getRepository(
          MessageSuppressionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        );
        return suppressionRepository.findAndCount({
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
        });
      }, buildSystemAuthContext(workspaceId));

    return { records, totalCount };
  }

  async findApplicableSuppressions({
    workspaceId,
    emailAddresses,
    unsubscribeTopicId,
  }: FindApplicableSuppressionsArgs): Promise<
    MessageSuppressionWorkspaceEntity[]
  > {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (!isNonEmptyArray(normalizedAddresses)) {
      return [];
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository = this.workspaceOrmManager.getRepository(
        MessageSuppressionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );
      return suppressionRepository.find({
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
    }, buildSystemAuthContext(workspaceId));
  }

  async findTrackingOptedOutEmailAddresses({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<Set<string>> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const optOuts = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const suppressionRepository = this.workspaceOrmManager.getRepository(
          MessageSuppressionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        );

        return suppressionRepository.find({
          where: {
            emailAddress: In(normalizedAddresses),
            reason: MessageSuppressionReason.TRACKING,
          },
        });
      },
      buildSystemAuthContext(workspaceId),
    );

    return new Set(optOuts.map(({ emailAddress }) => emailAddress));
  }

  async isTrackingOptedOut({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<boolean> {
    const optedOut = await this.findTrackingOptedOutEmailAddresses({
      workspaceId,
      emailAddresses: [emailAddress],
    });

    return optedOut.size > 0;
  }

  async setTrackingOptOut({
    workspaceId,
    emailAddress,
    isOptedOut,
  }: {
    workspaceId: string;
    emailAddress: string;
    isOptedOut: boolean;
  }): Promise<void> {
    if (isOptedOut) {
      await this.suppress({
        workspaceId,
        emailAddress,
        reason: MessageSuppressionReason.TRACKING,
        source: MessageSuppressionSource.SYSTEM,
      });

      return;
    }

    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository = this.workspaceOrmManager.getRepository(
        MessageSuppressionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );

      await suppressionRepository.delete({
        emailAddress: normalizedEmailAddress,
        reason: MessageSuppressionReason.TRACKING,
      });
    }, buildSystemAuthContext(workspaceId));
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

    const whereKey =
      reason === MessageSuppressionReason.TRACKING
        ? { emailAddress: normalizedEmailAddress, reason }
        : {
            emailAddress: normalizedEmailAddress,
            unsubscribeTopicId: isDefined(effectiveTopicId)
              ? effectiveTopicId
              : IsNull(),
            reason: Not(MessageSuppressionReason.TRACKING),
          };

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository = this.workspaceOrmManager.getRepository(
        MessageSuppressionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );
      const escalateExisting = async (): Promise<boolean> => {
        const existing = await suppressionRepository.findOneBy(whereKey);

        if (!isDefined(existing)) {
          return false;
        }

        if (this.shouldEscalate(existing.reason, reason)) {
          await suppressionRepository
            .createQueryBuilder()
            .where({ id: existing.id })
            .update()
            .set({ reason, source, providerEventId })
            .execute();
        }

        return true;
      };

      for (
        let insertAttempt = 1;
        insertAttempt <= SUPPRESSION_INSERT_ATTEMPTS;
        insertAttempt++
      ) {
        if (await escalateExisting()) {
          return;
        }

        const { identifiers } = await suppressionRepository.insert(
          {
            emailAddress: normalizedEmailAddress,
            reason,
            source,
            providerEventId,
            unsubscribeTopicId: effectiveTopicId,
          },
          { onConflictDoNothing: true },
        );

        if (identifiers.length > 0) {
          return;
        }
      }

      throw new EmailingDomainException(
        `Suppression for ${normalizedEmailAddress} kept conflicting with a row that disappeared before it could be read`,
        EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND,
      );
    }, buildSystemAuthContext(workspaceId));
  }

  async suppressManually({
    workspaceId,
    emailAddress,
    unsubscribeTopicId,
  }: SuppressManuallyArgs): Promise<MessageSuppressionWorkspaceEntity> {
    await this.recordUnsubscribe({
      workspaceId,
      emailAddress,
      unsubscribeTopicId,
    });

    const suppression =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const suppressionRepository = this.workspaceOrmManager.getRepository(
          MessageSuppressionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        );
        return suppressionRepository.findOneBy({
          emailAddress: this.normalizeEmailAddress(emailAddress),
          unsubscribeTopicId: isNonEmptyString(unsubscribeTopicId)
            ? unsubscribeTopicId
            : IsNull(),
        });
      }, buildSystemAuthContext(workspaceId));

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
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository = this.workspaceOrmManager.getRepository(
        MessageSuppressionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );
      const suppression = await suppressionRepository.findOneBy({
        id: suppressionId,
      });

      if (!isDefined(suppression)) {
        throw new EmailingDomainException(
          `Suppression ${suppressionId} not found`,
          EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_FOUND,
        );
      }

      const { affected } = await suppressionRepository.delete({
        id: suppressionId,
        reason: Not(In(HARD_SUPPRESSION_REASONS)),
      });

      if (affected === 0) {
        throw new EmailingDomainException(
          `Suppression ${suppressionId} records a ${suppression.reason} and cannot be removed`,
          EmailingDomainExceptionCode.MESSAGE_SUPPRESSION_NOT_REMOVABLE,
        );
      }
    }, buildSystemAuthContext(workspaceId));
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

    const optOuts = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const suppressionRepository = this.workspaceOrmManager.getRepository(
          MessageSuppressionWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
          { shouldSkipEventEmission: true },
        );
        return suppressionRepository.find({
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
      },
      buildSystemAuthContext(workspaceId),
    );

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

    await this.suppressTopicsNotKept({
      workspaceId,
      emailAddress,
      visibleTopics,
      keptTopicIdSet,
    });

    if (!canResubscribe || keptTopicIdSet.size === 0) {
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

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository = this.workspaceOrmManager.getRepository(
        MessageSuppressionWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
        { shouldSkipEventEmission: true },
      );
      return suppressionRepository.delete({
        emailAddress: normalizedEmailAddress,
        unsubscribeTopicId: isNonEmptyString(unsubscribeTopicId)
          ? unsubscribeTopicId
          : IsNull(),
        reason: MessageSuppressionReason.UNSUBSCRIBE,
      });
    }, buildSystemAuthContext(workspaceId));
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
