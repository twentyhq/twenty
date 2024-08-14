import { EventEmitter2 } from '@nestjs/event-emitter';

export class TwentyEventEmitter extends EventEmitter2 {
  constructor() {
    super();
  }

  emit(
    eventName: string,
    events: any[],
    properties: {
      workspaceId: string;
      [key: string]: any;
    },
  ) {
    return super.emit(eventName, {
      name: eventName,
      ...properties,
      events,
    });
  }
}
