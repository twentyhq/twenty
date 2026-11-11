import { computeTriggerEventNamesMatchingEvent } from 'src/engine/workspace-event-emitter/utils/compute-trigger-event-names-matching-event.util';

export const isDatabaseEventTriggerListeningToEvent = ({
  triggerEventName,
  eventName,
}: {
  triggerEventName: string;
  eventName: string;
}): boolean =>
  computeTriggerEventNamesMatchingEvent(eventName).includes(triggerEventName);
