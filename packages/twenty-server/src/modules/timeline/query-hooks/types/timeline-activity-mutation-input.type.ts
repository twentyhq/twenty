export type TimelineActivityMutationInput = Record<string, unknown> & {
  linkedObjectMetadataId?: string | null;
  linkedRecordId?: string | null;
  timelineActivityTypeId?: string | null;
};
