import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { type QueueJobEvent } from 'src/engine/subscriptions/types/queue-job-event.type';
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

    await this.publishToActiveStreams(workspaceId, (streamData) => {
      const streamUserWorkspaceId = streamData.authContext.userWorkspaceId;

      const metadataEventsForStream = events
        .filter((event) => {
          // Events without recipientUserWorkspaceIds are workspace-wide; delivered
          // to every stream. Events with the field are user-scoped; only delivered
          // to streams whose authContext.userWorkspaceId is in the list.
          if (!isDefined(event.recipientUserWorkspaceIds)) {
            return true;
          }

          return (
            isDefined(streamUserWorkspaceId) &&
            event.recipientUserWorkspaceIds.includes(streamUserWorkspaceId)
          );
        })
        .map((event) => ({
          metadataName: event.entityName,
          type: event.type,
          recordId: event.recordId,
          properties: event.properties,
          updatedCollectionHash,
        }));

      if (metadataEventsForStream.length === 0) {
        return undefined;
      }

      return {
        objectRecordEventsWithQueryIds: [],
        metadataEvents: metadataEventsForStream,
      };
    });
  }

  async broadcastQueueJobEvent({
    workspaceId,
    userWorkspaceId,
    queueJobEvent,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    queueJobEvent: QueueJobEvent;
  }): Promise<void> {
    await this.publishToActiveStreams(workspaceId, (streamData) =>
      streamData.authContext.userWorkspaceId === userWorkspaceId
        ? {
            objectRecordEventsWithQueryIds: [],
            metadataEvents: [],
            queueJobEvents: [queueJobEvent],
          }
        : undefined,
    );
  }

  private async publishToActiveStreams(
    workspaceId: string,
    buildPayloadForStream: (
      streamData: EventStreamData,
    ) => EventStreamPayload | undefined,
  ): Promise<void> {
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

    for (const [streamChannelId, streamData] of streamsData) {
      if (!isDefined(streamData)) {
        streamIdsToRemove.push(streamChannelId);
        continue;
      }

      const payload = buildPayloadForStream(streamData);

      if (!isDefined(payload)) {
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
