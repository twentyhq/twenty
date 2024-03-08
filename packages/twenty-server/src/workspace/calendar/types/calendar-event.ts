import { CalendarEventAttendeeObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';
import { CalendarEventObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

export type CalendarEventWithAttendees =
  ObjectRecord<CalendarEventObjectMetadata> & {
    attendees: Omit<
      ObjectRecord<CalendarEventAttendeeObjectMetadata>,
      'id' | 'createdAt' | 'updatedAt' | 'personId' | 'workspaceMemberId'
    >[];
  };
