import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any } from 'typeorm';

import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class MatchParticipantService<
  ParticipantWorkspaceEntity extends
    | CalendarEventParticipantWorkspaceEntity
    | MessageParticipantWorkspaceEntity,
> {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  private async getParticipantRepository(
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant',
  ) {
    if (objectMetadataName === 'messageParticipant') {
      return await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        objectMetadataName,
      );
    }

    return await this.twentyORMManager.getRepository<CalendarEventParticipantWorkspaceEntity>(
      objectMetadataName,
    );
  }

  public async matchParticipants(
    participants: ParticipantWorkspaceEntity[],
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant',
    transactionManager?: any,
  ) {
    const participantRepository =
      await this.getParticipantRepository(objectMetadataName);

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    const participantIds = participants.map((participant) => participant.id);
    const uniqueParticipantsHandles = [
      ...new Set(participants.map((participant) => participant.handle)),
    ];

    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
      );

    const people = await personRepository.find(
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
      const person = people.find((person) => person.email === handle);

      const workspaceMember = workspaceMembers.find(
        (workspaceMember) => workspaceMember.userEmail === handle,
      );

      await participantRepository.update(
        {
          id: Any(participantIds),
          handle,
        },
        {
          personId: person?.id,
          workspaceMemberId: workspaceMember?.id,
        },
        transactionManager,
      );
    }

    const matchedParticipants = await participantRepository.find(
      {
        where: {
          id: Any(participantIds),
          handle: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    this.eventEmitter.emit(`${objectMetadataName}.matched`, {
      workspaceId,
      workspaceMemberId: null,
      participants: matchedParticipants,
    });
  }

  public async matchParticipantsAfterPersonOrWorkspaceMemberCreation(
    handle: string,
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant',
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const participantRepository =
      await this.getParticipantRepository(objectMetadataName);

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    const participantsToUpdate = await participantRepository.find({
      where: {
        handle,
      },
    });

    const participantIdsToUpdate = participantsToUpdate.map(
      (participant) => participant.id,
    );

    if (personId) {
      await participantRepository.update(
        {
          id: Any(participantIdsToUpdate),
        },
        {
          person: {
            id: personId,
          },
        },
      );

      const updatedParticipants = await participantRepository.find({
        where: {
          id: Any(participantIdsToUpdate),
        },
      });

      this.eventEmitter.emit(`${objectMetadataName}.matched`, {
        workspaceId,
        name: `${objectMetadataName}.matched`,
        workspaceMemberId: null,
        participants: updatedParticipants,
      });
    }

    if (workspaceMemberId) {
      await participantRepository.update(
        {
          id: Any(participantIdsToUpdate),
        },
        {
          workspaceMember: {
            id: workspaceMemberId,
          },
        },
      );
    }
  }

  public async unmatchParticipants(
    handle: string,
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant',
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const participantRepository =
      await this.getParticipantRepository(objectMetadataName);

    if (personId) {
      await participantRepository.update(
        {
          handle,
        },
        {
          person: null,
        },
      );
    }
    if (workspaceMemberId) {
      await participantRepository.update(
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
