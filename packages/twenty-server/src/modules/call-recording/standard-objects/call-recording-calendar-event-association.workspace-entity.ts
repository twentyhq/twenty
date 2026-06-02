import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';

const EVENT_EXTERNAL_ID_FIELD_NAME = 'eventExternalId';

export const SEARCH_FIELDS_FOR_CALL_RECORDING_CALENDAR_EVENT_ASSOCIATION: FieldTypeAndNameMetadata[] =
  [{ name: EVENT_EXTERNAL_ID_FIELD_NAME, type: FieldMetadataType.TEXT }];

export class CallRecordingCalendarEventAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  calendarChannelId: string | null;
  eventExternalId: string | null;
  callRecording: EntityRelation<CallRecordingWorkspaceEntity>;
  callRecordingId: string;
  calendarEvent: EntityRelation<CalendarEventWorkspaceEntity>;
  calendarEventId: string;
}
