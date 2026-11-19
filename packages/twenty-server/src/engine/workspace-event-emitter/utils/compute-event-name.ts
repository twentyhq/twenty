import { checkStringIsDatabaseEventAction } from 'src/engine/workspace-event-emitter/utils/check-string-is-database-event-action';

export const computeEventName = (objectName: string, action: string) => {
  if (!checkStringIsDatabaseEventAction(action)) {
    throw new Error('Invalid action');
  }

  return `${objectName}.${action}`;
};
