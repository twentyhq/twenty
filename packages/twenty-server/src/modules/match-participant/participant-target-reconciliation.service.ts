import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { In, type ObjectLiteral } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
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

const RECONCILIATION_CHUNK_SIZE = 200;

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
      RECONCILIATION_CHUNK_SIZE,
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
    const changedMessages = await messageRepository.find({
      where: { id: In([...new Set(messageIds)]) },
      select: { id: true, messageThreadId: true },
    });
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
      RECONCILIATION_CHUNK_SIZE,
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
      const participants =
        messageIds.length === 0
          ? []
          : await participantRepository.find({
              where: { messageId: In(messageIds) },
              select: { messageId: true, personId: true },
            });

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

    if (operations.targetsToCreate.length > 0) {
      await targetRepository.insert(
        operations.targetsToCreate.map(({ parentId, ...target }) => ({
          ...target,
          [parentFieldName]: parentId,
          isAutomaticallyAssigned: true,
          isManuallyAssigned: false,
        })),
      );
    }

    if (operations.targetsToMarkAutomatic.length > 0) {
      await targetRepository.updateMany(
        operations.targetsToMarkAutomatic.map((id) => ({
          criteria: id,
          partialEntity: { isAutomaticallyAssigned: true },
        })),
      );
    }

    if (operations.targetsToMarkNotAutomatic.length > 0) {
      await targetRepository.updateMany(
        operations.targetsToMarkNotAutomatic.map((id) => ({
          criteria: id,
          partialEntity: { isAutomaticallyAssigned: false },
        })),
      );
    }

    if (operations.targetIdsToDelete.length > 0) {
      await targetRepository.delete({
        id: In(operations.targetIdsToDelete),
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
    if (isDefined(transactionScope)) {
      return transactionScope.getRepository<T>(objectMetadataName, {
        shouldBypassPermissionChecks: true,
      });
    }

    return this.workspaceOrmManager.getRepository<T>(objectMetadataName, {
      shouldBypassPermissionChecks: true,
    });
  }
}
