export type RichTextFieldFileOwnershipUpdates = {
  fileIdsToClaimByRecordIndex: Map<number, string[]>;
  fileIdsToRelease: string[];
};
