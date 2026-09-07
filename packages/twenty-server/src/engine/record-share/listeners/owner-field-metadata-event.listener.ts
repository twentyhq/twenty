import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getEffectiveOwnerFieldMetadataId } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-owner-field-metadata-id.util';
import {
  RebuildOwnerRecordSharesJob,
  type RebuildOwnerRecordSharesJobData,
} from 'src/engine/record-share/jobs/rebuild-owner-record-shares.job';
import {
  type ObjectMetadataUpdatedEvent,
  isObjectMetadataUpdatedEvent,
} from 'src/engine/record-share/utils/is-object-metadata-updated-event.util';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { computeMetadataEventName } from 'src/engine/subscriptions/metadata-event/utils/compute-metadata-event-name.util';

const hasEffectiveOwnerFieldChanged = (
  event: ObjectMetadataUpdatedEvent,
): boolean =>
  getEffectiveOwnerFieldMetadataId(event.properties.before) !==
  getEffectiveOwnerFieldMetadataId(event.properties.after);

@Injectable()
export class OwnerFieldMetadataEventListener {
  constructor(
    @InjectMessageQueue(MessageQueue.recordShareQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent(
    computeMetadataEventName({
      metadataName: 'objectMetadata',
      type: 'updated',
    }),
  )
  async handleObjectMetadataUpdated(
    metadataEventBatch: MetadataEventBatch<'objectMetadata', 'updated'>,
  ): Promise<void> {
    const { workspaceId } = metadataEventBatch;

    for (const event of metadataEventBatch.events
      .filter(isObjectMetadataUpdatedEvent)
      .filter(hasEffectiveOwnerFieldChanged)) {
      await this.messageQueueService.add<RebuildOwnerRecordSharesJobData>(
        RebuildOwnerRecordSharesJob.name,
        { workspaceId, objectMetadataId: event.recordId },
        {
          id: `${RebuildOwnerRecordSharesJob.name}-${workspaceId}-${event.recordId}`,
          retryLimit: 3,
        },
      );
    }
  }
}
