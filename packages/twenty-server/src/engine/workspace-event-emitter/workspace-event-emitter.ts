import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';

@Injectable()
export class WorkspaceEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public emit(eventName: string, events: any[], workspaceId: string) {
    if (!events.length) {
      return;
    }

    return this.eventEmitter.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    } satisfies WorkspaceEventBatch<any>);
  }
}
