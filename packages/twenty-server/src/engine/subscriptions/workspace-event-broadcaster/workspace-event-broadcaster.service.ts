import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

@Injectable()
export class WorkspaceEventBroadcaster {
  constructor(
    private readonly eventStreamService: EventStreamService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async broadcast({
    workspaceId,
    events,
    updatedCollectionHash,
  }: {
    workspaceId: string;
    events: WorkspaceBroadcastEvent[];
    updatedCollectionHash?: string;
  }): Promise<void> {
    if (events.length === 0) {
      return;
    }

    const activeStreamIds =
      await this.eventStreamService.getActiveStreamIds(workspaceId);

    if (activeStreamIds.length === 0) {
      return;
    }

    const streamsData = await this.eventStreamService.getStreamsData(
      workspaceId,
      activeStreamIds,
    );

    const streamIdsToRemove: string[] = [];

    const payload: EventStreamPayload = {
      objectRecordEventsWithQueryIds: [],
      metadataEvents: events.map((event) => ({
        metadataName: event.entityName,
        type: event.type,
        recordId: event.recordId,
        properties: event.properties,
        updatedCollectionHash,
      })),
    };

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        streamIdsToRemove.push(streamChannelId);
        continue;
      }

      await this.subscriptionService.publishToEventStream({
        workspaceId,
        eventStreamChannelId: streamChannelId,
        payload,
      });
    }

    await this.eventStreamService.removeFromActiveStreams(
      workspaceId,
      streamIdsToRemove,
    );
  }
}
