import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { isEventHandlerProp } from '@/front-component-build/internal/jsx-runtime/utils/is-event-handler-prop';

export const splitEventProps = (props: ElementProps | null | undefined) => {
  const cleanProps: ElementProps = {};
  let events: EventHandlersByPropName | null = null;
  for (const propName in props) {
    const propValue = props[propName];
    if (!isEventHandlerProp(propName, propValue)) {
      cleanProps[propName] = propValue;
      continue;
    }

    events = events || {};
    events[propName] = propValue;
  }
  return { cleanProps, events };
};
