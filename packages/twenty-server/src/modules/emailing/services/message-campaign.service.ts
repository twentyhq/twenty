import { Injectable } from '@nestjs/common';

import { z } from 'zod';

import { MATERIALIZE_CAMPAIGN_JOB } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { EmailingDomainStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-status.type';
import { buildUnsubscribeHostnameNotReadyMessage } from 'src/engine/core-modules/emailing-domain/drivers/utils/build-unsubscribe-hostname-not-ready-message.util';
import { isUnsubscribeHostnameReady } from 'src/engine/core-modules/emailing-domain/drivers/utils/is-unsubscribe-hostname-ready.util';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type EmailingDomainSendEmailResult } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-send-email-result.type';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type CampaignSkippedBreakdown } from 'src/engine/core-modules/emailing-domain/types/campaign-skipped-breakdown.type';
import { type MaterializeCampaignJobData } from 'src/engine/core-modules/emailing-domain/types/materialize-campaign-job-data.type';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MessageChannelMetadataService } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { EmailingDomainSenderService } from 'src/modules/emailing/services/emailing-domain-sender.service';
import { MessageCampaignAudienceService } from 'src/modules/emailing/services/message-campaign-audience.service';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { collectCampaignVariableNamesFromTemplates } from 'src/modules/emailing/utils/collect-campaign-variable-names-from-templates.util';
import { renderCampaignEmail } from 'src/modules/emailing/utils/render-campaign-email.util';
import { sendableDraftCampaignSchema } from 'src/modules/emailing/zod-schemas/sendable-draft-campaign.zod-schema';
import { MessageCampaignStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

type SendCampaignResult = {
  campaignId: string;
  queuedCount: number;
  skipped: CampaignSkippedBreakdown;
};

type SendableDraftCampaign = z.infer<typeof sendableDraftCampaignSchema>;

@Injectable()
export class MessageCampaignService {
  constructor(
    @InjectWorkspaceScopedRepository(EmailingDomainEntity)
    private readonly emailingDomainRepository: WorkspaceScopedRepository<EmailingDomainEntity>,
    private readonly emailingDomainSenderService: EmailingDomainSenderService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectMessageQueue(MessageQueue.emailQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly messageChannelMetadataService: MessageChannelMetadataService,
    private readonly userRoleService: UserRoleService,
    private readonly campaignVariableService: CampaignVariableService,
    private readonly messageCampaignAudienceService: MessageCampaignAudienceService,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
  ) {}

  async send({
    workspaceId,
    userWorkspaceId,
    campaignId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    campaignId: string;
  }): Promise<SendCampaignResult> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const { fromAddress, listId } =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const { fromAddress, listId } =
            await this.findSendableDraftCampaignOrThrow({
              workspaceId,
              campaignId,
              roleId,
            });

          return { fromAddress: fromAddress.primaryEmail, listId };
        },
      );

    const emailingDomain = await this.findSendReadyEmailingDomainOrThrow({
      workspaceId,
      fromAddress,
    });

    const { recipients, skipped } =
      await this.messageCampaignAudienceService.resolveNormalizedAudience({
        workspaceId,
        listId,
        roleId,
      });

    const messageChannel =
      await this.messageChannelMetadataService.getOrCreateEmailGroupChannel({
        fromAddress,
        userWorkspaceId,
        workspaceId,
      });

    const claimed =
      await this.messageCampaignLifecycleService.transitionCampaignStatus({
        workspaceId,
        campaignId,
        roleId,
        from: MessageCampaignStatus.DRAFT,
        to: MessageCampaignStatus.SENDING,
      });

    if (!claimed) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is no longer a sendable draft`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    await this.messageQueueService
      .add<MaterializeCampaignJobData>(
        MATERIALIZE_CAMPAIGN_JOB,
        {
          workspaceId,
          campaignId,
          messageChannelId: messageChannel.id,
          emailingDomainId: emailingDomain.id,
          recipients,
        },
        { retryLimit: 3 },
      )
      .catch(async (error) => {
        await this.messageCampaignLifecycleService.transitionCampaignStatus({
          workspaceId,
          campaignId,
          roleId,
          from: MessageCampaignStatus.SENDING,
          to: MessageCampaignStatus.DRAFT,
        });

        throw error;
      });

    return { campaignId, queuedCount: recipients.length, skipped };
  }

  async sendTest({
    workspaceId,
    toAddress,
    subject,
    html,
    fromAddress,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    toAddress: string;
    subject: string;
    html: string;
    fromAddress: string;
    unsubscribeTopicId?: string;
  }): Promise<EmailingDomainSendEmailResult> {
    const emailingDomain = await this.findSendReadyEmailingDomainOrThrow({
      workspaceId,
      fromAddress,
    });

    const variables =
      await this.campaignVariableService.buildVariablesForPerson(
        workspaceId,
        null,
      );
    const rendered = await renderCampaignEmail({
      subjectTemplate: subject,
      bodyTemplate: html,
      variables,
    });

    return this.emailingDomainSenderService.sendEmail(
      workspaceId,
      emailingDomain.id,
      {
        from: fromAddress,
        to: [toAddress],
        subject: rendered.subject,
        text: rendered.plainText,
        html: rendered.html,
        unsubscribeTopicId,
      },
    );
  }

  private async findSendReadyEmailingDomainOrThrow({
    workspaceId,
    fromAddress,
  }: {
    workspaceId: string;
    fromAddress: string;
  }): Promise<EmailingDomainEntity> {
    const emailingDomain = await this.emailingDomainRepository.findOne(
      workspaceId,
      {
        where: {
          domain: getDomainFromEmail(fromAddress)?.toLowerCase(),
          status: EmailingDomainStatus.VERIFIED,
        },
      },
    );

    if (!isDefined(emailingDomain)) {
      throw new EmailingDomainException(
        `No verified emailing domain matches the from address ${fromAddress}`,
        EmailingDomainExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED,
      );
    }

    if (!isUnsubscribeHostnameReady(emailingDomain)) {
      throw new EmailingDomainException(
        buildUnsubscribeHostnameNotReadyMessage(emailingDomain),
        EmailingDomainExceptionCode.EMAILING_DOMAIN_UNSUBSCRIBE_NOT_READY,
      );
    }

    return emailingDomain;
  }

  private async findSendableDraftCampaignOrThrow({
    workspaceId,
    campaignId,
    roleId,
  }: {
    workspaceId: string;
    campaignId: string;
    roleId: string;
  }): Promise<SendableDraftCampaign> {
    const campaignRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageCampaignWorkspaceEntity,
        { unionOf: [roleId] },
      );

    const campaign = await campaignRepository.findOne({
      where: { id: campaignId },
    });

    if (!isDefined(campaign)) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} not found`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND,
      );
    }

    const sendableCampaign = sendableDraftCampaignSchema.safeParse(campaign);

    if (!sendableCampaign.success) {
      throw new EmailingDomainException(
        `Campaign ${campaignId} is not sendable: ${sendableCampaign.error.issues
          .map((issue) => `${issue.path.join('.')} ${issue.message}`)
          .join(', ')}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    await this.campaignVariableService.assertKnownVariables(
      workspaceId,
      collectCampaignVariableNamesFromTemplates({
        subject: sendableCampaign.data.subject,
        bodyTemplate: sendableCampaign.data.bodyTemplate,
      }),
    );

    return sendableCampaign.data;
  }
}
