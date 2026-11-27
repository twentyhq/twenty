import { type ObjectRecordDiff } from '@/database-events/object-record-diff';

type Properties<T> = {
  updatedFields?: string[];
  before?: T;
  after?: T;
  diff?: Partial<ObjectRecordDiff<T>>;
};

export class ObjectRecordBaseEvent<T = object> {
  // Assigned once when the event is emitted and kept by every consumer and retry, so receivers can deduplicate
  eventId: string;
  recordId: string;
  userId?: string;
  userWorkspaceId?: string;
  workspaceMemberId?: string;
  properties: Properties<T>;
}
