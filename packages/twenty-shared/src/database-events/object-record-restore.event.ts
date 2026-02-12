import { ObjectRecordCreateEvent } from '@/database-events/object-record-create.event';
import { type ObjectRecordDiff } from '@/database-events/object-record-diff';

export class ObjectRecordRestoreEvent<
  T = object,
> extends ObjectRecordCreateEvent<T> {
  declare properties: {
    before: T;
    after: T;
    updatedFields: string[];
    diff: Partial<ObjectRecordDiff<T>>;
  };
}
