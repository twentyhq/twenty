import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

export type TimelineActivityPayload = {
  properties: ObjectRecordBaseEvent['properties'];
  linkedObjectMetadataId?: string;
  linkedRecordId?: string;
  linkedRecordCachedName?: string;
  workspaceMemberId?: string;
  // Kept only to merge with name-only rows written during a rolling upgrade.
  legacyName: string;
  timelineActivityTypeId: string;
  recordId: string;
  objectSingularName?: string;
};
