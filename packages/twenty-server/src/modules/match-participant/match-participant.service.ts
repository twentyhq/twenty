import { Injectable } from '@nestjs/common';

import { Any, Equal } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
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
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
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

  public async matchParticipants({
    participants,
    objectMetadataName,
    transactionManager,
  }: {
    participants: ParticipantWorkspaceEntity[];
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant';
    transactionManager?: WorkspaceEntityManager;
  }) {
    const participantRepository =
      await this.getParticipantRepository(objectMetadataName);

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    const participantIds = participants.map((participant) => participant.id);
    const uniqueParticipantsHandles = [
      ...new Set(participants.map((participant) => participant.handle)),
    ];

    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
      );

    let queryBuilder = personRepository
      .createQueryBuilder('person')
      .select([
        'person.id',
        'person.emailsPrimaryEmail',
        'person.emailsAdditionalEmails',
      ])
      .where('person.emailsPrimaryEmail IN (:...uniqueParticipantsHandles)', {
        uniqueParticipantsHandles,
      });

    for (const [index, handle] of uniqueParticipantsHandles.entries()) {
      queryBuilder = queryBuilder.orWhere(
        `person.emailsAdditionalEmails @> :handle${index}::jsonb`,
        {
          [`handle${index}`]: JSON.stringify([handle]),
        },
      );
    }

    const rawPeople = await queryBuilder
      .orderBy('person.createdAt', 'DESC')
      .getMany();

    const people = await personRepository.formatResult(rawPeople);

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
      const person =
        people.find((person) => person.emails?.primaryEmail === handle) ||
        people.find(
          (person) =>
            Array.isArray(person.emails?.additionalEmails) &&
            person.emails.additionalEmails.includes(handle),
        );

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

    this.workspaceEventEmitter.emitCustomBatchEvent(
      `${objectMetadataName}_matched`,
      [
        {
          workspaceMemberId: null,
          participants: matchedParticipants,
        },
      ],
      workspaceId,
    );
  }

  public async matchParticipantsAfterPersonOrWorkspaceMemberCreation({
    handle,
    isPrimaryEmail,
    objectMetadataName,
    personId,
    workspaceMemberId,
  }: {
    handle: string;
    isPrimaryEmail: boolean;
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant';
    personId?: string;
    workspaceMemberId?: string;
  }) {
    const participantRepository =
      await this.getParticipantRepository(objectMetadataName);

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    const participantsToUpdate = await participantRepository.find({
      where: {
        handle: Equal(handle),
      },
      relations: ['person'],
    });

    if (personId) {
      const participantIdsToMatchWithPerson: string[] = [];

      for (const participant of participantsToUpdate) {
        const existingPerson = participant.person;

        if (!existingPerson) {
          participantIdsToMatchWithPerson.push(participant.id);
          continue;
        }

        const isAssociatedToPrimaryEmail =
          existingPerson.emails?.primaryEmail.toLowerCase() ===
          handle.toLowerCase();

        if (isAssociatedToPrimaryEmail) {
          continue;
        }

        const isAssociatedToSecondaryEmail =
          Array.isArray(existingPerson.emails?.additionalEmails) &&
          existingPerson.emails.additionalEmails.some(
            (email) => email.toLowerCase() === handle.toLowerCase(),
          );

        if (isAssociatedToSecondaryEmail && isPrimaryEmail) {
          participantIdsToMatchWithPerson.push(participant.id);
        }
      }

      if (participantIdsToMatchWithPerson.length > 0) {
        await participantRepository.update(
          {
            id: Any(participantIdsToMatchWithPerson),
          },
          {
            person: {
              id: personId,
            },
          },
        );

        const updatedParticipants = await participantRepository.find({
          where: {
            id: Any(participantIdsToMatchWithPerson),
          },
        });

        this.workspaceEventEmitter.emitCustomBatchEvent(
          `${objectMetadataName}_matched`,
          [
            {
              workspaceId,
              name: `${objectMetadataName}_matched`,
              workspaceMemberId: null,
              participants: updatedParticipants,
            },
          ],
          workspaceId,
        );
      }
    }

    if (workspaceMemberId) {
      const participantIdsToMatchWithWorkspaceMember = participantsToUpdate.map(
        (participant) => participant.id,
      );

      await participantRepository.update(
        {
          id: Any(participantIdsToMatchWithWorkspaceMember),
        },
        {
          workspaceMember: {
            id: workspaceMemberId,
          },
        },
      );
    }
  }

  public async unmatchParticipants({
    handle,
    objectMetadataName,
    personId,
    workspaceMemberId,
  }: {
    handle: string;
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant';
    personId?: string;
    workspaceMemberId?: string;
  }) {
    const participantRepository =
      await this.getParticipantRepository(objectMetadataName);

    if (personId) {
      await participantRepository.update(
        {
          handle: Equal(handle),
        },
        {
          person: null,
        },
      );
    }
    if (workspaceMemberId) {
      await participantRepository.update(
        {
          handle: Equal(handle),
        },
        {
          workspaceMember: null,
        },
      );
    }
  }
}
