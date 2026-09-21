export type TimelineActivityMutationInput = Record<string, unknown> & {
  happensAt?: Date | string | null;
  linkedObjectMetadataId?: string | null;
  linkedRecordId?: string | null;
  timelineActivityTypeId?: string | null;
  workspaceMemberId?: string | null;
};
