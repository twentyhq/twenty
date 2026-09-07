import { Injectable } from '@nestjs/common';

import { MessageCampaignStatus } from 'twenty-shared/types';

import { withWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type SendScheduledCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/send-scheduled-campaign-job-data.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { SEND_SCHEDULED_CAMPAIGN_JOB } from 'src/modules/emailing/constants/send-scheduled-campaign-job.constant';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignService } from 'src/modules/emailing/services/message-campaign.service';
import { type SendCampaignResult } from 'src/modules/emailing/types/send-campaign-result.type';

@Injectable()
export class MessageCampaignScheduleService {
  constructor(
    @InjectMessageQueue(MessageQueue.delayedJobsQueue)
    private readonly delayedMessageQueueService: MessageQueueService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
    private readonly messageCampaignService: MessageCampaignService,
  ) {}

  async schedule({
    workspaceId,
    userWorkspaceId,
    campaignId,
    scheduledAt,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
    scheduledAt: Date;
  }): Promise<SendCampaignResult> {
    const delayMs = scheduledAt.getTime() - Date.now();

    if (delayMs <= 0) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} cannot be scheduled for ${scheduledAt.toISOString()}, which is not in the future`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SCHEDULE_NOT_IN_FUTURE,
      );
    }

    const {
      roleId,
      sendableRecipients,
      audience,
      expectedStatus,
      expectedScheduledAt,
    } = await this.messageCampaignService.prepareCampaignSendOrThrow({
      workspaceId,
      userWorkspaceId,
      campaignId,
    });

    const scheduled =
      await this.messageCampaignLifecycleService.transitionCampaignStatus({
        workspaceId,
        campaignId,
        roleId,
        from: expectedStatus,
        fromScheduledAt: expectedScheduledAt ?? undefined,
        to: MessageCampaignStatus.SCHEDULED,
        scheduledAt,
      });

    if (!scheduled) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is no longer sendable from ${expectedStatus}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    await this.delayedMessageQueueService
      .add<SendScheduledCampaignJobData>(
        SEND_SCHEDULED_CAMPAIGN_JOB,
        {
          workspaceId,
          campaignId,
          userWorkspaceId,
          scheduledAt: scheduledAt.toISOString(),
        },
        { delay: delayMs },
      )
      .catch(async (error) => {
        await this.messageCampaignLifecycleService.transitionCampaignStatus({
          workspaceId,
          campaignId,
          roleId,
          from: MessageCampaignStatus.SCHEDULED,
          fromScheduledAt: scheduledAt,
          to: expectedStatus,
          scheduledAt: expectedScheduledAt,
        });

        throw error;
      });

    return {
      campaignId,
      queuedCount: sendableRecipients.length,
      audience,
    };
  }

  async sendScheduled({
    workspaceId,
    campaignId,
    userWorkspaceId,
    scheduledAt,
  }: SendScheduledCampaignJobData): Promise<void> {
    await withWorkspaceAuthContext(
      buildSystemAuthContext(workspaceId),
      async () => {
        const scheduledAtDate = new Date(scheduledAt);

        const isStillScheduledForThisTime =
          await this.messageCampaignLifecycleService.isCampaignScheduledFor({
            workspaceId,
            campaignId,
            scheduledAt: scheduledAtDate,
          });

        if (!isStillScheduledForThisTime) {
          return;
        }

        const prepared = await this.messageCampaignService
          .prepareCampaignSendOrThrow({
            workspaceId,
            userWorkspaceId,
            campaignId,
          })
          .catch(async (error) => {
            await this.messageCampaignLifecycleService.transitionCampaignStatus(
              {
                workspaceId,
                campaignId,
                from: MessageCampaignStatus.SCHEDULED,
                fromScheduledAt: scheduledAtDate,
                to: MessageCampaignStatus.DRAFT,
                scheduledAt: null,
              },
            );

            throw error;
          });

        await this.messageCampaignService.claimAndMaterializeOrThrow({
          workspaceId,
          userWorkspaceId,
          campaignId,
          prepared,
          from: MessageCampaignStatus.SCHEDULED,
          fromScheduledAt: scheduledAtDate,
        });
      },
    );
  }
}
