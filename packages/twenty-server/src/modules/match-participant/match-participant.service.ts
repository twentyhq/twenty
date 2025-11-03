import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { Any, In } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
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
    | Pick<
        CalendarEventParticipantWorkspaceEntity,
        'id' | 'handle' | 'workspaceMemberId' | 'personId' | 'calendarEventId'
      >
    | Pick<
        MessageParticipantWorkspaceEntity,
        'id' | 'handle' | 'workspaceMemberId' | 'personId' | 'messageId'
      >,
> = {
  participants: ParticipantWorkspaceEntity[];
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

    const participantRepository = await this.getParticipantRepository(
      workspaceId,
      objectMetadataName,
    );

    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
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

      const partipantsToBeUpdated = participants
        .map((participant) => {
          const person = findPersonByPrimaryOrAdditionalEmail({
            people,
            email: participant.handle,
          });

          const workspaceMember = workspaceMembers.find(
            (workspaceMember) =>
              workspaceMember.userEmail === participant.handle,
          );

          const shouldMatchWithPerson =
            matchWith === 'workspaceMemberAndPerson' ||
            matchWith === 'personOnly';

          const shouldMatchWithWorkspaceMember =
            matchWith === 'workspaceMemberAndPerson' ||
            matchWith === 'workspaceMemberOnly';

          const newParticipant = {
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

          if (
            newParticipant.personId === participant.personId &&
            newParticipant.workspaceMemberId === participant.workspaceMemberId
          ) {
            return null;
          }

          return newParticipant;
        })
        .filter(isDefined);

      await participantRepository.updateMany(
        partipantsToBeUpdated.map((participant) => ({
          criteria: participant.id,
          partialEntity: participant,
        })),
      );

      this.workspaceEventEmitter.emitCustomBatchEvent(
        `${objectMetadataName}_matched`,
        [
          {
            workspaceMemberId: null,
            participants: partipantsToBeUpdated,
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
      participants: tobeRematchedParticipants as ParticipantWorkspaceEntity[],
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

    let participantsMatchingPersonEmails: ParticipantWorkspaceEntity[] = [];
    let participantsMatchingPersonId: ParticipantWorkspaceEntity[] = [];

    if (participantMatching.personIds.length > 0) {
      participantsMatchingPersonId = (await participantRepository.find({
        where: {
          personId: In(participantMatching.personIds),
        },
      })) as ParticipantWorkspaceEntity[];
    }

    if (participantMatching.personEmails.length > 0) {
      participantsMatchingPersonEmails = (await participantRepository.find({
        where: {
          handle: In(participantMatching.personEmails),
        },
      })) as ParticipantWorkspaceEntity[];
    }

    const uniqueParticipants = [
      ...new Set([
        ...participantsMatchingPersonId,
        ...participantsMatchingPersonEmails,
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
