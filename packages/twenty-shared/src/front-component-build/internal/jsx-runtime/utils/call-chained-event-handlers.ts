import { type EventHandler } from '@/front-component-build/internal/jsx-runtime/types/EventHandler';
import { isSyntheticLikeEvent } from '@/front-component-build/internal/jsx-runtime/utils/is-synthetic-like-event';

export const callChainedEventHandlers = ({
  thisArgument,
  event,
  firstHandler,
  secondHandler,
}: {
  thisArgument: unknown;
  event: Event;
  firstHandler: EventHandler;
  secondHandler: EventHandler;
}) => {
  const isPreventableEvent = isSyntheticLikeEvent(event);
  if (isPreventableEvent) {
    event.preventBaseUIHandler = function () {
      event.baseUIHandlerPrevented = true;
    };
  }

  firstHandler.call(thisArgument, event);

  const isSecondHandlerPrevented =
    isPreventableEvent && !!event.baseUIHandlerPrevented;
  if (!isSecondHandlerPrevented) {
    secondHandler.call(thisArgument, event);
  }
};
