import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  ReconcileOpportunityTargetsJob,
  type ReconcileOpportunityTargetsJobData,
} from 'src/modules/match-participant/jobs/reconcile-opportunity-targets.job';
import { type OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';

@Injectable()
export class ParticipantTargetOpportunityListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('opportunity', DatabaseEventAction.CREATED)
  async handleCreatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordCreateEvent<OpportunityWorkspaceEntity>
    >,
  ) {
    const opportunityIds = payload.events
      .filter(
        ({ properties }) =>
          isDefined(properties.after.companyId) ||
          isDefined(properties.after.pointOfContactId),
      )
      .map(({ recordId }) => recordId);

    if (opportunityIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<ReconcileOpportunityTargetsJobData>(
      ReconcileOpportunityTargetsJob.name,
      { workspaceId: payload.workspaceId, opportunityIds },
    );
  }

  @OnDatabaseBatchEvent('opportunity', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<OpportunityWorkspaceEntity>
    >,
  ) {
    const opportunityIds = payload.events
      .filter(
        ({ properties }) =>
          properties.before.companyId !== properties.after.companyId ||
          properties.before.pointOfContactId !==
            properties.after.pointOfContactId,
      )
      .map(({ recordId }) => recordId);

    if (opportunityIds.length === 0) {
      return;
    }

    await this.messageQueueService.add<ReconcileOpportunityTargetsJobData>(
      ReconcileOpportunityTargetsJob.name,
      { workspaceId: payload.workspaceId, opportunityIds },
    );
  }
}
