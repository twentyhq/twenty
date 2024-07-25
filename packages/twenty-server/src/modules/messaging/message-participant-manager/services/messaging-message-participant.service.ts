import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any, EntityManager } from 'typeorm';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class MessagingMessageParticipantService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async saveMessageParticipants(
    participants: ParticipantWithMessageId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<MessageParticipantWorkspaceEntity[]> {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const messageParticipants = await messageParticipantRepository.save(
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

    await this.matchMessageParticipants(
      messageParticipants,
      workspaceId,
      transactionManager,
    );

    return messageParticipants;
  }

  private async matchMessageParticipants(
    messageParticipants: MessageParticipantWorkspaceEntity[],
    workspaceId: string,
    transactionManager?: any,
  ) {
    const uniqueParticipantsHandles = [
      ...new Set(messageParticipants.map((participant) => participant.handle)),
    ];

    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
      );

    const persons = await personRepository.find(
      {
        where: {
          email: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    const workspaceMembers = await workspaceMemberRepository.find(
      {
        where: {
          userEmail: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    for (const handle of uniqueParticipantsHandles) {
      const person = persons.find((person) => person.email === handle);

      const workspaceMember = workspaceMembers.find(
        (workspaceMember) => workspaceMember.userEmail === handle,
      );

      await messageParticipantRepository.update(
        {
          handle,
        },
        {
          personId: person?.id,
          workspaceMemberId: workspaceMember?.id,
        },
        transactionManager,
      );
    }

    this.eventEmitter.emit(`messageParticipant.matched`, {
      workspaceId,
      workspaceMemberId: null,
      messageParticipants,
    });
  }

  public async matchMessageParticipantAfterPersonOrWorkspaceMemberCreation(
    handle: string,
    workspaceId: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const messageParticipantsToUpdate = await messageParticipantRepository.find(
      {
        where: {
          handle,
        },
      },
    );

    const messageParticipantIdsToUpdate = messageParticipantsToUpdate.map(
      (participant) => participant.id,
    );

    if (personId) {
      await messageParticipantRepository.update(
        {
          id: Any(messageParticipantIdsToUpdate),
        },
        {
          person: {
            id: personId,
          },
        },
      );

      const updatedMessageParticipants =
        await messageParticipantRepository.find({
          where: {
            id: Any(messageParticipantIdsToUpdate),
          },
        });

      this.eventEmitter.emit(`messageParticipant.matched`, {
        workspaceId,
        workspaceMemberId: null,
        messageParticipants: updatedMessageParticipants,
      });
    }

    if (workspaceMemberId) {
      await messageParticipantRepository.update(
        {
          id: Any(messageParticipantIdsToUpdate),
        },
        {
          workspaceMember: {
            id: workspaceMemberId,
          },
        },
      );
    }
  }

  public async unmatchMessageParticipants(
    handle: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    if (personId) {
      await messageParticipantRepository.update(
        {
          handle,
        },
        {
          person: null,
        },
      );
    }
    if (workspaceMemberId) {
      await messageParticipantRepository.update(
        {
          handle,
        },
        {
          workspaceMember: null,
        },
      );
    }
  }
}
