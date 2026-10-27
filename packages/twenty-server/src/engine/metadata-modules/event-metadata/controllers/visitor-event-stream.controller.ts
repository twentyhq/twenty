import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { MAX_CONNECTIONS_PER_VISITOR_TOKEN } from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { VisitorEventTokenService } from 'src/engine/metadata-modules/event-metadata/services/visitor-event-token.service';
import { buildEventRealtimeChannel } from 'src/engine/metadata-modules/event-metadata/utils/build-event-realtime-channel.util';
import { sendEventMetadataExceptionResponse } from 'src/engine/metadata-modules/event-metadata/utils/send-event-metadata-exception-response.util';
import { streamEventOccurrences } from 'src/engine/metadata-modules/event-metadata/utils/stream-event-occurrences.util';
import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Controller(ApiPath.AppEvents)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class VisitorEventStreamController {
  constructor(
    private readonly visitorEventTokenService: VisitorEventTokenService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly eventRealtimeService: EventRealtimeService,
    private readonly redisClientService: RedisClientService,
  ) {}

  @Get('stream')
  async stream(
    @Req() request: Request,
    @Res() response: Response,
    @Query('token') token?: string,
  ): Promise<void> {
    try {
      if (!isDefined(token)) {
        throw new EventMetadataException(
          'Missing visitor event token',
          EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
        );
      }

      const payload = await this.visitorEventTokenService.verifyOrThrow(token);
      const channels = await this.getVisitorChannelsOrThrow(payload);
      const connectionCountKey = `appEventVisitorStreamConnections:${payload.jti ?? payload.sub}`;
      const redisClient = this.redisClientService.getClient();
      const connectionCount = await redisClient.incr(connectionCountKey);

      await redisClient.expireat(connectionCountKey, payload.exp);

      if (connectionCount > MAX_CONNECTIONS_PER_VISITOR_TOKEN) {
        await redisClient.decr(connectionCountKey);
        response.status(HttpStatus.TOO_MANY_REQUESTS).json({
          error: 'TOO_MANY_CONNECTIONS',
          message: 'Too many open streams for this visitor token',
        });

        return;
      }

      await streamEventOccurrences({
        request,
        response,
        subscribe: (onOccurrence) =>
          this.eventRealtimeService.subscribe({ channels, onOccurrence }),
        closeAt: new Date(payload.exp * 1000),
        onClose: () => void redisClient.decr(connectionCountKey),
      });
    } catch (error) {
      sendEventMetadataExceptionResponse(response, error);
    }
  }

  private async getVisitorChannelsOrThrow({
    workspaceId,
    applicationId,
    anonymousId,
    eventMetadataIds,
  }: {
    workspaceId: string;
    applicationId: string;
    anonymousId: string;
    eventMetadataIds: string[];
  }): Promise<string[]> {
    const { flatEventMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
      ]);

    const channels = eventMetadataIds
      .map((eventMetadataId) => {
        const universalIdentifier =
          flatEventMetadataMaps.universalIdentifierById[eventMetadataId];

        return isDefined(universalIdentifier)
          ? flatEventMetadataMaps.byUniversalIdentifier[universalIdentifier]
          : undefined;
      })
      .filter(
        (flatEventMetadata): flatEventMetadata is FlatEventMetadata =>
          isDefined(flatEventMetadata) &&
          flatEventMetadata.applicationId === applicationId &&
          (flatEventMetadata.capabilities.realtime?.scopes ?? []).some(
            (scope) => scope.kind === 'visitor',
          ),
      )
      .map((flatEventMetadata) =>
        buildEventRealtimeChannel({
          workspaceId,
          eventMetadataId: flatEventMetadata.id,
          scope: { kind: 'visitor', anonymousId },
        }),
      );

    if (channels.length === 0) {
      throw new EventMetadataException(
        'None of the events in this visitor token can be streamed anymore',
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
      );
    }

    return channels;
  }
}
