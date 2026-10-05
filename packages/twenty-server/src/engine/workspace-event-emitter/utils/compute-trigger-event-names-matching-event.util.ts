export const computeTriggerEventNamesMatchingEvent = (
  eventName: string,
): string[] => {
  const [objectSingularName, action] = eventName.split('.');

  return [
    `${objectSingularName}.${action}`,
    `*.${action}`,
    `${objectSingularName}.*`,
    '*.*',
  ];
};
