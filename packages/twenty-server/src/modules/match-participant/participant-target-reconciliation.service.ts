import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In, type ObjectLiteral } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { getWorkspaceRepositoryWithOptionalTransaction } from 'src/engine/twenty-orm/utils/get-workspace-repository-with-optional-transaction.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import {
  computeTargetReconciliationOperations,
  type ExistingTarget,
  type TargetIdentity,
} from 'src/modules/match-participant/utils/compute-target-reconciliation-operations.util';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type TargetParentFieldName = 'calendarEventId' | 'messageThreadId';

type TargetWorkspaceEntity = Omit<ExistingTarget, 'parentId' | 'deletedAt'> & {
  calendarEventId?: string | null;
  messageThreadId?: string | null;
  deletedAt: string | null;
};

@Injectable()
export class ParticipantTargetReconciliationService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  public async reconcileParticipantTargets({
    sourceRecordIds,
    objectMetadataName,
    transactionScope,
  }: {
    sourceRecordIds: string[];
    objectMetadataName: 'messageParticipant' | 'calendarEventParticipant';
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (objectMetadataName === 'messageParticipant') {
      await this.reconcileMessageThreadTargetsFromMessageIds({
        messageIds: sourceRecordIds,
        transactionScope,
      });

      return;
    }

    await this.reconcileCalendarEventTargets({
      calendarEventIds: sourceRecordIds,
      transactionScope,
    });
  }

  public async reconcileCalendarEventTargets({
    calendarEventIds,
    transactionScope,
  }: {
    calendarEventIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    for (const calendarEventIdChunk of chunk(
      [...new Set(calendarEventIds)],
      QUERY_MAX_RECORDS,
    )) {
      const participantRepository =
        await this.getRepository<CalendarEventParticipantWorkspaceEntity>(
          'calendarEventParticipant',
          transactionScope,
        );

      const participants = await participantRepository.find({
        where: { calendarEventId: In(calendarEventIdChunk) },
        select: { calendarEventId: true, personId: true },
      });

      await this.reconcileTargets({
        parentIds: calendarEventIdChunk,
        parentFieldName: 'calendarEventId',
        participantPersonIdsByParentId: this.groupParticipantPersonIds({
          participants,
          getParentId: (participant) => participant.calendarEventId,
        }),
        targetObjectName: 'calendarEventTarget',
        transactionScope,
      });
    }
  }

  public async reconcileMessageThreadTargetsFromMessageIds({
    messageIds,
    transactionScope,
  }: {
    messageIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (messageIds.length === 0) {
      return;
    }

    const messageRepository = await this.getRepository<MessageWorkspaceEntity>(
      'message',
      transactionScope,
    );
    const changedMessages: Pick<
      MessageWorkspaceEntity,
      'id' | 'messageThreadId'
    >[] = [];

    for (const messageIdChunk of chunk(
      [...new Set(messageIds)],
      QUERY_MAX_RECORDS,
    )) {
      changedMessages.push(
        ...(await messageRepository.find({
          where: { id: In(messageIdChunk) },
          select: { id: true, messageThreadId: true },
        })),
      );
    }
    const messageThreadIds = [
      ...new Set(
        changedMessages
          .map(({ messageThreadId }) => messageThreadId)
          .filter(isDefined),
      ),
    ];

    await this.reconcileMessageThreadTargets({
      messageThreadIds,
      transactionScope,
    });
  }

  public async reconcileMessageThreadTargets({
    messageThreadIds,
    transactionScope,
  }: {
    messageThreadIds: string[];
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    const messageRepository = await this.getRepository<MessageWorkspaceEntity>(
      'message',
      transactionScope,
    );

    for (const messageThreadIdChunk of chunk(
      [...new Set(messageThreadIds)],
      QUERY_MAX_RECORDS,
    )) {
      const threadMessages = await messageRepository.find({
        where: { messageThreadId: In(messageThreadIdChunk) },
        select: { id: true, messageThreadId: true },
      });
      const messageThreadIdByMessageId = new Map<string, string>();

      for (const { id, messageThreadId } of threadMessages) {
        if (isDefined(messageThreadId)) {
          messageThreadIdByMessageId.set(id, messageThreadId);
        }
      }

      const participantRepository =
        await this.getRepository<MessageParticipantWorkspaceEntity>(
          'messageParticipant',
          transactionScope,
        );
      const messageIds = [...messageThreadIdByMessageId.keys()];
      const participants: Pick<
        MessageParticipantWorkspaceEntity,
        'messageId' | 'personId'
      >[] = [];

      for (const messageIdChunk of chunk(messageIds, QUERY_MAX_RECORDS)) {
        participants.push(
          ...(await participantRepository.find({
            where: { messageId: In(messageIdChunk) },
            select: { messageId: true, personId: true },
          })),
        );
      }

      await this.reconcileTargets({
        parentIds: messageThreadIdChunk,
        parentFieldName: 'messageThreadId',
        participantPersonIdsByParentId: this.groupParticipantPersonIds({
          participants,
          getParentId: (participant) =>
            messageThreadIdByMessageId.get(participant.messageId),
        }),
        targetObjectName: 'messageThreadTarget',
        transactionScope,
      });
    }
  }

  private async reconcileTargets({
    parentIds,
    parentFieldName,
    participantPersonIdsByParentId,
    targetObjectName,
    transactionScope,
  }: {
    parentIds: string[];
    parentFieldName: TargetParentFieldName;
    participantPersonIdsByParentId: Map<string, Set<string>>;
    targetObjectName: 'calendarEventTarget' | 'messageThreadTarget';
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<void> {
    if (parentIds.length === 0) {
      return;
    }

    // Existing workspaces only gain the target junction objects once the
    // upgrade metadata sync has run; until then reconciliation must no-op so
    // message and calendar imports keep succeeding. The backfill that follows
    // the sync covers rows imported during that window.
    if (
      !isDefined(getWorkspaceContext().objectIdByNameSingular[targetObjectName])
    ) {
      return;
    }

    const desiredTargets = await this.buildDesiredTargets({
      parentIds,
      participantPersonIdsByParentId,
      transactionScope,
    });
    const targetRepository = await this.getRepository<TargetWorkspaceEntity>(
      targetObjectName,
      transactionScope,
    );
    const existingTargetRows = await targetRepository.find({
      where: { [parentFieldName]: In(parentIds) },
      withDeleted: true,
    });
    const existingTargets = existingTargetRows
      .map((target): ExistingTarget | null => {
        const parentId = target[parentFieldName];

        if (!isDefined(parentId)) {
          return null;
        }

        return {
          ...target,
          parentId,
        };
      })
      .filter(isDefined);
    const operations = computeTargetReconciliationOperations({
      desiredTargets,
      existingTargets,
    });

    // Targets per parent are unbounded, so write batches are re-chunked to
    // stay under the ORM's per-call record cap.
    for (const targetsToCreateChunk of chunk(
      operations.targetsToCreate,
      QUERY_MAX_RECORDS,
    )) {
      await targetRepository.insert(
        targetsToCreateChunk.map(({ parentId, ...target }) => ({
          ...target,
          [parentFieldName]: parentId,
          isAutomaticallyAssigned: true,
          isManuallyAssigned: false,
        })),
        { onConflictDoNothing: true },
      );
    }

    for (const targetIdsToMarkAutomaticChunk of chunk(
      operations.targetsToMarkAutomatic,
      QUERY_MAX_RECORDS,
    )) {
      await targetRepository.updateMany(
        targetIdsToMarkAutomaticChunk.map((id) => ({
          criteria: id,
          partialEntity: { isAutomaticallyAssigned: true },
        })),
      );
    }

    for (const targetIdsToMarkNotAutomaticChunk of chunk(
      operations.targetsToMarkNotAutomatic,
      QUERY_MAX_RECORDS,
    )) {
      await targetRepository.updateMany(
        targetIdsToMarkNotAutomaticChunk.map((id) => ({
          criteria: id,
          partialEntity: { isAutomaticallyAssigned: false },
        })),
      );
    }

    for (const targetIdsToDeleteChunk of chunk(
      operations.targetIdsToDelete,
      QUERY_MAX_RECORDS,
    )) {
      await targetRepository.delete({
        id: In(targetIdsToDeleteChunk),
      });
    }
  }

  private async buildDesiredTargets({
    parentIds,
    participantPersonIdsByParentId,
    transactionScope,
  }: {
    parentIds: string[];
    participantPersonIdsByParentId: Map<string, Set<string>>;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<TargetIdentity[]> {
    const personIds = [
      ...new Set(
        [...participantPersonIdsByParentId.values()].flatMap((ids) => [...ids]),
      ),
    ];

    if (personIds.length === 0) {
      return [];
    }

    const personRepository = await this.getRepository<PersonWorkspaceEntity>(
      'person',
      transactionScope,
    );
    const people = await personRepository.find({
      where: { id: In(personIds) },
      select: { id: true, companyId: true },
    });
    // find() excludes soft-deleted people, so this set keeps desired targets
    // aligned with the backfill, which only joins live people.
    const livePersonIds = new Set(people.map(({ id }) => id));
    const companyIdByPersonId = new Map(
      people.map(({ id, companyId }) => [id, companyId]),
    );

    const opportunityRepository =
      await this.getRepository<OpportunityWorkspaceEntity>(
        'opportunity',
        transactionScope,
      );
    const opportunities = await opportunityRepository.find({
      where: { pointOfContactId: In(personIds) },
      select: { id: true, pointOfContactId: true },
    });
    const opportunityIdsByPersonId = new Map<string, string[]>();

    for (const opportunity of opportunities) {
      if (!isDefined(opportunity.pointOfContactId)) {
        continue;
      }

      const opportunityIds =
        opportunityIdsByPersonId.get(opportunity.pointOfContactId) ?? [];

      opportunityIds.push(opportunity.id);
      opportunityIdsByPersonId.set(
        opportunity.pointOfContactId,
        opportunityIds,
      );
    }

    return parentIds.flatMap((parentId) =>
      [...(participantPersonIdsByParentId.get(parentId) ?? [])].flatMap(
        (personId): TargetIdentity[] => {
          if (!livePersonIds.has(personId)) {
            return [];
          }

          const companyId = companyIdByPersonId.get(personId);
          const opportunityIds = opportunityIdsByPersonId.get(personId) ?? [];

          return [
            {
              parentId,
              targetPersonId: personId,
              targetCompanyId: null,
              targetOpportunityId: null,
            },
            ...(isDefined(companyId)
              ? [
                  {
                    parentId,
                    targetPersonId: null,
                    targetCompanyId: companyId,
                    targetOpportunityId: null,
                  },
                ]
              : []),
            ...opportunityIds.map((opportunityId) => ({
              parentId,
              targetPersonId: null,
              targetCompanyId: null,
              targetOpportunityId: opportunityId,
            })),
          ];
        },
      ),
    );
  }

  private groupParticipantPersonIds<
    Participant extends { personId: string | null },
  >({
    participants,
    getParentId,
  }: {
    participants: Participant[];
    getParentId: (participant: Participant) => string | undefined;
  }): Map<string, Set<string>> {
    const personIdsByParentId = new Map<string, Set<string>>();

    for (const participant of participants) {
      const parentId = getParentId(participant);
      const personId = participant.personId;

      if (!isDefined(parentId) || !isDefined(personId)) {
        continue;
      }

      const personIds = personIdsByParentId.get(parentId) ?? new Set<string>();

      personIds.add(personId);
      personIdsByParentId.set(parentId, personIds);
    }

    return personIdsByParentId;
  }

  private async getRepository<T extends ObjectLiteral>(
    objectMetadataName: string,
    transactionScope?: WorkspaceTransactionScope,
  ): Promise<WorkspaceRepository<T>> {
    return getWorkspaceRepositoryWithOptionalTransaction<T>({
      objectMetadataName,
      transactionScope,
      workspaceOrmManager: this.workspaceOrmManager,
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    });
  }
}
