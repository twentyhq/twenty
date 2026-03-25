import { checkStringIsDatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/utils/check-string-is-database-event-action';

export const computeEventName = (objectName: string, action: string) => {
  if (!checkStringIsDatabaseEventAction(action)) {
    throw new Error('Invalid action');
  }

  return `${objectName}.${action}`;
};
