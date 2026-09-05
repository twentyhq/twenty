import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordEvent,
  type ObjectRecordRestoreEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  RecalculateSharingRuleRecordSharesJob,
  type RecalculateSharingRuleRecordSharesJobData,
} from 'src/engine/record-share/jobs/recalculate-sharing-rule-record-shares.job';
import { resolveSharingRuleIdsAffectedByRecordEvents } from 'src/engine/record-share/utils/resolve-sharing-rule-ids-affected-by-record-events.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class SharingRuleRecordEventListener {
  constructor(
    @InjectMessageQueue(MessageQueue.recordShareQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @OnDatabaseBatchEvent('*', DatabaseEventAction.CREATED)
  async handleCreated(
    batchEvent: WorkspaceEventBatch<ObjectRecordCreateEvent>,
  ): Promise<void> {
    await this.enqueueAffectedSharingRules(
      batchEvent,
      DatabaseEventAction.CREATED,
    );
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.UPDATED)
  async handleUpdated(
    batchEvent: WorkspaceEventBatch<ObjectRecordUpdateEvent>,
  ): Promise<void> {
    await this.enqueueAffectedSharingRules(
      batchEvent,
      DatabaseEventAction.UPDATED,
    );
  }

  @OnDatabaseBatchEvent('*', DatabaseEventAction.RESTORED)
  async handleRestored(
    batchEvent: WorkspaceEventBatch<ObjectRecordRestoreEvent>,
  ): Promise<void> {
    await this.enqueueAffectedSharingRules(
      batchEvent,
      DatabaseEventAction.RESTORED,
    );
  }

  private async enqueueAffectedSharingRules(
    batchEvent: WorkspaceEventBatch<ObjectRecordEvent>,
    action: DatabaseEventAction,
  ): Promise<void> {
    const { flatSharingRuleMaps } =
      await this.workspaceCacheService.getOrRecompute(batchEvent.workspaceId, [
        'flatSharingRuleMaps',
      ]);

    const hasActiveSharingRule = Object.values(
      flatSharingRuleMaps.byUniversalIdentifier,
    ).some(
      (sharingRule) =>
        isDefined(sharingRule) &&
        sharingRule.objectMetadataId === batchEvent.objectMetadata.id &&
        sharingRule.isActive &&
        !isDefined(sharingRule.deletedAt),
    );

    if (!hasActiveSharingRule) {
      return;
    }

    const { flatRowLevelPermissionPredicateMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(batchEvent.workspaceId, [
        'flatRowLevelPermissionPredicateMaps',
        'flatFieldMetadataMaps',
      ]);

    const sharingRuleIds = resolveSharingRuleIdsAffectedByRecordEvents({
      objectMetadataId: batchEvent.objectMetadata.id,
      action,
      events: batchEvent.events,
      flatSharingRuleMaps,
      flatRowLevelPermissionPredicateMaps,
      flatFieldMetadataMaps,
    });

    for (const sharingRuleId of sharingRuleIds) {
      await this.messageQueueService.add<RecalculateSharingRuleRecordSharesJobData>(
        RecalculateSharingRuleRecordSharesJob.name,
        {
          workspaceId: batchEvent.workspaceId,
          sharingRuleIds: [sharingRuleId],
        },
        {
          id: `${RecalculateSharingRuleRecordSharesJob.name}-${sharingRuleId}`,
          retryLimit: 3,
        },
      );
    }
  }
}
