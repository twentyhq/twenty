import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import {
  FeatureFlagEntity,
  FeatureFlagKeys,
} from 'src/core/feature-flag/feature-flag.entity';
import { ObjectRecordCreateEvent } from 'src/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/integrations/event-emitter/utils/object-record-changed-properties.util';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import {
  MatchMessageParticipantJob,
  MatchMessageParticipantsJobData,
} from 'src/workspace/messaging/jobs/match-message-participant.job';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@Injectable()
export class MessagingWorkspaceMemberListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @OnEvent('workspaceMember.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberObjectMetadata>,
  ) {
    if (payload.createdRecord.userEmail === null) {
      return;
    }

    const messagingFeatureFlag = await this.featureFlagRepository.findOneBy({
      key: FeatureFlagKeys.IsMessagingEnabled,
      value: true,
      workspaceId: payload.workspaceId,
    });

    if (!messagingFeatureFlag || !messagingFeatureFlag.value) {
      return;
    }

    this.messageQueueService.add<MatchMessageParticipantsJobData>(
      MatchMessageParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        email: payload.createdRecord.userEmail,
        workspaceMemberId: payload.createdRecord.id,
      },
    );
  }

  @OnEvent('workspaceMember.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<WorkspaceMemberObjectMetadata>,
  ) {
    const messagingFeatureFlag = await this.featureFlagRepository.findOneBy({
      key: FeatureFlagKeys.IsMessagingEnabled,
      value: true,
      workspaceId: payload.workspaceId,
    });

    const isMessagingEnabled =
      messagingFeatureFlag && messagingFeatureFlag.value;

    if (
      objectRecordUpdateEventChangedProperties(
        payload.previousRecord,
        payload.updatedRecord,
      ).includes('userEmail') &&
      isMessagingEnabled
    ) {
      this.messageQueueService.add<MatchMessageParticipantsJobData>(
        MatchMessageParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.updatedRecord.userEmail,
          workspaceMemberId: payload.updatedRecord.id,
        },
      );
    }
  }
}
