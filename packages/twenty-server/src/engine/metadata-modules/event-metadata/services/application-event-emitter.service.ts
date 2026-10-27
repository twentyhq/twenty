import { Injectable } from '@nestjs/common';

import {
  EVENT_LIMITS,
  type EmitEventResult,
  type EventOccurrence,
  getEventPropertyValuesErrors,
} from 'twenty-shared/application';
import { v4 } from 'uuid';

import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { EventRealtimeService } from 'src/engine/metadata-modules/event-metadata/services/event-realtime.service';
import { buildEventRealtimeChannel } from 'src/engine/metadata-modules/event-metadata/utils/build-event-realtime-channel.util';
import { computeEventOccurrenceRealtimeScopes } from 'src/engine/metadata-modules/event-metadata/utils/compute-event-occurrence-realtime-scopes.util';
import { findApplicationFlatEventMetadataByNameOrThrow } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-by-name-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationEventEmitterService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly eventRealtimeService: EventRealtimeService,
  ) {}

  async emit({
    workspaceId,
    applicationId,
    event,
    properties,
    anonymousId,
  }: {
    workspaceId: string;
    applicationId: string;
    event: string;
    properties: Record<string, unknown>;
    anonymousId: string | null;
  }): Promise<EmitEventResult> {
    const { flatEventMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const flatEventMetadata = findApplicationFlatEventMetadataByNameOrThrow({
      flatEventMetadataMaps,
      applicationId,
      name: event,
    });

    const propertyErrors = getEventPropertyValuesErrors({
      eventName: event,
      properties: flatEventMetadata.properties,
      values: properties,
    });

    if (propertyErrors.length > 0) {
      throw new EventMetadataException(
        propertyErrors.join('; '),
        EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES,
      );
    }

    const occurrence: EventOccurrence = {
      id: v4(),
      event,
      occurredAt: new Date().toISOString(),
      properties,
    };
    const serializedOccurrence = JSON.stringify(occurrence);

    if (
      Buffer.byteLength(serializedOccurrence) > EVENT_LIMITS.MAX_PAYLOAD_BYTES
    ) {
      throw new EventMetadataException(
        `An event occurrence cannot exceed ${EVENT_LIMITS.MAX_PAYLOAD_BYTES} bytes`,
        EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES,
      );
    }

    const channels = computeEventOccurrenceRealtimeScopes({
      flatEventMetadata,
      flatObjectMetadataMaps,
      properties,
      anonymousId,
    }).map((scope) =>
      buildEventRealtimeChannel({
        workspaceId,
        eventMetadataId: flatEventMetadata.id,
        scope,
      }),
    );

    await this.eventRealtimeService.publish({ channels, serializedOccurrence });

    return { id: occurrence.id, occurredAt: occurrence.occurredAt };
  }
}
