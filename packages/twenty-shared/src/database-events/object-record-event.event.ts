import { type ObjectRecordDeleteEvent } from '@/database-events/object-record-delete.event';
import { type ObjectRecordUpdateEvent } from '@/database-events/object-record-update.event';
import { type ObjectRecordCreateEvent } from '@/database-events/object-record-create.event';
import { type ObjectRecordDestroyEvent } from '@/database-events/object-record-destroy.event';
import { type ObjectRecordRestoreEvent } from '@/database-events/object-record-restore.event';
import { type ObjectRecordUpsertEvent } from '@/database-events/object-record-upsert.event';

export type ObjectRecordEvent<T = object> =
  | ObjectRecordUpdateEvent<T>
  | ObjectRecordDeleteEvent<T>
  | ObjectRecordCreateEvent<T>
  | ObjectRecordDestroyEvent<T>
  | ObjectRecordRestoreEvent<T>
  | ObjectRecordUpsertEvent<T>;
