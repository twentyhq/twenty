import { isDefined } from 'twenty-shared/utils';

import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';

export const parseEventNameOrThrow = (eventName: string) => {
  const [objectName, action] = eventName.split('.');

  if (!checkStringIsDatabaseEventAction(action)) {
    throw new Error('Invalid event name');
  }

  if (!isDefined(objectName)) {
    throw new Error('Invalid event name');
  }

  return {
    objectName,
    action,
  };
};
