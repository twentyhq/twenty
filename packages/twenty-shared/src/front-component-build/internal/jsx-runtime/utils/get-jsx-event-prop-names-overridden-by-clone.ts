import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { isJsxEventPropOverriddenByClone } from '@/front-component-build/internal/jsx-runtime/utils/is-jsx-event-prop-overridden-by-clone';

export const getJsxEventPropNamesOverriddenByClone = ({
  jsxEventHandlers,
  cloneConfig,
  eventHandlersSetByInnerClones,
}: {
  jsxEventHandlers: EventHandlersByPropName;
  cloneConfig: ElementProps;
  eventHandlersSetByInnerClones: EventHandlersByPropName | null;
}) =>
  Object.keys(jsxEventHandlers).filter((jsxEventPropName) =>
    isJsxEventPropOverriddenByClone({
      eventPropName: jsxEventPropName,
      cloneConfig,
      eventHandlersSetByInnerClones,
    }),
  );
