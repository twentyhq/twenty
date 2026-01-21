import { Injectable } from '@nestjs/common';

import { LessThan } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  MessageChannelSubscriptionProvider,
  MessageChannelSubscriptionStatus,
  MessageChannelSubscriptionWorkspaceEntity,
} from 'src/modules/messaging/common/standard-objects/message-channel-subscription.workspace-entity';

@Injectable()
export class MessageChannelSubscriptionService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async findByMessageChannelId(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<MessageChannelSubscriptionWorkspaceEntity | null> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    return subscriptionRepository.findOne({
      where: { messageChannelId },
    });
  }

  async existsForChannel(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const subscription = await this.findByMessageChannelId(
      messageChannelId,
      workspaceId,
    );

    return subscription !== null;
  }

  async create(
    data: {
      messageChannelId: string;
      provider: MessageChannelSubscriptionProvider;
      status: MessageChannelSubscriptionStatus;
      expiresAt?: Date | null;
      providerSubscriptionId?: string | null;
    },
    workspaceId: string,
  ): Promise<MessageChannelSubscriptionWorkspaceEntity> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    const subscription = subscriptionRepository.create({
      messageChannelId: data.messageChannelId,
      provider: data.provider,
      status: data.status,
      expiresAt: data.expiresAt?.toISOString() ?? null,
      providerSubscriptionId: data.providerSubscriptionId ?? null,
      failureCount: 0,
      lastError: null,
      lastNotificationAt: null,
    });

    return subscriptionRepository.save(subscription);
  }

  async updateStatus(
    subscriptionId: string,
    status: MessageChannelSubscriptionStatus,
    workspaceId: string,
    additionalData?: {
      expiresAt?: Date | null;
      providerSubscriptionId?: string | null;
      lastError?: string | null;
      failureCount?: number;
    },
  ): Promise<void> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    const updateData: Partial<MessageChannelSubscriptionWorkspaceEntity> = {
      status,
    };

    if (additionalData?.expiresAt !== undefined) {
      updateData.expiresAt = additionalData.expiresAt?.toISOString() ?? null;
    }

    if (additionalData?.providerSubscriptionId !== undefined) {
      updateData.providerSubscriptionId = additionalData.providerSubscriptionId;
    }

    if (additionalData?.lastError !== undefined) {
      updateData.lastError = additionalData.lastError;
    }

    if (additionalData?.failureCount !== undefined) {
      updateData.failureCount = additionalData.failureCount;
    }

    await subscriptionRepository.update({ id: subscriptionId }, updateData);
  }

  async recordNotification(
    subscriptionId: string,
    workspaceId: string,
  ): Promise<void> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    await subscriptionRepository.update(
      { id: subscriptionId },
      { lastNotificationAt: new Date().toISOString() },
    );
  }

  async incrementFailureCount(
    subscriptionId: string,
    error: string,
    workspaceId: string,
  ): Promise<void> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    const subscription = await subscriptionRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return;
    }

    await subscriptionRepository.update(
      { id: subscriptionId },
      {
        failureCount: subscription.failureCount + 1,
        lastError: error,
      },
    );
  }

  async delete(messageChannelId: string, workspaceId: string): Promise<void> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    await subscriptionRepository.delete({ messageChannelId });
  }

  async findExpiringSoon(
    daysUntilExpiration: number,
    workspaceId: string,
  ): Promise<MessageChannelSubscriptionWorkspaceEntity[]> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    const expirationThreshold = new Date();

    expirationThreshold.setDate(
      expirationThreshold.getDate() + daysUntilExpiration,
    );

    return subscriptionRepository.find({
      where: {
        status: MessageChannelSubscriptionStatus.ACTIVE,
        expiresAt: LessThan(expirationThreshold.toISOString()),
      },
    });
  }

  async findAllActive(
    workspaceId: string,
  ): Promise<MessageChannelSubscriptionWorkspaceEntity[]> {
    const subscriptionRepository =
      await this.globalWorkspaceOrmManager.getRepository<MessageChannelSubscriptionWorkspaceEntity>(
        workspaceId,
        'messageChannelSubscription',
      );

    return subscriptionRepository.find({
      where: {
        status: MessageChannelSubscriptionStatus.ACTIVE,
      },
    });
  }
}
