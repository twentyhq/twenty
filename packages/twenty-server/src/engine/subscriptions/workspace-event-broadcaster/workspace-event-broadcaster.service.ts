import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type PermissionFlagType } from 'twenty-shared/constants';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { resolveUserWorkspaceIdsWithPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/resolve-user-workspace-ids-with-permission-flag.util';
import { EventStreamService } from 'src/engine/subscriptions/event-stream.service';
import { SubscriptionService } from 'src/engine/subscriptions/subscription.service';
import { type EventStreamData } from 'src/engine/subscriptions/types/event-stream-data.type';
import { type EventStreamPayload } from 'src/engine/subscriptions/types/event-stream-payload.type';
import { type QueueJobEvent } from 'src/engine/subscriptions/types/queue-job-event.type';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

// A stream carrying an application or an api key is narrower than the user it
// authenticates: the read guard intersects the user role with the application
// role, which this fan-out cannot evaluate, so a gated event must not reach it.
const isStreamScopedToItsUser = (streamData: EventStreamData): boolean =>
  !isDefined(streamData.authContext.applicationId) &&
  !isDefined(streamData.authContext.apiKeyId);

@Injectable()
export class WorkspaceEventBroadcaster {
  constructor(
    private readonly eventStreamService: EventStreamService,
    private readonly subscriptionService: SubscriptionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

    const allowedUserWorkspaceIdsByPermissionFlag =
      await this.resolveAllowedUserWorkspaceIdsByPermissionFlag({
        workspaceId,
        events,
      });

    await this.publishToActiveStreams(workspaceId, (streamData) => {
      const streamUserWorkspaceId = streamData.authContext.userWorkspaceId;

      const metadataEventsForStream = events
        .filter((event) => {
          if (isDefined(event.requiredPermissionFlag)) {
            const isStreamAllowed =
              isStreamScopedToItsUser(streamData) &&
              isDefined(streamUserWorkspaceId) &&
              (allowedUserWorkspaceIdsByPermissionFlag
                .get(event.requiredPermissionFlag)
                ?.has(streamUserWorkspaceId) ??
                false);

            if (!isStreamAllowed) {
              return false;
            }
          }

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
    userWorkspaceId?: string;
    queueJobEvent: QueueJobEvent;
  }): Promise<void> {
    await this.publishToActiveStreams(workspaceId, (streamData) =>
      !isDefined(userWorkspaceId) ||
      streamData.authContext.userWorkspaceId === userWorkspaceId
        ? {
            objectRecordEventsWithQueryIds: [],
            metadataEvents: [],
            queueJobEvents: [queueJobEvent],
          }
        : undefined,
    );
  }

  private async resolveAllowedUserWorkspaceIdsByPermissionFlag({
    workspaceId,
    events,
  }: {
    workspaceId: string;
    events: WorkspaceBroadcastEvent[];
  }): Promise<Map<PermissionFlagType, Set<string>>> {
    const requiredPermissionFlags = new Set(
      events
        .map((event) => event.requiredPermissionFlag)
        .filter((permissionFlag): permissionFlag is PermissionFlagType =>
          isDefined(permissionFlag),
        ),
    );

    const allowedUserWorkspaceIdsByPermissionFlag = new Map<
      PermissionFlagType,
      Set<string>
    >();

    if (requiredPermissionFlags.size === 0) {
      return allowedUserWorkspaceIdsByPermissionFlag;
    }

    const { flatRoleMaps, flatRolePermissionFlagMaps, flatRoleTargetMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: [
            'flatRoleMaps',
            'flatRolePermissionFlagMaps',
            'flatRoleTargetMaps',
          ],
        },
      );

    for (const permissionFlag of requiredPermissionFlags) {
      allowedUserWorkspaceIdsByPermissionFlag.set(
        permissionFlag,
        new Set(
          resolveUserWorkspaceIdsWithPermissionFlag({
            permissionFlag,
            flatRoleMaps,
            flatRolePermissionFlagMaps,
            flatRoleTargetMaps,
          }),
        ),
      );
    }

    return allowedUserWorkspaceIdsByPermissionFlag;
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
