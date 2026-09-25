import { Injectable } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import {
  ReconcilePersonCompanyTargetsJob,
  type ReconcilePersonCompanyTargetsJobData,
} from 'src/modules/match-participant/jobs/reconcile-person-company-targets.job';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class ParticipantTargetPersonListener {
  constructor(
    @InjectMessageQueue(MessageQueue.messagingQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ) {
    const personIds = payload.events
      .filter(
        ({ properties }) =>
          !isDefined(properties.before.companyId) &&
          isDefined(properties.after.companyId),
      )
      .map(({ recordId }) => recordId);

    if (personIds.length === 0) {
      return;
    }

    // Enrichment can attach a company long after participants were matched,
    // without changing an email address or causing another provider sync.
    await this.messageQueueService.add<ReconcilePersonCompanyTargetsJobData>(
      ReconcilePersonCompanyTargetsJob.name,
      { workspaceId: payload.workspaceId, personIds },
    );
  }
}
