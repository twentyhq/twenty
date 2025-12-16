import { ObjectRecordBaseEvent } from '@/database-events/object-record.base.event';
import { type ObjectRecordDiff } from '@/database-events/object-record-diff';

export class ObjectRecordUpdateEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  declare properties: {
    updatedFields?: string[];
    diff?: Partial<ObjectRecordDiff<T>>;
    before: T;
    after: T;
  };
}
