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
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';

@Injectable()
export class MessagingPersonListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  @OnEvent('person.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<PersonObjectMetadata>,
  ) {
    if (payload.createdRecord.email === null) {
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
        email: payload.createdRecord.email,
        personId: payload.createdRecord.id,
      },
    );
  }

  @OnEvent('person.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<PersonObjectMetadata>,
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
      ).includes('email') &&
      isMessagingEnabled
    ) {
      this.messageQueueService.add<MatchMessageParticipantsJobData>(
        MatchMessageParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.updatedRecord.email,
          personId: payload.updatedRecord.id,
        },
      );
    }
  }
}
