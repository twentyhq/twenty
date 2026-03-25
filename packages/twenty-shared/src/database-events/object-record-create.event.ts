import { ObjectRecordBaseEvent } from '@/database-events/object-record.base.event';

export class ObjectRecordCreateEvent<
  T = object,
> extends ObjectRecordBaseEvent<T> {
  declare properties: {
    after: T;
  };
}
