import { type RichTextMetadata } from 'twenty-shared/types';

import { type FileOutput } from 'src/engine/api/common/common-args-processors/data-arg-processor/types/file-item.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { type CallRecordingRequestStatus } from 'src/modules/call-recording/common/enums/call-recording-request-status.enum';
import { type CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

export class CallRecordingWorkspaceEntity extends BaseWorkspaceEntity {
  title: string | null;
  status: CallRecordingStatus;
  recordingRequestStatus: CallRecordingRequestStatus;
  applicationId: string | null;
  externalBotId: string | null;
  externalRecordingId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  video: FileOutput[] | null;
  audio: FileOutput[] | null;
  transcript: Record<string, unknown> | null;
  summary: RichTextMetadata | null;
  calendarEvent: EntityRelation<CalendarEventWorkspaceEntity> | null;
  calendarEventId: string | null;
}
