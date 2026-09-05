import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';
import {
  RecalculateSharingRuleRecordSharesJob,
  type RecalculateSharingRuleRecordSharesJobData,
} from 'src/engine/record-share/jobs/recalculate-sharing-rule-record-shares.job';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { computeMetadataEventName } from 'src/engine/subscriptions/metadata-event/utils/compute-metadata-event-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  type MetadataEvent,
  type UpdateMetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event';

const SHARING_RULE_EVENTS = 'metadata.sharingRule.*';
const PREDICATE_EVENTS = 'metadata.rowLevelPermissionPredicate.*';
const PREDICATE_GROUP_EVENTS = 'metadata.rowLevelPermissionPredicateGroup.*';
const SHARING_RULE_PROPERTIES_MATERIALIZED_IN_RECORD_SHARES = new Set<string>([
  'granteePrincipalType',
  'granteeRoleId',
  'granteePrincipalId',
  'accessLevel',
  'isActive',
]);

const changesMaterializedRecordShares = (event: MetadataEvent): boolean =>
  event.type !== 'updated' ||
  event.properties.updatedFields.some((updatedField) =>
    SHARING_RULE_PROPERTIES_MATERIALIZED_IN_RECORD_SHARES.has(updatedField),
  );

const readSharingRuleId = (entity: object | undefined): string | null =>
  isDefined(entity) &&
  'sharingRuleId' in entity &&
  typeof entity.sharingRuleId === 'string'
    ? entity.sharingRuleId
    : null;

const resolveParentSharingRuleIds = (event: MetadataEvent): string[] =>
  [
    readSharingRuleId(
      event.type === 'created' ? undefined : event.properties.before,
    ),
    readSharingRuleId(
      event.type === 'deleted' ? undefined : event.properties.after,
    ),
  ].filter(isDefined);

type ObjectMetadataUpdatedEvent = MetadataEvent &
  UpdateMetadataEvent<'objectMetadata'>;

const isObjectMetadataUpdatedEvent = (
  event: MetadataEvent,
): event is ObjectMetadataUpdatedEvent =>
  event.metadataName === 'objectMetadata' && event.type === 'updated';

const isTurnedPrivate = (event: ObjectMetadataUpdatedEvent): boolean =>
  getEffectiveReadability(event.properties.after) ===
    MetadataReadability.PRIVATE &&
  getEffectiveReadability(event.properties.before) !==
    MetadataReadability.PRIVATE;

@Injectable()
export class SharingRuleMetadataEventListener {
  constructor(
    @InjectMessageQueue(MessageQueue.recordShareQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @OnEvent(SHARING_RULE_EVENTS)
  async handleSharingRuleEvent(
    metadataEventBatch: MetadataEventBatch<'sharingRule'>,
  ): Promise<void> {
    await this.enqueueRecalculation({
      workspaceId: metadataEventBatch.workspaceId,
      sharingRuleIds: metadataEventBatch.events
        .filter(changesMaterializedRecordShares)
        .map((event) => event.recordId),
    });
  }

  @OnEvent(PREDICATE_EVENTS)
  @OnEvent(PREDICATE_GROUP_EVENTS)
  async handleCriteriaEvent(
    metadataEventBatch: MetadataEventBatch<
      'rowLevelPermissionPredicate' | 'rowLevelPermissionPredicateGroup'
    >,
  ): Promise<void> {
    await this.enqueueRecalculation({
      workspaceId: metadataEventBatch.workspaceId,
      sharingRuleIds: metadataEventBatch.events.flatMap(
        resolveParentSharingRuleIds,
      ),
    });
  }

  @OnEvent(
    computeMetadataEventName({
      metadataName: 'objectMetadata',
      type: 'updated',
    }),
  )
  async handleObjectMetadataUpdated(
    metadataEventBatch: MetadataEventBatch<'objectMetadata', 'updated'>,
  ): Promise<void> {
    const objectMetadataIdsTurnedPrivate = metadataEventBatch.events
      .filter(isObjectMetadataUpdatedEvent)
      .filter(isTurnedPrivate)
      .map((event) => event.recordId);

    if (objectMetadataIdsTurnedPrivate.length === 0) {
      return;
    }

    const { flatSharingRuleMaps } =
      await this.workspaceCacheService.getOrRecompute(
        metadataEventBatch.workspaceId,
        ['flatSharingRuleMaps'],
      );

    await this.enqueueRecalculation({
      workspaceId: metadataEventBatch.workspaceId,
      sharingRuleIds: Object.values(flatSharingRuleMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (flatSharingRule) =>
            flatSharingRule.isActive &&
            !isDefined(flatSharingRule.deletedAt) &&
            objectMetadataIdsTurnedPrivate.includes(
              flatSharingRule.objectMetadataId,
            ),
        )
        .map((flatSharingRule) => flatSharingRule.id),
    });
  }

  private async enqueueRecalculation({
    workspaceId,
    sharingRuleIds,
  }: RecalculateSharingRuleRecordSharesJobData): Promise<void> {
    for (const sharingRuleId of new Set(sharingRuleIds)) {
      await this.messageQueueService.add<RecalculateSharingRuleRecordSharesJobData>(
        RecalculateSharingRuleRecordSharesJob.name,
        { workspaceId, sharingRuleIds: [sharingRuleId] },
        {
          id: `${RecalculateSharingRuleRecordSharesJob.name}-${sharingRuleId}`,
          retryLimit: 3,
        },
      );
    }
  }
}
