import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

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
    transactionManager?: EntityManager,
  ): Promise<void> {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const savedParticipants = await messageParticipantRepository.save(
      participants.map((participant) => {
        return {
          messageId: participant.messageId,
          role: participant.role,
          handle: participant.handle,
          displayName: participant.displayName,
        };
      }),
      {},
      transactionManager,
    );

    await this.matchParticipantService.matchParticipants(
      savedParticipants,
      'messageParticipant',
      transactionManager,
    );
  }
}
