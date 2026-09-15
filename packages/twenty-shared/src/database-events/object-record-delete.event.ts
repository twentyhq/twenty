import { type ObjectRecordDiff } from '@/database-events/object-record-diff';
import { ObjectRecordBaseEvent } from '@/database-events/object-record.base.event';

export class ObjectRecordDeleteEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  declare properties: {
    before: T;
    after: T;
    updatedFields: string[];
    diff: Partial<ObjectRecordDiff<T>>;
  };
}
