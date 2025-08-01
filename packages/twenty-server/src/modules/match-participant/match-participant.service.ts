import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { Any, In } from 'typeorm';

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

type ObjectMetadataName = 'messageParticipant' | 'calendarEventParticipant';

type MatchParticipantsForWorkspaceMembersArgs = {
  participantMatching: {
    workspaceMemberIds: string[];
  };
  objectMetadataName: ObjectMetadataName;
};

type MatchParticipantsForPeopleArgs = {
  participantMatching: {
    personIds: string[];
    personEmails: string[];
  };
  objectMetadataName: ObjectMetadataName;
};

type MatchParticipantsArgs<
  ParticipantWorkspaceEntity extends
    | CalendarEventParticipantWorkspaceEntity
    | MessageParticipantWorkspaceEntity,
> = {
  participants: Pick<
    ParticipantWorkspaceEntity,
    'id' | 'handle' | 'workspaceMemberId' | 'personId'
  >[];
  objectMetadataName: ObjectMetadataName;
  transactionManager?: WorkspaceEntityManager;
  matchWith: 'workspaceMemberOnly' | 'personOnly' | 'workspaceMemberAndPerson';
};

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
    matchWith = 'workspaceMemberAndPerson',
  }: MatchParticipantsArgs<ParticipantWorkspaceEntity>) {
    if (participants.length === 0) {
      return;
    }

    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!isDefined(workspaceId)) {
      throw new Error('Workspace ID is required');
    }

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const chunkSize = 200;
    const chunkedParticipants = chunk(participants, chunkSize);

    for (const participants of chunkedParticipants) {
      const uniqueParticipantsHandles = [
        ...new Set(participants.map((participant) => participant.handle)),
      ];

      const queryBuilder = addPersonEmailFiltersToQueryBuilder({
        queryBuilder: personRepository.createQueryBuilder('person'),
        emails: uniqueParticipantsHandles,
      });

      const people = await queryBuilder
        .orderBy('person.createdAt', 'ASC')
        .getMany();

      const workspaceMembers = await workspaceMemberRepository.find(
        {
          where: {
            userEmail: Any(uniqueParticipantsHandles),
          },
        },
        transactionManager,
      );

      const partipantsWithNewMatch = participants.map((participant) => {
        const person = findPersonByPrimaryOrAdditionalEmail({
          people,
          email: participant.handle,
        });

        const workspaceMember = workspaceMembers.find(
          (workspaceMember) => workspaceMember.userEmail === participant.handle,
        );

        const shouldMatchWithPerson =
          matchWith === 'workspaceMemberAndPerson' ||
          matchWith === 'personOnly';

        const shouldMatchWithWorkspaceMember =
          matchWith === 'workspaceMemberAndPerson' ||
          matchWith === 'workspaceMemberOnly';

        return {
          ...participant,
          ...(shouldMatchWithPerson && {
            personId: isDefined(person) ? person.id : null,
          }),
          ...(shouldMatchWithWorkspaceMember && {
            workspaceMemberId: isDefined(workspaceMember)
              ? workspaceMember.id
              : null,
          }),
        };
      });

      if (objectMetadataName === 'messageParticipant') {
        const participantRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<MessageParticipantWorkspaceEntity>(
            workspaceId,
            objectMetadataName,
          );

        await participantRepository.save(partipantsWithNewMatch);
      } else {
        const participantRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<CalendarEventParticipantWorkspaceEntity>(
            workspaceId,
            objectMetadataName,
          );

        await participantRepository.save(partipantsWithNewMatch);
      }

      this.workspaceEventEmitter.emitCustomBatchEvent(
        `${objectMetadataName}_matched`,
        [
          {
            workspaceMemberId: null,
            participants: partipantsWithNewMatch,
          },
        ],
        workspaceId,
      );
    }
  }

  public async matchParticipantsForWorkspaceMembers({
    participantMatching,
    objectMetadataName,
  }: MatchParticipantsForWorkspaceMembersArgs) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!isDefined(workspaceId)) {
      throw new Error('Workspace ID is required');
    }

    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    const participants = await participantRepository.find({
      where: {
        workspaceMemberId: In(participantMatching.workspaceMemberIds),
      },
    });

    const tobeRematchedParticipants = participants.map((participant) => {
      return {
        ...participant,
        workspaceMemberId: null,
      };
    });

    await this.matchParticipants({
      matchWith: 'workspaceMemberOnly',
      participants: tobeRematchedParticipants,
      objectMetadataName,
    });
  }

  public async matchParticipantsForPeople({
    participantMatching,
    objectMetadataName,
  }: MatchParticipantsForPeopleArgs) {
    const workspaceId = this.scopedWorkspaceContextFactory.create().workspaceId;

    if (!isDefined(workspaceId)) {
      throw new Error('Workspace ID is required');
    }

    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );
    let participantsMatchingExistingPersonEmails: ParticipantWorkspaceEntity[] =
      [];
    let participantsMatchingOtherPersonEmails: ParticipantWorkspaceEntity[] =
      [];
    let participantsMatchingPersonId: ParticipantWorkspaceEntity[] = [];

    if (participantMatching.personIds.length > 0) {
      const people = await personRepository.find({
        where: {
          id: In(participantMatching.personIds),
        },
      });

      const exitingPeopleEmails = people.flatMap((person) => [
        person.emails.primaryEmail,
        ...(person.emails.additionalEmails as string[]),
      ]);

      participantsMatchingExistingPersonEmails =
        (await participantRepository.find({
          where: {
            handle: In(exitingPeopleEmails),
          },
        })) as ParticipantWorkspaceEntity[];

      participantsMatchingPersonId = (await participantRepository.find({
        where: {
          personId: In(participantMatching.personIds),
        },
      })) as ParticipantWorkspaceEntity[];
    }

    if (participantMatching.personEmails.length > 0) {
      participantsMatchingOtherPersonEmails = (await participantRepository.find(
        {
          where: {
            handle: In(participantMatching.personEmails),
          },
        },
      )) as ParticipantWorkspaceEntity[];
    }

    const uniqueParticipants = [
      ...new Set([
        ...participantsMatchingPersonId,
        ...participantsMatchingExistingPersonEmails,
        ...participantsMatchingOtherPersonEmails,
      ]),
    ];

    const tobeRematchedParticipants = uniqueParticipants.map((participant) => {
      return {
        ...participant,
        personId: null,
      };
    });

    await this.matchParticipants({
      matchWith: 'personOnly',
      participants: tobeRematchedParticipants,
      objectMetadataName,
    });
  }
}
