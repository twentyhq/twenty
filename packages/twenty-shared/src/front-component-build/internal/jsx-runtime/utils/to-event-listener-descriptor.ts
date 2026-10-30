import { USES_PREACT } from '__uses_preact__';

import { CAPTURE_PHASE_PROP_NAME_SUFFIX } from '@/front-component-build/internal/jsx-runtime/constants/capture-phase-prop-name-suffix';
import { type EventListenerDescriptor } from '@/front-component-build/internal/jsx-runtime/types/EventListenerDescriptor';
import { isCapturePhaseEventProp } from '@/front-component-build/internal/jsx-runtime/utils/is-capture-phase-event-prop';
import { isTextEntryElement } from '@/front-component-build/internal/jsx-runtime/utils/is-text-entry-element';

const EVENT_PROP_NAME_PREFIX = 'on';
const DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME: Record<
  string,
  string
> = {
  ondoubleclick: 'ondblclick',
};

export const toEventListenerDescriptor = ({
  eventPropName,
  element,
}: {
  eventPropName: string;
  element: EventTarget;
}): EventListenerDescriptor => {
  const isCapturePhase = isCapturePhaseEventProp(eventPropName);
  const bubblePhaseEventPropName = isCapturePhase
    ? eventPropName.slice(0, -CAPTURE_PHASE_PROP_NAME_SUFFIX.length)
    : eventPropName;
  const lowerCaseEventPropName = bubblePhaseEventPropName.toLowerCase();
  const domEventPropName =
    DOM_EVENT_PROP_NAME_BY_LOWER_CASE_REACT_EVENT_PROP_NAME[
      lowerCaseEventPropName
    ] || lowerCaseEventPropName;
  const eventType = domEventPropName.slice(EVENT_PROP_NAME_PREFIX.length);
  const isTextEntryChange =
    USES_PREACT && eventType === 'change' && isTextEntryElement(element);
  const listenerType = isTextEntryChange ? 'input' : eventType;
  const listenerKey = isTextEntryChange ? 'change:input' : eventType;

  return {
    key: isCapturePhase ? listenerKey + ':capture' : listenerKey,
    type: listenerType,
    capture: isCapturePhase,
  };
};
