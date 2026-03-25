import { ObjectRecordBaseEvent } from '@/database-events/object-record.base.event';
import { type ObjectRecordDiff } from '@/database-events/object-record-diff';

export class ObjectRecordUpsertEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  declare properties: {
    before?: T;
    after: T;
    diff?: Partial<ObjectRecordDiff<T>>;
    updatedFields?: string[];
  };
}
