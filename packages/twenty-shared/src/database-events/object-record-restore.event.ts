import { ObjectRecordCreateEvent } from '@/database-events/object-record-create.event';

export class ObjectRecordRestoreEvent<
  T = object,
> extends ObjectRecordCreateEvent<T> {
  declare properties: {
    after: T;
  };
}
