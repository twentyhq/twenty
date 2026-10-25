import { Scope } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { PersonHandleFieldService } from 'src/modules/match-participant/person-handle-field/person-handle-field.service';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';

export type PersonHandleMatching = {
  fieldUniversalIdentifier: string;
  messageChannelIds: string[];
  handles: string[];
  changedPersonIds: string[];
};

export type MessageParticipantMatchParticipantJobData = {
  workspaceId: string;
  participantMatching: {
    personEmails: string[];
    workspaceMemberIds: string[];
  };
  personHandleMatching?: PersonHandleMatching[];
};

@Processor({
  queueName: MessageQueue.messagingQueue,
  scope: Scope.REQUEST,
})
export class MessageParticipantMatchParticipantJob {
  constructor(
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
    private readonly personHandleFieldService: PersonHandleFieldService,
  ) {}

  @Process(MessageParticipantMatchParticipantJob.name)
  async handle(data: MessageParticipantMatchParticipantJobData): Promise<void> {
    const { participantMatching, personHandleMatching, workspaceId } = data;

    if (participantMatching.personEmails.length > 0) {
      await this.matchParticipantService.matchParticipantsForPeople({
        participantMatching,
        objectMetadataName: 'messageParticipant',
        workspaceId,
      });
    }

    for (const {
      fieldUniversalIdentifier,
      messageChannelIds,
      handles,
      changedPersonIds,
    } of personHandleMatching ?? []) {
      const personHandleField =
        await this.personHandleFieldService.findByUniversalIdentifier({
          workspaceId,
          fieldUniversalIdentifier,
        });

      if (isDefined(personHandleField)) {
        await this.matchParticipantService.matchParticipantsForPersonHandles({
          personHandleField,
          messageChannelIds,
          handles,
          changedPersonIds,
          workspaceId,
        });
      }
    }

    if (participantMatching.workspaceMemberIds.length > 0) {
      await this.matchParticipantService.matchParticipantsForWorkspaceMembers({
        participantMatching,
        objectMetadataName: 'messageParticipant',
        workspaceId,
      });
    }
  }
}
