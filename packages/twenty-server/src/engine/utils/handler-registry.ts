import { isDefined } from 'twenty-shared/utils';

// lets the engine call back code it must not import, such as workflow handlers, which register themselves here
export class HandlerRegistry<TKey extends string, THandler> {
  private readonly handlers = new Map<TKey, THandler>();

  register(key: TKey, handler: THandler): void {
    this.handlers.set(key, handler);
  }

  getHandlerOrThrow(key: TKey): THandler {
    const handler = this.handlers.get(key);

    if (!isDefined(handler)) {
      throw new Error(`No handler is registered for ${key}`);
    }

    return handler;
  }
}
