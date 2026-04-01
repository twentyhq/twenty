import { registerEnumType } from '@nestjs/graphql';

export enum AutomationActionType {
  CREATE_TASK = 'CREATE_TASK',
  SEND_EMAIL = 'SEND_EMAIL',
  UPDATE_FIELD = 'UPDATE_FIELD',
  ASSIGN_OWNER = 'ASSIGN_OWNER',
  NOTIFY_OWNER = 'NOTIFY_OWNER',
  ADD_TO_CAMPAIGN = 'ADD_TO_CAMPAIGN',
}

registerEnumType(AutomationActionType, {
  name: 'AutomationActionType',
  description: 'Action type for automation',
});
