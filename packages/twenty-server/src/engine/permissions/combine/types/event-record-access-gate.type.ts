/* @license Enterprise */

import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';

export type EventRecordAccessGate<
  TEvent extends ObjectRecordEvent = ObjectRecordEvent,
> = {
  resolveAdmittedRecordIds: (
    authContext: PermissionsAuthContext,
  ) => Promise<Set<string>>;
  resolveReadableEvents: (args: {
    authContext: PermissionsAuthContext;
    events: TEvent[];
  }) => Promise<TEvent[]>;
};
