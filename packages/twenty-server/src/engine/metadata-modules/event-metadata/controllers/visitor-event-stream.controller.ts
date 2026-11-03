import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { EventMetadataRestApiExceptionFilter } from 'src/engine/metadata-modules/event-metadata/filters/event-metadata-rest-api-exception.filter';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { VisitorEventTokenService } from 'src/engine/metadata-modules/event-metadata/services/visitor-event-token.service';
import { streamEventOccurrences } from 'src/engine/metadata-modules/event-metadata/utils/stream-event-occurrences.util';

@Controller(ApiPath.AppEvents)
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
@UseFilters(EventMetadataRestApiExceptionFilter)
export class VisitorEventStreamController {
  constructor(
    private readonly visitorEventTokenService: VisitorEventTokenService,
    private readonly eventRealtimeService: EventRealtimeService,
  ) {}

  @Get('stream')
  async stream(
    @Req() request: Request,
    @Res() response: Response,
    @Query('token') token?: string,
  ): Promise<void> {
    if (!isDefined(token)) {
      throw new EventMetadataException(
        'Missing visitor event token',
        EventMetadataExceptionCode.INVALID_VISITOR_EVENT_TOKEN,
      );
    }

    const payload = await this.visitorEventTokenService.verifyOrThrow(token);
    const channels =
      await this.visitorEventTokenService.resolveChannelsOrThrow(payload);
    const releaseStreamSlot =
      await this.visitorEventTokenService.acquireStreamSlotOrThrow(payload);

    await streamEventOccurrences({
      request,
      response,
      subscribe: (onOccurrence) =>
        this.eventRealtimeService.subscribe({ channels, onOccurrence }),
      closeAt: new Date(payload.exp * 1000),
      onClose: () => void releaseStreamSlot(),
    });
  }
}
