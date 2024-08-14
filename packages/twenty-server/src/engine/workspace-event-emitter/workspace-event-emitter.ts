import { EventEmitter2 } from '@nestjs/event-emitter';

export class WorkspaceEventEmitter extends EventEmitter2 {
  constructor() {
    super();
  }

  emit(eventName: string, events: any[], workspaceId: string) {
    return super.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    });
  }
}
