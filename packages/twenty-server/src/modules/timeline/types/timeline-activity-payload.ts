import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { type TimelineActivityKind } from 'twenty-shared/timeline';

export type TimelineActivityPayload = {
  properties: ObjectRecordBaseEvent['properties'];
  linkedObjectMetadataId?: string;
  linkedRecordId?: string;
  linkedRecordCachedName?: string;
  workspaceMemberId?: string;
  name: string;
  kind: TimelineActivityKind;
  recordId: string;
  objectSingularName?: string;
};
