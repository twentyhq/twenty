import { isDefined } from 'twenty-shared/utils';

// lets the engine call back code it must not import, such as workflow handlers, which register themselves here
export class HandlerRegistry<THandler> {
  private readonly handlers = new Map<string, THandler>();

  register(key: string, handler: THandler): void {
    this.handlers.set(key, handler);
  }

  getHandlerOrThrow(key: string): THandler {
    const handler = this.handlers.get(key);

    if (!isDefined(handler)) {
      throw new Error(`No handler is registered for ${key}`);
    }

    return handler;
  }
}
