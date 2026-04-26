export type GetOneMessageListResponse = {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
  previousSyncCursor: string | null;
  nextSyncCursor: string;
  folderId: string | undefined;
  highestUid?: number;
  uidValidity?: number;
  modSeq?: string;
  firstSyncedUid?: number;
};

export type GetMessageListsResponse = Array<GetOneMessageListResponse>;
