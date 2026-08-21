import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { type TimelineActivityAction } from 'twenty-shared/timeline';

export type TimelineActivityPayload = {
  properties: ObjectRecordBaseEvent['properties'];
  linkedObjectMetadataId?: string;
  linkedRecordId?: string;
  linkedRecordCachedName?: string;
  workspaceMemberId?: string;
  name: string;
  // Authoritative action. `name` keeps the legacy string format for readers that
  // still parse it
  action: TimelineActivityAction;
  sourceObjectMetadataId: string;
  // Relation the rule walked, null for a rule on the record itself. With the
  // source object it names the rule that produced the entry.
  ruleRelationFieldMetadataId: string | null;
  recordId: string;
  objectSingularName?: string;
};
