import { type ObjectRecordCreateEvent } from '@/database-events/object-record-create.event';
import { type ObjectRecordDeleteEvent } from '@/database-events/object-record-delete.event';
import { type ObjectRecordRestoreEvent } from '@/database-events/object-record-restore.event';
import { type ObjectRecordUpsertEvent } from '@/database-events/object-record-upsert.event';
import { type ObjectRecordUpdateEvent } from '@/database-events/object-record-update.event';

export type ObjectRecordNonDestructiveEvent =
  | ObjectRecordCreateEvent
  | ObjectRecordUpdateEvent
  | ObjectRecordDeleteEvent
  | ObjectRecordRestoreEvent
  | ObjectRecordUpsertEvent;
