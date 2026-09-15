import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { v4 } from 'uuid';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { CLAIMABLE_WEBHOOK_SUBSCRIPTION_STATUSES } from 'src/modules/connected-account/webhook-subscription-manager/constants/claimable-webhook-subscription-statuses.constant';
import { WEBHOOK_SUBSCRIPTION_CLAIM_STALE_MS } from 'src/modules/connected-account/webhook-subscription-manager/constants/webhook-subscription-claim-stale-ms.constant';
import {
  type WebhookSubscribableChannel,
  type WebhookSubscriptionResult,
} from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

@Injectable()
export class WebhookSubscriptionStatusService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
  ) {}

  public async claimSubscriptionCreation(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const clientState = v4();

    const updateResult = await this.getRepository(channelType)
      .createQueryBuilder()
      .update()
      .set({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.PENDING,
        webhookSubscriptionClientState: clientState,
      })
      .where('"id" = :channelId', { channelId })
      .andWhere('"workspaceId" = :workspaceId', { workspaceId })
      .andWhere(
        `("webhookSubscriptionStatus" IS NULL
          OR "webhookSubscriptionStatus" IN (:...claimableStatuses)
          OR ("webhookSubscriptionStatus" = :pendingStatus AND "updatedAt" <= :staleClaimBefore))`,
        {
          claimableStatuses: CLAIMABLE_WEBHOOK_SUBSCRIPTION_STATUSES,
          pendingStatus: WebhookSubscriptionStatus.PENDING,
          staleClaimBefore: new Date(
            Date.now() - WEBHOOK_SUBSCRIPTION_CLAIM_STALE_MS,
          ),
        },
      )
      .returning('id')
      .execute();

    return updateResult.raw.length > 0 ? clientState : null;
  }

  public async settleClaimedSubscription(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    workspaceId: string,
    clientState: string,
    result: WebhookSubscriptionResult,
  ): Promise<boolean> {
    const { affected } = await this.getRepository(channelType).update(
      {
        id: channelId,
        workspaceId,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.PENDING,
        webhookSubscriptionClientState: clientState,
      },
      {
        webhookSubscriptionExternalId: result.externalSubscriptionId,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
        webhookSubscriptionExpiresAt: result.expiresAt,
        ...(channelType === WebhookSubscriptionChannelType.CALENDAR
          ? { webhookSubscriptionExternalResourceId: result.externalResourceId }
          : {}),
      },
    );

    return isDefined(affected) && affected > 0;
  }

  public async markAsActive(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    result: WebhookSubscriptionResult,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionExternalId: result.externalSubscriptionId,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      webhookSubscriptionExpiresAt: result.expiresAt,
      ...(channelType === WebhookSubscriptionChannelType.CALENDAR
        ? { webhookSubscriptionExternalResourceId: result.externalResourceId }
        : {}),
    });
  }

  public async markAsFailed(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
    });
  }

  public async markAsExpired(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionStatus: WebhookSubscriptionStatus.EXPIRED,
    });
  }

  public async resetPendingSubscription(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionExpiresAt: null,
    });
  }

  public async clearRemovedSubscription(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    workspaceId: string,
    removedSubscriptionId: string | null,
  ): Promise<boolean> {
    const { affected } = await this.getRepository(channelType).update(
      {
        id: channelId,
        workspaceId,
        ...(isDefined(removedSubscriptionId)
          ? { webhookSubscriptionExternalId: removedSubscriptionId }
          : {}),
      },
      {
        webhookSubscriptionExternalId: null,
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionExpiresAt: null,
        ...(channelType === WebhookSubscriptionChannelType.CALENDAR
          ? { webhookSubscriptionExternalResourceId: null }
          : {}),
      },
    );

    return isDefined(affected) && affected > 0;
  }

  private update(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    payload: QueryDeepPartialEntity<WebhookSubscribableChannel>,
  ) {
    return this.getRepository(channelType).update(channelId, payload);
  }

  private getRepository(
    channelType: WebhookSubscriptionChannelType,
  ): Repository<WebhookSubscribableChannel> {
    return (
      channelType === WebhookSubscriptionChannelType.CALENDAR
        ? this.calendarChannelRepository
        : this.messageChannelRepository
    ) as Repository<WebhookSubscribableChannel>;
  }
}
