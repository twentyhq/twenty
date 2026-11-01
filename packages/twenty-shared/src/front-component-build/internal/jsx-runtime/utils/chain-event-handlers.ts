import { type EventHandler } from '@/front-component-build/internal/jsx-runtime/types/EventHandler';
import { callChainedEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/call-chained-event-handlers';

export const chainEventHandlers = (
  firstHandler: EventHandler,
  secondHandler: EventHandler,
): EventHandler =>
  function (this: unknown, event: Event) {
    callChainedEventHandlers({
      thisArgument: this,
      event,
      firstHandler,
      secondHandler,
    });
  };
