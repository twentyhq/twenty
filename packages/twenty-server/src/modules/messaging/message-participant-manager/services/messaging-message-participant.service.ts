import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';

@Injectable()
export class MessagingMessageParticipantService {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
  ) {}

  public async saveMessageParticipants(
    participants: ParticipantWithMessageId[],
    transactionManager?: WorkspaceEntityManager,
  ): Promise<void> {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const existingParticipantsBasedOnMessageIds =
      await messageParticipantRepository.find({
        where: {
          messageId: In(
            participants.map((participant) => participant.messageId),
          ),
        },
      });

    const participantsToCreate: Pick<
      MessageParticipantWorkspaceEntity,
      'messageId' | 'handle' | 'displayName' | 'role'
    >[] = participants
      .filter(
        (participant) =>
          !existingParticipantsBasedOnMessageIds.find(
            (existingParticipant) =>
              existingParticipant.messageId === participant.messageId &&
              existingParticipant.handle === participant.handle &&
              existingParticipant.displayName === participant.displayName &&
              existingParticipant.role === participant.role,
          ),
      )
      .map((participant) => {
        return {
          messageId: participant.messageId,
          handle: participant.handle,
          displayName: participant.displayName,
          role: participant.role,
        };
      });

    const createdParticipants = await messageParticipantRepository.insert(
      participantsToCreate,
      transactionManager,
    );

    await this.matchParticipantService.matchParticipants({
      participants: createdParticipants.raw ?? [],
      objectMetadataName: 'messageParticipant',
      transactionManager,
      matchWith: 'workspaceMemberAndPerson',
    });
  }
}
