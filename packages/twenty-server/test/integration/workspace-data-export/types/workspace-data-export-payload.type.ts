export type WorkspaceDataExportPayload = {
  id: string;
  workspaceId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  sizeInBytes: number;
  createdAt: string;
  completedObjectCount: number | null;
  totalObjectCount: number | null;
  downloadUrl: string | null;
};

export type WorkspaceDataExportGraphqlError = {
  message: string;
  extensions?: { subCode?: string };
};
