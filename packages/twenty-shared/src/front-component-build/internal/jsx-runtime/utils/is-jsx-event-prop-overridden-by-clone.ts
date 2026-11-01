import { type ElementProps } from '@/front-component-build/internal/jsx-runtime/types/ElementProps';
import { type EventHandlersByPropName } from '@/front-component-build/internal/jsx-runtime/types/EventHandlersByPropName';
import { doesCloneSetOrClearEventProp } from '@/front-component-build/internal/jsx-runtime/utils/does-clone-set-or-clear-event-prop';

export const isJsxEventPropOverriddenByClone = ({
  eventPropName,
  cloneConfig,
  eventHandlersSetByInnerClones,
}: {
  eventPropName: string;
  cloneConfig: ElementProps;
  eventHandlersSetByInnerClones: EventHandlersByPropName | null;
}) => {
  if (doesCloneSetOrClearEventProp(cloneConfig, eventPropName)) {
    return true;
  }

  if (eventHandlersSetByInnerClones === null) {
    return false;
  }

  return eventPropName in eventHandlersSetByInnerClones;
};
