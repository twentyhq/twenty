export type WorkspaceDataExportPayload = {
  id: string;
  workspaceId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  sizeInBytes: number;
  createdAt: string;
  objectCount: number | null;
  exportedObjectCount: number | null;
  columnCount: number | null;
  exportedRowCount: number | null;
  downloadUrl: string | null;
};

export type WorkspaceDataExportGraphqlError = {
  message: string;
  extensions?: { subCode?: string };
};
