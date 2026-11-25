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
import { findApplicationFlatEventMetadataByNameOrThrow } from 'src/engine/metadata-modules/event-metadata/utils/find-application-flat-event-metadata-by-name-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApplicationEventEmitterService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async emit({
    workspaceId,
    applicationId,
    event,
    properties,
  }: {
    workspaceId: string;
    applicationId: string;
    event: string;
    properties: Record<string, unknown>;
  }): Promise<EmitEventResult> {
    const { flatEventMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatEventMetadataMaps',
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
      type: event,
      occurredAt: new Date().toISOString(),
      properties,
    };

    if (
      Buffer.byteLength(JSON.stringify(occurrence)) >
      EVENT_LIMITS.MAX_PAYLOAD_BYTES
    ) {
      throw new EventMetadataException(
        `An event occurrence cannot exceed ${EVENT_LIMITS.MAX_PAYLOAD_BYTES} bytes`,
        EventMetadataExceptionCode.INVALID_EVENT_PROPERTIES,
      );
    }

    return { id: occurrence.id, occurredAt: occurrence.occurredAt };
  }
}
