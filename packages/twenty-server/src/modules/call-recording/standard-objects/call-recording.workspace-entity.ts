import { FieldMetadataType } from 'twenty-shared/types';

import { type FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CallRecordingCalendarEventAssociationWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording-calendar-event-association.workspace-entity';

const MEETING_OCCURRENCE_KEY_FIELD_NAME = 'meetingOccurrenceKey';

export const SEARCH_FIELDS_FOR_CALL_RECORDING: FieldTypeAndNameMetadata[] = [
  { name: MEETING_OCCURRENCE_KEY_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class CallRecordingWorkspaceEntity extends BaseWorkspaceEntity {
  meetingOccurrenceKey: string;
  status: string;
  recordingPolicy: string;
  sourceApplicationId: string | null;
  externalBotId: string | null;
  externalRecordingId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  video: FileOutput[] | null;
  audio: FileOutput[] | null;
  transcript: Record<string, unknown> | null;
  failureReason: string | null;
  callRecordingCalendarEventAssociations: EntityRelation<
    CallRecordingCalendarEventAssociationWorkspaceEntity[]
  >;
}
