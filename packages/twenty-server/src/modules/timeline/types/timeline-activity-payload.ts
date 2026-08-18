import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule.type';

export type TimelineActivityPayload = {
  properties: ObjectRecordBaseEvent['properties'];
  linkedObjectMetadataId?: string;
  linkedRecordId?: string;
  linkedRecordCachedName?: string;
  workspaceMemberId?: string;
  name: string;
  // Authoritative action. `name` keeps the legacy string format for readers that
  // still parse it
  action: TimelineActivityRuleAction;
  sourceObjectMetadataId: string;
  recordId: string;
  objectSingularName?: string;
};
