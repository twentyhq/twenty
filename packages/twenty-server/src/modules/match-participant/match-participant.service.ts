import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { Any, In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceRepositoryWithOptionalTransaction } from 'src/engine/twenty-orm/utils/get-workspace-repository-with-optional-transaction.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type ObjectMetadataName = 'messageParticipant' | 'calendarEventParticipant';

type GetParticipantRepositoryArgs = {
  objectMetadataName: ObjectMetadataName;
  transactionScope?: WorkspaceTransactionScope;
};

type MatchParticipantsForWorkspaceMembersArgs = {
  participantMatching: {
    workspaceMemberIds: string[];
  };
  objectMetadataName: ObjectMetadataName;
  workspaceId: string;
};

type MatchParticipantsForPeopleArgs = {
  participantMatching: {
    personIds: string[];
    personEmails: string[];
  };
  objectMetadataName: ObjectMetadataName;
  workspaceId: string;
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
  sourceRecordIds: string[];
  objectMetadataName: ObjectMetadataName;
  matchWith: 'workspaceMemberOnly' | 'personOnly' | 'workspaceMemberAndPerson';
  transactionScope?: WorkspaceTransactionScope;
};

@Injectable()
export class MatchParticipantService<
  ParticipantWorkspaceEntity extends
    | CalendarEventParticipantWorkspaceEntity
    | MessageParticipantWorkspaceEntity,
> {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly participantTargetReconciliationService: ParticipantTargetReconciliationService,
  ) {}

  private getParticipantRepository({
    objectMetadataName,
    transactionScope,
  }: GetParticipantRepositoryArgs) {
    return getWorkspaceRepositoryWithOptionalTransaction<ParticipantWorkspaceEntity>(
      {
        objectMetadataName,
        transactionScope,
        workspaceOrmManager: this.workspaceOrmManager,
      },
    );
  }

  public async matchParticipants({
    participants,
    sourceRecordIds,
    objectMetadataName,
    matchWith = 'workspaceMemberAndPerson',
    transactionScope,
  }: MatchParticipantsArgs<ParticipantWorkspaceEntity>) {
    // Desired targets derive from personId only, so a workspaceMemberOnly
    // rematch can never change them; skip the recompute in that case.
    const shouldReconcileTargets = matchWith !== 'workspaceMemberOnly';

    if (participants.length === 0) {
      if (shouldReconcileTargets) {
        await this.participantTargetReconciliationService.reconcileParticipantTargets(
          {
            sourceRecordIds,
            objectMetadataName,
            transactionScope,
          },
        );
      }

      return;
    }

    const personRepository =
      getWorkspaceRepositoryWithOptionalTransaction<PersonWorkspaceEntity>({
        objectMetadataName: 'person',
        transactionScope,
        workspaceOrmManager: this.workspaceOrmManager,
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      });

    const participantRepository = this.getParticipantRepository({
      objectMetadataName,
      transactionScope,
    });

    const workspaceMemberRepository =
      getWorkspaceRepositoryWithOptionalTransaction<WorkspaceMemberWorkspaceEntity>(
        {
          objectMetadataName: 'workspaceMember',
          transactionScope,
          workspaceOrmManager: this.workspaceOrmManager,
          rolePermissionConfig: { shouldBypassPermissionChecks: true },
        },
      );

    const chunkSize = 200;
    const chunkedParticipants = chunk(participants, chunkSize);

    for (const participants of chunkedParticipants) {
      const uniqueParticipantsHandles = [
        ...new Set(participants.map((participant) => participant.handle)),
      ].filter(isDefined);

      const queryBuilder = addPersonEmailFiltersToQueryBuilder({
        queryBuilder: personRepository.createQueryBuilder('person'),
        emails: uniqueParticipantsHandles,
      });

      const people = await queryBuilder
        .orderBy('person.createdAt', 'ASC')
        .getMany<PersonWorkspaceEntity>();

      const workspaceMembers = await workspaceMemberRepository.find({
        where: {
          userEmail: Any(uniqueParticipantsHandles),
        },
      });

      const partipantsToBeUpdated = participants
        .map((participant) => ({
          ...participant,
          handle: participant.handle ?? '',
        }))
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
          partialEntity: {
            personId: participant.personId,
            workspaceMemberId: participant.workspaceMemberId,
          },
        })),
      );
    }

    if (shouldReconcileTargets) {
      await this.participantTargetReconciliationService.reconcileParticipantTargets(
        {
          sourceRecordIds,
          objectMetadataName,
          transactionScope,
        },
      );
    }
  }

  public async matchParticipantsForWorkspaceMembers({
    participantMatching,
    objectMetadataName,
    workspaceId,
  }: MatchParticipantsForWorkspaceMembersArgs) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const participantRepository = this.getParticipantRepository({
            objectMetadataName,
            transactionScope,
          });

          const participants = await participantRepository.find({
            where: {
              workspaceMemberId: In(participantMatching.workspaceMemberIds),
            },
          });

          const rematchedParticipants = participants.map((participant) => ({
            ...participant,
            workspaceMemberId: null,
          })) as ParticipantWorkspaceEntity[];

          await this.matchParticipants({
            matchWith: 'workspaceMemberOnly',
            participants: rematchedParticipants,
            sourceRecordIds: this.getSourceRecordIds(rematchedParticipants),
            objectMetadataName,
            transactionScope,
          });
        },
      );
    }, authContext);
  }

  public async matchParticipantsForPeople({
    participantMatching,
    objectMetadataName,
    workspaceId,
  }: MatchParticipantsForPeopleArgs) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const participantRepository = this.getParticipantRepository({
            objectMetadataName,
            transactionScope,
          });

          let participantsMatchingPersonEmails: ParticipantWorkspaceEntity[] =
            [];
          let participantsMatchingPersonId: ParticipantWorkspaceEntity[] = [];

          if (participantMatching.personIds.length > 0) {
            participantsMatchingPersonId = (await participantRepository.find({
              where: {
                personId: In(participantMatching.personIds),
              },
            })) as ParticipantWorkspaceEntity[];
          }

          if (participantMatching.personEmails.length > 0) {
            participantsMatchingPersonEmails =
              (await participantRepository.find({
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

          const tobeRematchedParticipants = uniqueParticipants.map(
            (participant) => {
              return {
                ...participant,
                personId: null,
              };
            },
          );

          await this.matchParticipants({
            matchWith: 'personOnly',
            participants: tobeRematchedParticipants,
            sourceRecordIds: this.getSourceRecordIds(tobeRematchedParticipants),
            objectMetadataName,
            transactionScope,
          });
        },
      );
    }, authContext);
  }

  private getSourceRecordIds(
    participants: ParticipantWorkspaceEntity[],
  ): string[] {
    return participants.map((participant) =>
      'messageId' in participant
        ? participant.messageId
        : participant.calendarEventId,
    );
  }
}
