import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull } from 'typeorm';

import {
  GLOBAL_BLOCKING_SUPPRESSION_REASONS,
  HARD_SUPPRESSION_REASONS,
} from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MessageSuppressionSource } from 'src/engine/core-modules/emailing-domain/types/message-suppression-source.type';
import { type TopicOptOutState } from 'src/engine/core-modules/emailing-domain/types/topic-opt-out-state.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageSuppressionWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-suppression.workspace-entity';
import { MessageTopicWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic.workspace-entity';

// Topics surfaced on the public preferences page.
const PUBLIC_TOPIC_VISIBILITY = 'PUBLIC';

type SuppressArgs = {
  workspaceId: string;
  emailAddress: string;
  reason: MessageSuppressionReason;
  source: MessageSuppressionSource;
  providerEventId?: string | null;
  topicId?: string | null;
};

type TopicOptOutStateArgs = {
  workspaceId: string;
  emailAddress: string;
};

type SetTopicOptOutsArgs = {
  workspaceId: string;
  emailAddress: string;
  // Topics the recipient wants to keep receiving (checked boxes). Visible topics
  // not in this set are opted out of; visible topics in it are re-opted-in.
  keptTopicIds: string[];
};

// MessageSuppression is the single consent store: a row with topicId NULL is a
// global block; a row with a topicId and reason UNSUBSCRIBE is a per-topic
// opt-out. There is no opt-in subscription state.
@Injectable()
export class MessageSuppressionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private getSuppressionRepository(workspaceId: string) {
    return this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      MessageSuppressionWorkspaceEntity,
      { shouldBypassPermissionChecks: true },
    );
  }

  async getSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
  ): Promise<Set<string>> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const suppressedRecipients =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const suppressionRepository =
            await this.getSuppressionRepository(workspaceId);

          return suppressionRepository.find({
            where: {
              emailAddress: { primaryEmail: In(normalizedAddresses) },
              reason: In(GLOBAL_BLOCKING_SUPPRESSION_REASONS),
              topicId: IsNull(),
            },
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    return this.toAddressSet(suppressedRecipients);
  }

  async getTopicSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
    topicId: string,
  ): Promise<Set<string>> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    if (!isNonEmptyArray(normalizedAddresses)) {
      return new Set();
    }

    const suppressedRecipients =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const suppressionRepository =
            await this.getSuppressionRepository(workspaceId);

          return suppressionRepository.find({
            where: {
              emailAddress: { primaryEmail: In(normalizedAddresses) },
              reason: MessageSuppressionReason.UNSUBSCRIBE,
              topicId,
            },
          });
        },
        buildSystemAuthContext(workspaceId),
      );

    return this.toAddressSet(suppressedRecipients);
  }

  // Records a suppression (global when topicId is null, per-topic otherwise).
  // Race-safe against at-least-once SNS deliveries: a concurrent insert losing
  // the unique-index race is reconciled by re-reading and escalating, so two
  // deliveries can never create duplicate rows. Reasons only ever escalate
  // (UNSUBSCRIBE -> BOUNCE/COMPLAINT), never downgrade.
  async suppress({
    workspaceId,
    emailAddress,
    reason,
    source,
    providerEventId = null,
    topicId = null,
  }: SuppressArgs): Promise<void> {
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository =
        await this.getSuppressionRepository(workspaceId);

      const whereKey = {
        emailAddress: { primaryEmail: normalizedEmailAddress },
        topicId: isDefined(topicId) ? topicId : IsNull(),
      };

      const escalateExisting = async (): Promise<boolean> => {
        const existing = await suppressionRepository.findOneBy(whereKey);

        if (!isDefined(existing)) {
          return false;
        }

        if (this.shouldEscalate(existing.reason, reason)) {
          await suppressionRepository.update(existing.id, {
            reason,
            source,
            providerEventId,
          });
        }

        return true;
      };

      if (await escalateExisting()) {
        return;
      }

      try {
        await suppressionRepository.insert({
          emailAddress: {
            primaryEmail: normalizedEmailAddress,
            additionalEmails: null,
          },
          reason,
          source,
          providerEventId,
          topicId,
        });
      } catch (error) {
        // A concurrent delivery won the insert race. The unique index guarantees
        // a single row now exists; reconcile against it instead of failing.
        if (!(await escalateExisting())) {
          throw error;
        }
      }
    }, buildSystemAuthContext(workspaceId));
  }

  // For the public preferences page: every visible topic, flagged with whether
  // this address currently has a per-topic opt-out.
  async getTopicOptOutState({
    workspaceId,
    emailAddress,
  }: TopicOptOutStateArgs): Promise<TopicOptOutState[]> {
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return [];
    }

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const topicRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageTopicWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const visibleTopics = await topicRepository.find({
          where: { visibility: PUBLIC_TOPIC_VISIBILITY },
        });

        if (!isNonEmptyArray(visibleTopics)) {
          return [];
        }

        const suppressionRepository =
          await this.getSuppressionRepository(workspaceId);

        const optOuts = await suppressionRepository.find({
          where: {
            emailAddress: { primaryEmail: normalizedEmailAddress },
            reason: MessageSuppressionReason.UNSUBSCRIBE,
            topicId: In(visibleTopics.map((topic) => topic.id)),
          },
        });

        const optedOutTopicIds = new Set(
          optOuts.map((suppression) => suppression.topicId),
        );

        return visibleTopics.map((topic) => ({
          topicId: topic.id,
          topicName: topic.name,
          optedOut: optedOutTopicIds.has(topic.id),
        }));
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  // For the public preferences form. The token proves control of the address, so
  // recipient-driven re-opt-in is allowed: visible topics not in keptTopicIds get
  // a per-topic opt-out, and re-checked topics have their per-topic UNSUBSCRIBE
  // suppression lifted. Never lifts BOUNCE/COMPLAINT, never lifts global blocks.
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
      if (keptTopicIdSet.has(topicState.topicId)) {
        await this.liftTopicOptOut(
          workspaceId,
          emailAddress,
          topicState.topicId,
        );
      } else {
        await this.suppress({
          workspaceId,
          emailAddress,
          reason: MessageSuppressionReason.UNSUBSCRIBE,
          source: MessageSuppressionSource.SYSTEM,
          topicId: topicState.topicId,
        });
      }
    }
  }

  private async liftTopicOptOut(
    workspaceId: string,
    emailAddress: string,
    topicId: string,
  ): Promise<void> {
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const suppressionRepository =
        await this.getSuppressionRepository(workspaceId);

      // Only a recipient-driven opt-out is reversible — never a hard suppression.
      const existing = await suppressionRepository.findOneBy({
        emailAddress: { primaryEmail: normalizedEmailAddress },
        topicId,
        reason: MessageSuppressionReason.UNSUBSCRIBE,
      });

      if (isDefined(existing)) {
        await suppressionRepository.delete(existing.id);
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private normalizeAddresses(emailAddresses: string[]): string[] {
    return [
      ...new Set(
        emailAddresses.map((emailAddress) => emailAddress.trim().toLowerCase()),
      ),
    ];
  }

  private toAddressSet(
    suppressions: MessageSuppressionWorkspaceEntity[],
  ): Set<string> {
    return new Set(
      suppressions
        .map((suppression) => suppression.emailAddress?.primaryEmail)
        .filter(isNonEmptyString),
    );
  }

  private shouldEscalate(
    existingReason: string,
    incomingReason: MessageSuppressionReason,
  ): boolean {
    const existingIsHard = HARD_SUPPRESSION_REASONS.some(
      (hardReason) => hardReason === existingReason,
    );
    const incomingIsHard = HARD_SUPPRESSION_REASONS.includes(incomingReason);

    return !existingIsHard && incomingIsHard;
  }
}
