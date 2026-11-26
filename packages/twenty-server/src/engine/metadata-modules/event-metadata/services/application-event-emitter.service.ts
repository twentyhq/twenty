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
import { findApplicationFlatEventMetadataOrThrow } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-or-throw.util';
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
    eventUniversalIdentifier,
    id,
    properties,
    anonymousId,
  }: {
    workspaceId: string;
    applicationId: string;
    event?: string;
    eventUniversalIdentifier?: string;
    id?: string;
    properties: Record<string, unknown>;
    anonymousId: string | null;
  }): Promise<EmitEventResult> {
    const { flatEventMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const flatEventMetadata = findApplicationFlatEventMetadataOrThrow({
      flatEventMetadataMaps,
      applicationId,
      name: event,
      universalIdentifier: eventUniversalIdentifier,
    });

    const propertyErrors = getEventPropertyValuesErrors({
      eventName: flatEventMetadata.name,
      schema: flatEventMetadata.schema,
      values: properties,
    });

    if (propertyErrors.length > 0) {
      throw new EventMetadataException(
        propertyErrors.join('; '),
        EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES,
      );
    }

    const occurrence: EventOccurrence = {
      id: id ?? v4(),
      type: flatEventMetadata.name,
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
