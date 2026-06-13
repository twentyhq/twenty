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
import { MessageTopicService } from 'src/modules/emailing/services/message-topic.service';

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

// Suppression is the single consent store, held in a core table (it is
// compliance state keyed by email address, written only by webhook handlers and
// the public unsubscribe controller — none of which run in a workspace/user
// context). A row with topicId NULL is a global block; a row with a topicId and
// reason UNSUBSCRIBE is a per-topic opt-out. There is no opt-in state.
@Injectable()
export class MessageSuppressionService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageSuppressionEntity)
    private readonly suppressionRepository: WorkspaceScopedRepository<MessageSuppressionEntity>,
    private readonly messageTopicService: MessageTopicService,
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
        topicId: IsNull(),
      },
    });

    return new Set(suppressions.map((suppression) => suppression.emailAddress));
  }

  async getTopicSuppressedAddresses(
    workspaceId: string,
    emailAddresses: string[],
    topicId: string,
  ): Promise<Set<string>> {
    const normalizedAddresses = this.normalizeAddresses(emailAddresses);

    // An undefined topicId would silently drop the key from the WHERE clause
    // and return every topic's opt-outs (cross-topic over-suppression).
    if (!isNonEmptyArray(normalizedAddresses) || !isNonEmptyString(topicId)) {
      return new Set();
    }

    const suppressions = await this.suppressionRepository.find(workspaceId, {
      where: {
        emailAddress: In(normalizedAddresses),
        reason: MessageSuppressionReason.UNSUBSCRIBE,
        topicId,
      },
    });

    return new Set(suppressions.map((suppression) => suppression.emailAddress));
  }

  // Records a suppression (global when topicId is null, per-topic otherwise).
  // Race-safe against at-least-once SNS deliveries: losing the unique-index race
  // on insert is reconciled by re-reading and escalating, so two deliveries can
  // never create duplicate rows. Reasons only ever escalate (UNSUBSCRIBE ->
  // BOUNCE/COMPLAINT), never downgrade.
  async suppress({
    workspaceId,
    emailAddress,
    reason,
    source,
    providerEventId = null,
    topicId = null,
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
      : topicId;

    const whereKey = {
      emailAddress: normalizedEmailAddress,
      topicId: isDefined(effectiveTopicId) ? effectiveTopicId : IsNull(),
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
        topicId: effectiveTopicId,
      });
    } catch (error) {
      // A concurrent delivery won the insert race. The unique index guarantees
      // a single row now exists; reconcile against it instead of failing.
      const isUniqueViolation =
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      if (!isUniqueViolation || !(await escalateExisting())) {
        throw error;
      }
    }
  }

  // For the public preferences page: every visible topic, flagged with whether
  // this address currently has a per-topic opt-out.
  async getTopicOptOutState({
    workspaceId,
    emailAddress,
  }: TopicOptOutStateArgs): Promise<TopicOptOutState[]> {
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return [];
    }

    const visibleTopics =
      await this.messageTopicService.findPublicTopics(workspaceId);

    if (!isNonEmptyArray(visibleTopics)) {
      return [];
    }

    const optOuts = await this.suppressionRepository.find(workspaceId, {
      where: {
        emailAddress: normalizedEmailAddress,
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
      const shouldReceive = keptTopicIdSet.has(topicState.topicId);

      // The usual submit changes 0-1 checkboxes; skip topics already in the
      // requested state instead of issuing no-op writes.
      if (shouldReceive === !topicState.optedOut) {
        continue;
      }

      if (shouldReceive) {
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
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    // Only a recipient-driven opt-out is reversible — never a hard suppression,
    // never a global block (those have topicId NULL and don't match).
    await this.suppressionRepository.delete(workspaceId, {
      emailAddress: normalizedEmailAddress,
      topicId,
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
