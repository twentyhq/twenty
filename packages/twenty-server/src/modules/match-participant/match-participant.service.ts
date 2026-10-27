import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { MessageChannelType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Any, In, Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { getWorkspaceRepositoryWithOptionalTransaction } from 'src/engine/twenty-orm/utils/get-workspace-repository-with-optional-transaction.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { addPersonHandleFiltersToQueryBuilder } from 'src/modules/match-participant/person-handle-field/utils/add-person-handle-filters-to-query-builder.util';
import { findPersonByCanonicalHandle } from 'src/modules/match-participant/person-handle-field/utils/find-person-by-canonical-handle.util';
import { findPersonByPrimaryOrAdditionalEmail } from 'src/modules/match-participant/utils/find-person-by-primary-or-additional-email';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
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

type MatchParticipantsForPersonHandlesArgs = {
  personHandleField: PersonHandleField;
  messageChannelIds: string[];
  handles: string[];
  changedPersonIds: string[];
  workspaceId: string;
};

type MatchParticipantsForPeopleArgs = {
  participantMatching: {
    personEmails: string[];
  };
  objectMetadataName: ObjectMetadataName;
  workspaceId: string;
};

export type MatchParticipantsArgs<
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
  matchWith:
    | 'workspaceMemberOnly'
    | 'personOnly'
    | 'workspaceMemberAndPerson'
    | 'targetsOnly';
  // handles are canonical values of this person field
  personHandleField?: PersonHandleField;
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
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
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
        rolePermissionConfig: { shouldBypassPermissionChecks: true },
      },
    );
  }

  public async matchParticipants({
    participants,
    sourceRecordIds,
    objectMetadataName,
    matchWith = 'workspaceMemberAndPerson',
    personHandleField,
    transactionScope,
  }: MatchParticipantsArgs<ParticipantWorkspaceEntity>) {
    // Targets derive from personId only, so a workspaceMemberOnly rematch cannot change them
    const shouldReconcileTargets = matchWith !== 'workspaceMemberOnly';

    // Sources with non-email handles only reconcile targets: matching them as emails would null out the
    // caller-supplied personId
    if (matchWith === 'targetsOnly') {
      await this.participantTargetReconciliationService.reconcileParticipantTargets(
        {
          sourceRecordIds,
          objectMetadataName,
          transactionScope,
        },
      );

      return;
    }

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

    const shouldMatchWithPerson =
      matchWith === 'workspaceMemberAndPerson' || matchWith === 'personOnly';

    // workspace members are only known by email
    const shouldMatchWithWorkspaceMember =
      (matchWith === 'workspaceMemberAndPerson' ||
        matchWith === 'workspaceMemberOnly') &&
      !isDefined(personHandleField);

    const chunkSize = 200;
    const chunkedParticipants = chunk(participants, chunkSize);

    for (const participants of chunkedParticipants) {
      const uniqueParticipantsHandles = [
        ...new Set(participants.map((participant) => participant.handle)),
      ].filter(isDefined);

      const people = await this.buildPersonQueryBuilder({
        queryBuilder: personRepository.createQueryBuilder('person'),
        personHandleField,
        handles: uniqueParticipantsHandles,
      })
        .orderBy('person.createdAt', 'ASC')
        .getMany<PersonWorkspaceEntity>();

      const workspaceMembers = shouldMatchWithWorkspaceMember
        ? await workspaceMemberRepository.find({
            where: {
              userEmail: Any(uniqueParticipantsHandles),
            },
          })
        : [];

      const partipantsToBeUpdated = participants
        .map((participant) => ({
          ...participant,
          handle: participant.handle ?? '',
        }))
        .map((participant) => {
          const person = isDefined(personHandleField)
            ? findPersonByCanonicalHandle({
                people,
                personHandleField,
                handle: participant.handle,
              })
            : findPersonByPrimaryOrAdditionalEmail({
                people,
                email: participant.handle,
              });

          const workspaceMember = workspaceMembers.find(
            (workspaceMember) =>
              workspaceMember.userEmail === participant.handle,
          );

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

  // participants of channels matching on this person field, whose handle is one of the person's values before or after the change
  public async matchParticipantsForPersonHandles({
    personHandleField,
    messageChannelIds,
    handles,
    changedPersonIds,
    workspaceId,
  }: MatchParticipantsForPersonHandlesArgs) {
    if (!isNonEmptyArray(messageChannelIds) || !isNonEmptyArray(handles)) {
      return;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.workspaceOrmManager.runInWorkspaceTransaction(
        async (transactionScope) => {
          const participantRepository = this.getParticipantRepository({
            objectMetadataName: 'messageParticipant',
            transactionScope,
          });

          const participantsWithHandle = await participantRepository
            .createQueryBuilder('participant')
            .where('"participant"."handle" = ANY(:handles)', { handles })
            .getMany<ParticipantWorkspaceEntity>();

          if (!isNonEmptyArray(participantsWithHandle)) {
            return;
          }

          // the same handle can sit on a channel that matches another field, which this change does not concern
          const messageIdsOnMatchingChannels =
            await this.findMessageIdsOnChannels({
              participants: participantsWithHandle,
              messageChannelIds,
              transactionScope,
            });

          // a link the app passed to someone else stands: only unlinked participants and those of the changed people move
          const participantsToRematch = participantsWithHandle.filter(
            (participant) =>
              messageIdsOnMatchingChannels.has(
                this.getSourceRecordId(participant),
              ) &&
              (!isDefined(participant.personId) ||
                changedPersonIds.includes(participant.personId)),
          );

          await this.matchParticipants({
            matchWith: 'personOnly',
            participants: participantsToRematch,
            sourceRecordIds: this.getSourceRecordIds(participantsToRematch),
            objectMetadataName: 'messageParticipant',
            personHandleField,
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

          if (!isNonEmptyArray(participantMatching.personEmails)) {
            return;
          }

          // emails before and after the change pick candidates, so links made any other way are left alone
          const participantsWithEmailHandle = await participantRepository
            .createQueryBuilder('participant')
            .where('LOWER("participant"."handle") = ANY(:emails)', {
              emails: [
                ...new Set(
                  participantMatching.personEmails.map((email) =>
                    email.toLowerCase(),
                  ),
                ),
              ],
            })
            .getMany<ParticipantWorkspaceEntity>();

          const participantsToRematch =
            await this.withoutAppChannelParticipants({
              participants: participantsWithEmailHandle,
              objectMetadataName,
              workspaceId,
              transactionScope,
            });

          await this.matchParticipants({
            matchWith: 'personOnly',
            participants: participantsToRematch,
            sourceRecordIds: this.getSourceRecordIds(participantsToRematch),
            objectMetadataName,
            transactionScope,
          });
        },
      );
    }, authContext);
  }

  // apps link their own participants, even ones whose handle looks like an email
  private async withoutAppChannelParticipants({
    participants,
    objectMetadataName,
    workspaceId,
    transactionScope,
  }: {
    participants: ParticipantWorkspaceEntity[];
    objectMetadataName: ObjectMetadataName;
    workspaceId: string;
    transactionScope: WorkspaceTransactionScope;
  }): Promise<ParticipantWorkspaceEntity[]> {
    if (
      objectMetadataName !== 'messageParticipant' ||
      !isNonEmptyArray(participants)
    ) {
      return participants;
    }

    const appMessageChannels = await this.messageChannelRepository.find({
      where: { workspaceId, type: MessageChannelType.APP },
      select: { id: true },
    });

    if (!isNonEmptyArray(appMessageChannels)) {
      return participants;
    }

    const appChannelMessageIds = await this.findMessageIdsOnChannels({
      participants,
      messageChannelIds: appMessageChannels.map(
        (messageChannel) => messageChannel.id,
      ),
      transactionScope,
    });

    return participants.filter(
      (participant) =>
        !appChannelMessageIds.has(this.getSourceRecordId(participant)),
    );
  }

  private buildPersonQueryBuilder({
    queryBuilder,
    personHandleField,
    handles,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    personHandleField: PersonHandleField | undefined;
    handles: string[];
  }): WorkspaceSelectQueryBuilder {
    if (!isDefined(personHandleField)) {
      return addPersonEmailFiltersToQueryBuilder({
        queryBuilder,
        emails: handles,
      });
    }

    return addPersonHandleFiltersToQueryBuilder({
      queryBuilder,
      personHandleField,
      handles,
    });
  }

  private async findMessageIdsOnChannels({
    participants,
    messageChannelIds,
    transactionScope,
  }: {
    participants: ParticipantWorkspaceEntity[];
    messageChannelIds: string[];
    transactionScope: WorkspaceTransactionScope;
  }): Promise<Set<string>> {
    const associations =
      await getWorkspaceRepositoryWithOptionalTransaction<MessageChannelMessageAssociationWorkspaceEntity>(
        {
          objectMetadataName: 'messageChannelMessageAssociation',
          transactionScope,
          workspaceOrmManager: this.workspaceOrmManager,
          rolePermissionConfig: { shouldBypassPermissionChecks: true },
        },
      ).find({
        where: {
          messageId: Any([...new Set(this.getSourceRecordIds(participants))]),
          messageChannelId: Any(messageChannelIds),
        },
        select: { messageId: true },
      });

    return new Set(associations.map((association) => association.messageId));
  }

  private getSourceRecordIds(
    participants: ParticipantWorkspaceEntity[],
  ): string[] {
    return participants.map((participant) =>
      this.getSourceRecordId(participant),
    );
  }

  private getSourceRecordId(participant: ParticipantWorkspaceEntity): string {
    return 'messageId' in participant
      ? participant.messageId
      : participant.calendarEventId;
  }
}
