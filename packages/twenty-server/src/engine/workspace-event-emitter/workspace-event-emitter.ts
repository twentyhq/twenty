import { EventEmitter2 } from '@nestjs/event-emitter';

import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';

export class WorkspaceEventEmitter extends EventEmitter2 {
  constructor() {
    super();
  }

  emit(eventName: string, events: any[], workspaceId: string) {
    return super.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    } satisfies WorkspaceEventBatch<any>);
  }
}
