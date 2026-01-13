import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { transformEventToWebhookEvent } from 'src/engine/core-modules/webhook/utils/transform-event-to-webhook-event';
import { SubscriptionChannel } from 'src/engine/subscriptions/enums/subscription-channel.enum';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class WorkspaceEventEmitterService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly eventStreamService: EventStreamService,
  ) {}

  async publish(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    for (const eventData of workspaceEventBatch.events) {
      const { record, updatedFields } = transformEventToWebhookEvent({
        eventName: workspaceEventBatch.name,
        event: eventData,
      });

      const event = {
        action: operation,
        objectNameSingular: nameSingular,
        eventDate: new Date(),
        record,
        ...(updatedFields && { updatedFields }),
      };

      // Publish individual events to legacy channel (onDbEvent)
      await this.subscriptionService.publish({
        channel: SubscriptionChannel.DATABASE_EVENT_CHANNEL,
        workspaceId: workspaceEventBatch.workspaceId,
        payload: { onDbEvent: event },
      });
    }

    await this.publishToEventStreams(workspaceEventBatch);
  }

  private async publishToEventStreams(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const workspaceId = workspaceEventBatch.workspaceId;

    const activeStreamIds =
      await this.eventStreamService.getActiveStreamIds(workspaceId);

    if (activeStreamIds.length === 0) {
      return;
    }

    const streamsData = await this.eventStreamService.getStreamsData(
      workspaceId,
      activeStreamIds,
    );

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        continue;
      }

      await this.processStreamEvents(
        streamChannelId,
        streamData,
        workspaceEventBatch,
      );
    }
  }

  private async processStreamEvents(
    streamChannelId: string,
    streamData: EventStreamData,
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    const matchedEvents: {
      queryIds: string[];
      event: ObjectRecordEvent & { objectNameSingular: string };
    }[] = [];

    const objectNameSingular = workspaceEventBatch.objectMetadata.nameSingular;

    for (const event of workspaceEventBatch.events) {
      const eventWithObjectName = {
        objectNameSingular,
        ...event,
      };

      const matchedQueryIds = this.eventStreamService.matchQueriesWithEvent(
        streamData.queries,
        eventWithObjectName,
      );

      if (matchedQueryIds.length === 0) {
        continue;
      }

      matchedEvents.push({
        queryIds: matchedQueryIds,
        event: eventWithObjectName,
      });
    }

    if (matchedEvents.length > 0) {
      await this.subscriptionService.publishToEventStream({
        workspaceId: workspaceEventBatch.workspaceId,
        eventStreamChannelId: streamChannelId,
        payload: matchedEvents,
      });
    }
  }
}
