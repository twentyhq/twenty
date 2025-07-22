export type GetOneMessageListResponse = {
  messageExternalIds: string[];
  messageExternalIdsToDelete: string[];
  previousSyncCursor: string;
  nextSyncCursor: string;
  folderId: string | undefined;
};

export type GetMessageListsResponse = Array<GetOneMessageListResponse>;
