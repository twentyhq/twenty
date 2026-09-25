import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';
import { computeMetadataEventName } from 'src/engine/subscriptions/metadata-event/utils/compute-metadata-event-name.util';
import {
  AllMetadataEventName,
  AllMetadataEventType,
  MetadataEvent,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

// Shutdown must not hang on a stalled listener: notifications are best effort.
const DRAIN_TIMEOUT_MS = 30_000;

type EmitMetadataEventsArgs = {
  metadataEvents: MetadataEvent[];
  workspaceId: string;
  initiatorContext?: WorkspaceAuthContext;
};

@Injectable()
export class MetadataEventEmitter {
  private readonly logger = new Logger(MetadataEventEmitter.name);
  private readonly pendingEvents = new Set<Promise<unknown>>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  public emitMetadataEvents({
    metadataEvents,
    workspaceId,
    initiatorContext,
  }: EmitMetadataEventsArgs): void {
    if (metadataEvents.length === 0) {
      return;
    }

    const resolvedInitiatorContext =
      this.resolveInitiatorContext(initiatorContext);

    const userId =
      resolvedInitiatorContext?.type === 'user' ||
      resolvedInitiatorContext?.type === 'pendingActivationUser'
        ? resolvedInitiatorContext.user.id
        : undefined;
    const apiKeyId =
      resolvedInitiatorContext?.type === 'apiKey'
        ? resolvedInitiatorContext.apiKey.id
        : undefined;

    const grouped = this.groupByMetadataNameAndAction(metadataEvents);

    for (const { eventName, events, metadataName, type } of grouped.values()) {
      if (metadataEvents.length === 0) {
        continue;
      }

      const metadataEventBatch: MetadataEventBatch = {
        name: eventName,
        workspaceId,
        metadataName,
        type,
        events,
        userId,
        apiKeyId,
      };

      const pendingEvent = this.eventEmitter
        .emitAsync(eventName, metadataEventBatch)
        .catch((error: unknown) => {
          this.logger.error(
            `Failed to handle ${eventName} for workspace ${workspaceId}`,
            error instanceof Error ? error.stack : String(error),
          );
        })
        .finally(() => {
          this.pendingEvents.delete(pendingEvent);
        });

      this.pendingEvents.add(pendingEvent);
    }
  }

  async drain(timeoutMs = DRAIN_TIMEOUT_MS): Promise<void> {
    if (this.pendingEvents.size === 0) {
      return;
    }

    let timeout: NodeJS.Timeout | undefined;

    const hasTimedOut = await Promise.race([
      Promise.allSettled([...this.pendingEvents]).then(() => false),
      new Promise<boolean>((resolve) => {
        timeout = setTimeout(() => resolve(true), timeoutMs);
      }),
    ]);

    clearTimeout(timeout);

    if (hasTimedOut) {
      this.logger.warn(
        `Stopped waiting for ${this.pendingEvents.size} metadata event batches after ${timeoutMs}ms`,
      );
    }
  }

  private resolveInitiatorContext(
    initiatorContext?: WorkspaceAuthContext,
  ): WorkspaceAuthContext | undefined {
    if (isDefined(initiatorContext)) {
      return initiatorContext;
    }

    try {
      return getWorkspaceAuthContext();
    } catch {
      return undefined;
    }
  }

  private groupByMetadataNameAndAction(metadataEvents: MetadataEvent[]) {
    const grouped = new Map<
      AllMetadataEventName,
      {
        metadataName: AllMetadataName;
        type: AllMetadataEventType;
        eventName: AllMetadataEventName;
        events: MetadataEvent[];
      }
    >();

    for (const metadataEvent of metadataEvents) {
      const { metadataName, type } = metadataEvent;
      const eventName = computeMetadataEventName({
        metadataName,
        type,
      });
      const occurrence = grouped.get(eventName);

      if (!isDefined(occurrence)) {
        grouped.set(eventName, {
          eventName,
          metadataName,
          type,
          events: [metadataEvent],
        });
        continue;
      }

      grouped.set(eventName, {
        ...occurrence,
        events: [...occurrence.events, metadataEvent],
      });
    }

    return grouped;
  }
}
