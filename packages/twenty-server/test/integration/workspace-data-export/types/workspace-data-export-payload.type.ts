export type WorkspaceDataExportPayload = {
  id: string;
  workspaceId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  sizeInBytes: number;
  createdAt: string;
  downloadUrl: string | null;
};

export type WorkspaceDataExportGraphqlError = {
  message: string;
  extensions?: { subCode?: string };
};
