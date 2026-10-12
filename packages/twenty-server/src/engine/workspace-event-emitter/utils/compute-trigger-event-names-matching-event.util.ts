import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';

export const computeTriggerEventNamesMatchingEvent = (
  eventName: string,
): string[] => {
  const { objectSingularName, action } = parseEventNameOrThrow(eventName);

  return [
    `${objectSingularName}.${action}`,
    `*.${action}`,
    `${objectSingularName}.*`,
    '*.*',
  ];
};
