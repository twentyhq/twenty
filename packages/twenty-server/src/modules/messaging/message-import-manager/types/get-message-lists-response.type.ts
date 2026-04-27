export type GetOneMessageListResponse = {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
  previousSyncCursor: string | null;
  nextSyncCursor: string;
  folderId: string | undefined;
  highestUid?: string;
  uidValidity?: string;
  modSeq?: string;
  firstSyncedUid?: string;
};

export type GetMessageListsResponse = Array<GetOneMessageListResponse>;
