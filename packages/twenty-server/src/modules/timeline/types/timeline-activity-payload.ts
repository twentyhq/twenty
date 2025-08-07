export type TimelineActivityPayload = {
  properties: Record<string, unknown>;
  linkedObjectMetadataId?: string;
  linkedRecordId?: string;
  linkedRecordCachedName?: string;
  workspaceMemberId?: string;
  name: string;
  recordId: string;
  overrideObjectSingularName?: string;
};
