import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

export type TimelineActivityPayload = {
  properties: ObjectRecordBaseEvent['properties'];
  linkedObjectMetadataId?: string;
  linkedRecordId?: string;
  linkedRecordCachedName?: string;
  workspaceMemberId?: string;
  name: string;
  recordId: string;
  overrideObjectSingularName?: string;
};
