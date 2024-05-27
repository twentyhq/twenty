import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { CreateCompanyAndContactService } from 'src/modules/connected-account/auto-companies-and-contacts-creation/services/create-company-and-contact.service';
import { MessageChannelRepository } from 'src/modules/messaging/repositories/message-channel.repository';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-channel.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-participant.workspace-entity';

export type MessagingCreateCompanyAndContactAfterSyncJobData = {
  workspaceId: string;
  messageChannelId: string;
};

@Injectable()
export class MessagingCreateCompanyAndContactAfterSyncJob
  implements MessageQueueJob<MessagingCreateCompanyAndContactAfterSyncJobData>
{
  private readonly logger = new Logger(
    MessagingCreateCompanyAndContactAfterSyncJob.name,
  );
  constructor(
    private readonly createCompanyAndContactService: CreateCompanyAndContactService,
    @InjectObjectMetadataRepository(MessageChannelWorkspaceEntity)
    private readonly messageChannelService: MessageChannelRepository,
    @InjectObjectMetadataRepository(MessageParticipantWorkspaceEntity)
    private readonly messageParticipantRepository: MessageParticipantRepository,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async handle(
    data: MessagingCreateCompanyAndContactAfterSyncJobData,
  ): Promise<void> {
    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId}`,
    );
    const { workspaceId, messageChannelId } = data;

    const messageChannel = await this.messageChannelService.getByIds(
      [messageChannelId],
      workspaceId,
    );

    const { handle, isContactAutoCreationEnabled } = messageChannel[0];

    if (!isContactAutoCreationEnabled) {
      return;
    }

    const isContactCreationForSentAndReceivedEmailsEnabledFeatureFlag =
      await this.featureFlagRepository.findOneBy({
        workspaceId: workspaceId,
        key: FeatureFlagKeys.IsContactCreationForSentAndReceivedEmailsEnabled,
        value: true,
      });

    const isContactCreationForSentAndReceivedEmailsEnabled =
      isContactCreationForSentAndReceivedEmailsEnabledFeatureFlag?.value;

    const contactsToCreate = isContactCreationForSentAndReceivedEmailsEnabled
      ? await this.messageParticipantRepository.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberId(
          messageChannelId,
          workspaceId,
        )
      : await this.messageParticipantRepository.getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberIdAndMessageOutgoing(
          messageChannelId,
          workspaceId,
        );

    await this.createCompanyAndContactService.createCompaniesAndContactsAndUpdateParticipants(
      handle,
      contactsToCreate,
      workspaceId,
    );

    this.logger.log(
      `create contacts and companies after sync for workspace ${data.workspaceId} and messageChannel ${data.messageChannelId} done`,
    );
  }
}
