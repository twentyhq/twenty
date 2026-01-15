import { type ObjectRecordEvent } from 'twenty-shared/database-events';

export type ObjectRecordSubscriptionEvent = ObjectRecordEvent & {
  objectNameSingular: string;
};
