import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type DatabaseEventAction } from 'src/engine/workspace-event-emitter/enums/database-event-action';

export type ObjectRecordSubscriptionEvent = ObjectRecordEvent & {
  action: DatabaseEventAction;
  objectNameSingular: string;
};
