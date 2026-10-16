import { type EventHandlersBySource } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersBySource';
import { callChainedEventHandlers } from '@/front-component-build/internal/jsx-runtime/utils/call-chained-event-handlers';

export const createElementEventListener = (
  handlersBySource: EventHandlersBySource,
) =>
  function (this: unknown, event: Event) {
    const jsxHandler = handlersBySource.jsx;
    const cloneHandler = handlersBySource.clone;
    if (jsxHandler && cloneHandler) {
      callChainedEventHandlers({
        thisArgument: this,
        event,
        firstHandler: jsxHandler,
        secondHandler: cloneHandler,
      });
      return;
    }

    const handlerOfSingleSource = jsxHandler || cloneHandler;
    if (handlerOfSingleSource) {
      handlerOfSingleSource.call(this, event);
    }
  };
