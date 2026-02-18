import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

export type ObjectRecordSubscriptionEvent = ObjectRecordEvent & {
  action: DatabaseEventAction;
  objectNameSingular: string;
};
