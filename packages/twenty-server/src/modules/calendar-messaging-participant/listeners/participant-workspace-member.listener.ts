import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/integrations/event-emitter/types/object-record-update.event';
import { objectRecordChangedProperties as objectRecordUpdateEventChangedProperties } from 'src/engine/integrations/event-emitter/utils/object-record-changed-properties.util';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  MatchParticipantJobData,
  MatchParticipantJob,
} from 'src/modules/calendar-messaging-participant/jobs/match-participant.job';
import {
  UnmatchParticipantJobData,
  UnmatchParticipantJob,
} from 'src/modules/calendar-messaging-participant/jobs/unmatch-participant.job';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@Injectable()
export class ParticipantWorkspaceMemberListener {
  constructor(
    @Inject(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('workspaceMember.created')
  async handleCreatedEvent(
    payload: ObjectRecordCreateEvent<WorkspaceMemberObjectMetadata>,
  ) {
    if (payload.properties.after.userEmail === null) {
      return;
    }

    await this.messageQueueService.add<MatchParticipantJobData>(
      MatchParticipantJob.name,
      {
        workspaceId: payload.workspaceId,
        email: payload.properties.after.userEmail,
        workspaceMemberId: payload.properties.after.id,
      },
    );
  }

  @OnEvent('workspaceMember.updated')
  async handleUpdatedEvent(
    payload: ObjectRecordUpdateEvent<WorkspaceMemberObjectMetadata>,
  ) {
    if (
      objectRecordUpdateEventChangedProperties(
        payload.properties.before,
        payload.properties.after,
      ).includes('userEmail')
    ) {
      await this.messageQueueService.add<UnmatchParticipantJobData>(
        UnmatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.properties.before.userEmail,
          personId: payload.recordId,
        },
      );

      await this.messageQueueService.add<MatchParticipantJobData>(
        MatchParticipantJob.name,
        {
          workspaceId: payload.workspaceId,
          email: payload.properties.after.userEmail,
          workspaceMemberId: payload.recordId,
        },
      );
    }
  }
}
