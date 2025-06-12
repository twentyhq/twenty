import { Injectable } from '@nestjs/common';

import { Any, Equal } from 'typeorm';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
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
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly scopedWorkspaceContextFactory: ScopedWorkspaceContextFactory,
  ) {}

  private async getParticipantRepository(
    workspaceId: string,
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant',
  ) {
    if (objectMetadataName === 'messageParticipant') {
      return await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageParticipantWorkspaceEntity>(
        workspaceId,
        objectMetadataName,
      );
    }

    return await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarEventParticipantWorkspaceEntity>(
      workspaceId,
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
    if (participants.length === 0) {
      return;
    }

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }
    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    const participantIds = participants.map((participant) => participant.id);
    const uniqueParticipantsHandles = [
      ...new Set(participants.map((participant) => participant.handle)),
    ];

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const queryBuilder = addPersonEmailFiltersToQueryBuilder({
      queryBuilder: personRepository.createQueryBuilder('person'),
      emails: uniqueParticipantsHandles,
    });

    const rawPeople = await queryBuilder
      .orderBy('person.createdAt', 'ASC')
      .getMany();

    const people = await personRepository.formatResult(rawPeople);

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
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
      const person = findPersonByPrimaryOrAdditionalEmail({
        people,
        email: handle,
      });

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
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }
    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    if (personId) {
      await participantRepository.update(
        {
          handle: Equal(handle),
        },
        {
          person: null,
        },
      );

      const personRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
          workspaceId,
          'person',
          { shouldBypassPermissionChecks: true },
        );

      const queryBuilder = addPersonEmailFiltersToQueryBuilder({
        queryBuilder: personRepository.createQueryBuilder('person'),
        emails: [handle],
        excludePersonIds: [personId],
      });

      const rawPeople = await queryBuilder
        .orderBy('person.createdAt', 'ASC')
        .getMany();

      const peopleToMatch = await personRepository.formatResult(rawPeople);

      if (peopleToMatch.length > 0) {
        const bestMatch = findPersonByPrimaryOrAdditionalEmail({
          people: peopleToMatch,
          email: handle,
        });

        if (bestMatch) {
          await participantRepository.update(
            {
              handle: Equal(handle),
            },
            {
              personId: bestMatch.id,
            },
          );

          const rematchedParticipants = await participantRepository.find({
            where: {
              handle: Equal(handle),
            },
          });

          this.workspaceEventEmitter.emitCustomBatchEvent(
            `${objectMetadataName}_matched`,
            [
              {
                workspaceMemberId: null,
                participants: rematchedParticipants,
              },
            ],
            workspaceId,
          );
        }
      }
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

  public async matchParticipantsAfterPersonCreation({
    handle,
    isPrimaryEmail,
    personId,
    objectMetadataName,
  }: {
    handle: string;
    isPrimaryEmail: boolean;
    personId: string;
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant';
  }) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    const participantsToUpdate = await participantRepository.find({
      where: {
        handle: Equal(handle),
      },
      relations: ['person'],
    });

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

  public async matchParticipantsAfterWorkspaceMemberCreation({
    handle,
    workspaceMemberId,
    objectMetadataName,
  }: {
    handle: string;
    workspaceMemberId: string;
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant';
  }) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    const participantsToUpdate = await participantRepository.find({
      where: {
        handle: Equal(handle),
      },
    });

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
