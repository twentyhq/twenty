import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  WebhookSubscriptionChannelType,
  WebhookSubscriptionStatus,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
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

  public async markAsActive(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    result: WebhookSubscriptionResult,
    clientState?: string,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionExternalId: result.externalSubscriptionId,
      webhookSubscriptionStatus: WebhookSubscriptionStatus.ACTIVE,
      webhookSubscriptionExpiresAt: result.expiresAt,
      webhookSubscriptionFailureCount: 0,
      webhookSubscriptionFailedAt: null,
      ...(isDefined(clientState)
        ? { webhookSubscriptionClientState: clientState }
        : {}),
      ...(channelType === WebhookSubscriptionChannelType.CALENDAR
        ? { webhookSubscriptionExternalResourceId: result.externalResourceId }
        : {}),
    });
  }

  public async markAsFailed(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
  ) {
    await this.getRepository(channelType)
      .createQueryBuilder()
      .update()
      .set({
        webhookSubscriptionStatus: WebhookSubscriptionStatus.FAILED,
        webhookSubscriptionFailedAt: new Date(),
        webhookSubscriptionFailureCount: () =>
          '"webhookSubscriptionFailureCount" + 1',
      })
      .where({ id: channelId })
      .execute();
  }

  public async markAsPermanentlyFailed(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    status:
      | WebhookSubscriptionStatus.FAILED_INSUFFICIENT_PERMISSIONS
      | WebhookSubscriptionStatus.FAILED_UNKNOWN,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionStatus: status,
    });
  }

  public async resetPendingSubscription(
    channelType: WebhookSubscriptionChannelType,
    channelId: string,
    clientState: string,
  ) {
    await this.update(channelType, channelId, {
      webhookSubscriptionClientState: clientState,
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
